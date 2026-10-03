import { Routes, Route } from 'react-router-dom';

import { WeddingProvider } from './hooks/useWedding.jsx';
import SiteLayout from './layouts/SiteLayout.jsx';

import Home from './pages/Home.jsx';
import OurStory from './pages/OurStory.jsx';
import WeddingDetails from './pages/WeddingDetails.jsx';
import Gallery from './pages/Gallery.jsx';
import Rsvp from './pages/Rsvp.jsx';
import Gift from './pages/Gift.jsx';
import GiftCallback from './pages/GiftCallback.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin
import { AuthProvider } from './admin/AuthContext.jsx';
import RequireAuth from './admin/RequireAuth.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Login from './admin/pages/Login.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import Rsvps from './admin/pages/Rsvps.jsx';
import Donations from './admin/pages/Donations.jsx';
import AdminGallery from './admin/pages/Gallery.jsx';
import Settings from './admin/pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<WeddingProvider><SiteLayout /></WeddingProvider>}>
        <Route path="/" element={<Home />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/details" element={<WeddingDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/gift/callback" element={<GiftCallback />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin — separate auth context, no site layout */}
      <Route path="/manage" element={<AuthProvider><Login /></AuthProvider>} />
      <Route
        path="/manage/*"
        element={
          <AuthProvider>
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          </AuthProvider>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rsvps" element={<Rsvps />} />
        <Route path="donations" element={<Donations />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
