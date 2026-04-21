import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mexicoCityDataset } from "@/data/cities/mexico-city";
import { RestaurantBookingWorkbench } from "@/components/restaurant-booking-workbench";

describe("RestaurantBookingWorkbench", () => {
  it("renders the booking scaffold for the selected restaurant", () => {
    const restaurant = mexicoCityDataset.restaurants[0]!;
    const markup = renderToStaticMarkup(
      <RestaurantBookingWorkbench
        locale={mexicoCityDataset.meta.locale}
        restaurant={restaurant}
        timeZone={mexicoCityDataset.meta.timeZone}
      />,
    );

    expect(markup).toContain("Availability and reservation path");
    expect(markup).toContain("Next 10 days");
    expect(markup).toContain("Demand model");
    expect(markup).toContain(restaurant.bestWindow);
  });
});
