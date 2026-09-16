import { apiClient } from './api';
import type {
  AddOrderDto,
  ApiResponse,
  GetUniqueProductsDto,
  OrderResult,
  Product,
  SizePrediction,
} from '../types';

/**
 * Product service — thin wrapper around the real Order endpoints
 * that return product lists. No fake endpoints are created.
 */

export interface ProductListResponse {
  data: Product[];
  message: string;
  status: number;
}

function mapProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];
  return [];
}

export async function getBestSellerProducts(): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>('/api/Order/GetBestSellerProducts');
  return mapProducts(res.data.data);
}

export async function getMaleProducts(): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>('/api/Order/GetMaleProducts');
  return mapProducts(res.data.data);
}

export async function getFemaleProducts(): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>('/api/Order/GetFemaleProducts');
  return mapProducts(res.data.data);
}

export async function getMaleProductsWithCategory(categoryId: string): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>(
    `/api/Order/GetMaleProductsWithCategory/${categoryId}`,
  );
  return mapProducts(res.data.data);
}

export async function getFemaleProductsWithCategory(categoryId: string): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>(
    `/api/Order/GetFemaleProductsWithCategory/${categoryId}`,
  );
  return mapProducts(res.data.data);
}

export async function getUniqueProducts(filters: GetUniqueProductsDto): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>('/api/Order/GetUniqueProducts', {
    params: {
      colorId: filters.colorId ?? undefined,
      feature: filters.feature ?? undefined,
      categoryId: filters.categoryId ?? undefined,
      gender: filters.gender ?? undefined,
    } as Record<string, unknown>,
  });
  return mapProducts(res.data.data);
}

export async function getProductById(id: string): Promise<Product | null> {
  const res = await apiClient.get<ApiResponse<Product>>(`/api/Order/GetProductById/${id}`);
  if (res.data.status !== 200) return null;
  return res.data.data ?? null;
}

/** Fetch products that are in stock for a given size name (e.g. "L", "M"). */
export async function getProductsBySize(sizeName: string): Promise<Product[]> {
  const res = await apiClient.get<ApiResponse<Product[]>>(
    `/api/Order/GetProductsBySize/${encodeURIComponent(sizeName)}`,
  );
  return mapProducts(res.data.data);
}

/**
 * All product listing variants (best sellers, male, female).
 */
export type ProductQuery =
  | { kind: 'best' }
  | { kind: 'male' }
  | { kind: 'female' }
  | { kind: 'male-category'; categoryId: string }
  | { kind: 'female-category'; categoryId: string }
  | { kind: 'unique'; filters: GetUniqueProductsDto };

export async function fetchProducts(query: ProductQuery): Promise<Product[]> {
  switch (query.kind) {
    case 'best':
      return getBestSellerProducts();
    case 'male':
      return getMaleProducts();
    case 'female':
      return getFemaleProducts();
    case 'male-category':
      return getMaleProductsWithCategory(query.categoryId);
    case 'female-category':
      return getFemaleProductsWithCategory(query.categoryId);
    case 'unique':
      return getUniqueProducts(query.filters);
  }
}

/* ------------------------- Orders & Cart ------------------------- */

export async function addOrder(dto: AddOrderDto): Promise<OrderResult> {
  const res = await apiClient.post<ApiResponse<OrderResult>>('/api/Order/AddOrder', dto);
  return res.data.data;
}

export async function getMyOrders(): Promise<unknown> {
  const res = await apiClient.get<ApiResponse<unknown>>('/api/Order/GetMyOrders');
  return res.data.data;
}

/** Persist the selected size against the signed-in user's profile. */
export async function saveUserSize(size: string): Promise<void> {
  await apiClient.post('/api/User/ConfirmSize', null, { params: { size } });
}

/* ------------------------- AI Services ------------------------- */

/** Forward an uploaded image to the AI visual recommendation service. */
export async function recommendFromImage(file: File): Promise<Product[]> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<Product[]>>('/api/Order/recommend', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return Array.isArray(res.data.data) ? (res.data.data as Product[]) : [];
}

/** Forward body measurements to the size prediction model. */
export async function predictSize(inputData: number[]): Promise<SizePrediction> {
  const res = await apiClient.post<SizePrediction | string>('/api/Order/predict', {
    input_data: inputData,
  });
  if (typeof res.data === 'string') return JSON.parse(res.data) as SizePrediction;
  return res.data as SizePrediction;
}
