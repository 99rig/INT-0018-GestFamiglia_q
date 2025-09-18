/**
 * API Index - Esporta tutte le API in modo organizzato
 */

// Importa tutti i moduli API
import { apiClient } from './client.js'
import { authAPI } from './auth.js'
import { expensesAPI } from './expenses.js'
import { categoriesAPI } from './categories.js'
import { reportsAPI } from './reports.js'
import { usersAPI } from './users.js'

// ===== API ORGANIZZATA PER MODULI =====
export const API = {
  auth: authAPI,
  expenses: expensesAPI,
  categories: categoriesAPI,
  reports: reportsAPI,
  users: usersAPI,

  // Utility methods che accedono direttamente al client
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

// ===== COMPATIBILITÀ CON API VECCHIA =====
// Manteniamo l'oggetto api flat per compatibilità con il codice esistente
export const api = {
  // Auth endpoints
  login: authAPI.login,
  refreshToken: authAPI.refreshToken,
  register: authAPI.register,
  logout: authAPI.logout,
  getUserProfile: authAPI.getUserProfile,
  getCurrentUser: authAPI.getCurrentUser,
  updateUserProfile: authAPI.updateUserProfile,

  // Expenses endpoints
  getExpenses: expensesAPI.getExpenses,
  createExpense: expensesAPI.createExpense,
  createExpenseWithFile: expensesAPI.createExpenseWithFile,
  updateExpense: expensesAPI.updateExpense,
  deleteExpense: expensesAPI.deleteExpense,

  // Categories endpoints
  getCategories: categoriesAPI.getCategories,
  createCategory: categoriesAPI.createCategory,
  updateCategory: categoriesAPI.updateCategory,
  deleteCategory: categoriesAPI.deleteCategory,

  // Budgets endpoints
  getBudgets: reportsAPI.getBudgets,
  createBudget: reportsAPI.createBudget,
  updateBudget: reportsAPI.updateBudget,
  deleteBudget: reportsAPI.deleteBudget,
  getCurrentBudgets: reportsAPI.getCurrentBudgets,

  // Spending Plans endpoints
  getSpendingPlans: reportsAPI.getSpendingPlans,
  getSpendingPlan: reportsAPI.getSpendingPlan,
  getSpendingPlanDetails: reportsAPI.getSpendingPlanDetails, // 🚀 Nuovo endpoint ottimizzato
  createSpendingPlan: reportsAPI.createSpendingPlan,
  updateSpendingPlan: reportsAPI.updateSpendingPlan,
  deleteSpendingPlan: reportsAPI.deleteSpendingPlan,
  getCurrentSpendingPlans: reportsAPI.getCurrentSpendingPlans,
  getSpendingPlansStatistics: reportsAPI.getSpendingPlansStatistics,
  copySpendingPlanToNextPeriod: reportsAPI.copySpendingPlanToNextPeriod,
  smartCloneSpendingPlan: reportsAPI.smartCloneSpendingPlan,

  // Planned Expenses endpoints
  getPlannedExpenses: reportsAPI.getPlannedExpenses,
  getPlannedExpense: reportsAPI.getPlannedExpense,
  createPlannedExpense: reportsAPI.createPlannedExpense,
  updatePlannedExpense: reportsAPI.updatePlannedExpense,
  deletePlannedExpense: reportsAPI.deletePlannedExpense,
  addPaymentToPlannedExpense: reportsAPI.addPaymentToPlannedExpense,
  getPlannedExpensesByStatus: reportsAPI.getPlannedExpensesByStatus,
  getPlannedExpensesDueSoon: reportsAPI.getPlannedExpensesDueSoon,
  getPlannedExpensesPaymentSummary: reportsAPI.getPlannedExpensesPaymentSummary,
  getPlannedExpensePayments: reportsAPI.getPlannedExpensePayments,

  // Family endpoints
  getFamilies: usersAPI.getFamilies,
  getFamily: usersAPI.getFamily,
  createFamily: usersAPI.createFamily,
  updateFamily: usersAPI.updateFamily,
  deleteFamily: usersAPI.deleteFamily,
  joinFamily: usersAPI.joinFamily,
  leaveFamily: usersAPI.leaveFamily,
  createFamilyInvitation: usersAPI.createFamilyInvitation,
  getFamilyInvitations: usersAPI.getFamilyInvitations,
  getReceivedInvitations: usersAPI.getReceivedInvitations,
  acceptInvitation: usersAPI.acceptInvitation,

  // Generic HTTP methods
  get: API.get,
  post: API.post,

  // Utility methods
  setAuthToken: API.setAuthToken,
  get defaults() {
    return API.defaults
  }
}

// Export per compatibilità
export default api