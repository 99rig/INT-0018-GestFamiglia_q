import { defineStore } from 'pinia'
import { api } from 'src/services/api'

export const useExpensesStore = defineStore('expenses', {
  state: () => ({
    expenses: [],
    categories: [],
    loading: false,
    error: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
  }),

  getters: {
    // Spese del mese corrente
    currentMonthExpenses: (state) => {
      return state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === state.currentMonth && 
               expenseDate.getFullYear() === state.currentYear
      })
    },

    // Totale spese del mese
    currentMonthTotal: (state) => {
      return state.expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getMonth() === state.currentMonth && 
                 expenseDate.getFullYear() === state.currentYear
        })
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
    },

    // Spese per categoria
    expensesByCategory: (state) => {
      const grouped = {}
      state.expenses.forEach(expense => {
        if (!grouped[expense.category]) {
          grouped[expense.category] = []
        }
        grouped[expense.category].push(expense)
      })
      return grouped
    },

    // Ultime N spese
    recentExpenses: (state) => (limit = 5) => {
      return [...state.expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit)
    }
  },

  actions: {
    // Carica tutte le spese
    async loadExpenses() {
      this.loading = true
      this.error = null

      try {
        const response = await api.getExpenses()
        this.expenses = response.results || response || []
      } catch (error) {
        this.error = error.message
        console.error('Error loading expenses:', error)
      } finally {
        this.loading = false
      }
    },

    // Aggiungi nuova spesa
    async addExpense(expenseData) {
      this.loading = true
      this.error = null
      
      try {
        // Per ora aggiungiamo localmente, poi integreremo con l'API
        // const response = await api.createExpense(expenseData)
        
        const newExpense = {
          id: Date.now(),
          ...expenseData,
          date: expenseData.date || new Date().toISOString()
        }
        
        this.expenses.unshift(newExpense)
        return newExpense
      } catch (error) {
        this.error = error.message
        console.error('Error adding expense:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Aggiorna una spesa
    async updateExpense(id, expenseData) {
      this.loading = true
      this.error = null
      
      try {
        // const response = await api.updateExpense(id, expenseData)
        
        const index = this.expenses.findIndex(e => e.id === id)
        if (index !== -1) {
          this.expenses[index] = { ...this.expenses[index], ...expenseData }
        }
        
        return this.expenses[index]
      } catch (error) {
        this.error = error.message
        console.error('Error updating expense:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Elimina una spesa
    async deleteExpense(id) {
      this.loading = true
      this.error = null
      
      try {
        // await api.deleteExpense(id)
        
        const index = this.expenses.findIndex(e => e.id === id)
        if (index !== -1) {
          this.expenses.splice(index, 1)
        }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting expense:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Carica categorie
    async loadCategories() {
      try {
        const response = await api.getCategories()
        this.categories = response.results || response || []
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },

    // Filtra per mese
    setMonth(month, year) {
      this.currentMonth = month
      this.currentYear = year
    },

    // Reset store
    reset() {
      this.expenses = []
      this.categories = []
      this.loading = false
      this.error = null
    }
  }
})