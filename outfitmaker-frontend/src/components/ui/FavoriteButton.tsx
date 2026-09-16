import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { HeartFilledIcon, HeartIcon } from './Icons';

interface FavoriteButtonProps {
  product: Product;
  /** Style variant: visible-on-hover card button or always-visible. */
  variant?: 'hover' | 'always';
  className?: string;
}

export function FavoriteButton({ product, variant = 'hover', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  const favorite = isFavorite(product.id);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await toggleFavorite(product);
      setAnimating(true);
      setBounceKey((k) => k + 1);
    } catch {
      navigate('/auth');
    }
  }

  const baseClasses =
    'group/fav relative flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ' +
    (variant === 'always'
      ? 'bg-white/90 text-ink shadow-sm hover:bg-white'
      : 'bg-white/85 text-ink opacity-0 shadow-sm group-hover/card:opacity-100 hover:bg-white focus-visible:opacity-100') +
    ' ' +
    className;

  return (
    <button
      type="button"
      key={bounceKey}
      onClick={handleClick}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorite}
      className={baseClasses}
    >
      {favorite ? (
        <HeartFilledIcon
          className={`h-5 w-5 text-burgundy ${animating ? 'animate-heart' : ''}`}
        />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
    </button>
  );
}
