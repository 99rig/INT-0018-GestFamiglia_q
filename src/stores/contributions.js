import { defineStore } from 'pinia'
import { contributionsAPI } from 'src/services/api/contributions'
import { Notify } from 'quasar'

export const useContributionsStore = defineStore('contributions', {
  state: () => ({
    contributions: [],
    currentContribution: null,
    availableContributions: [],
    familyBalance: null,
    familyTotalContributions: null,
    familyBalanceLastFetch: null,
    stats: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Restituisce il saldo totale disponibile
     */
    totalAvailableBalance: (state) => {
      return state.contributions.reduce((total, contribution) => {
        return total + parseFloat(contribution.available_balance || 0)
      }, 0)
    },

    /**
     * Restituisce i contributi disponibili (con saldo > 0)
     */
    contributionsWithBalance: (state) => {
      return state.contributions.filter(c => parseFloat(c.available_balance) > 0)
    },

    /**
     * Restituisce i contributi dell'utente corrente
     */
    myContributions: (state) => {
      const userId = localStorage.getItem('userId')
      return state.contributions.filter(c => c.user == userId)
    },

    /**
     * Controlla se il cache del balance famiglia è ancora valido (5 minuti TTL)
     */
    isBalanceCacheValid: (state) => {
      if (!state.familyBalanceLastFetch) return false
      const now = Date.now()
      const cacheAge = now - state.familyBalanceLastFetch
      const TTL = 5 * 60 * 1000 // 5 minuti in millisecondi
      return cacheAge < TTL
    },

    /**
     * Restituisce i contributi raggruppati per utente
     */
    contributionsByUser: (state) => {
      const grouped = {}
      state.contributions.forEach(contribution => {
        const userName = contribution.user_detail?.first_name || contribution.user_name || 'Utente'
        if (!grouped[userName]) {
          grouped[userName] = {
            user: userName,
            contributions: [],
            total: 0,
            available: 0
          }
        }
        grouped[userName].contributions.push(contribution)
        grouped[userName].total += parseFloat(contribution.amount || 0)
        grouped[userName].available += parseFloat(contribution.available_balance || 0)
      })
      return Object.values(grouped)
    }
  },

  actions: {
    /**
     * Recupera la lista dei contributi
     */
    async fetchContributions(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await contributionsAPI.getContributions(params)
        this.contributions = response.data
        return response.data
      } catch (error) {
        this.error = error
        console.error('Errore nel recupero contributi:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Recupera i dettagli di un singolo contributo
     */
    async fetchContribution(id) {
      this.loading = true
      this.error = null
      try {
        const response = await contributionsAPI.getContribution(id)
        this.currentContribution = response.data
        return response.data
      } catch (error) {
        this.error = error
        console.error('Errore nel recupero contributo:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crea un nuovo contributo
     */
    async createContribution(data) {
      this.loading = true
      this.error = null
      try {
        const response = await contributionsAPI.createContribution(data)

        // Aggiungi il nuovo contributo alla lista
        this.contributions.unshift(response.data)

        Notify.create({
          type: 'positive',
          message: 'Contributo aggiunto con successo',
          position: 'top'
        })

        // Aggiorna statistiche e saldo
        await this.fetchStats()
        await this.fetchBalance()

        return response.data
      } catch (error) {
        this.error = error
        Notify.create({
          type: 'negative',
          message: 'Errore nell\'aggiunta del contributo',
          position: 'top'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Aggiorna un contributo esistente
     */
    async updateContribution(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await contributionsAPI.updateContribution(id, data)

        // Aggiorna il contributo nella lista
        const index = this.contributions.findIndex(c => c.id === id)
        if (index !== -1) {
          this.contributions[index] = response.data
        }

        Notify.create({
          type: 'positive',
          message: 'Contributo aggiornato con successo',
          position: 'top'
        })

        return response.data
      } catch (error) {
        this.error = error
        Notify.create({
          type: 'negative',
          message: 'Errore nell\'aggiornamento del contributo',
          position: 'top'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Elimina un contributo
     */
    async deleteContribution(id) {
      this.loading = true
      this.error = null
      try {
        await contributionsAPI.deleteContribution(id)

        // Rimuovi il contributo dalla lista
        this.contributions = this.contributions.filter(c => c.id !== id)

        Notify.create({
          type: 'positive',
          message: 'Contributo eliminato con successo',
          position: 'top'
        })

        // Aggiorna statistiche e saldo
        await this.fetchStats()
        await this.fetchBalance()

      } catch (error) {
        this.error = error
        Notify.create({
          type: 'negative',
          message: 'Errore nell\'eliminazione del contributo',
          position: 'top'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Recupera le statistiche sui contributi
     */
    async fetchStats() {
      try {
        const response = await contributionsAPI.getStats()
        this.stats = response.data
        return response.data
      } catch (error) {
        console.error('Errore nel recupero statistiche:', error)
        throw error
      }
    },

    /**
     * Recupera il saldo famiglia con smart caching
     * @param {boolean} forceRefresh - Se true, ignora il cache e richiede sempre i dati aggiornati
     */
    async fetchBalance(forceRefresh = false) {
      try {
        // Se il cache è valido e non si forza il refresh, ritorna il valore cached
        // NOTA: Controlla anche che ci sia familyTotalContributions per evitare cache incompleti
        if (!forceRefresh && this.isBalanceCacheValid && this.familyBalance !== null && this.familyTotalContributions !== null) {
          console.log('🏦 Using cached family balance:', this.familyBalance, 'total:', this.familyTotalContributions)
          return { balance: this.familyBalance, totalContributions: this.familyTotalContributions }
        }

        console.log('🏦 Fetching fresh family balance from API...')
        const response = await contributionsAPI.getBalance()
        console.log('🏦 API Response:', response)

        // Gestisce diversi formati possibili di risposta (come nel codice originale)
        let balance = 0
        let totalContributions = 0

        if (response.data) {
          console.log('🏦 Using response.data format:', response.data)
          balance = parseFloat(response.data.current_balance || response.data.total_balance || response.data.balance || response.data.available_balance || 0)
          totalContributions = parseFloat(response.data.total_contributions || 0)
        } else if (response.total_balance !== undefined) {
          console.log('🏦 Using response.total_balance format')
          balance = parseFloat(response.total_balance)
          totalContributions = parseFloat(response.total_contributions || 0)
        } else if (response.current_balance !== undefined) {
          console.log('🏦 Using response.current_balance format')
          balance = parseFloat(response.current_balance)
          totalContributions = parseFloat(response.total_contributions || 0)
        }

        console.log('🏦 Parsed values - balance:', balance, 'totalContributions:', totalContributions)

        this.familyBalance = balance
        this.familyTotalContributions = totalContributions
        this.familyBalanceLastFetch = Date.now()

        console.log('🏦 Family balance updated:', this.familyBalance, 'of', this.familyTotalContributions)
        return { balance, totalContributions }
      } catch (error) {
        console.error('Errore nel recupero saldo:', error)
        throw error
      }
    },

    /**
     * Invalida il cache del balance famiglia (da chiamare dopo transazioni che cambiano il saldo)
     */
    invalidateBalanceCache() {
      this.familyBalanceLastFetch = null
      this.familyTotalContributions = null
      console.log('🏦 Family balance cache invalidated')
    },

    /**
     * Debug: forza il refresh del balance (da usare in console)
     */
    async debugRefreshBalance() {
      console.log('🏦 DEBUG: Forcing balance refresh...')
      this.invalidateBalanceCache()
      return await this.fetchBalance(true)
    },

    /**
     * Recupera i contributi disponibili
     */
    async fetchAvailableContributions() {
      try {
        const response = await contributionsAPI.getAvailable()
        this.availableContributions = response.data
        return response.data
      } catch (error) {
        console.error('Errore nel recupero contributi disponibili:', error)
        throw error
      }
    },

    /**
     * Utilizza un contributo per una spesa
     */
    async useContributionForExpense(contributionId, expenseId, amount) {
      this.loading = true
      this.error = null
      try {
        const response = await contributionsAPI.useForExpense(contributionId, {
          expense_id: expenseId,
          amount: amount
        })

        // Aggiorna il saldo del contributo nella lista
        const contribution = this.contributions.find(c => c.id === contributionId)
        if (contribution) {
          contribution.available_balance = parseFloat(contribution.available_balance) - amount
          contribution.status = contribution.available_balance > 0 ? 'parzialmente_utilizzato' : 'esaurito'
        }

        Notify.create({
          type: 'positive',
          message: 'Contributo utilizzato per la spesa',
          position: 'top'
        })

        // Aggiorna statistiche e saldo
        await this.fetchStats()
        await this.fetchBalance()

        return response.data
      } catch (error) {
        this.error = error
        Notify.create({
          type: 'negative',
          message: error.response?.data?.detail || 'Errore nell\'utilizzo del contributo',
          position: 'top'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Reset dello store
     */
    resetStore() {
      this.contributions = []
      this.currentContribution = null
      this.availableContributions = []
      this.familyBalance = null
      this.stats = null
      this.loading = false
      this.error = null
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'contributions',
        storage: localStorage,
        paths: ['contributions', 'familyBalance', 'stats']
      }
    ]
  }
})