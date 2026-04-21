"use client";

import { useMemo, useState } from "react";
import {
  PARTY_SIZES,
  buildBookingForecast,
  type BookingForecastDay,
  type BookingPartySize,
  type BookingServiceSegment,
  type BookingSlotStatus,
} from "@/lib/booking-forecast";
import type { Restaurant } from "@/lib/restaurant-types";

type RestaurantBookingWorkbenchProps = {
  restaurant: Restaurant;
  locale: string;
  timeZone: string;
};

function formatReservationPlatform(platform: string) {
  if (platform.toLowerCase() === "opentable") {
    return "OpenTable";
  }

  if (platform.toLowerCase() === "resy") {
    return "Resy";
  }

  return platform;
}

function buildAvailabilitySummary(restaurant: Restaurant) {
  if (restaurant.bookingMode === "walk-in") {
    return "No standard reservation flow. Show up at opening or aim for the quietest off-peak window.";
  }

  return `${restaurant.bookingNote} ${restaurant.timingNote}`;
}

function formatBookingModeLabel(mode: Restaurant["bookingMode"]) {
  switch (mode) {
    case "walk-in":
      return "walk-in only";
    case "reservation":
      return "reservation slots";
    case "website":
      return "via website";
    case "call":
      return "by phone";
    case "dm":
      return "via DM";
  }
}

function getLocalDateKey(date = new Date(), timeZone = "UTC") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "04";
  const day = parts.find((part) => part.type === "day")?.value ?? "19";

  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatCountEn(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatPartySize(size: BookingPartySize) {
  return `${size} guests`;
}

function formatBookingDayLabel(isoDate: string, index: number, locale = "en-US") {
  if (index === 0) {
    return "Today";
  }

  if (index === 1) {
    return "Tomorrow";
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
  })
    .format(parseDateKey(isoDate))
    .replace(".", "");
}

function formatBookingDayDate(isoDate: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(parseDateKey(isoDate));
}

function formatBookingPressureLabel(
  pressure: BookingForecastDay["summaryByParty"][BookingPartySize]["pressure"],
) {
  switch (pressure) {
    case "open":
      return "open";
    case "steady":
      return "steady";
    case "tight":
      return "tight";
    case "sold-out":
      return "sold out";
  }
}

function formatBookingCountLabel(
  summary: BookingForecastDay["summaryByParty"][BookingPartySize],
) {
  if (summary.availableCount > 0) {
    return formatCountEn(summary.availableCount, "slot", "slots");
  }

  if (summary.waitlistCount > 0) {
    return formatCountEn(summary.waitlistCount, "waitlist window", "waitlist windows");
  }

  return "No slots";
}

function formatSlotStatusLabel(status: BookingSlotStatus) {
  switch (status) {
    case "available":
      return "Bookable slot";
    case "waitlist":
      return "Waitlist";
    case "unavailable":
      return "Unavailable";
  }
}

function formatSegmentLabel(segment: BookingServiceSegment) {
  switch (segment) {
    case "lunch":
      return "Lunch";
    case "early":
      return "Early";
    case "prime":
      return "Prime";
    case "late":
      return "Late";
  }
}

function buildSlotGroups(
  day: BookingForecastDay | undefined,
  partySize: BookingPartySize,
) {
  if (!day) {
    return [];
  }

  return (["lunch", "early", "prime", "late"] as BookingServiceSegment[])
    .map((segment) => ({
      segment,
      slots: day.slots.filter(
        (slot) =>
          slot.segment === segment &&
          slot.statusByParty[partySize] !== "unavailable",
      ),
    }))
    .filter((group) => group.slots.length > 0);
}

