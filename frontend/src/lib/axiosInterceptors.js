import { clearAuthSession, getAccessToken, getRefreshToken, setAuthSession } from './auth'

export function setupAxiosInterceptors(axiosInstance) {
  let refreshPromise = null

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken()
      if (token && !config.url?.startsWith('/auth/')) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (config.data && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response) {
        const originalRequest = error.config || {}
        const isUnauthorized = error.response.status === 401
        const isAuthRequest = originalRequest.url?.startsWith('/auth/')
        const alreadyRetried = Boolean(originalRequest._retry)

        if (isUnauthorized && !isAuthRequest && !alreadyRetried) {
          const currentRefreshToken = getRefreshToken()
          if (!currentRefreshToken) {
            clearAuthSession()
            return Promise.reject(error)
          }

          originalRequest._retry = true

          try {
            if (!refreshPromise) {
              refreshPromise = axiosInstance
                .post('/auth/refresh', { refreshToken: currentRefreshToken })
                .then((res) => {
                  setAuthSession({
                    accessToken: res.data.accessToken,
                    refreshToken: res.data.refreshToken,
                  })
                  return res.data.accessToken
                })
                .finally(() => {
                  refreshPromise = null
                })
            }

            const newAccessToken = await refreshPromise
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return axiosInstance(originalRequest)
          } catch (refreshError) {
            clearAuthSession()
            return Promise.reject(refreshError)
          }
        }

        console.error('API error:', error.response.status, error.response.data)
      } else {
        console.error('Network error:', error.message)
      }
      return Promise.reject(error)
    }
  )
}
