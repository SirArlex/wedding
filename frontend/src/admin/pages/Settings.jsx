import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { settings as settingsApi } from '../api.js';
import { Save, Check } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400";
const TEXTAREA = `${INPUT} resize-none`;

export default function Settings() {
  const { weddingId } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!weddingId) return;
    settingsApi
      .get(weddingId)
      .then((res) => setForm(flattenSettings(res.data.wedding)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weddingId]);

  function flattenSettings(w) {
    return {
      brideName: w.brideName || '',
      groomName: w.groomName || '',
      weddingDate: w.weddingDate ? w.weddingDate.split('T')[0] : '',
      venueName: w.venue?.name || '',
      venueAddress: w.venue?.address || '',
      venueCity: w.venue?.city || '',
      venueMapUrl: w.venue?.mapUrl || '',
      ceremonyTime: w.ceremony?.time || '',
      receptionTime: w.reception?.time || '',
      story: w.story || '',
      heroImage: w.heroImage || '',
      giftIntroText: w.giftSettings?.introText || '',
      giftSuggestedAmount: w.giftSettings?.suggestedAmount ?? '',
      giftMinAmount: w.giftSettings?.minAmount ?? '',
      giftBankName: w.giftSettings?.bankDetails?.bankName || '',
      giftAccountName: w.giftSettings?.bankDetails?.accountName || '',
      giftAccountNumber: w.giftSettings?.bankDetails?.accountNumber || '',
    };
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        brideName: form.brideName,
        groomName: form.groomName,
        weddingDate: form.weddingDate,
        story: form.story,
        heroImage: form.heroImage,
        venue: {
          name: form.venueName,
          address: form.venueAddress,
          city: form.venueCity,
          mapUrl: form.venueMapUrl,
        },
        ceremony: { time: form.ceremonyTime },
        reception: { time: form.receptionTime },
        giftSettings: {
          introText: form.giftIntroText,
          suggestedAmount: Number(form.giftSuggestedAmount) || 0,
          minAmount: Number(form.giftMinAmount) || 0,
          bankDetails: {
            bankName: form.giftBankName,
            accountName: form.giftAccountName,
            accountNumber: form.giftAccountNumber,
          },
        },
      };
      await settingsApi.update(weddingId, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error || 'Failed to load settings.'}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Edit your wedding details</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              saved ? 'bg-green-500' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}</>}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-6">
          {/* Couple */}
          <Section title="The Couple">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bride's Name">
                <input className={INPUT} value={form.brideName} onChange={(e) => set('brideName', e.target.value)} placeholder="Praise" />
              </Field>
              <Field label="Groom's Name">
                <input className={INPUT} value={form.groomName} onChange={(e) => set('groomName', e.target.value)} placeholder="Bright" />
              </Field>
            </div>
          </Section>

          {/* Date & Time */}
          <Section title="Date & Time">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Wedding Date">
                <input type="date" className={INPUT} value={form.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} />
              </Field>
              <Field label="Ceremony Time">
                <input className={INPUT} value={form.ceremonyTime} onChange={(e) => set('ceremonyTime', e.target.value)} placeholder="e.g. 11:00 AM" />
              </Field>
              <Field label="Reception Time">
                <input className={INPUT} value={form.receptionTime} onChange={(e) => set('receptionTime', e.target.value)} placeholder="e.g. 2:00 PM" />
              </Field>
            </div>
          </Section>

          {/* Venue */}
          <Section title="Venue">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Venue Name">
                <input className={INPUT} value={form.venueName} onChange={(e) => set('venueName', e.target.value)} placeholder="Grand Ballroom" />
              </Field>
              <Field label="City">
                <input className={INPUT} value={form.venueCity} onChange={(e) => set('venueCity', e.target.value)} placeholder="Lagos" />
              </Field>
            </div>
            <Field label="Address">
              <input className={INPUT} value={form.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} placeholder="123 Example Street" />
            </Field>
            <Field label="Google Maps URL" hint="Paste the full URL from Google Maps">
              <input className={INPUT} value={form.venueMapUrl} onChange={(e) => set('venueMapUrl', e.target.value)} placeholder="https://maps.google.com/…" />
            </Field>
          </Section>

          {/* Story */}
          <Section title="Our Story">
            <Field label="Story Text" hint="Displayed in the 'Our Story' section on the website">
              <textarea
                className={TEXTAREA}
                rows={6}
                value={form.story}
                onChange={(e) => set('story', e.target.value)}
                placeholder="Tell your story…"
              />
            </Field>
          </Section>

          {/* Hero Image */}
          <Section title="Hero Image">
            <Field label="Hero Image URL" hint="Cloudinary or any image URL for the main banner">
              <input className={INPUT} value={form.heroImage} onChange={(e) => set('heroImage', e.target.value)} placeholder="https://res.cloudinary.com/…" />
            </Field>
            {form.heroImage && (
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                <img src={form.heroImage} alt="Hero preview" className="h-40 w-full object-cover" />
              </div>
            )}
          </Section>

          {/* Gift Settings */}
          <Section title="Gift & Registry">
            <Field label="Introduction Text" hint="Shown at the top of the gifts page">
              <textarea
                className={TEXTAREA}
                rows={3}
                value={form.giftIntroText}
                onChange={(e) => set('giftIntroText', e.target.value)}
                placeholder="Your presence is the greatest gift. If you'd like to contribute…"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Suggested Amount (₦)" hint="Pre-filled in the gift form">
                <input type="number" min="0" className={INPUT} value={form.giftSuggestedAmount} onChange={(e) => set('giftSuggestedAmount', e.target.value)} placeholder="5000" />
              </Field>
              <Field label="Minimum Amount (₦)">
                <input type="number" min="0" className={INPUT} value={form.giftMinAmount} onChange={(e) => set('giftMinAmount', e.target.value)} placeholder="500" />
              </Field>
            </div>
          </Section>

          {/* Bank Details */}
          <Section title="Bank Transfer Details">
            <p className="text-xs text-gray-400 -mt-2">Displayed on the site for guests who prefer bank transfer.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Bank Name">
                <input className={INPUT} value={form.giftBankName} onChange={(e) => set('giftBankName', e.target.value)} placeholder="First Bank" />
              </Field>
              <Field label="Account Name">
                <input className={INPUT} value={form.giftAccountName} onChange={(e) => set('giftAccountName', e.target.value)} placeholder="Praise Adeyemi" />
              </Field>
              <Field label="Account Number">
                <input className={INPUT} value={form.giftAccountNumber} onChange={(e) => set('giftAccountNumber', e.target.value)} placeholder="0123456789" />
              </Field>
            </div>
          </Section>
        </div>

        {/* Bottom save button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              saved ? 'bg-green-500' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}</>}
          </button>
        </div>
      </div>
    </form>
  );
}
