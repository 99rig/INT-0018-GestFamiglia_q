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

        const newToken = await authStore.refreshToken()

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
        authStore.logout()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient