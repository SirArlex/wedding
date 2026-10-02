/**
 * PageHeader — the quiet, consistent intro band at the top of interior pages.
 * Centered serif title over alabaster, with an optional small label and
 * a thin gold rule. No imagery here — interior pages open with calm.
 */
export default function PageHeader({ label, title, intro }) {
  return (
    <header className="container-editorial pt-16 pb-4 text-center sm:pt-20">
      {label && <span className="luxe-label">{label}</span>}
      <h1 className="text-section-title mt-5 font-serif">{title}</h1>
      <div className="rule-gold mt-7" />
      {intro && (
        <p className="mx-auto mt-7 max-w-prose2 text-lg leading-relaxed text-stone">
          {intro}
        </p>
      )}
    </header>
  );
}
