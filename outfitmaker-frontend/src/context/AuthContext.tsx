import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, Gender } from '../types';
import { setStoredToken } from '../services/api';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dto: {
    name: string;
    phoneNumber: string;
    gender: Gender;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  confirmEmail: (email: string, verifyCode: string) => Promise<void>;
  resendEmailCode: (email: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'outfitmaker_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Keep the axios bearer token in sync with persisted user.
  useEffect(() => {
    setStoredToken(user?.token ?? null);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.signIn({ email, password });
      setUser(loggedIn);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (dto: {
      name: string;
      phoneNumber: string;
      gender: Gender;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      await authService.signUp({
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        gender: dto.gender,
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
      });
    },
    [],
  );

  const confirmEmail = useCallback(async (email: string, verifyCode: string) => {
    await authService.confirmEmail(email, verifyCode);
  }, []);

  const resendEmailCode = useCallback(async (email: string) => {
    await authService.resendEmailCode(email);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setStoredToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user?.token,
      isLoading,
      login,
      register,
      confirmEmail,
      resendEmailCode,
      logout,
    }),
    [user, isLoading, login, register, confirmEmail, resendEmailCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
