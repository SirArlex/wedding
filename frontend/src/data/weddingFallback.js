/**
 * Local fallback copy of the development wedding.
 *
 * The app fetches live data from the backend API. If the API is unreachable
 * (e.g. the backend isn't running), this data is used so the site still
 * renders fully. It mirrors the shape returned by GET /api/wedding.
 *
 * To change couple details during development you can edit this file, but the
 * backend's services/weddingData.js is the true source once the API is running.
 */
export const weddingFallback = {
  slug: 'amara-and-elliot',

  brideName: 'Amara',
  groomName: 'Elliot',

  weddingDate: 'Saturday, the Fourteenth of June, 2025',
  weddingDateISO: '2025-06-14',
  location: 'Val d’Orcia, Tuscany',

  hero: {
    kicker: 'The Wedding Of',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80',
  },

  story: {
    intro: 'How two paths became one.',
    paragraphs: [
      'We met on an unremarkable Tuesday in a bookshop that no longer exists, both reaching for the last copy of the same novel. Neither of us would let go. We settled it over coffee that lasted until the shop closed.',
      'Seven years, three apartments, one small and devoted dog, and more shared cups of coffee than we could ever count later, Elliot proposed in the same quiet corner where we first argued over a book — this time with a ring, and no argument at all.',
      'We would be honoured to have you with us as we begin the next chapter, under the Tuscan sun, surrounded by the people who made our story possible.',
    ],
    quote: 'To the world you may be one person, but to one person you are the world.',
    image:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
  },

  ceremony: {
    title: 'The Ceremony',
    date: 'Saturday, June 14, 2025',
    time: 'Four o’clock in the afternoon',
    venue: 'Chapel of San Biagio',
    address: 'Via di San Biagio, Montepulciano, Tuscany',
    mapUrl: 'https://maps.google.com/?q=Tempio+di+San+Biagio+Montepulciano',
    note: 'Followed by cocktails on the terrace.',
  },

  reception: {
    title: 'The Reception',
    date: 'Saturday, June 14, 2025',
    time: 'Six o’clock in the evening until late',
    venue: 'Villa Cicolina',
    address: 'Via Provinciale, Montepulciano, Tuscany',
    mapUrl: 'https://maps.google.com/?q=Villa+Cicolina+Montepulciano',
    note: 'Dinner, dancing, and black-tie attire.',
  },

  gallery: [
    {
      src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      alt: 'The couple walking through a sunlit field',
      orientation: 'portrait',
    },
    {
      src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
      alt: 'Golden hour embrace',
      orientation: 'landscape',
    },
    {
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      alt: 'Hands and rings',
      orientation: 'square',
    },
    {
      src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ceremony under the open sky',
      orientation: 'portrait',
    },
    {
      src: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1400&q=80',
      alt: 'Table setting at dusk',
      orientation: 'landscape',
    },
    {
      src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      alt: 'First dance',
      orientation: 'square',
    },
    {
      src: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80',
      alt: 'Bouquet detail',
      orientation: 'portrait',
    },
    {
      src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=80',
      alt: 'The celebration',
      orientation: 'landscape',
    },
  ],

  gift: {
    heading: 'A Gift',
    message:
      'Your presence at our wedding is the greatest gift of all. For those who have expressed a wish to help us begin our life together, we have made it possible to send a gift with love. It is never expected, only deeply appreciated.',
  },

  published: true,
};

export default weddingFallback;
