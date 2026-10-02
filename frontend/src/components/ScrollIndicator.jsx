import { motion } from 'framer-motion';

/**
 * A subtle scroll cue at the base of the hero — a thin line that breathes.
 * Fades out once the user starts scrolling is handled by the hero scrim;
 * here we keep it minimal and quietly animated.
 */
export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 1.2 }}
      className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
    >
      <span className="font-sans text-[0.625rem] uppercase tracking-luxe text-alabaster/70">
        Scroll
      </span>
      <span className="relative block h-12 w-px overflow-hidden bg-alabaster/30">
        <motion.span
          className="absolute inset-x-0 top-0 block h-4 bg-alabaster"
          animate={{ y: [-16, 48] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </span>
    </motion.div>
  );
}
