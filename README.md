# Amara &amp; Elliot — Wedding Website

A premium, editorial wedding website. **Phase 2** is now complete — the site
has full RSVP persistence, a Paystack-powered donation flow with server-side
verification, and a live Gift Wall.

- **Frontend:** React + Vite + Tailwind CSS + React Router + Framer Motion
- **Backend:** Node.js + Express + MongoDB/Mongoose + Paystack

---

## Quick start

You run two processes: the backend API and the frontend dev server.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The API starts on **http://localhost:5000**.

- **MongoDB is required for RSVP and donations.** Without it the site renders,
  but form submissions return 503. See *Connecting MongoDB* below.
- **Paystack keys are required for the payment flow.** Without them the
  initiation step returns a 503 pointing to a configuration note.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The site opens on **http://localhost:5173**. Vite proxies `/api/*` to the
backend automatically.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | Defaults to 5000 |
| `NODE_ENV` | no | `development` / `production` |
| `CLIENT_ORIGIN` | yes (prod) | Comma-separated allowed origins for CORS |
| `MONGODB_URI` | yes | Local or Atlas URI |
| `PAYSTACK_SECRET_KEY` | yes | **Never expose this to the frontend** |
| `PAYSTACK_PUBLIC_KEY` | optional | Kept in env for reference; not used server-side |
| `PAYSTACK_CALLBACK_URL` | yes | e.g. `https://yourdomain.com/gift/callback` |

### Frontend (`frontend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | In production, set to your backend URL |

---

## Project structure

```
wedding-website/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── weddingController.js
│   │   ├── rsvpController.js      ← Phase 2
│   │   └── donationController.js  ← Phase 2
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Wedding.js
│   │   ├── Rsvp.js                ← Phase 2
│   │   └── Donation.js            ← Phase 2
│   ├── routes/
│   │   ├── weddingRoutes.js
│   │   ├── rsvpRoutes.js          ← Phase 2
│   │   └── donationRoutes.js      ← Phase 2
│   ├── services/
│   │   ├── weddingData.js
│   │   └── seed.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── vercel.json                ← Vercel deployment config
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Button.jsx
    │   │   ├── Footer.jsx
    │   │   ├── GalleryGrid.jsx
    │   │   ├── GiftWall.jsx        ← Phase 2
    │   │   ├── Hero.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── PageHeader.jsx
    │   │   ├── Reveal.jsx
    │   │   ├── ScrollIndicator.jsx
    │   │   ├── Section.jsx
    │   │   └── ThankYou.jsx
    │   ├── data/
    │   │   └── weddingFallback.js
    │   ├── hooks/
    │   │   ├── useScrollReveal.js
    │   │   └── useWedding.jsx
    │   ├── layouts/
    │   │   └── SiteLayout.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── OurStory.jsx
    │   │   ├── WeddingDetails.jsx
    │   │   ├── Gallery.jsx
    │   │   ├── Rsvp.jsx           ← Phase 2 (real submission)
    │   │   ├── Gift.jsx           ← Phase 2 (Paystack)
    │   │   ├── GiftCallback.jsx   ← Phase 2
    │   │   └── NotFound.jsx
    │   └── services/
    │       └── weddingService.js
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## How data flows

### RSVP

```
POST /api/rsvp
  → server-side validation
  → duplicate check (email + weddingId unique index)
  → Rsvp.create()
  → 201 { success, message }
```

### Donation / Gift

```
1. Frontend POSTs to /api/donations/initiate
     { weddingSlug, donorName, email, amountNaira, message?, anonymous? }

2. Backend creates Donation { status: 'pending' } in MongoDB,
   then calls Paystack Initialize Transaction (server-to-server).
   Returns { authorizationUrl } to the frontend.

3. Frontend redirects to authorizationUrl (Paystack-hosted checkout).

4a. Paystack redirects to /gift/callback?reference=xxx
    Frontend calls GET /api/donations/verify/:reference
    Backend calls Paystack Verify Transaction (server-to-server),
    checks amount matches, sets status: 'success' or 'failed'.

4b. Paystack webhook → POST /api/donations/webhook
    Backend verifies HMAC-SHA512 signature, then confirms the donation.
    This is the authoritative path — the frontend callback is a UI hint.

5. GET /api/donations/wall  — returns successful donations (no emails).
   GET /api/donations/summary — returns total amount + count.
```

**The Paystack secret key never leaves the server.**

---

## Connecting MongoDB

1. In `backend/.env`, set `MONGODB_URI`:
   - Local: `mongodb://127.0.0.1:27017/wedding`
   - Atlas: `mongodb+srv://<user>:<pass>@<cluster>/wedding`
2. Seed the development wedding:
   ```bash
   cd backend && npm run seed
   ```
3. Restart the backend.

---

## Deploying to Vercel

### Backend (Express → Vercel Serverless)

The `backend/vercel.json` file routes all traffic to `server.js`.

```bash
cd backend
vercel                # first deploy (follow prompts)
vercel --prod         # subsequent deploys
```

In the Vercel dashboard, add your environment variables:
- `MONGODB_URI`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_CALLBACK_URL` → `https://your-frontend.vercel.app/gift/callback`
- `CLIENT_ORIGIN` → `https://your-frontend.vercel.app`
- `NODE_ENV` → `production`

**Paystack Webhook URL:**  
In your Paystack dashboard → Settings → Webhooks, set the URL to:
```
https://your-backend.vercel.app/api/donations/webhook
```

### Frontend (React → Vercel Static)

```bash
cd frontend
vercel
```

In the Vercel dashboard set:
- `VITE_API_BASE_URL` → `https://your-backend.vercel.app/api`

---

## Security

- **Helmet** — secure HTTP headers on every response.
- **Rate limiting** — 200 req/15 min general; 5 RSVP/hr; 10 donation initiations/hr per IP.
- **Paystack secret key** — server-only. Never sent to or from the browser.
- **Webhook HMAC-SHA512** — every incoming Paystack webhook is signature-verified.
- **Amount verification** — the backend checks the amount Paystack reports matches what it stored.
- **Sanitize-html** — all user-supplied strings are stripped of HTML before storage.
- **Emails never returned** — public endpoints (`/wall`, `/summary`) never include email addresses.

---

## Scripts

**Backend**
| Command | Does |
|---|---|
| `npm run dev` | Start API with auto-reload |
| `npm start` | Start API (production) |
| `npm run seed` | Upsert development wedding into MongoDB |

**Frontend**
| Command | Does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## Phase 3 (future)

- Authentication + admin dashboard (view RSVPs, export CSV)
- Multi-tenant slug switching
- SMS / email confirmations
- Full CMS for couple details, story, and gallery
