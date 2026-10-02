import { motion } from 'framer-motion';
import { useWedding } from '../hooks/useWedding.jsx';
import Button from './Button.jsx';
import ScrollIndicator from './ScrollIndicator.jsx';

/**
 * Homepage hero — the single most important view.
 *
 * One orchestrated entrance: the image settles with a slow zoom while the
 * type rises in sequence. No other section competes with this motion.
 */
export default function Hero() {
  const { wedding } = useWedding();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.18, delayChildren: 0.25 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {/* Cinematic image with a gentle, slow zoom on load. */}
      <div className="absolute inset-0">
        <img
          src={wedding.hero?.image}
          alt=""
          className="h-full w-full object-cover animate-slow-zoom"
          fetchpriority="high"
        />
        {/* Readability scrim — darker low, soft at top. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/60" />
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-alabaster"
      >
        <motion.p
          variants={item}
          className="font-sans text-xs uppercase tracking-luxe text-alabaster/85 sm:text-sm"
        >
          {wedding.hero?.kicker}
        </motion.p>

        <motion.h1
          variants={item}
          className="text-display mt-6 font-serif font-light"
        >
          {wedding.brideName}
          <span className="mx-3 inline-block align-middle font-light text-gold-soft sm:mx-5">
            &amp;
          </span>
          {wedding.groomName}
        </motion.h1>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <p className="font-sans text-sm uppercase tracking-wide2 text-alabaster/90 sm:text-base">
            {wedding.weddingDate}
          </p>
          <p className="font-serif text-lg italic text-alabaster/85 sm:text-xl">
            {wedding.location}
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <Button to="/rsvp" variant="solid">
            RSVP
          </Button>
          <Button
            to="/gift"
            variant="outline"
            className="border-alabaster/50 text-alabaster hover:bg-alabaster hover:text-ink"
          >
            Send a Gift
          </Button>
        </motion.div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
