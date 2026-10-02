import { Link } from 'react-router-dom';
import { useWedding } from '../hooks/useWedding.jsx';

export default function Footer() {
  const { wedding } = useWedding();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-alabaster">
      <div className="container-editorial py-20 text-center">
        <p className="luxe-label text-gold-soft">{wedding.hero?.kicker}</p>

        <h2 className="mt-6 font-serif text-4xl sm:text-5xl">
          {wedding.brideName} <span className="text-gold-soft">&amp;</span>{' '}
          {wedding.groomName}
        </h2>

        <div className="mx-auto mt-8 h-px w-16 bg-gold-soft/40" />

        <p className="mt-8 font-sans text-sm uppercase tracking-wide2 text-alabaster/70">
          {wedding.weddingDate}
        </p>
        <p className="mt-2 font-sans text-sm uppercase tracking-wide2 text-alabaster/70">
          {wedding.location}
        </p>

        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { to: '/our-story', label: 'Our Story' },
            { to: '/details', label: 'Details' },
            { to: '/gallery', label: 'Gallery' },
            { to: '/rsvp', label: 'RSVP' },
            { to: '/gift', label: 'Gift' },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-sans text-xs uppercase tracking-wide2 text-alabaster/60 transition-colors duration-300 hover:text-gold-soft"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="mt-14 font-sans text-xs tracking-wide text-alabaster/40">
          © {year} {wedding.brideName} &amp; {wedding.groomName}. Made with love.
        </p>
      </div>
    </footer>
  );
}
