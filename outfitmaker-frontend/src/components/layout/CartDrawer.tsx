import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl, formatPrice } from '../../utils/imageHelper';
import { CloseIcon, MinusIcon, PlusIcon } from '../ui/Icons';
import { useState } from 'react';

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    checkout,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  async function handleCheckout() {
    setError(null);
    if (!isAuthenticated) {
      closeCart();
      navigate('/auth');
      return;
    }
    setPlacing(true);
    try {
      const res = await checkout();
      closeCart();
      navigate(`/order-success?orderId=${res.orderId}&total=${res.total}`);
    } catch {
      setError('We couldn’t place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Your Cart{' '}
            {items.length > 0 && (
              <span className="text-sm font-sans font-normal text-slate-faint">({items.length})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-ink transition hover:bg-ink/5"
            aria-label="Close cart"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="text-5xl">🛍️</div>
            <h3 className="text-lg font-semibold text-ink">Your cart is empty</h3>
            <p className="text-sm text-slate-soft">Discover pieces that match your style.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                closeCart();
                navigate('/shop');
              }}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-line">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-4 py-5">
                    <Link
                      to={`/product/${product.id}`}
                      onClick={closeCart}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-sand"
                    >
                      <img
                        src={resolveImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).src = resolveImageUrl(null))}
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-medium text-ink hover:text-burgundy"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="text-xs text-slate-faint hover:text-burgundy"
                          aria-label={`Remove ${product.name}`}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-2 text-ink transition hover:text-burgundy"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-2 text-ink transition hover:text-burgundy"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-semibold text-ink">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-soft">Subtotal</span>
                <span className="font-serif text-2xl font-semibold text-ink">{formatPrice(subtotal)}</span>
              </div>
              <button type="button" className="btn-primary w-full" onClick={handleCheckout} disabled={placing}>
                {placing ? 'Placing order…' : isAuthenticated ? 'Checkout' : 'Sign in to Checkout'}
              </button>
              {error && <p className="mt-3 text-center text-sm text-burgundy">{error}</p>}
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full text-center text-xs text-slate-faint underline-offset-4 hover:text-burgundy hover:underline"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
