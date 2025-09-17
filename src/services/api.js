/**
 * API Service - Gestione chiamate HTTP al backend Django
 */

import axios from 'axios'

// Configura istanza axios con environment variables Quasar standard
const apiClient = axios.create({
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

  async updateUserProfile(profileData) {
    const response = await apiClient.patch('/auth/profile/', profileData)
    return response.data
  },

  // Expenses endpoints
  async getExpenses(filters = {}) {
    const params = new URLSearchParams()

    if (filters.category) {
      params.append('category', filters.category)
    }
    if (filters.date_from) {
      params.append('date_from', filters.date_from)
    }
    if (filters.date_to) {
      params.append('date_to', filters.date_to)
    }

    const url = params.toString() ? `/expenses/?${params.toString()}` : '/expenses/'
    const response = await apiClient.get(url)
    return response.data
  },

  async createExpense(expenseData) {
    const response = await apiClient.post('/expenses/', expenseData)
    return response.data
  },

  async createExpenseWithFile(formData) {
    const response = await apiClient.post('/expenses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
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

  async updateBudget(id, budgetData) {
    const response = await apiClient.put(`/budgets/${id}/`, budgetData)
    return response.data
  },

  async deleteBudget(id) {
    await apiClient.delete(`/budgets/${id}/`)
  },

  async getCurrentBudgets() {
    const response = await apiClient.get('/budgets/current/')
    return response.data
  },

  // Spending Plans endpoints
  async getSpendingPlans() {
    const response = await apiClient.get('/spending-plans/')
    return response.data
  },

  async getSpendingPlan(id) {
    const response = await apiClient.get(`/spending-plans/${id}/`)
    return response.data
  },

  async createSpendingPlan(planData) {
    const response = await apiClient.post('/spending-plans/', planData)
    return response.data
  },

  async updateSpendingPlan(id, planData) {
    const response = await apiClient.put(`/spending-plans/${id}/`, planData)
    return response.data
  },

  async deleteSpendingPlan(id) {
    await apiClient.delete(`/spending-plans/${id}/`)
  },

  async getCurrentSpendingPlans() {
    const response = await apiClient.get('/spending-plans/current/')
    return response.data
  },

  async getSpendingPlansStatistics() {
    const response = await apiClient.get('/spending-plans/statistics/')
    return response.data
  },

  async copySpendingPlanToNextPeriod(id) {
    const response = await apiClient.post(`/spending-plans/${id}/copy_to_next_period/`)
    return response.data
  },

  // Planned Expenses endpoints
  async getPlannedExpenses() {
    const response = await apiClient.get('/planned-expenses/')
    return response.data
  },

  async getPlannedExpense(id) {
    const response = await apiClient.get(`/planned-expenses/${id}/`)
    return response.data
  },

  async createPlannedExpense(plannedExpenseData) {
    const response = await apiClient.post('/planned-expenses/', plannedExpenseData)
    return response.data
  },

  async updatePlannedExpense(id, plannedExpenseData) {
    const response = await apiClient.put(`/planned-expenses/${id}/`, plannedExpenseData)
    return response.data
  },

  async deletePlannedExpense(id) {
    await apiClient.delete(`/planned-expenses/${id}/`)
  },

  async addPaymentToPlannedExpense(id, paymentData) {
    const response = await apiClient.post(`/planned-expenses/${id}/add_payment/`, paymentData)
    return response.data
  },

  async getPlannedExpensesByStatus(status) {
    const response = await apiClient.get(`/planned-expenses/by_status/?status=${status}`)
    return response.data
  },

  async getPlannedExpensesDueSoon(days = 7) {
    const response = await apiClient.get(`/planned-expenses/due_soon/?days=${days}`)
    return response.data
  },

  async getPlannedExpensesPaymentSummary() {
    const response = await apiClient.get('/planned-expenses/payment_summary/')
    return response.data
  },

  // Family endpoints
  async getFamilies() {
    const response = await apiClient.get('/families/')
    return response.data
  },

  async getFamily(id) {
    const response = await apiClient.get(`/families/${id}/`)
    return response.data
  },

  async createFamily(familyData) {
    const response = await apiClient.post('/families/', familyData)
    return response.data
  },

  async updateFamily(id, familyData) {
    const response = await apiClient.put(`/families/${id}/`, familyData)
    return response.data
  },

  async deleteFamily(id) {
    await apiClient.delete(`/families/${id}/`)
  },

  async joinFamily(joinData) {
    const response = await apiClient.post('/families/join/', joinData)
    return response.data
  },

  async leaveFamily() {
    const response = await apiClient.post('/families/leave/')
    return response.data
  },

  async createFamilyInvitation(invitationData) {
    const response = await apiClient.post('/family-invitations/', invitationData)
    return response.data
  },

  async getFamilyInvitations() {
    const response = await apiClient.get('/family-invitations/')
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
