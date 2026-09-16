import { apiClient, AI_BASE_URL, AI_WAKE_URL } from './api';
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

const AI_STARTUP_POLL_MS = 3000;
const AI_STARTUP_TIMEOUT_MS = 90_000;

function basename(name: string): string {
  return name.split(/[\\/]/).pop() ?? name;
}

async function aiHealthOk(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_BASE_URL}/health`, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Free-tier containers sleep on idle; SnapDeploy serves an HTML wake page
 * instead of JSON while warming up. Trigger the wake API and poll /health
 * until the model container responds, so direct browser calls succeed.
 */
async function ensureAiAwake(): Promise<void> {
  if (await aiHealthOk()) return;
  await fetch(AI_WAKE_URL, { method: 'POST' }).catch(() => {});
  const deadline = Date.now() + AI_STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, AI_STARTUP_POLL_MS));
    if (await aiHealthOk()) return;
  }
  throw new Error('AI container is still starting up');
}

/** Upload an image and return visually similar products from the collection. */
export async function recommendFromImage(file: File): Promise<Product[]> {
  await ensureAiAwake();

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${AI_BASE_URL}/recommend`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`AI recommend failed: ${res.status}`);

  const data = (await res.json()) as { recommended_images?: string[] };
  const recommended = (data.recommended_images ?? []).map(basename);

  // Map matched image filenames back to products in the catalog.
  const catalog = await getBestSellerProducts();
  return catalog.filter((p) => recommended.includes(basename(p.imageUrl)));
}

/** Predict clothing size from body measurements. */
export async function predictSize(inputData: number[]): Promise<SizePrediction> {
  await ensureAiAwake();

  const res = await fetch(`${AI_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_data: inputData }),
  });
  if (!res.ok) throw new Error(`AI predict failed: ${res.status}`);

  const data = (await res.json()) as SizePrediction;
  return data;
}
