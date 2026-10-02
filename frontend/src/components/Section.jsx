/**
 * Section — consistent vertical rhythm for every content block.
 *
 * Props:
 *   tone      "light" (alabaster) | "linen" (subtle panel)
 *   as        semantic element (default <section>)
 *   id        anchor id
 *   className extra classes on the inner container
 */
export default function Section({
  children,
  tone = 'light',
  as: Tag = 'section',
  id,
  bleed = false,
  className = '',
}) {
  const tones = {
    light: 'bg-alabaster',
    linen: 'bg-linen',
    ink: 'bg-ink text-alabaster',
  };

  return (
    <Tag id={id} className={`${tones[tone]} py-20 sm:py-28 lg:py-36`}>
      {bleed ? (
        <div className={className}>{children}</div>
      ) : (
        <div className={`container-editorial ${className}`}>{children}</div>
      )}
    </Tag>
  );
}

/**
 * SectionHeading — the standard centered heading block.
 * The small label is optional and only rendered when it carries meaning.
 */
export function SectionHeading({ label, title, intro, align = 'center' }) {
  const alignment =
    align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${alignment} gap-5`}>
      {label && <span className="luxe-label">{label}</span>}
      <h2 className="text-section-title max-w-2xl">{title}</h2>
      {align === 'center' && <div className="rule-gold" />}
      {intro && (
        <p className="max-w-prose2 text-stone text-lg leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}
