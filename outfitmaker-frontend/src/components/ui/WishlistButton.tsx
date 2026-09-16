import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { HeartFilledIcon, HeartIcon } from './Icons';

/** Labeled wishlist toggle used on the product details page. */
export function WishlistButton({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hasAnimated, setHasAnimated] = useState(false);

  const active = isFavorite(product.id);

  async function handleClick() {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await toggleFavorite(product);
      setHasAnimated(true);
      setTimeout(() => setHasAnimated(false), 500);
    } catch {
      navigate('/auth');
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className="inline-flex h-full min-w-44 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-burgundy/40 hover:text-burgundy sm:flex-none"
    >
      {active ? (
        <HeartFilledIcon className={`h-5 w-5 text-burgundy ${hasAnimated ? 'animate-heart' : ''}`} />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
      {active ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  );
}
