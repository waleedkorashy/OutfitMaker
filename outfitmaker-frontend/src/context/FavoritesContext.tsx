import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FavoriteProduct, Product } from '../types';
import * as favoritesService from '../services/favoriteService';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: FavoriteProduct[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const { isAuthenticated } = useAuth();

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch {
      // ignore — favorites are best-effort
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favorites.some((f) => f.id === productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to save favorites');
      }
      const existing = isFavorite(product.id);
      if (existing) {
        await favoritesService.removeFavorite(product.id);
        setFavorites((prev) => prev.filter((f) => f.id !== product.id));
      } else {
        await favoritesService.addFavorite(product.id);
        setFavorites((prev) => [
          ...prev,
          {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            rate: product.rate ?? 0,
            price: product.price,
          },
        ]);
      }
    },
    [isAuthenticated, isFavorite],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, isFavorite, toggleFavorite, refreshFavorites }),
    [favorites, isFavorite, toggleFavorite, refreshFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
