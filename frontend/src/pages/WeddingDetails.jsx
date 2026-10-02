import { MapPin, Clock, Calendar } from 'lucide-react';

import { useWedding } from '../hooks/useWedding.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

function EventDetail({ event }) {
  if (!event) return null;
  return (
    <Reveal>
      <article className="flex h-full flex-col border border-ink/10 bg-alabaster px-8 py-12 text-center sm:px-10 lg:px-14">
        <span className="luxe-label">{event.title}</span>
        <h3 className="mt-5 font-serif text-3xl sm:text-4xl">{event.venue}</h3>

        <div className="mx-auto mt-6 h-px w-10 bg-gold/50" />

        <ul className="mt-8 space-y-5 text-stone">
          <li className="flex flex-col items-center gap-2">
            <Calendar size={16} strokeWidth={1.4} className="text-gold" />
            <span className="font-sans text-sm uppercase tracking-wide2 text-ink">
              {event.date}
            </span>
          </li>
          <li className="flex flex-col items-center gap-2">
            <Clock size={16} strokeWidth={1.4} className="text-gold" />
            <span className="font-serif text-lg italic">{event.time}</span>
          </li>
          <li className="flex flex-col items-center gap-2">
            <MapPin size={16} strokeWidth={1.4} className="text-gold" />
            <span className="max-w-xs">{event.address}</span>
          </li>
        </ul>

        {event.note && (
          <p className="mt-8 font-serif text-base italic text-ink/70">
            {event.note}
          </p>
        )}

        {event.mapUrl && (
          <div className="mt-auto pt-10">
            <Button href={event.mapUrl} variant="outline">
              Get directions
            </Button>
          </div>
        )}
      </article>
    </Reveal>
  );
}

export default function WeddingDetails() {
  const { wedding } = useWedding();

  return (
    <>
      <PageHeader
        label="The Day"
        title="Wedding Details"
        intro={`Join us on ${wedding.weddingDate} in ${wedding.location}.`}
      />

      <Section tone="light" className="!pt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          <EventDetail event={wedding.ceremony} />
          <EventDetail event={wedding.reception} />
        </div>
      </Section>

      {/* Practical notes — calm, text-forward, no clutter */}
      <Section tone="linen">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="luxe-label">Good to Know</span>
          <h2 className="text-section-title mt-5">A few small things</h2>
          <div className="rule-gold mt-7" />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
          {[
            {
              h: 'Attire',
              p: 'Black-tie. We’d love to see you dressed in your finest for the evening.',
            },
            {
              h: 'Travel',
              p: 'The nearest airport is Florence. Montepulciano is roughly a ninety-minute drive.',
            },
            {
              h: 'Children',
              p: 'As much as we adore them, we have chosen to celebrate as an adults-only evening.',
            },
          ].map((note) => (
            <Reveal key={note.h} className="text-center">
              <h3 className="font-serif text-2xl">{note.h}</h3>
              <p className="mx-auto mt-4 max-w-xs text-stone leading-relaxed">
                {note.p}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Button to="/rsvp" variant="solid">
            RSVP
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
