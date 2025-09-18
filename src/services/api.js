/**
 * API Service - Re-export dell'API organizzata per compatibilità
 *
 * NOTA: Questo file mantiene la compatibilità con il codice esistente.
 * Per nuove implementazioni, si consiglia di usare:
 * import { API } from './api/index.js'
 *
 * E accedere ai metodi tramite:
 * API.auth.login(...)
 * API.expenses.getExpenses(...)
 * API.reports.getSpendingPlanDetails(...)
 * ecc.
 */

// Re-export dell'API organizzata mantenendo compatibilità
export { api, API } from './api/index.js'
export default { api, API }