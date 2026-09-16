import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getBestSellerProducts } from '../services/productService';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductSkeletonGrid } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { HeroVisual } from '../components/ui/HeroVisual';
import { ArrowRightIcon, HeartIcon, RulerIcon, SparkleIcon } from '../components/ui/Icons';

const AI_FEATURES = [
  {
    to: '/style-finder',
    icon: <SparkleIcon className="h-6 w-6" />,
    title: 'AI Style Finder',
    text: 'Upload an image and discover visually similar styles from our collection.',
    cta: 'Explore',
  },
  {
    to: '/find-size',
    icon: <RulerIcon className="h-6 w-6" />,
    title: 'Find My Size',
    text: 'Get a size recommendation based on your measurements and body shape.',
    cta: 'Find Size',
  },
  {
    to: '/shop',
    icon: <HeartIcon className="h-6 w-6" />,
    title: 'Shop The Look',
    text: 'Discover fashion pieces selected to match your style.',
    cta: 'Shop',
  },
];

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getBestSellerProducts();
      setProducts(data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-fit grid min-h-[540px] items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow mb-5">AI-Powered Fashion</p>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Style That
              <br />
              Finds <span className="italic text-burgundy">You.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-soft">
              Discover fashion that matches your taste, your look, and your fit — powered by
              intelligent visual search.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Explore Collection
              </Link>
              <Link to="/style-finder" className="btn-outline">
                Try AI Style Finder
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl lg:max-w-none">
            <div className="aspect-[720/760]">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* AI FEATURE INTRODUCTION */}
      <section className="border-y border-line bg-cream/60">
        <div className="container-fit py-16">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-3">Practical Intelligence</p>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
              Fashion, guided by AI
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {AI_FEATURES.map((f, i) => (
              <Link
                key={f.to}
                to={f.to}
                className="group rounded-3xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-xl"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-ivory">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-soft">{f.text}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy">
                  {f.cta}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-fit py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Popular right now</p>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Best Sellers</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy hover:underline"
          >
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {status === 'loading' && <ProductSkeletonGrid count={4} />}
        {status === 'error' && (
          <ErrorState
            title="We couldn’t load the products."
            message="Please try again in a moment."
            onAction={load}
          />
        )}
        {status === 'success' && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
