"use client";

import Image from "next/image";

export type MediaViewerItem = {
  src: string;
  alt: string;
  caption: string;
};

type RestaurantMediaLightboxProps = {
  activeItem: MediaViewerItem;
  items: MediaViewerItem[];
  viewerIndex: number;
  onClose: () => void;
  onMove: (step: number) => void;
  onSelect: (index: number) => void;
};

export function RestaurantMediaLightbox({
  activeItem,
  items,
  viewerIndex,
  onClose,
  onMove,
  onSelect,
}: RestaurantMediaLightboxProps) {
  return (
    <div
      aria-label="Photo viewer"
      aria-modal="true"
      className="media-lightbox"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="media-lightbox__shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="media-lightbox__toolbar">
          <div className="media-lightbox__meta">
            <span>
              Photo {viewerIndex + 1} / {items.length}
            </span>
            <strong>{activeItem.caption}</strong>
          </div>
          <div className="media-lightbox__actions">
            <a
              className="media-lightbox__action"
              href={activeItem.src}
              rel="noreferrer"
              target="_blank"
            >
              Open original
            </a>
            <button
              aria-label="Close viewer"
              className="media-lightbox__action"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        <div className="media-lightbox__stage">
          {items.length > 1 ? (
            <button
              aria-label="Previous photo"
              className="media-lightbox__nav media-lightbox__nav--prev"
              onClick={() => onMove(-1)}
              type="button"
            >
              Prev
            </button>
          ) : null}

          <div className="media-lightbox__frame">
            <Image
              alt={activeItem.alt}
              className="media-lightbox__image"
              fill
              preload
              sizes="100vw"
              src={activeItem.src}
            />
          </div>

          {items.length > 1 ? (
            <button
              aria-label="Next photo"
              className="media-lightbox__nav media-lightbox__nav--next"
              onClick={() => onMove(1)}
              type="button"
            >
              Next
            </button>
          ) : null}
        </div>

        {items.length > 1 ? (
          <div className="media-lightbox__thumbs">
            {items.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                className={
                  index === viewerIndex
                    ? "media-lightbox__thumb is-active"
                    : "media-lightbox__thumb"
                }
                onClick={() => onSelect(index)}
                type="button"
              >
                <Image
                  alt={item.alt}
                  className="media-lightbox__thumbImage"
                  fill
                  loading="lazy"
                  sizes="96px"
                  src={item.src}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
