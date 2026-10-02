import { useScrollReveal } from '../hooks/useScrollReveal.js';

/**
 * A quiet wrapper that fades its children up once, when scrolled into view.
 * Respects reduced-motion (the hook reveals immediately in that case).
 */
export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
