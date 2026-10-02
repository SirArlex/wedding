import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <p className="luxe-label">Lost your way?</p>
        <h1 className="mt-6 font-serif text-7xl sm:text-8xl">404</h1>
        <p className="mx-auto mt-6 max-w-sm text-stone leading-relaxed">
          This page doesn’t exist — but the celebration still does.
        </p>
        <div className="mt-10">
          <Button to="/" variant="outline">
            Return home
          </Button>
        </div>
      </div>
    </section>
  );
}
