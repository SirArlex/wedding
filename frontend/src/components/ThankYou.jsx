import { motion } from 'framer-motion';

import Button from './Button.jsx';

/**
 * ThankYou — a calm, full-height confirmation state.
 * Reused for both RSVP and Gift success. Gentle single entrance.
 */
export default function ThankYou({
  label = 'Thank You',
  title,
  message,
  primaryTo = '/',
  primaryLabel = 'Return home',
}) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-xl text-center"
      >
        <span className="luxe-label">{label}</span>
        <h1 className="text-section-title mt-6 font-serif">{title}</h1>
        <div className="rule-gold mt-8" />
        <p className="mx-auto mt-8 max-w-prose2 text-lg leading-relaxed text-stone">
          {message}
        </p>
        <div className="mt-12">
          <Button to={primaryTo} variant="outline">
            {primaryLabel}
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
