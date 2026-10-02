import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element once as it scrolls into view.
 * Used sparingly for restrained editorial entrances — not on every element.
 *
 * @param {object} options IntersectionObserver options
 * @returns {[React.RefObject, boolean]} ref to attach, and whether it's visible
 */
export function useScrollReveal({ threshold = 0.18, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Honour reduced-motion: reveal immediately, skip the observer.
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
