import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../types';
import { addOrder } from '../services/productService';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
  sizeName?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, sizeName?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Place the order against the backend. Requires authentication. */
  checkout: () => Promise<{ total: number; orderId: string }>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const STORAGE_KEY = 'outfitmaker_cart';
const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1, sizeName?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.sizeName === sizeName);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.sizeName === sizeName
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, sizeName }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const checkout = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Please sign in to checkout');
    const result = await addOrder({
      orderItems: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        sizeName: i.sizeName,
      })),
    });
    setItems([]);
    return result;
  }, [items, isAuthenticated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      isOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      count,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      isOpen,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
