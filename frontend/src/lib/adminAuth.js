const ADMIN_ACCESS_TOKEN_KEY = 'adminAccessToken';
const ADMIN_REFRESH_TOKEN_KEY = 'adminRefreshToken';
const ADMIN_KEY = 'adminAuthUser';
const ADMIN_AUTH_CHANGE_EVENT = 'admin-auth-state-changed';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getAdminAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function getAdminRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
}

export function getAdminUser() {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession({ accessToken, refreshToken, admin }) {
  if (!isBrowser()) return;
  if (accessToken) localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}

export function clearAdminSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}

export function getAdminAuthChangeEventName() {
  return ADMIN_AUTH_CHANGE_EVENT;
}
