import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-fit flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-serif text-7xl font-bold text-burgundy">404</h1>
      <p className="mt-4 text-lg text-slate-soft">This page took the day off.</p>
      <Link to="/" className="btn-primary mt-8">Back to Home</Link>
    </div>
  );
}
