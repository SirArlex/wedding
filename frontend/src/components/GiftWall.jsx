import { useState, useEffect } from 'react';
import Reveal from './Reveal.jsx';
import Section from './Section.jsx';
import { SectionHeading } from './Section.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * GiftWall — displays confirmed donations.
 * Email addresses are never shown; the server never returns them.
 * Fetches from GET /api/donations/wall?slug={weddingSlug}
 */
export default function GiftWall({ weddingSlug }) {
  const [gifts, setGifts]       = useState([]);
  const [summary, setSummary]   = useState(null); // { total, count, formatted }
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!weddingSlug) return;

    async function fetchWall() {
      try {
        const [wallRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/donations/wall?slug=${encodeURIComponent(weddingSlug)}`),
          fetch(`${API_BASE}/donations/summary?slug=${encodeURIComponent(weddingSlug)}`),
        ]);
        const wallData    = await wallRes.json();
        const summaryData = await summaryRes.json();

        if (wallData.success) setGifts(wallData.data || []);
        if (summaryData.success) setSummary(summaryData.data);
      } catch {
        // Silently fail — Gift Wall is an enhancement, not critical
      } finally {
        setLoading(false);
      }
    }

    fetchWall();
  }, [weddingSlug]);

  // Don't render the section at all if there's nothing to show
  if (!loading && gifts.length === 0) return null;

  return (
    <Section tone="linen">
      <Reveal>
        <SectionHeading
          label="Messages From Loved Ones"
          title="The Gift Wall"
        />
      </Reveal>

      {/* Summary bar */}
      {summary && summary.count > 0 && (
        <Reveal delay={0.05}>
          <div className="mx-auto mb-14 max-w-prose2 text-center">
            <p className="font-serif text-2xl text-ink">
              {summary.count} {summary.count === 1 ? 'gift' : 'gifts'} received
              {summary.formatted && summary.total > 0 && (
                <> · <span className="text-gold">{summary.formatted}</span></>
              )}
            </p>
          </div>
        </Reveal>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="mx-auto grid max-w-editorial gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift, i) => (
            <Reveal key={gift.id} delay={i * 0.06}>
              <div className="flex flex-col gap-3 border border-ink/10 bg-alabaster p-6">
                {/* Name + amount */}
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-serif text-lg text-ink">{gift.name}</span>
                  <span className="shrink-0 font-sans text-xs uppercase tracking-wide2 text-gold">
                    {gift.amount}
                  </span>
                </div>

                {/* Message */}
                {gift.message && (
                  <p className="font-sans text-sm leading-relaxed text-stone">
                    "{gift.message}"
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
