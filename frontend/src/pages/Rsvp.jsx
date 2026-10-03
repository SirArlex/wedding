import { useState } from 'react';

import { useWedding } from '../hooks/useWedding.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';
import ThankYou from '../components/ThankYou.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const inputBase =
  'w-full border-0 border-b border-ink/20 bg-transparent px-0 py-3 font-sans ' +
  'text-ink placeholder:text-stone/50 focus:border-gold focus:outline-none ' +
  'focus:ring-0 transition-colors duration-300';

const labelBase = 'block font-sans text-xs uppercase tracking-wide2 text-stone';

export default function Rsvp() {
  const { wedding } = useWedding();
  const [submitted, setSubmitted] = useState(false);
  const [submittedAttending, setSubmittedAttending] = useState('yes');
  const [submittedName, setSubmittedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    attending: 'yes',
    guests: '1',
    message: '',
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setServerError('');
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email.';
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
      const res = await fetch(`${API_BASE}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingSlug: wedding.slug || 'praise-and-bright',
          fullName: form.name,
          email: form.email,
          attending: form.attending,
          guestCount: form.attending === 'yes' ? Number(form.guests) : 1,
          message: form.message || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Duplicate RSVP is a "nice" error — show inline without alarming the user
        if (data.code === 'DUPLICATE_RSVP') {
          setServerError(data.message || 'We already have your RSVP. Thank you!');
        } else {
          setServerError(data.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      // Success
      setSubmittedAttending(form.attending);
      setSubmittedName(form.name);
      setSubmitted(true);
    } catch {
      setServerError('Unable to submit right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <ThankYou
        label="Thank You"
        title={
          submittedAttending === 'yes'
            ? "We can't wait to see you"
            : "You'll be dearly missed"
        }
        message={
          submittedAttending === 'yes'
            ? `Thank you, ${submittedName.split(' ')[0]}. Your response has been noted and we are so happy you'll be joining us in ${wedding.location}.`
            : `Thank you for letting us know, ${submittedName.split(' ')[0]}. We'll miss you, but we understand — and we'll raise a glass to you.`
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        label="Kindly Respond"
        title="RSVP"
        intro={`Please respond by the first of May, 2025. We've reserved a place for you at ${wedding.location}.`}
      />

      <Section tone="light" className="!pt-12">
        <Reveal>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto max-w-xl space-y-10"
          >
            {/* Server error banner */}
            {serverError && (
              <div className="border border-ink/20 bg-linen px-5 py-4 font-sans text-sm text-ink">
                {serverError}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className={labelBase}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputBase}
                placeholder="Your name"
                aria-invalid={!!errors.name}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-2 font-sans text-xs text-red-700/80">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelBase}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputBase}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-2 font-sans text-xs text-red-700/80">{errors.email}</p>
              )}
            </div>

            {/* Attending */}
            <fieldset>
              <legend className={labelBase}>Will you be attending?</legend>
              <div className="mt-4 flex gap-8">
                {[
                  { value: 'yes', label: 'Joyfully accepts' },
                  { value: 'no', label: 'Regretfully declines' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 font-serif text-lg"
                  >
                    <input
                      type="radio"
                      name="attending"
                      value={opt.value}
                      checked={form.attending === opt.value}
                      onChange={(e) => update('attending', e.target.value)}
                      className="h-4 w-4 accent-gold"
                      disabled={loading}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Guests — only relevant if attending */}
            {form.attending === 'yes' && (
              <div>
                <label htmlFor="guests" className={labelBase}>
                  Number of guests (including yourself)
                </label>
                <select
                  id="guests"
                  value={form.guests}
                  onChange={(e) => update('guests', e.target.value)}
                  className={`${inputBase} cursor-pointer`}
                  disabled={loading}
                >
                  {['1', '2', '3', '4'].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label htmlFor="message" className={labelBase}>
                A note to the couple{' '}
                <span className="normal-case tracking-normal text-stone/60">(optional)</span>
              </label>
              <textarea
                id="message"
                rows={3}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                className={`${inputBase} resize-none`}
                placeholder="Share your wishes…"
                disabled={loading}
              />
            </div>

            <div className="pt-2 text-center">
              <Button type="submit" variant="solid" disabled={loading}>
                {loading ? 'Sending…' : 'Send response'}
              </Button>
            </div>
          </form>
        </Reveal>
      </Section>
    </>
  );
}
