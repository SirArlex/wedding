import { useWedding } from '../hooks/useWedding.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

export default function Gallery() {
  const { wedding } = useWedding();

  return (
    <>
      <PageHeader
        label="Moments"
        title="The Gallery"
        intro="A collection of the moments that have led us here."
      />

      <Section tone="light" className="!pt-12">
        <Reveal>
          <GalleryGrid images={wedding.gallery} />
        </Reveal>
      </Section>

      <Section tone="linen" className="text-center">
        <Reveal>
          <h2 className="text-section-title">More to come</h2>
          <p className="mx-auto mt-6 max-w-prose2 text-stone leading-relaxed">
            We’ll be adding photographs from the celebration here after the day.
            For now, we hope these give you a feeling for what’s ahead.
          </p>
          <div className="mt-10">
            <Button to="/rsvp" variant="solid">
              RSVP
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
