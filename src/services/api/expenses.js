/**
 * Expenses API - Gestione spese
 */

import { apiClient } from './client.js'

export const expensesAPI = {
  // CRUD Spese
  async getExpenses(filters = {}) {
    const params = new URLSearchParams()

    if (filters.search) {
      params.append('search', filters.search)
    }
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
    const response = await apiClient.patch(`/expenses/${id}/`, expenseData)
    return response.data
  },

  async deleteExpense(id) {
    await apiClient.delete(`/expenses/${id}/`)
  },

  async payExpense(id, paymentData) {
    const response = await apiClient.post(`/expenses/${id}/pay_expense/`, paymentData)
    return response.data
  },

  // Converte una spesa in ricorrente
  async convertToRecurring(id, conversionData) {
    const response = await apiClient.post(`/expenses/${id}/convert_to_recurring/`, conversionData)
    return response.data
  },

  // Carica expenses per multiple planned expenses in batch (ottimizzato)
  async getBatchByPlannedExpenses(plannedExpenseIds) {
    if (!plannedExpenseIds || plannedExpenseIds.length === 0) {
      return { expenses_by_planned_expense: {}, total_expenses: 0 }
    }

    const idsString = plannedExpenseIds.join(',')
    const response = await apiClient.get(`/expenses/batch_by_planned_expenses/?planned_expense_ids=${idsString}`)
    return response.data
  },

  // Ottieni le quote/pagamenti di una spesa
  async getExpenseQuotes(expenseId) {
    const response = await apiClient.get(`/expenses/${expenseId}/quote/`)
    return response.data
  }
}

export default expensesAPI