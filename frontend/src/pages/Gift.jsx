import { useState, useEffect } from 'react';

import { useWedding } from '../hooks/useWedding.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { SectionHeading } from '../components/Section.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';
import ThankYou from '../components/ThankYou.jsx';
import GiftWall from '../components/GiftWall.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const presetAmounts = ['2000', '5000', '10000', '25000'];
const presetLabels   = ['₦2,000', '₦5,000', '₦10,000', '₦25,000'];

const inputBase =
  'w-full border-0 border-b border-ink/20 bg-transparent px-0 py-3 font-sans ' +
  'text-ink placeholder:text-stone/50 focus:border-gold focus:outline-none ' +
  'focus:ring-0 transition-colors duration-300';
const labelBase = 'block font-sans text-xs uppercase tracking-wide2 text-stone';

export default function Gift() {
  const { wedding } = useWedding();
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState('');
  const [amount, setAmount]         = useState('5000');
  const [custom, setCustom]         = useState('');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [note, setNote]             = useState('');
  const [anonymous, setAnonymous]   = useState(false);
  const [errors, setErrors]         = useState({});

  // Naira amount in number
  const effectiveAmount = custom.trim() ? Number(custom.trim()) : Number(amount);

  function formatDisplay(n) {
    if (!n || isNaN(n)) return '₦0';
    return `₦${Number(n).toLocaleString('en-NG')}`;
  }

  function validate() {
    const next = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email.';
    }
    if (!effectiveAmount || effectiveAmount < 100) {
      next.amount = 'Minimum donation is ₦100.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/donations/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingSlug: wedding.slug || 'praise-and-bright',
          donorName: name,
          email,
          amountNaira: effectiveAmount,
          message: note || undefined,
          anonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // Redirect to Paystack checkout page
      window.location.href = data.authorizationUrl;
    } catch {
      setServerError('Unable to reach the payment gateway. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        label={wedding.gift?.heading || 'A Gift'}
        title="Send a Gift"
        intro={wedding.gift?.message}
      />

      <Section tone="light" className="!pt-12">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Editorial image */}
          <Reveal className="order-2 lg:order-1">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80"
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </Reveal>

          {/* Gift form */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Server error */}
              {serverError && (
                <div className="border border-ink/20 bg-linen px-5 py-4 font-sans text-sm text-ink">
                  {serverError}
                </div>
              )}

              {/* Amount presets */}
              <div>
                <span className={labelBase}>Choose an amount</span>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {presetAmounts.map((a, i) => {
                    const active = !custom.trim() && amount === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => { setAmount(a); setCustom(''); setErrors((e) => ({ ...e, amount: undefined })); }}
                        className={`border py-4 font-serif text-base transition-all duration-300 ${
                          active
                            ? 'border-ink bg-ink text-alabaster'
                            : 'border-ink/20 text-ink hover:border-ink'
                        }`}
                      >
                        {presetLabels[i]}
                      </button>
                    );
                  })}
                </div>
                {errors.amount && (
                  <p className="mt-2 font-sans text-xs text-red-700/80">{errors.amount}</p>
                )}
              </div>

              {/* Custom amount */}
              <div>
                <label htmlFor="custom" className={labelBase}>
                  Or enter your own (₦)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-0 top-3 font-serif text-xl text-stone">
                    ₦
                  </span>
                  <input
                    id="custom"
                    type="number"
                    min="100"
                    step="100"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setErrors((e2) => ({ ...e2, amount: undefined })); }}
                    className={`${inputBase} pl-5`}
                    placeholder="Amount in Naira"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="gift-name" className={labelBase}>
                  Your name
                </label>
                <input
                  id="gift-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((err) => ({ ...err, name: undefined })); }}
                  className={inputBase}
                  placeholder="So the couple knows who to thank"
                  disabled={loading}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-2 font-sans text-xs text-red-700/80">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="gift-email" className={labelBase}>
                  Email
                </label>
                <input
                  id="gift-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: undefined })); }}
                  className={inputBase}
                  placeholder="For your payment receipt"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-2 font-sans text-xs text-red-700/80">{errors.email}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label htmlFor="gift-note" className={labelBase}>
                  A message{' '}
                  <span className="normal-case tracking-normal text-stone/60">(optional)</span>
                </label>
                <textarea
                  id="gift-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`${inputBase} resize-none`}
                  placeholder="Your wishes for the couple…"
                  disabled={loading}
                />
              </div>

              {/* Anonymous option */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                  disabled={loading}
                />
                <span className="font-sans text-sm text-stone">
                  Show my gift as Anonymous on the Gift Wall
                </span>
              </label>

              <div className="pt-2">
                <Button type="submit" variant="solid" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? 'Redirecting…' : `Continue — ${formatDisplay(effectiveAmount)}`}
                </Button>
                <p className="mt-5 font-sans text-xs leading-relaxed text-stone/70">
                  You'll be taken to Paystack's secure checkout. Your card details are
                  never shared with us.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </Section>

      {/* Gift Wall — shown beneath the form */}
      <GiftWall weddingSlug={wedding.slug || 'praise-and-bright'} />
    </>
  );
}
