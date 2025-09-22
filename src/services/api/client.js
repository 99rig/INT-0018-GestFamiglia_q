/**
 * API Client - Istanza axios condivisa e configurata
 */

import axios from 'axios'

// Configura istanza axios con environment variables Quasar standard
export const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api` : 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Interceptor per aggiungere token alle richieste
apiClient.interceptors.request.use((config) => {
  // Il token verrà aggiunto dal store auth quando necessario
  return config
})

// State per gestire il refresh dei token
let isRefreshing = false
let failedQueue = []

// Interceptor per gestire errori di autenticazione
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Non intercettare errori per le chiamate di auth per evitare loop infiniti
    if (originalRequest.url?.includes('/auth/logout/') ||
        originalRequest.url?.includes('/auth/refresh/')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Metti in coda le richieste fallite durante il refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Importa dinamicamente il store per evitare circular imports
        const { useAuthStore } = await import('../../stores/auth.js')
        const authStore = useAuthStore()

        const refreshSuccess = await authStore.refreshAccessToken()

        if (!refreshSuccess || !authStore.accessToken) {
          throw new Error('Token refresh failed')
        }

        const newToken = authStore.accessToken

        // Processa le richieste in coda
        failedQueue.forEach(({ resolve }) => resolve(newToken))
        failedQueue = []

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Fallback: rimuovi tokens e redirect al login
        failedQueue.forEach(({ reject }) => reject(refreshError))
        failedQueue = []

        const { useAuthStore } = await import('../../stores/auth.js')
        const authStore = useAuthStore()
        // Non attendere il logout per evitare potenziali loop
        authStore.logout().catch(() => {
          // Ignora errori di logout - l'importante è pulire lo stato locale
        })

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient