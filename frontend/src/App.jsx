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

export default function App() {
  return (
    <WeddingProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/details" element={<WeddingDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/rsvp" element={<Rsvp />} />
          <Route path="/gift" element={<Gift />} />
          <Route path="/gift/callback" element={<GiftCallback />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </WeddingProvider>
  );
}
