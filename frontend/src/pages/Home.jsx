import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

import { useWedding } from '../hooks/useWedding.jsx';
import Hero from '../components/Hero.jsx';
import Section, { SectionHeading } from '../components/Section.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Home() {
  const { wedding } = useWedding();

  return (
    <>
      <Hero />

      {/* ── Couple story (editorial, asymmetric) ─────────────── */}
      <Section tone="light" id="story">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="overflow-hidden">
              <img
                src={wedding.story?.image}
                alt="The couple"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7 lg:pl-6">
            <span className="luxe-label">Our Story</span>
            <h2 className="text-section-title mt-5">{wedding.story?.intro}</h2>
            <div className="mt-8 space-y-5 text-stone leading-relaxed">
              {wedding.story?.paragraphs?.slice(0, 2).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-10">
              <Button to="/our-story" variant="quiet">
                Read our story
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── Wedding details ──────────────────────────────────── */}
      <Section tone="linen" id="details">
        <Reveal>
          <SectionHeading
            label="The Day"
            title="Wedding Details"
            intro="We invite you to celebrate with us. Here is everything you will need for the day."
          />
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2">
          {[wedding.ceremony, wedding.reception].map((event) => (
            <Reveal key={event.title} className="bg-linen">
              <div className="flex h-full flex-col px-8 py-12 text-center sm:px-10 lg:px-14">
                <span className="luxe-label">{event.title}</span>
                <h3 className="mt-5 font-serif text-3xl">{event.venue}</h3>

                <dl className="mt-8 space-y-3 text-stone">
                  <div>
                    <dd className="font-sans text-sm uppercase tracking-wide2">
                      {event.date}
                    </dd>
                  </div>
                  <div>
                    <dd className="font-serif text-lg italic">{event.time}</dd>
                  </div>
                  <div>
                    <dd>{event.address}</dd>
                  </div>
                </dl>

                {event.note && (
                  <p className="mt-6 font-serif text-base italic text-ink/70">
                    {event.note}
                  </p>
                )}

                {event.mapUrl && (
                  <div className="mt-auto pt-8">
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wide2 text-ink transition-colors duration-300 hover:text-gold"
                    >
                      <MapPin size={14} strokeWidth={1.5} />
                      View location
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Button to="/details" variant="outline">
            All details
          </Button>
        </Reveal>
      </Section>

      {/* ── Gallery preview ──────────────────────────────────── */}
      <Section tone="light" id="gallery">
        <Reveal>
          <SectionHeading label="Moments" title="A Glimpse" />
        </Reveal>
        <Reveal className="mt-14">
          <GalleryGrid images={wedding.gallery} limit={6} />
        </Reveal>
        <Reveal className="mt-14 text-center">
          <Button to="/gallery" variant="quiet">
            See the full gallery
          </Button>
        </Reveal>
      </Section>

      {/* ── RSVP invitation ──────────────────────────────────── */}
      <Section tone="ink" id="rsvp-preview">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="luxe-label text-gold-soft">Kindly Respond</span>
          <h2 className="text-section-title mt-6 text-alabaster">
            Will you join us?
          </h2>
          <div className="mx-auto mt-7 h-px w-16 bg-gold-soft/40" />
          <p className="mx-auto mt-7 max-w-prose2 text-lg leading-relaxed text-alabaster/75">
            Your presence would mean the world to us. Please let us know whether
            you can make it so we can prepare to celebrate with you.
          </p>
          <div className="mt-10">
            <Button
              to="/rsvp"
              variant="outline"
              className="border-gold-soft/50 text-alabaster hover:bg-gold-soft hover:text-ink hover:border-gold-soft"
            >
              RSVP
            </Button>
          </div>
        </Reveal>
      </Section>

      {/* ── Gift preview ─────────────────────────────────────── */}
      <Section tone="light" id="gift-preview">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <span className="luxe-label">{wedding.gift?.heading}</span>
            <h2 className="text-section-title mt-5">
              A blessing, if you wish
            </h2>
            <p className="mt-8 max-w-prose2 text-stone leading-relaxed">
              {wedding.gift?.message}
            </p>
            <div className="mt-10">
              <Button to="/gift" variant="solid">
                Send a Gift
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=1400&q=80"
                alt=""
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
