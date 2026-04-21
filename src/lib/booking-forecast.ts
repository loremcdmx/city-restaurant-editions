import type { Restaurant } from "@/lib/restaurant-types";

export const PARTY_SIZES = [2, 3, 4, 5, 6] as const;

export type BookingPartySize = (typeof PARTY_SIZES)[number];
export type BookingSlotStatus = "available" | "waitlist" | "unavailable";
export type BookingServiceSegment = "lunch" | "early" | "prime" | "late";

export type BookingForecastSlot = {
  key: string;
  isoDate: string;
  time: string;
  segment: BookingServiceSegment;
  statusByParty: Record<BookingPartySize, BookingSlotStatus>;
  maxPartySize: BookingPartySize | null;
};

export type BookingDayPartySummary = {
  availableCount: number;
  waitlistCount: number;
  bestSlotKey: string | null;
  bestSlotTime: string | null;
  maxPartySize: BookingPartySize | null;
  pressure: "sold-out" | "tight" | "steady" | "open";
  segmentAvailability: Record<BookingServiceSegment, number>;
};

export type BookingForecastDay = {
  isoDate: string;
  dayKey: string;
  closed: boolean;
  slots: BookingForecastSlot[];
  summaryByParty: Record<BookingPartySize, BookingDayPartySummary>;
};

