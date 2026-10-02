import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../components/Button.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * GiftCallback — the page Paystack redirects to after a payment attempt.
 * URL: /gift/callback?reference=xxx&trxref=xxx
 *
 * We verify the transaction server-to-server; the frontend never trusts
 * Paystack's redirect alone to mark a donation as successful.
 */
export default function GiftCallback() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed' | 'error'
  const [amount, setAmount]   = useState('');
  const [donorName, setDonorName] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const res  = await fetch(`${API_BASE}/donations/verify/${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (data.success && data.status === 'success') {
          setAmount(data.amount || '');
          setDonorName(data.donorName || '');
          setStatus('success');
        } else if (data.status === 'pending') {
          // Paystack can be slow; wait briefly and retry once
          setTimeout(async () => {
            try {
              const res2  = await fetch(`${API_BASE}/donations/verify/${encodeURIComponent(reference)}`);
              const data2 = await res2.json();
              if (data2.success && data2.status === 'success') {
                setAmount(data2.amount || '');
                setDonorName(data2.donorName || '');
                setStatus('success');
              } else {
                setStatus('failed');
              }
            } catch {
              setStatus('error');
            }
          }, 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('error');
      }
    }

    verify();
  }, [reference]);

  if (status === 'loading') {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <p className="luxe-label">One moment</p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl">
            Confirming your gift…
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-stone leading-relaxed">
            We're verifying your payment with our payment partner. This only takes a second.
          </p>
          <div className="mt-10 flex justify-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <p className="luxe-label">With Gratitude</p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl sm:leading-tight">
            Thank you for your kindness
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-stone leading-relaxed">
            {donorName
              ? `Your generosity touches us deeply, ${donorName.split(' ')[0]}.`
              : 'Your generosity touches us deeply.'}{' '}
            {amount && `Your gift of ${amount} has been received.`}
            {' '}It will be treasured always.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button to="/" variant="solid">
              Back to the wedding
            </Button>
            <Button to="/gift" variant="outline">
              View the Gift Wall
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'failed') {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <p className="luxe-label">Payment Unsuccessful</p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl">
            Something didn't go through
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-stone leading-relaxed">
            Your payment was not completed. No charge was made. Please try again —
            the couple would still love to receive your gift.
          </p>
          <div className="mt-10">
            <Button to="/gift" variant="solid">
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <p className="luxe-label">Something went wrong</p>
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl">
          We couldn't confirm your payment
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-stone leading-relaxed">
          If you were charged, please get in touch and we'll sort it out right away.
          Otherwise, please try again.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button to="/gift" variant="solid">
            Try again
          </Button>
          <Button to="/" variant="outline">
            Return home
          </Button>
        </div>
      </div>
    </section>
  );
}
