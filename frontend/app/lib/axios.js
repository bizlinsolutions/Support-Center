import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split('=')[1] : null;
}

function setCookie(name, value, maxAge) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

let refreshPromise = null;

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    const skipAuth = ['/auth/login', '/auth/signup', '/auth/refresh'].some(p => config.url?.startsWith(p));
    if (token && !skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const originalRequest = error.config || {};
      const isUnauthorized = error.response.status === 401;
      const isAuthRequest = originalRequest.url?.startsWith('/auth/');
      const alreadyRetried = Boolean(originalRequest._retry);

      if (isUnauthorized && !isAuthRequest && !alreadyRetried) {
        const currentRefreshToken = getCookie('refreshToken');
        if (!currentRefreshToken) {
          clearCookie('token');
          clearCookie('refreshToken');
          clearCookie('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_BASE}/auth/refresh`, { refreshToken: currentRefreshToken })
              .then((res) => {
                const { accessToken, refreshToken } = res.data;
                setCookie('token', accessToken, 7 * 24 * 60 * 60);
                setCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60);
                return accessToken;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }

          const newAccessToken = await refreshPromise;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearCookie('token');
          clearCookie('refreshToken');
          clearCookie('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      console.error('API error:', error.response.status, error.response.data);
    } else {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
