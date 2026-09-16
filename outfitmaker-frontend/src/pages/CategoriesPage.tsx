import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../components/ui/Icons';

const CATEGORIES = [
  { name: 'Men', to: '/shop?g=male', gender: 'male', desc: 'Sharp-ready essentials', accent: '#2e2a25' },
  { name: 'Women', to: '/shop?g=female', gender: 'female', desc: 'Elegant everyday pieces', accent: '#6f1d2b' },
  { name: 'Unique Pieces', to: '/shop?unique=1', gender: '', desc: 'Limited, one-of-a-kind finds', accent: '#b28a4b' },
  { name: 'All Products', to: '/shop', gender: '', desc: 'Browse the full collection', accent: '#8f3340' },
];

export function CategoriesPage() {
  return (
    <div className="container-fit py-12 lg:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Browse by</p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Categories</h1>
        <p className="mt-4 text-lg text-slate-soft">
          Explore the collection grouped by gender and style.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.name}
            to={c.to}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div
              className="absolute inset-0 opacity-[0.06] transition group-hover:opacity-[0.12]"
              style={{ backgroundColor: c.accent }}
            />
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20" style={{ backgroundColor: c.accent }} />
            <div className="relative">
              <h2 className="font-serif text-2xl font-semibold text-ink">{c.name}</h2>
              <p className="mt-1 text-sm text-slate-soft">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy">
                Shop
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-burgundy p-10 text-center text-ivory">
        <h2 className="font-serif text-3xl font-semibold">Not sure where to start?</h2>
        <p className="mx-auto mt-3 max-w-md text-ivory/80">
          Let our AI find styles that match an image you love.
        </p>
        <Link to="/style-finder" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-sm font-semibold text-burgundy transition hover:bg-white">
          Try AI Style Finder
        </Link>
      </div>
    </div>
  );
}
