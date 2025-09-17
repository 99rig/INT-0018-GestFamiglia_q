/**
 * API Service - Gestione chiamate HTTP al backend Django
 */

import axios from 'axios'

// Configura istanza axios
const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://192.168.1.125:8000/api',
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

// Interceptor per gestire errori di autenticazione
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto, gestito dal store auth
      console.log('Token expired, handled by auth store')
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth endpoints
  async login(email, password) {
    const response = await apiClient.post('/auth/login/', {
      email,
      password
    })
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken
    })
    return response.data
  },

  async logout() {
    await apiClient.post('/auth/logout/')
  },

  async getUserProfile() {
    const response = await apiClient.get('/auth/profile/')
    return response.data
  },

  // Expenses endpoints
  async getExpenses() {
    const response = await apiClient.get('/expenses/')
    return response.data
  },

  async createExpense(expenseData) {
    const response = await apiClient.post('/expenses/', expenseData)
    return response.data
  },

  async updateExpense(id, expenseData) {
    const response = await apiClient.put(`/expenses/${id}/`, expenseData)
    return response.data
  },

  async deleteExpense(id) {
    await apiClient.delete(`/expenses/${id}/`)
  },

  // Categories endpoints
  async getCategories() {
    const response = await apiClient.get('/categories/')
    return response.data
  },

  async getSubcategories() {
    const response = await apiClient.get('/subcategories/')
    return response.data
  },

  // Budgets endpoints
  async getBudgets() {
    const response = await apiClient.get('/budgets/')
    return response.data
  },

  async createBudget(budgetData) {
    const response = await apiClient.post('/budgets/', budgetData)
    return response.data
  },

  // Generic HTTP methods
  async get(url) {
    return await apiClient.get(url)
  },

  async post(url, data) {
    return await apiClient.post(url, data)
  },

  // Utility per impostare il token
  setAuthToken(token) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  },

  // Expose defaults for external access
  get defaults() {
    return apiClient.defaults
  }
}

export default api