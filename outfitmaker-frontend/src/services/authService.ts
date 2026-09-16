import { apiClient } from './api';
import type { AuthUser, BasicRegisterDto, SignInDto } from '../types';

/**
 * Auth service — wraps the real UserController endpoints.
 */

export interface AuthResponse<T> {
  status: number;
  message: string;
  data: T;
}

export async function signIn(dto: SignInDto): Promise<AuthUser> {
  const res = await apiClient.post<AuthResponse<AuthUser>>('/api/User/SignIn', dto);
  assertSuccess(res.data);
  return res.data.data;
}

export async function signUp(dto: BasicRegisterDto): Promise<unknown> {
  const form = new FormData();
  form.append('Name', dto.name);
  form.append('PhoneNumber', dto.phoneNumber);
  form.append('Gender', String(dto.gender));
  form.append('Email', dto.email);
  form.append('Password', dto.password);
  form.append('ConfirmPassword', dto.confirmPassword);
  const res = await apiClient.post<AuthResponse<unknown>>('/api/User/SignUp', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  assertSuccess(res.data);
  return res.data.data;
}

export async function confirmEmail(email: string, verifyCode: string): Promise<void> {
  const res = await apiClient.post<AuthResponse<unknown>>('/api/User/ConfirmEmail', {
    email,
    verifyCode,
  });
  assertSuccess(res.data);
}

export async function resendEmailCode(email: string): Promise<void> {
  const res = await apiClient.post<AuthResponse<unknown>>('/api/User/ResendEmailCode', null, {
    params: { email },
  });
  assertSuccess(res.data);
}

/**
 * The backend always answers HTTP 200 and carries the real outcome in the
 * body (status 200 = ok, 400/500 = failure). Throw on non-200 so callers
 * surface the message in the UI instead of silently "succeeding".
 */
function assertSuccess(res: { status: number; message: string }): void {
  if (res.status !== 200) {
    const message = (res.message ?? '').replace(/^Fail\s*/, '').trim();
    throw new Error(message || 'Something went wrong. Please try again.');
  }
}
