import { Link } from 'react-router-dom';

/**
 * A single, consistent button/link primitive in two quiet variants.
 *
 * variant="solid"   — ink fill, used for the primary action.
 * variant="outline" — hairline border, used for secondary actions.
 *
 * Renders as a <Link> when `to` is given, an <a> when `href` is given,
 * otherwise a <button>. Deliberately understated: letter-spaced small-caps,
 * a slow underline/fill transition, no shadow, no icon by default.
 */
const base =
  'inline-flex items-center justify-center font-sans text-xs uppercase tracking-wide2 ' +
  'px-9 py-4 transition-all duration-500 ease-silk focus-visible:outline-none ' +
  'focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-4 ' +
  'focus-visible:ring-offset-alabaster select-none disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  solid:
    'bg-ink text-alabaster border border-ink hover:bg-transparent hover:text-ink',
  outline:
    'bg-transparent text-ink border border-ink/30 hover:border-ink hover:bg-ink hover:text-alabaster',
  quiet:
    'px-0 py-1 border-b border-gold/50 text-ink hover:border-ink',
};

export default function Button({
  children,
  variant = 'solid',
  to,
  href,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = `${base} ${variants[variant] || variants.solid} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}
