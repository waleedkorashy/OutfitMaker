import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl, formatPrice } from '../utils/imageHelper';
import { EmptyState } from '../components/ui/EmptyState';
import { HeartFilledIcon, BagIcon } from '../components/ui/Icons';
import { useCart } from '../context/CartContext';

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="container-fit py-16">
        <EmptyState
          title="Sign in to see your favorites"
          message="Your saved pieces will appear here."
          actionLabel="Sign In"
          onAction={() => (window.location.href = '/auth')}
        />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container-fit py-16">
        <h1 className="mb-8 text-4xl font-semibold text-ink">Your Favorites</h1>
        <EmptyState
          title="Your favorites are waiting for you."
          message="Tap the heart on any product to save it here."
          actionLabel="Explore Collection"
          onAction={() => (window.location.href = '/shop')}
        />
      </div>
    );
  }

  return (
    <div className="container-fit py-12">
      <header className="mb-8">
        <p className="eyebrow mb-3">Saved for later</p>
        <h1 className="text-4xl font-semibold text-ink">Your Favorites</h1>
      </header>

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {favorites.map((f) => (
          <article key={f.id} className="group/card">
            <Link to={`/product/${f.id}`} className="block overflow-hidden rounded-2xl bg-sand">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img
                  src={resolveImageUrl(f.imageUrl)}
                  alt={f.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  onError={(e) => ((e.target as HTMLImageElement).src = resolveImageUrl(null))}
                />
              </div>
            </Link>
            <div className="mt-3">
              <Link to={`/product/${f.id}`} className="line-clamp-1 font-medium text-ink hover:text-burgundy">
                {f.name}
              </Link>
              <p className="mt-1 font-serif text-lg font-semibold text-burgundy">{formatPrice(f.price)}</p>
              <button
                type="button"
                onClick={() =>
                  addToCart({ id: f.id, name: f.name, imageUrl: f.imageUrl, price: f.price })
                }
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-burgundy"
              >
                <BagIcon className="h-4 w-4" /> Add to Cart
              </button>
              <span className="ml-3 inline-flex items-center gap-1 text-xs text-slate-faint">
                <HeartFilledIcon className="h-3.5 w-3.5 text-burgundy" /> Saved
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