export function RestaurantBookingWorkbench({
  restaurant,
  locale,
  timeZone,
}: RestaurantBookingWorkbenchProps) {
  const bookingAnchorDate = useMemo(
    () => getLocalDateKey(new Date(), timeZone),
    [timeZone],
  );
  const bookingForecast = useMemo(
    () => buildBookingForecast(restaurant, bookingAnchorDate),
    [bookingAnchorDate, restaurant],
  );
  const bookingPlatform = restaurant.booking?.reservationPlatform
    ? formatReservationPlatform(restaurant.booking.reservationPlatform)
    : null;
  const [partySize, setPartySize] = useState<BookingPartySize>(2);
  const [selectedBookingDate, setSelectedBookingDate] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  const preferredBookingDay =
    bookingForecast.days.find(
      (day) => day.summaryByParty[partySize].availableCount > 0,
    ) ??
    bookingForecast.days.find(
      (day) => day.summaryByParty[partySize].waitlistCount > 0,
    ) ??
    bookingForecast.days.find((day) => !day.closed) ??
    bookingForecast.days[0];

  const effectiveBookingDate =
    bookingForecast.days.find((day) => day.isoDate === selectedBookingDate)
      ?.isoDate ?? preferredBookingDay?.isoDate ?? "";

  const selectedBookingDay =
    bookingForecast.days.find((day) => day.isoDate === effectiveBookingDate) ??
    bookingForecast.days[0];

  const selectedBookingSummary = selectedBookingDay?.summaryByParty[partySize];

  const bookingSlotGroups = useMemo(
    () => buildSlotGroups(selectedBookingDay, partySize),
    [partySize, selectedBookingDay],
  );

  const visibleSlots = useMemo(
    () => bookingSlotGroups.flatMap((group) => group.slots),
    [bookingSlotGroups],
  );

  const selectedSlot =
    visibleSlots.find((slot) => slot.key === selectedSlotKey) ??
    visibleSlots[0] ??
    null;

  const alternateBookingDays = useMemo(
    () =>
      bookingForecast.days.filter(
        (day) =>
          day.isoDate !== selectedBookingDay?.isoDate &&
          !day.closed &&
          (day.summaryByParty[partySize].availableCount > 0 ||
            day.summaryByParty[partySize].waitlistCount > 0),
      ),
    [bookingForecast.days, partySize, selectedBookingDay],
  );

  const bestBookingDay = useMemo(
    () =>
      [...bookingForecast.days]
        .filter((day) => !day.closed)
        .sort((left, right) => {
          const leftSummary = left.summaryByParty[partySize];
          const rightSummary = right.summaryByParty[partySize];

          if (rightSummary.availableCount !== leftSummary.availableCount) {
            return rightSummary.availableCount - leftSummary.availableCount;
          }

          return left.isoDate.localeCompare(right.isoDate);
        })[0],
    [bookingForecast.days, partySize],
  );

  const bookingScale = useMemo(
    () =>
      Math.max(
        ...bookingForecast.days.map((day) =>
          Math.max(
            1,
            day.summaryByParty[partySize].availableCount,
            day.summaryByParty[partySize].waitlistCount,
          ),
        ),
      ),
    [bookingForecast.days, partySize],
  );

  return (
    <section className="booking-workbench">
      <div className="booking-workbench__header">
        <div>
          <p className="section-kicker">Booking</p>
          <h3>Availability and reservation path</h3>
          <p>{buildAvailabilitySummary(restaurant)}</p>
        </div>
        <div className="booking-headlineStats">
          <div className="booking-stat">
            <span>Best opening</span>
            <strong>
              {bestBookingDay
                ? `${formatBookingDayLabel(
                    bestBookingDay.isoDate,
                    bookingForecast.days.findIndex(
                      (day) => day.isoDate === bestBookingDay.isoDate,
                    ),
                    locale,
                  )}, ${formatBookingDayDate(bestBookingDay.isoDate, locale)}`
                : "-"}
            </strong>
          </div>
          <div className="booking-stat">
            <span>Booking channel</span>
            <strong>{bookingPlatform ?? "Website / contact"}</strong>
          </div>
          <div className="booking-stat">
            <span>Forecast</span>
            <strong>Demand model</strong>
          </div>
        </div>
      </div>

      <div className="booking-toolbar">
        <div className="booking-party">
          <span className="booking-toolbar__label">Party</span>
          <div className="booking-party__controls">
            {PARTY_SIZES.map((size) => (
              <button
                key={size}
                className={
                  size === partySize
                    ? "booking-party__button is-active"
                    : "booking-party__button"
                }
                onClick={() => {
                  setPartySize(size);
                  setSelectedSlotKey(null);
                }}
                type="button"
              >
                {formatPartySize(size)}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-toolbar__meta">
          <span className="booking-chip">Next 10 days</span>
          <span className="booking-chip">Slot model</span>
          <span className="booking-chip">
            {formatBookingModeLabel(restaurant.bookingMode)}
          </span>
        </div>
      </div>

      <div className="booking-dateRailWrap">
        <div className="booking-dateRail__head">
          <span className="booking-toolbar__label">Nearby dates</span>
          <strong>Next 10 days</strong>
        </div>
        <div className="booking-dateRail">
          {bookingForecast.days.map((day, index) => {
            const summary = day.summaryByParty[partySize];
            const isActive = day.isoDate === selectedBookingDay?.isoDate;

            return (
              <button
                key={day.isoDate}
                className={
                  isActive
                    ? "booking-day is-active"
                    : day.closed
                      ? "booking-day is-closed"
                      : "booking-day"
                }
                onClick={() => {
                  setSelectedBookingDate(day.isoDate);
                  setSelectedSlotKey(null);
                }}
                type="button"
              >
                <div className="booking-day__head">
                  <span className="booking-day__label">
                    {formatBookingDayLabel(day.isoDate, index, locale)}
                  </span>
                  <span
                    className={`booking-day__pressure booking-day__pressure--${summary.pressure}`}
                  >
                    {day.closed
                      ? "closed"
                      : formatBookingPressureLabel(summary.pressure)}
                  </span>
                </div>
                <strong>{formatBookingDayDate(day.isoDate, locale)}</strong>
                <div className="booking-day__graph" aria-hidden="true">
                  {(
                    ["lunch", "early", "prime", "late"] as BookingServiceSegment[]
                  ).map((segment) => {
                    const count = summary.segmentAvailability[segment];

                    return (
                      <span
                        key={`${day.isoDate}-${segment}`}
                        className={`booking-day__bar booking-day__bar--${segment}`}
                        style={{
                          height: day.closed
                            ? "8px"
                            : `${Math.max(10, (count / bookingScale) * 42)}px`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="booking-day__meta">
                  <span>{day.closed ? "Closed" : formatBookingCountLabel(summary)}</span>
                  <span>
                    {summary.maxPartySize
                      ? `Up to ${summary.maxPartySize} guests`
                      : summary.waitlistCount > 0
                        ? "Waitlist"
                        : "-"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="booking-panel">
        <div className="booking-panel__main">
          <div className="booking-selection">
            <div>
              <p className="section-kicker">Selected date</p>
              <h3>
                {selectedBookingDay
                  ? `${formatBookingDayLabel(
                      selectedBookingDay.isoDate,
                      bookingForecast.days.findIndex(
                        (day) => day.isoDate === selectedBookingDay.isoDate,
                      ),
                    )} - ${formatBookingDayDate(selectedBookingDay.isoDate)}`
                  : "Booking unavailable"}
              </h3>
              <p>
                {selectedBookingDay?.closed
                  ? "The restaurant is closed on this day."
                  : selectedBookingSummary?.availableCount
                    ? `${selectedBookingSummary.availableCount} bookable slots for ${formatPartySize(
                        partySize,
                      )}.`
                    : selectedBookingSummary?.waitlistCount
                      ? `No live slots, but ${selectedBookingSummary.waitlistCount} waitlist windows are visible.`
                      : "No visible slots. Try adjacent dates."}
              </p>
            </div>

            <div className="booking-selection__stats">
              <div className="booking-stat">
                <span>Best time</span>
                <strong>{selectedBookingSummary?.bestSlotTime ?? "-"}</strong>
              </div>
              <div className="booking-stat">
                <span>Usually clears</span>
                <strong>
                  {selectedBookingSummary?.maxPartySize
                    ? `Up to ${selectedBookingSummary.maxPartySize} guests`
                    : "Via waitlist"}
                </strong>
              </div>
              <div className="booking-stat">
                <span>Pressure</span>
                <strong>
                  {selectedBookingSummary
                    ? formatBookingPressureLabel(selectedBookingSummary.pressure)
                    : "-"}
                </strong>
              </div>
            </div>
          </div>

          <div className="booking-segmentRail" aria-hidden="true">
            {(
              ["lunch", "early", "prime", "late"] as BookingServiceSegment[]
            ).map((segment) => (
              <div key={segment} className="booking-segmentRail__item">
                <span>{formatSegmentLabel(segment)}</span>
                <strong>{selectedBookingSummary?.segmentAvailability[segment] ?? 0}</strong>
              </div>
            ))}
          </div>

          {selectedBookingDay?.closed ? (
            <div className="booking-empty">
              <strong>The restaurant is closed on this date.</strong>
              <p>Switch to a nearby day or open the restaurant website for other options.</p>
            </div>
          ) : bookingSlotGroups.length > 0 ? (
            bookingSlotGroups.map((group) => (
              <section key={group.segment} className="booking-slotGroup">
                <div className="booking-slotGroup__head">
                  <strong>{formatSegmentLabel(group.segment)}</strong>
                  <span>
                    {formatCountEn(
                      group.slots.filter(
                        (slot) => slot.statusByParty[partySize] === "available",
                      ).length,
                      "slot",
                      "slots",
                    )}{" "}
                    /{" "}
                    {formatCountEn(
                      group.slots.filter(
                        (slot) => slot.statusByParty[partySize] === "waitlist",
                      ).length,
                      "waitlist",
                      "waitlists",
                    )}
                  </span>
                </div>
                <div className="booking-slotGrid">
                  {group.slots.map((slot) => {
                    const status = slot.statusByParty[partySize];
                    const isSelected = slot.key === selectedSlot?.key;

                    return (
                      <button
                        key={slot.key}
                        className={
                          isSelected
                            ? `booking-slot is-${status} is-selected`
                            : `booking-slot is-${status}`
                        }
                        onClick={() => setSelectedSlotKey(slot.key)}
                        type="button"
                      >
                        <span>{slot.time}</span>
                        <small>
                          {status === "available"
                            ? slot.maxPartySize
                              ? `up to ${slot.maxPartySize}`
                              : "bookable"
                            : "waitlist"}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="booking-empty">
              <strong>No visible slots for {formatPartySize(partySize)} on this day.</strong>
              <p>Try a smaller party, an earlier service, or a nearby day.</p>
            </div>
          )}
        </div>

        <aside className="booking-panel__aside">
          <div className="booking-focus">
            <p className="section-kicker">Reservation path</p>
            <h3>
              {selectedSlot
                ? `${selectedSlot.time} - ${formatPartySize(partySize)}`
                : "No live slot selected"}
            </h3>
            <p>
              {selectedSlot && selectedBookingDay
                ? `${formatBookingDayDate(selectedBookingDay.isoDate)} - ${formatSlotStatusLabel(
                    selectedSlot.statusByParty[partySize],
                  )}.`
                : buildAvailabilitySummary(restaurant)}
            </p>

            <div className="booking-focus__stack">
              <div className="booking-focus__row">
                <span>Platform</span>
                <strong>{bookingPlatform ?? "Website / contact"}</strong>
              </div>
              <div className="booking-focus__row">
                <span>Status</span>
                <strong>
                  {selectedSlot
                    ? formatSlotStatusLabel(selectedSlot.statusByParty[partySize])
                    : "No slot"}
                </strong>
              </div>
              <div className="booking-focus__row">
                <span>Best time to book</span>
                <strong>{restaurant.bestWindow}</strong>
              </div>
              <div className="booking-focus__row">
                <span>Usually clears</span>
                <strong>
                  {selectedBookingSummary?.maxPartySize
                    ? `Up to ${selectedBookingSummary.maxPartySize} guests`
                    : "Via waitlist"}
                </strong>
              </div>
            </div>

            <div className="action-row">
              {restaurant.bookingUrl ? (
                <a
                  className="action action--primary"
                  href={restaurant.bookingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {selectedSlot?.statusByParty[partySize] === "waitlist"
                    ? "Open waitlist"
                    : restaurant.bookingMode === "walk-in"
                      ? "Website & contact"
                      : "Continue to booking"}
                </a>
              ) : null}
              {restaurant.phone ? (
                <a
                  className="action"
                  href={`tel:${restaurant.phone.replace(/\s+/g, "")}`}
                >
                  Call
                </a>
              ) : null}
            </div>

            <p className="booking-footnote">
              Forecast built from opening hours, booking pressure, public demand,
              and hashed variability. It is directional, not a live inventory feed.
            </p>
          </div>

          {alternateBookingDays.length > 0 ? (
            <div className="booking-alternates">
              <strong>Alternatives</strong>
              <div className="booking-alternates__list">
                {alternateBookingDays.slice(0, 3).map((day) => (
                  <button
                    key={day.isoDate}
                    className="booking-alternate"
                    onClick={() => {
                      setSelectedBookingDate(day.isoDate);
                      setSelectedSlotKey(null);
                    }}
                    type="button"
                  >
                    <span>
                      {formatBookingDayLabel(
                        day.isoDate,
                        bookingForecast.days.findIndex(
                          (item) => item.isoDate === day.isoDate,
                        ),
                      )}
                    </span>
                    <strong>{formatBookingDayDate(day.isoDate)}</strong>
                    <small>{formatBookingCountLabel(day.summaryByParty[partySize])}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
