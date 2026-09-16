import { apiClient } from './api';
import type { ApiResponse, FavoriteProduct } from '../types';

/**
 * Favorites service — wraps the real favourite-product endpoints
 * (all require a Customer token).
 */

export async function getFavorites(): Promise<FavoriteProduct[]> {
  const res = await apiClient.get<ApiResponse<FavoriteProduct[]>>('/api/Order/GetFavouriteProducts');
  return res.data.data;
}

export async function addFavorite(productId: string): Promise<void> {
  await apiClient.post(`/api/Order/AddFavouriteProduct/${productId}`);
}

export async function removeFavorite(productId: string): Promise<void> {
  await apiClient.delete(`/api/Order/DeleteFavouriteProduct/${productId}`);
}
