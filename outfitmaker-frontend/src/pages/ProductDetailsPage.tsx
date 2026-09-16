import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import type { Product, ProductSizeStock } from '../types';
import { getProductById, getBestSellerProducts, saveUserSize } from '../services/productService';
import { resolveImageUrl, formatPrice } from '../utils/imageHelper';
import { ProductCard } from '../components/ui/ProductCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { WishlistButton } from '../components/ui/WishlistButton';
import { BagIcon, MinusIcon, PlusIcon, RulerIcon, ArrowRightIcon } from '../components/ui/Icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ALL_SIZES = ['XXS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const incoming = (location.state as { product?: Product } | null)?.product;

  const [product, setProduct] = useState<Product | null>(incoming ?? null);
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(incoming ? 'success' : 'loading');
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addedMsg, setAddedMsg] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [savingSize, setSavingSize] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (incoming) {
      // If navigated with product in state, still fetch to get sizes
      (async () => {
        try {
          const fresh = await getProductById(id);
          if (fresh) {
            setProduct(fresh);
            const map = new Map<string, number>();
            fresh.sizes?.forEach((s: ProductSizeStock) => map.set(s.sizeName, s.quantity));
            setStockMap(map);
          }
          setStatus('success');
        } catch {
          setStatus('error');
        }
      })();
      return;
    }
    (async () => {
      setStatus('loading');
      try {
        const found = await getProductById(id);
        setProduct(found);
        const map = new Map<string, number>();
        found?.sizes?.forEach((s: ProductSizeStock) => map.set(s.sizeName, s.quantity));
        setStockMap(map);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    })();
  }, [id, incoming]);

  useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        const data = await getBestSellerProducts();
        setRelated(data.filter((p) => p.id !== product.id).slice(0, 4));
      } catch {
        /* ignore */
      }
    })();
  }, [product]);

  async function handleSelectSize(size: string) {
    if ((stockMap.get(size) ?? 0) === 0) return;
    setSelectedSize(size);
    setSizeError(null);
    if (!user?.token) return;
    setSavingSize(true);
    try {
      await saveUserSize(size);
    } catch {
      /* size is best-effort; cart works without persisting it */
    } finally {
      setSavingSize(false);
    }
  }

  async function handleAddToCart() {
    if (!product) return;
    if (!selectedSize) {
      setSizeError('Please select a size first.');
      return;
    }
    if ((stockMap.get(selectedSize) ?? 0) === 0) {
      setSizeError('This size is out of stock.');
      return;
    }
    if (user?.token) {
      try {
        await saveUserSize(selectedSize);
      } catch {
        /* ignore */
      }
    }
    addToCart(product, quantity, selectedSize);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  }

  if (status === 'loading') return <div className="container-fit py-16"><LoadingState label="Loading product…" /></div>;
  if (status === 'error')
    return (
      <div className="container-fit py-16">
        <ErrorState
          title="We couldn't load this product."
          message="Please try again in a moment."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );

  if (!product)
    return (
      <div className="container-fit py-16">
        <ErrorState
          title="Product not found."
          message="This product may no longer be available."
          actionLabel="Back to Shop"
          onAction={() => (window.location.href = '/shop')}
        />
      </div>
    );

  const p = product;

  return (
    <div className="container-fit py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-soft">
        <Link to="/shop" className="hover:text-burgundy">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-ink line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl bg-sand">
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).src = resolveImageUrl(null))}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="eyebrow mb-3">{product.categoryName || 'The Collection'}</p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{product.name}</h1>
          <p className="mt-4 font-serif text-3xl font-semibold text-burgundy">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 leading-relaxed text-slate-soft">
            A piece from the OutFitMaker collection, selected to complement your style and your fit.
          </p>

          {/* Size selector — driven by live stock */}
          <div className="mt-8">
            <span className="mb-3 block text-sm font-semibold text-ink">Select Size</span>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => {
                const qty = stockMap.get(s) ?? 0;
                const outOfStock = qty === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectSize(s)}
                    disabled={outOfStock}
                    aria-pressed={selectedSize === s}
                    className={`min-w-12 rounded-full border px-3.5 py-2.5 text-sm font-medium transition ${
                      outOfStock
                        ? 'cursor-not-allowed border-line bg-cream/60 text-slate-faint line-through'
                        : selectedSize === s
                          ? 'border-ink bg-ink text-ivory'
                          : 'border-line bg-white text-charcoal hover:border-ink/40'
                    }`}
                  >
                    {s}
                    {outOfStock && ' ✕'}
                  </button>
                );
              })}
            </div>
            {savingSize && <p className="mt-2 text-xs text-slate-soft">Saving your size…</p>}
          </div>

          {sizeError && <p className="mt-3 text-sm font-medium text-burgundy">{sizeError}</p>}

          {/* Size help */}
          <Link
            to="/find-size"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:underline"
          >
            <RulerIcon className="h-4 w-4" />
            Need help finding your size? <span className="font-semibold">Find My Size</span>
          </Link>

          {/* Quantity */}
          <div className="mt-6">
            <span className="mb-3 block text-sm font-semibold text-ink">Quantity</span>
            <div className="inline-flex items-center rounded-full border border-line bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-ink transition hover:text-burgundy"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="p-3 text-ink transition hover:text-burgundy"
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="btn-primary flex-1" onClick={handleAddToCart}>
              <BagIcon className="h-4 w-4" />
              Add To Cart
            </button>
            <WishlistButton product={p} />
          </div>

          {addedMsg && (
            <p className="mt-3 text-sm font-medium text-burgundy animate-fade-in">
              Added to your cart ✓
            </p>
          )}
        </div>
      </div>

      {/* You may also like */}
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Keep exploring</p>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">You May Also Like</h2>
          </div>
          <Link to="/style-finder" className="inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy hover:underline">
            AI Style Finder <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}