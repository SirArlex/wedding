import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/** Scrolls to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

/**
 * SiteLayout — the shared shell for every page.
 * Navbar is fixed and overlays the hero on the homepage; other pages get
 * top padding so content clears the bar.
 */
export default function SiteLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-alabaster">
      <ScrollToTop />
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-20 lg:pt-24'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
