// Type definitions matching the OutFitMaker ASP.NET Core API contracts.

/** Generic wrapper returned by the backend for most endpoints. */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export type Gender = 0 | 1; // 0 = Male, 1 = Female

/** Sign-in request body. */
export interface SignInDto {
  email: string;
  password: string;
  fcmToken?: string;
}

/** Sign-up request body (multipart form). */
export interface BasicRegisterDto {
  name: string;
  phoneNumber: string;
  gender: Gender;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Authenticated user returned by SignIn. */
export interface AuthUser {
  id: string;
  token: string;
  email: string;
  name: string;
  phoneNumber: string;
  gender: Gender;
  emailConfirmed: boolean;
  size: string;
  role: string;
}

/** A product as returned by list/recommendation endpoints. */
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId?: string;
  colorId?: string;
  sizeId?: string;
  type?: ProductFeature;
  rate?: number;
  description?: string;
  categoryName?: string;
  /** Only present in GetProductById responses — per-size stock levels. */
  sizes?: ProductSizeStock[];
}

/** Shape used by a few endpoints that include category/gender info. */
export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rate?: number;
}

export type ProductFeature = 'Only' | 'star';

/** Body for Order endpoints. */
export interface AddOrderDto {
  orderItems: OrderItemDto[];
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  sizeName?: string;
  note?: string;
}

/** Per-size availability returned by GetProductById. */
export interface ProductSizeStock {
  sizeName: string;
  quantity: number;
}

/** Response of a placed order. */
export interface OrderResult {
  total: number;
  orderId: string;
}

/** Favorite product from GetFavouriteProducts. */
export interface FavoriteProduct {
  id: string;
  name: string;
  imageUrl: string;
  rate: number;
  price: number;
}

/** AI size prediction request forwarded by the backend. */
export interface SizePredictBody {
  input_data: number[];
}

/** Size prediction result. */
export interface SizePrediction {
  predicted_class: number;
  class_name: string;
}

/** Enums used to build query params (mirrors backend enums). */
export const GenderEnum = {
  Male: 0,
  Female: 1,
} as const;
export type GenderEnumValue = (typeof GenderEnum)[keyof typeof GenderEnum];

export const ProductFeatureEnum = {
  Only: 0,
  Star: 1,
} as const;
export type ProductFeatureValue = (typeof ProductFeatureEnum)[keyof typeof ProductFeatureEnum];

/** Filters for GetUniqueProducts. */
export interface GetUniqueProductsDto {
  colorId?: string;
  feature?: ProductFeatureValue;
  categoryId?: string;
  gender?: GenderEnumValue;
}
