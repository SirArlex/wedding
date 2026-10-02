import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { useWedding } from '../hooks/useWedding.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/details', label: 'Details' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/rsvp', label: 'RSVP' },
  { to: '/gift', label: 'Gift' },
];

export default function Navbar() {
  const { wedding } = useWedding();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // The navbar is transparent only while over the homepage hero.
  const overHero = location.pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on route change and lock scroll while it's open.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const monogram = `${wedding.brideName?.[0] || ''} & ${wedding.groomName?.[0] || ''}`;

  const barText = overHero ? 'text-alabaster' : 'text-ink';
  const barBg = overHero
    ? 'bg-transparent'
    : 'bg-alabaster/90 backdrop-blur-md border-b border-ink/5';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-silk ${barBg}`}
    >
      <nav className="container-editorial flex h-20 items-center justify-between lg:h-24">
        {/* Monogram */}
        <Link
          to="/"
          className={`font-serif text-xl tracking-wide transition-colors duration-500 ${barText}`}
          aria-label="Home"
        >
          {monogram}
        </Link>

        {/* Desktop links */}
        <ul className={`hidden items-center gap-9 lg:flex ${barText}`}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative font-sans text-xs uppercase tracking-wide2 transition-opacity duration-300 hover:opacity-100 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="inline-flex flex-col items-center">
                    {link.label}
                    <span
                      className={`mt-1 h-px bg-gold transition-all duration-500 ease-silk ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`lg:hidden ${barText}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} strokeWidth={1.25} /> : <Menu size={22} strokeWidth={1.25} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-0 z-40 flex flex-col bg-alabaster transition-all duration-500 ease-silk lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="container-editorial flex h-20 items-center justify-between">
          <span className="font-serif text-xl text-ink">{monogram}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-ink"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>

        <ul className="flex flex-1 flex-col items-center justify-center gap-8">
          {links.map((link, i) => (
            <li
              key={link.to}
              style={{
                transitionDelay: open ? `${120 + i * 60}ms` : '0ms',
              }}
              className={`transition-all duration-500 ease-silk ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `font-serif text-3xl ${isActive ? 'text-gold' : 'text-ink'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="pb-12 text-center luxe-label">
          {wedding.weddingDateISO}
        </p>
      </div>
    </header>
  );
}
