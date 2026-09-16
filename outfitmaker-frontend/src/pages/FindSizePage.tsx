import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { predictSize, getProductsBySize } from '../services/productService';
import { RulerIcon, SparkleIcon, ArrowRightIcon } from '../components/ui/Icons';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductCard } from '../components/ui/ProductCard';

type BodyShape = 'Slim' | 'Regular' | 'Curvy';
type Phase = 'form' | 'analyzing' | 'result' | 'error';

const BODY_SHAPES: BodyShape[] = ['Slim', 'Regular', 'Curvy'];
const BODY_SHAPE_CODES: Record<BodyShape, number> = { Slim: 0, Regular: 1, Curvy: 2 };

// Ordered per the size model's input features:
// weight, age, height, waist, hips, Body_Shape.
function buildInputData(
  weight: number,
  height: number,
  age: number,
  waist: number,
  hips: number,
  shape: BodyShape,
): number[] {
  return [weight, age, height, waist, hips, BODY_SHAPE_CODES[shape]];
}

export function FindSizePage() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shape, setShape] = useState<BodyShape>('Regular');
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    const wa = Number(waist);
    const hi = Number(hips);
    if (!w || !h || !a) {
      setFormError('Please enter your weight, height, and age.');
      return;
    }
    if (!wa || !hi) {
      setFormError('Please enter your waist and hip measurements to get an accurate size.');
      return;
    }
    setPhase('analyzing');
    try {
      const res = await predictSize(buildInputData(w, h, a, wa, hi, shape));
      const size = res.class_name || String(res.predicted_class);
      setResult(size);
      try {
        const products = await getProductsBySize(size);
        setRecommendations(products);
      } catch {
        setRecommendations([]);
      }
      setPhase('result');
    } catch {
      setPhase('error');
    }
  }

  if (phase === 'analyzing') {
    return (
      <div className="container-fit flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-white/70 p-12 text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
            <RulerIcon className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-semibold text-ink">
            FINDING YOUR PERFECT FIT…
          </h2>
          <p className="mt-3 text-sm text-slate-soft">
            Analyzing your measurements and body shape…
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="ai-dot" />
            <span className="ai-dot [animation-delay:150ms]" />
            <span className="ai-dot [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="container-fit flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorState
            title="We couldn't calculate your size right now."
            message="Please check your information and try again."
            actionLabel="Try Again"
            onAction={() => setPhase('form')}
          />
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="container-fit py-10 lg:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white/80 p-10 text-center animate-fade-up">
          <p className="eyebrow mb-6">YOUR RECOMMENDED SIZE</p>
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-burgundy text-ivory shadow-xl">
            <span className="font-serif text-5xl font-bold">{result}</span>
          </div>
          <p className="mt-7 text-base text-slate-soft">
            Based on your measurements, our AI recommends size{' '}
            <span className="font-semibold text-ink">{result}</span>.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={`/shop`} className="btn-primary">
              Shop My Size
            </Link>
            <button type="button" onClick={() => setPhase('form')} className="btn-ghost">
              Recalculate
            </button>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-3">Available in {result}</p>
              <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
                Recommended For You
              </h2>
              <p className="mt-2 text-sm text-slate-soft">
                Only items currently in stock in size {result}.
              </p>
            </div>
            <Link to={`/shop`} className="hidden items-center gap-1.5 text-sm font-semibold text-burgundy hover:underline sm:inline-flex">
              View All <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-white/70 p-10 text-center">
              <p className="text-sm text-slate-soft">
                We couldn't find in-stock items in size {result} right now. Check back soon or
                browse the full collection.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fit py-12 lg:py-16">
      <header className="mx-auto mb-10 max-w-xl text-center">
        <p className="eyebrow mb-4 flex items-center justify-center gap-2">
          <SparkleIcon className="h-4 w-4 text-burgundy" /> Find My Size
        </p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Find Your Perfect Fit</h1>
        <p className="mt-4 text-lg text-slate-soft">
          Measure your waist and hips for the most accurate size recommendation.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md rounded-3xl border border-line bg-white/70 p-8 shadow-sm"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Weight</span>
          <div className="flex items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-burgundy/50">
            <input
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-transparent py-3 text-base focus:outline-none focus:ring-0"
              placeholder="65"
              aria-label="Weight"
            />
            <span className="text-sm text-slate-faint">kg</span>
          </div>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-ink">Height</span>
          <div className="flex items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-burgundy/50">
            <input
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-transparent py-3 text-base focus:outline-none focus:ring-0"
              placeholder="175"
              aria-label="Height"
            />
            <span className="text-sm text-slate-faint">cm</span>
          </div>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-ink">Age</span>
          <div className="flex items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-burgundy/50">
            <input
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-transparent py-3 text-base focus:outline-none focus:ring-0"
              placeholder="24"
              aria-label="Age"
            />
            <span className="text-sm text-slate-faint">yrs</span>
          </div>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-ink">Waist</span>
          <div className="flex items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-burgundy/50">
            <input
              type="number"
              inputMode="decimal"
              min="40"
              max="180"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-full bg-transparent py-3 text-base focus:outline-none focus:ring-0"
              placeholder="75"
              aria-label="Waist"
            />
            <span className="text-sm text-slate-faint">cm</span>
          </div>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-ink">Hips</span>
          <div className="flex items-center rounded-2xl border border-line bg-ivory px-4 focus-within:border-burgundy/50">
            <input
              type="number"
              inputMode="decimal"
              min="50"
              max="200"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              className="w-full bg-transparent py-3 text-base focus:outline-none focus:ring-0"
              placeholder="95"
              aria-label="Hips"
            />
            <span className="text-sm text-slate-faint">cm</span>
          </div>
        </label>

        <fieldset className="mt-6">
          <legend className="mb-2 block text-sm font-medium text-ink">Body Shape</legend>
          <div className="grid grid-cols-3 gap-2">
            {BODY_SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShape(s)}
                aria-pressed={shape === s}
                className={`rounded-full border px-3 py-2.5 text-sm font-medium transition ${
                  shape === s
                    ? 'border-ink bg-ink text-ivory'
                    : 'border-line bg-white text-charcoal hover:border-ink/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        {formError && <p className="mt-4 text-sm text-burgundy">{formError}</p>}

        <button type="submit" className="btn-primary mt-7 w-full">
          Find My Size
        </button>
      </form>
    </div>
  );
}