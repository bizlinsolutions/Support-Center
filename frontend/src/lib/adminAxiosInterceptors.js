import {
  clearAdminSession,
  getAdminAccessToken,
  getAdminRefreshToken,
  setAdminSession,
} from './adminAuth';

export function setupAdminAxiosInterceptors(axiosInstance) {
  let refreshPromise = null;

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAdminAccessToken();
      if (token && !config.url?.startsWith('/admin/auth/')) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response) {
        const originalRequest = error.config || {};
        const isUnauthorized = error.response.status === 401;
        const isAuthRequest = originalRequest.url?.startsWith('/admin/auth/');
        const alreadyRetried = Boolean(originalRequest._retry);

        if (isUnauthorized && !isAuthRequest && !alreadyRetried) {
          const currentRefreshToken = getAdminRefreshToken();
          if (!currentRefreshToken) {
            clearAdminSession();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            if (!refreshPromise) {
              refreshPromise = axiosInstance
                .post('/admin/auth/refresh', { refreshToken: currentRefreshToken })
                .then((res) => {
                  setAdminSession({
                    accessToken: res.data.accessToken,
                    refreshToken: res.data.refreshToken,
                  });
                  return res.data.accessToken;
                })
                .finally(() => {
                  refreshPromise = null;
                });
            }

            const newAccessToken = await refreshPromise;
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            clearAdminSession();
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );
}
