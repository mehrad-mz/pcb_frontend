import { api } from "./client";
import { clearTokens } from "./tokens";

export const PHONE_REGEX = /^09\d{9}$/;

export type PhoneCheckResponse = {
  exists: boolean;
  method: string;
  next_step: string;
};

export type AuthTokenResponse = {
  /** true = user still needs to set a password */
  has_password: boolean;
  access: string;
  refresh: string;
};

export type UserProfile = {
  id: number;
  phone: string;
  full_name?: string;
  first_name?: string;
  email?: string;
  gender?: string;
  birth_date?: string;
  avatar?: string;
};

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export async function phoneCheck(
  phone: string,
  method: "otp" | "password" = "otp"
): Promise<PhoneCheckResponse> {
  return api.post<PhoneCheckResponse>("/api/v1/auth/phone-check/", { phone, method });
}

export async function sendOtp(phone: string): Promise<void> {
  await api.post("/api/v1/auth/otp/send/", { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthTokenResponse> {
  return api.post<AuthTokenResponse>("/api/v1/auth/otp/verify/", {
    phone,
    code,
  });
}

export async function resendOtp(phone: string): Promise<void> {
  await api.post("/api/v1/auth/resend-otp/", { phone });
}

export async function passwordLogin(
  phone: string,
  password: string
): Promise<AuthTokenResponse> {
  return api.post<AuthTokenResponse>("/api/v1/auth/login/", { phone, password });
}

export async function setPassword(
  password: string,
  confirmPassword: string
): Promise<{ detail?: string; message?: string }> {
  return api.post("/api/v1/auth/set-password/", {
    password,
    confirm_password: confirmPassword,
  });
}

export async function getProfile(): Promise<UserProfile> {
  return api.get<UserProfile>("/api/v1/auth/profile/");
}

export function logout() {
  clearTokens();
}
