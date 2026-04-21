import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  RestaurantMediaLightbox,
  type MediaViewerItem,
} from "@/components/restaurant-media-lightbox";

describe("RestaurantMediaLightbox", () => {
  it("renders the active item and gallery navigation", () => {
    const items: MediaViewerItem[] = [
      {
        alt: "Dining room",
        caption: "Restaurant interior",
        src: "https://example.com/interior.jpg",
      },
      {
        alt: "Signature dish",
        caption: "Signature plate",
        src: "https://example.com/dish.jpg",
      },
    ];

    const markup = renderToStaticMarkup(
      <RestaurantMediaLightbox
        activeItem={items[0]}
        items={items}
        onClose={vi.fn()}
        onMove={vi.fn()}
        onSelect={vi.fn()}
        viewerIndex={0}
      />,
    );

    expect(markup).toContain("Photo 1 / 2");
    expect(markup).toContain("Restaurant interior");
    expect(markup).toContain("Open original");
    expect(markup).toContain("Prev");
    expect(markup).toContain("Next");
  });
});
