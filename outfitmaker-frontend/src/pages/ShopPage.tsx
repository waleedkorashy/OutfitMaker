import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import { GenderEnum } from '../types';
import { fetchProducts } from '../services/productService';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductSkeletonGrid } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchIcon, CloseIcon } from '../components/ui/Icons';

type GenderFilter = 'all' | 'male' | 'female';

const GENDER_LABELS: Record<Exclude<GenderFilter, 'all'>, string> = {
  male: 'Men',
  female: 'Women',
};

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const genderParam = (searchParams.get('g') as GenderFilter) || 'all';
  const query = searchParams.get('q') || '';
  const uniqueOnly = searchParams.get('unique') === '1';

  const gender = genderParam === 'all' ? undefined : genderParam;
  const search = query;

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      let data: Product[];
      if (uniqueOnly) {
        data = await fetchProducts({
          kind: 'unique',
          filters: {
            gender: gender ? (gender === 'male' ? GenderEnum.Male : GenderEnum.Female) : undefined,
          },
        });
      } else if (gender === 'male') {
        data = await fetchProducts({ kind: 'male' });
      } else if (gender === 'female') {
        data = await fetchProducts({ kind: 'female' });
      } else {
        data = await fetchProducts({ kind: 'best' });
      }
      // Client-side search filter (backend has no free-text search endpoint).
      const filtered = search
        ? data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : data;
      setProducts(filtered);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [gender, search, uniqueOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const setGender = (value: GenderFilter) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('g');
    else next.set('g', value);
    setSearchParams(next);
  };

  // Hardcoded filter chips derive from params we support via real endpoints.
  const filterChips = useMemo(() => {
    const removeParam = (key: string) => {
      const next = new URLSearchParams(searchParams);
      next.delete(key);
      setSearchParams(next, { replace: true });
    };

    const chips: { label: string; onRemove: () => void }[] = [];
    if (gender) {
      chips.push({
        label: GENDER_LABELS[gender],
        onRemove: () => removeParam('g'),
      });
    }
    if (uniqueOnly) {
      chips.push({
        label: 'Unique Pieces',
        onRemove: () => removeParam('unique'),
      });
    }
    if (query) {
      chips.push({
        label: `“${query}”`,
        onRemove: () => removeParam('q'),
      });
    }
    return chips;
  }, [gender, query, uniqueOnly, searchParams, setSearchParams]);

  return (
    <div className="container-fit py-12 lg:py-16">
      <header className="mb-8">
        <p className="eyebrow mb-3">The Collection</p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Shop</h1>
      </header>

      {/* Search + filters bar */}
      <div className="mb-8 flex flex-col gap-4">
        <form
          role="search"
          className="flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3 focus-within:border-burgundy/40"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const value = String(form.get('q') || '').trim();
            const next = new URLSearchParams(searchParams);
            if (value) next.set('q', value);
            else next.delete('q');
            setSearchParams(next);
          }}
        >
          <SearchIcon className="h-5 w-5 text-slate-soft" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm focus:outline-none focus:ring-0"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGender('all')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              genderParam === 'all'
                ? 'border-ink bg-ink text-ivory'
                : 'border-line bg-white text-charcoal hover:border-ink/40'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              genderParam === 'male'
                ? 'border-ink bg-ink text-ivory'
                : 'border-line bg-white text-charcoal hover:border-ink/40'
            }`}
          >
            Men
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              genderParam === 'female'
                ? 'border-ink bg-ink text-ivory'
                : 'border-line bg-white text-charcoal hover:border-ink/40'
            }`}
          >
            Women
          </button>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (uniqueOnly) next.delete('unique');
              else next.set('unique', '1');
              setSearchParams(next);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              uniqueOnly
                ? 'border-burgundy bg-burgundy text-white'
                : 'border-line bg-white text-charcoal hover:border-burgundy/40'
            }`}
          >
            Unique Pieces
          </button>
        </div>

        {/* Active filter chips */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filterChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full bg-burgundy/10 px-3 py-1.5 text-xs font-medium text-burgundy"
              >
                {chip.label}
                <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label}`} className="hover:text-burgundy-dark">
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {status === 'loading' && <ProductSkeletonGrid count={8} />}
      {status === 'error' && (
        <ErrorState
          title="We couldn’t load the products."
          message="Please check your connection and try again."
          onAction={load}
        />
      )}
      {status === 'success' && products.length === 0 && (
        <EmptyState title="No products found" message="Try adjusting your search or filters." />
      )}
      {status === 'success' && products.length > 0 && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center text-xs text-slate-faint">
        Showing {status === 'success' ? products.length : '…'} product
        {products.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
