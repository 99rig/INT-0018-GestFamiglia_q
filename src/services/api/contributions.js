import { apiClient } from './client'

/**
 * API Service per la gestione dei contributi famiglia
 */
export const contributionsAPI = {
  /**
   * Recupera la lista dei contributi
   * @param {Object} params - Parametri di filtraggio
   * @returns {Promise}
   */
  getContributions(params = {}) {
    return apiClient.get('/contributions/', { params })
  },

  /**
   * Recupera i dettagli di un singolo contributo
   * @param {Number} id - ID del contributo
   * @returns {Promise}
   */
  getContribution(id) {
    return apiClient.get(`/contributions/${id}/`)
  },

  /**
   * Crea un nuovo contributo
   * @param {Object} data - Dati del contributo
   * @returns {Promise}
   */
  createContribution(data) {
    return apiClient.post('/contributions/', data)
  },

  /**
   * Aggiorna un contributo esistente
   * @param {Number} id - ID del contributo
   * @param {Object} data - Dati aggiornati
   * @returns {Promise}
   */
  updateContribution(id, data) {
    return apiClient.patch(`/contributions/${id}/`, data)
  },

  /**
   * Elimina un contributo
   * @param {Number} id - ID del contributo
   * @returns {Promise}
   */
  deleteContribution(id) {
    return apiClient.delete(`/contributions/${id}/`)
  },

  /**
   * Recupera le statistiche sui contributi
   * @returns {Promise}
   */
  getStats() {
    return apiClient.get('/contributions/stats/')
  },

  /**
   * Recupera il saldo complessivo della famiglia
   * @returns {Promise}
   */
  getBalance() {
    return apiClient.get('/contributions/balance/')
  },

  /**
   * Recupera solo i contributi con saldo disponibile
   * @returns {Promise}
   */
  getAvailable() {
    return apiClient.get('/contributions/available/')
  },

  /**
   * Utilizza un contributo per una spesa
   * @param {Number} contributionId - ID del contributo
   * @param {Object} data - Dati utilizzo (expense_id, amount)
   * @returns {Promise}
   */
  useForExpense(contributionId, data) {
    return apiClient.post(`/contributions/${contributionId}/use_for_expense/`, data)
  },

  /**
   * Recupera l'utilizzo dei contributi
   * @param {Object} params - Parametri di filtraggio
   * @returns {Promise}
   */
  getExpenseContributions(params = {}) {
    return apiClient.get('/expense-contributions/', { params })
  },
}

// Esporta anche le singole funzioni per retrocompatibilità
export const {
  getContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getStats,
  getBalance,
  getAvailable,
  useForExpense,
  getExpenseContributions
} = contributionsAPI