export type BookingForecast = {
  days: BookingForecastDay[];
  modeledWith: string[];
};

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SEGMENT_KEYS: BookingServiceSegment[] = ["lunch", "early", "prime", "late"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hash01(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(value: number) {
  const normalized = ((value % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function createDateRange(anchorDate: string, length: number) {
  const [year, month, day] = anchorDate.slice(0, 10).split("-").map(Number);
  const anchor = new Date(year, month - 1, day);

  return Array.from({ length }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + index);
    return date;
  });
}

function normalizeIntervals(restaurant: Restaurant, date: Date) {
  const dayKey = DAY_KEYS[date.getDay()];
  const matchedDay = restaurant.openingHours.find((day) => day.day === dayKey);

  if (!matchedDay || matchedDay.closed) {
    return {
      dayKey,
      closed: true,
      intervals: [] as Array<{ open: number; close: number }>,
    };
  }

  const intervals = matchedDay.intervals.map((interval) => {
    const open = parseTimeToMinutes(interval.open);
    let close = parseTimeToMinutes(interval.close);

    if (interval.overnight || close <= open) {
      close += 24 * 60;
    }

    return { open, close };
  });

  return {
    dayKey,
    closed: intervals.length === 0,
    intervals,
  };
}

function inferSegment(minutes: number): BookingServiceSegment {
  const hour = Math.floor((((minutes % (24 * 60)) + 24 * 60) % (24 * 60)) / 60);

  if (hour < 15) {
    return "lunch";
  }

  if (hour < 18) {
    return "early";
  }

  if (hour < 21) {
    return "prime";
  }

  return "late";
}

function buildScarcityScore(restaurant: Restaurant) {
  let score = 0.14;

  switch (restaurant.bookingPressure) {
    case "walk-in":
      score -= 0.14;
      break;
    case "few-days":
      score += 0.1;
      break;
    case "one-week":
      score += 0.18;
      break;
    case "two-weeks-plus":
      score += 0.28;
      break;
  }

  switch (restaurant.priceBand) {
    case "budget":
      score -= 0.05;
      break;
    case "mid":
      score += 0.01;
      break;
    case "high":
      score += 0.06;
      break;
    case "destination":
      score += 0.11;
      break;
  }

  if (restaurant.awards.includes("MICHELIN 2★")) {
    score += 0.1;
  } else if (restaurant.awards.includes("MICHELIN 1★")) {
    score += 0.07;
  } else if (restaurant.awards.includes("MICHELIN Bib")) {
    score += 0.03;
  }

  if (restaurant.awards.includes("50 Best")) {
    score += 0.08;
  }

  if ((restaurant.numRatings ?? 0) >= 5000) {
    score += 0.05;
  } else if ((restaurant.numRatings ?? 0) >= 2500) {
    score += 0.03;
  }

  if (restaurant.globalScore >= 99) {
    score += 0.05;
  } else if (restaurant.globalScore >= 95) {
    score += 0.03;
  }

  if (restaurant.booking?.reservationPlatform?.toLowerCase() === "opentable") {
    score += 0.03;
  }

  if (restaurant.booking?.daysInAdvance?.lowAvailability) {
    score += Math.min(restaurant.booking.daysInAdvance.lowAvailability / 120, 0.16);
  }

  return clamp(score, 0.04, 0.88);
}

function buildBaseSlotScore(
  restaurant: Restaurant,
  isoDate: string,
  dateIndex: number,
  time: string,
  segment: BookingServiceSegment,
) {
  const scarcity = buildScarcityScore(restaurant);
  const weekday = parseDateKey(isoDate).getDay();
  const isWeekend = weekday === 5 || weekday === 6;
  const openBias = segment === "lunch" ? 0.08 : segment === "early" ? 0.06 : 0;
  const primePenalty = segment === "prime" ? 0.16 : segment === "late" ? 0.08 : 0;
  const weekendPenalty = isWeekend ? 0.08 : 0;
  const shortLeadPenalty = clamp((3 - dateIndex) * 0.035, 0, 0.12);
  const longerLeadBoost = clamp(dateIndex * 0.035, 0, 0.22);
  const noise = hash01(`${restaurant.slug}|${isoDate}|${time}|base`) * 0.22 - 0.08;

  return clamp(
    0.86 - scarcity - primePenalty - weekendPenalty - shortLeadPenalty + longerLeadBoost + openBias + noise,
    0.05,
    0.98,
  );
}

function buildSlotStatuses(
  restaurant: Restaurant,
  isoDate: string,
  dateIndex: number,
  time: string,
  segment: BookingServiceSegment,
) {
  const baseScore = buildBaseSlotScore(restaurant, isoDate, dateIndex, time, segment);
  const statusByParty = {} as Record<BookingPartySize, BookingSlotStatus>;

  for (const size of PARTY_SIZES) {
    const sizePenalty =
      size === 2
        ? 0
        : size === 3
          ? 0.04
          : size === 4
            ? 0.1
            : size === 5
              ? 0.18
              : 0.26;
    const sizeNoise = hash01(`${restaurant.slug}|${isoDate}|${time}|${size}`) * 0.08 - 0.03;
    const score = baseScore - sizePenalty + sizeNoise;

    if (score >= 0.54) {
      statusByParty[size] = "available";
      continue;
    }

    if (score >= 0.47) {
      statusByParty[size] = "waitlist";
      continue;
    }

    statusByParty[size] = "unavailable";
  }

  return statusByParty;
}

function createEmptySummary(): Record<BookingPartySize, BookingDayPartySummary> {
  return Object.fromEntries(
    PARTY_SIZES.map((size) => [
      size,
      {
        availableCount: 0,
        waitlistCount: 0,
        bestSlotKey: null,
        bestSlotTime: null,
        maxPartySize: null,
        pressure: "sold-out",
        segmentAvailability: {
          lunch: 0,
          early: 0,
          prime: 0,
          late: 0,
        },
      },
    ]),
  ) as Record<BookingPartySize, BookingDayPartySummary>;
}

function summarizeDay(slots: BookingForecastSlot[]) {
  const summary = createEmptySummary();

  for (const size of PARTY_SIZES) {
    const availableSlots = slots.filter((slot) => slot.statusByParty[size] === "available");
    const waitlistSlots = slots.filter((slot) => slot.statusByParty[size] === "waitlist");
    const availableSizes = slots
      .filter((slot) => slot.statusByParty[size] === "available")
      .map((slot) => slot.maxPartySize)
      .filter((value): value is BookingPartySize => value !== null);

    const segmentAvailability = Object.fromEntries(
      SEGMENT_KEYS.map((segment) => [
        segment,
        slots.filter((slot) => slot.segment === segment && slot.statusByParty[size] === "available")
          .length,
      ]),
    ) as Record<BookingServiceSegment, number>;

    let pressure: BookingDayPartySummary["pressure"] = "sold-out";

    if (availableSlots.length >= 7) {
      pressure = "open";
    } else if (availableSlots.length >= 4) {
      pressure = "steady";
    } else if (availableSlots.length > 0 || waitlistSlots.length > 0) {
      pressure = "tight";
    }

    summary[size] = {
      availableCount: availableSlots.length,
      waitlistCount: waitlistSlots.length,
      bestSlotKey: availableSlots[0]?.key ?? waitlistSlots[0]?.key ?? null,
      bestSlotTime: availableSlots[0]?.time ?? waitlistSlots[0]?.time ?? null,
      maxPartySize:
        availableSizes.length > 0
          ? availableSizes.sort((left, right) => right - left)[0]
          : null,
      pressure,
      segmentAvailability,
    };
  }

  return summary;
}

function buildSlotsForDay(
  restaurant: Restaurant,
  date: Date,
  dateIndex: number,
  intervals: Array<{ open: number; close: number }>,
) {
  const isoDate = date.toISOString().slice(0, 10);
  const slots: BookingForecastSlot[] = [];

  intervals.forEach((interval, intervalIndex) => {
    for (
      let minute = interval.open;
      minute <= interval.close - 75;
      minute += 30
    ) {
      const time = formatMinutes(minute);
      const segment = inferSegment(minute);
      const statusByParty = buildSlotStatuses(
        restaurant,
        isoDate,
        dateIndex,
        time,
        segment,
      );
      const maxPartySize =
        [...PARTY_SIZES]
          .reverse()
          .find((size) => statusByParty[size] === "available") ?? null;

      slots.push({
        key: `${isoDate}-${intervalIndex}-${time}`,
        isoDate,
        time,
        segment,
        statusByParty,
        maxPartySize,
      });
    }
  });

  return slots;
}

export function buildBookingForecast(
  restaurant: Restaurant,
  anchorDate: string,
): BookingForecast {
  const days = createDateRange(anchorDate, 10).map((date, dateIndex) => {
    const isoDate = date.toISOString().slice(0, 10);
    const normalizedDay = normalizeIntervals(restaurant, date);

    if (normalizedDay.closed) {
      return {
        isoDate,
        dayKey: normalizedDay.dayKey,
        closed: true,
        slots: [],
        summaryByParty: createEmptySummary(),
      };
    }

    const slots = buildSlotsForDay(
      restaurant,
      date,
      dateIndex,
      normalizedDay.intervals,
    );

    return {
      isoDate,
      dayKey: normalizedDay.dayKey,
      closed: false,
      slots,
      summaryByParty: summarizeDay(slots),
    };
  });

  return {
    days,
    modeledWith: [
      "hours",
      "booking pressure",
      "public demand",
      "awards",
      "party size",
      "hashed slot variance",
    ],
  };
}
