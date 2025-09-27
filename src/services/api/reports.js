/**
 * Reports API - Gestione budget, piani di spesa e spese pianificate
 */

import { apiClient } from './client.js'

export const reportsAPI = {
  // ===== BUDGETS =====
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

  // ===== SPENDING PLANS =====
  async getSpendingPlans(showAll = false) {
    const params = showAll ? '?show_all=true' : ''
    const response = await apiClient.get(`/spending-plans/${params}`)
    return response.data
  },

  // 🚀 Endpoint ottimizzato per select - solo ID e nome
  async getSpendingPlansForSelect() {
    const response = await apiClient.get('/spending-plans/select_options/')
    return response.data
  },

  async getSpendingPlan(id) {
    const response = await apiClient.get(`/spending-plans/${id}/`)
    return response.data
  },

  // 🚀 Endpoint ottimizzato per i dettagli del piano
  async getSpendingPlanDetails(id) {
    const response = await apiClient.get(`/spending-plans/${id}/details/`)
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

  async smartCloneSpendingPlan(id, options = {}) {
    const response = await apiClient.post(`/spending-plans/${id}/smart_clone/`, options)
    return response.data
  },

  // ===== PLANNED EXPENSES =====
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

  async getPlannedExpensePayments(plannedExpenseId) {
    const response = await apiClient.get(`/planned-expenses/${plannedExpenseId}/payments/`)
    return response.data
  },

  async generateRecurringInstallments(plannedExpenseId) {
    const response = await apiClient.post(`/planned-expenses/${plannedExpenseId}/generate_recurring/`)
    return response.data
  },

  async updatePlannedExpenseInstallment(plannedExpenseId, installmentNumber, data) {
    const response = await apiClient.patch(`/planned-expenses/${plannedExpenseId}/installments/${installmentNumber}/`, data)
    return response.data
  }
}

export default reportsAPI