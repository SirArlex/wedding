/**
 * GalleryGrid — an editorial masonry layout using CSS columns.
 *
 * Restrained hover: a slow image scale under a fixed frame, plus a whisper
 * of a darkening overlay. No shadows, no rounded corners, no captions on top.
 *
 * @param {Array} images  [{ src, alt, orientation }]
 * @param {number} limit  optional cap on how many to show
 */
export default function GalleryGrid({ images = [], limit }) {
  const shown = typeof limit === 'number' ? images.slice(0, limit) : images;

  return (
    <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 lg:gap-6">
      {shown.map((img, i) => (
        <figure
          key={`${img.src}-${i}`}
          className="group mb-4 block w-full overflow-hidden sm:mb-5 lg:mb-6"
        >
          <div className="overflow-hidden">
            <img
              src={img.src}
              alt={img.alt || ''}
              loading="lazy"
              className="w-full object-cover transition-transform duration-[1200ms] ease-silk group-hover:scale-105"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}
