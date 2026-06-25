const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const ACCESS_DAYS = 1;
const REFRESH_DAYS = 7;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export function saveTokens(access: string, refresh?: string) {
  setCookie(ACCESS_KEY, access, ACCESS_DAYS);
  if (refresh) setCookie(REFRESH_KEY, refresh, REFRESH_DAYS);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_KEY);
}

export function clearTokens() {
  deleteCookie(ACCESS_KEY);
  deleteCookie(REFRESH_KEY);
}

/** Read access token from cookie string (for middleware / server). */
export function getAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ACCESS_KEY}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
