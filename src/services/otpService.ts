import { api } from './api';

export async function requestOTP(
  email: string, password: string, loginType: string
): Promise<{ demoEmail: string }> {
  return api.post('/auth/request-otp', { email, password, loginType });
}

export async function verifyOTP(
  email: string, otp: string
): Promise<{ token: string; user: Record<string, unknown> }> {
  return api.post('/auth/verify-otp', { email, otp });
}
