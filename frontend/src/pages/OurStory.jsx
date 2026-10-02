import { useWedding } from '../hooks/useWedding.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

export default function OurStory() {
  const { wedding } = useWedding();
  const story = wedding.story || {};

  return (
    <>
      <PageHeader label="Our Story" title={story.intro || 'How two paths became one'} />

      {/* Lead image */}
      <Section tone="light" className="!pt-10">
        <Reveal>
          <div className="mx-auto max-w-4xl overflow-hidden">
            <img
              src={story.image}
              alt="The couple"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </Reveal>

        {/* Narrative */}
        <Reveal className="mx-auto mt-16 max-w-prose2">
          <div className="space-y-7 text-lg leading-relaxed text-ink/80">
            {story.paragraphs?.map((p, i) => (
              <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-gold' : ''}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        {/* Quote */}
        {story.quote && (
          <Reveal className="mx-auto mt-20 max-w-3xl text-center">
            <div className="rule-gold mb-10" />
            <blockquote className="font-serif text-2xl italic leading-relaxed text-ink sm:text-3xl">
              “{story.quote}”
            </blockquote>
            <div className="rule-gold mt-10" />
          </Reveal>
        )}
      </Section>

      {/* Gentle CTA onward */}
      <Section tone="linen" className="text-center">
        <Reveal>
          <h2 className="text-section-title">We can’t wait to celebrate</h2>
          <p className="mx-auto mt-6 max-w-prose2 text-stone leading-relaxed">
            Come be part of the next chapter. We’d love to know you’ll be there.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Button to="/rsvp" variant="solid">
              RSVP
            </Button>
            <Button to="/details" variant="outline">
              See the details
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
