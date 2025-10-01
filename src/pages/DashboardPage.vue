<template>
  <q-page class="mcf-dashboard">
    <!-- Loading State -->
    <MCFLoading
      v-if="loading"
      message="Caricamento dashboard..."
      submessage="Preparazione dei dati finanziari"
    />

    <!-- Dashboard Content -->
    <div v-else>
    <!-- Modern Header -->
    <div class="mcf-dashboard-header">
      <div class="mcf-welcome-section">
        <h1 class="mcf-welcome-title">{{ greeting }}, {{ userName }}!</h1>
        <p class="mcf-welcome-subtitle">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Quick Actions (moved here) -->
    <div class="mcf-quick-actions-compact">
      <div class="mcf-actions-grid-square">
        <div class="mcf-action-widget" @click="goToAddExpense">
          <div class="mcf-action-icon-large mcf-action-icon--primary">
            <q-icon name="add_circle" size="32px" />
          </div>
          <div class="mcf-action-label">Nuova spesa</div>
        </div>

        <div class="mcf-action-widget" @click="goToScanner">
          <div class="mcf-action-icon-large mcf-action-icon--accent">
            <q-icon name="document_scanner" size="32px" />
          </div>
          <div class="mcf-action-label">Scansiona</div>
        </div>

        <div class="mcf-action-widget" @click="goToBudget">
          <div class="mcf-action-icon-large mcf-action-icon--tertiary">
            <q-icon name="account_balance_wallet" size="32px" />
          </div>
          <div class="mcf-action-label">Piani Spesa</div>
        </div>
      </div>
    </div>

    <!-- Modern Stats Widgets -->
    <div class="mcf-stats-widgets">
      <!-- Piani di Spesa -->
      <div class="mcf-stat-widget">
        <div class="mcf-widget-icon mcf-widget-icon--primary">
          <q-icon name="event_note" size="28px" />
        </div>
        <div class="mcf-widget-content">
          <div class="mcf-widget-value">{{ totalSpendingPlans }}</div>
          <div class="mcf-widget-label">Piani di Spesa</div>
        </div>
      </div>

      <!-- Spese del mese -->
      <div class="mcf-stat-widget">
        <div class="mcf-widget-icon mcf-widget-icon--accent">
          <q-icon name="receipt_long" size="28px" />
        </div>
        <div class="mcf-widget-content">
          <div class="mcf-widget-value">€{{ monthExpenses }}</div>
          <div class="mcf-widget-label">Speso {{ currentMonth }}</div>
        </div>
      </div>
    </div>

    <!-- Modern Recent Expenses -->
    <div class="mcf-recent-expenses">
      <div class="mcf-section-header-inline">
        <h2 class="mcf-section-title">Ultime spese</h2>
        <q-btn
          flat
          dense
          no-caps
          class="mcf-btn-link"
          label="Vedi tutte"
          icon-right="arrow_forward"
          @click="goToExpenses"
        />
      </div>

      <div class="mcf-expenses-list">
        <q-card
          v-for="expense in recentExpenses"
          :key="expense.id"
          class="mcf-expense-card"
          :class="getExpenseStatusClass(expense)"
          bordered
        >
          <div class="expense-main">
            <div class="expense-left">
              <div class="expense-description">
                {{ expense.description }}
                <q-icon
                  v-if="expense.status === 'pagata'"
                  name="check_circle"
                  class="paid-icon"
                  color="positive"
                  size="16px"
                />
              </div>
              <div class="expense-meta">
                <span v-if="expense.category" class="category-chip">
                  {{ expense.category }}
                </span>
                <span class="date-text">{{ formatDate(expense.date) }}</span>
              </div>
            </div>
            <div class="expense-right">
              <div class="expense-amount">€{{ expense.amount }}</div>
              <div v-if="expense.status" class="expense-status-badge" :class="`status-${expense.status}`">
                {{ getStatusText(expense.status) }}
              </div>
            </div>
          </div>
        </q-card>

        <div v-if="recentExpenses.length === 0" class="mcf-empty-state">
          <q-icon name="receipt_long" size="48px" class="mcf-empty-icon" />
          <div class="mcf-empty-title">Nessuna spesa registrata</div>
          <div class="mcf-empty-subtitle">Inizia aggiungendo la tua prima spesa</div>
        </div>
      </div>
    </div>

    <!-- Modern FAB -->
    <q-page-sticky position="bottom-right" :offset="[24, 24]" v-if="$q.screen.gt.sm">
      <q-fab
        class="mcf-fab"
        color="primary"
        icon="add"
        direction="up"
        vertical-actions-align="right"
      >
        <q-fab-action
          class="mcf-fab-action mcf-fab-action--accent"
          icon="add_shopping_cart"
          label="Spesa manuale"
          @click="goToAddExpense"
        />
        <q-fab-action
          class="mcf-fab-action mcf-fab-action--secondary"
          icon="document_scanner"
          label="Scansiona"
          @click="goToScanner"
        />
        <q-fab-action
          class="mcf-fab-action mcf-fab-action--warning"
          icon="account_balance_wallet"
          label="Piani Spesa"
          @click="goToBudget"
        />
      </q-fab>
    </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date, Notify } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useExpensesStore } from 'stores/expenses'
import { reportsAPI } from 'src/services/api/reports.js'
import MCFLoading from 'src/components/MCFLoading.vue'
// import { useSnackbar } from 'src/composables/useSnackbar' - not used yet

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const expensesStore = useExpensesStore()
// const snackbar = useSnackbar() - not used yet

// Data
const loading = ref(true)
const userName = ref('Utente')
const recentExpenses = ref([])
const monthExpenses = ref(0)
const monthTrend = ref(0)
const totalSpendingPlans = ref(0)
const activePlans = ref([])
const lastExpense = ref({})
const budgetTotal = ref(0)
const budgetRemaining = ref(0)

// Computed
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buongiorno'
  if (hour < 18) return 'Buon pomeriggio'
  return 'Buonasera'
})

const currentDate = computed(() => {
  return date.formatDate(new Date(), 'dddd D MMMM YYYY', {
    days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
             'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  })
})

const currentMonth = computed(() => {
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  return months[new Date().getMonth()]
})

const budgetProgress = computed(() => {
  if (budgetTotal.value === 0) return 0
  return monthExpenses.value / budgetTotal.value
})

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    // Carica dati utente
    const userProfile = authStore.user
    if (userProfile?.first_name) {
      userName.value = userProfile.first_name
    }

    // Carica spese recenti
    await expensesStore.loadExpenses()
    const expenses = expensesStore.expenses

    // Ultime 5 spese con mapping corretto dei campi e status
    recentExpenses.value = expenses.slice(0, 5).map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount).toFixed(2),
      category: expense.category_detail?.name || expense.category?.name || 'Altro',
      date: expense.date,
      status: expense.payment_status || expense.status || 'non_pagata'
    }))

    // Carica piani di spesa (tutti, non solo quelli attivi)
    try {
      const plansResponse = await reportsAPI.getSpendingPlans(true)
      console.log('Plans response:', plansResponse)
      if (Array.isArray(plansResponse)) {
        totalSpendingPlans.value = plansResponse.length
      } else if (plansResponse?.data && Array.isArray(plansResponse.data)) {
        totalSpendingPlans.value = plansResponse.data.length
      } else if (plansResponse?.results && Array.isArray(plansResponse.results)) {
        totalSpendingPlans.value = plansResponse.results.length
      } else {
        console.warn('Formato risposta piani non riconosciuto:', plansResponse)
        totalSpendingPlans.value = 0
      }
    } catch (error) {
      console.error('Errore caricamento piani:', error)
      totalSpendingPlans.value = 0
    }

    // Calcola totale del mese corrente
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth)
    monthExpenses.value = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)

    // Calcola totale del mese scorso per il trend
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const lastMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth
    })
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

    // Calcola trend percentage
    if (lastMonthTotal > 0) {
      const currentTotal = parseFloat(monthExpenses.value)
      monthTrend.value = ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100
    } else {
      monthTrend.value = 0
    }

    // Carica piani di spesa attivi per calcolare il budget
    await loadActivePlans()

  } catch (error) {
    console.error('Errore caricamento dashboard:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento dei dati'
    })
  } finally {
    loading.value = false
  }
}

const loadActivePlans = async () => {
  try {
    console.log('🔄 Caricamento piani di spesa attivi...')

    // Carica piani di spesa attivi (current)
    const currentPlansResponse = await reportsAPI.getCurrentSpendingPlans()
    console.log('📋 Risposta API getCurrentSpendingPlans:', currentPlansResponse)

    activePlans.value = currentPlansResponse || []
    console.log('📊 Piani attivi trovati:', activePlans.value.length)
    console.log('📝 Dettaglio piani:', activePlans.value)

    // Calcola budget totale da tutti i piani attivi (usa total_budget - budget pianificato dall'utente)
    budgetTotal.value = activePlans.value.reduce((total, plan) => {
      const planBudget = parseFloat(plan.total_budget || 0)
      console.log(`💰 Piano "${plan.name}": Budget €${planBudget} (spese effettive: €${plan.total_estimated_amount})`)
      return total + planBudget
    }, 0)

    // Calcola budget rimanente
    budgetRemaining.value = (budgetTotal.value - parseFloat(monthExpenses.value || 0)).toFixed(2)

    console.log('📊 Piani attivi caricati:', activePlans.value.length)
    console.log('💰 Budget totale calcolato:', budgetTotal.value)
    console.log('💸 Spese del mese:', monthExpenses.value)
    console.log('🏦 Budget rimanente:', budgetRemaining.value)

  } catch (error) {
    console.error('❌ Errore caricamento piani attivi:', error)
    console.error('📝 Dettaglio errore:', error.response?.data || error.message)
    // Se non ci sono piani, impostiamo valori di default
    budgetTotal.value = 0
    budgetRemaining.value = 0
  }
}

const getCategoryIcon = (category) => {
  const icons = {
    'Alimentari': 'shopping_cart',
    'Trasporti': 'directions_car',
    'Salute': 'favorite',
    'Casa': 'home',
    'Intrattenimento': 'movie',
    'Shopping': 'shopping_bag',
    'Altro': 'category'
  }
  return icons[category] || 'category'
}

const getCategoryColor = (category) => {
  const colors = {
    'Alimentari': 'green',
    'Trasporti': 'blue',
    'Salute': 'red',
    'Casa': 'orange',
    'Intrattenimento': 'purple',
    'Shopping': 'pink',
    'Altro': 'grey'
  }
  return colors[category] || 'grey'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return date.formatDate(dateString, 'DD/MM/YYYY')
}

const getExpenseStatusClass = (expense) => {
  if (expense.status === 'pagata') return 'expense-paid'
  if (expense.status === 'in_sospeso') return 'expense-pending'
  return 'expense-unpaid'
}

const getStatusText = (status) => {
  const statusMap = {
    'pagata': 'Pagata',
    'in_sospeso': 'In Sospeso',
    'non_pagata': 'Da Pagare'
  }
  return statusMap[status] || status
}

// Navigation
const goToAddExpense = () => {
  router.push('/expenses/add')
}

const goToScanner = () => {
  router.push('/scanner')
}

const goToExpenses = () => {
  router.push('/expenses')
}

const goToBudget = () => {
  router.push('/planned-expenses')
}


const viewExpense = (expense) => {
  router.push(`/expenses/${expense.id}`)
}

// Lifecycle
onMounted(async () => {
  // Le route guards garantiscono che l'utente sia autenticato
  await loadDashboardData()
})
</script>

<style lang="scss" scoped>
.mcf-dashboard {
  padding: 24px;
  background-color: var(--mcf-bg-primary);
}

// === HEADER SECTION ===
.mcf-dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.mcf-welcome-section {
  flex: 1;
}

.mcf-welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 4px 0;
  line-height: 1.2;

  @media (max-width: 600px) {
    font-size: 24px;
  }
}

.mcf-welcome-subtitle {
  font-size: 14px;
  color: var(--mcf-text-muted);
  margin: 0;
  font-weight: 400;
}

.mcf-header-actions {
  @media (max-width: 600px) {
    width: 100%;
  }
}

// === STATS GRID ===
// === STATS WIDGETS ===
.mcf-stats-widgets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    gap: 10px;
  }
}

.mcf-stat-widget {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 14px;
    gap: 10px;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

.mcf-widget-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  &.mcf-widget-icon--primary {
    background-color: #dbeafe;
    color: #0c4a6e;
  }

  &.mcf-widget-icon--accent {
    background-color: #fef3c7;
    color: #92400e;
  }
}

.mcf-widget-content {
  flex: 1;
  min-width: 0;
}

.mcf-widget-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 2px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
}

.mcf-widget-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
}

.mcf-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.mcf-stat-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 768px) {
    padding: 16px;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
    transform: translateY(-1px);
  }
}

.mcf-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

// === STAT LABEL WITH INLINE ICON ===
.mcf-stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mcf-text-muted);
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-stat-label-icon {
  font-size: 16px;
  color: var(--mcf-primary);

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

// === VALUE IN HEADER ===
.mcf-stat-value-header {
  font-size: 18px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  line-height: 1.1;
  text-align: right;

  @media (min-width: 768px) {
    font-size: 22px;
  }
}

// === TREND INDICATOR ===
.mcf-stat-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;

  @media (min-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
  }

  &.mcf-stat-trend--up {
    background-color: var(--mcf-error-light);
    color: var(--mcf-error);
  }

  &.mcf-stat-trend--down {
    background-color: var(--mcf-accent-light);
    color: var(--mcf-accent);
  }
}

// === PROGRESS INDICATOR ===
.mcf-stat-progress {
  display: flex;
  align-items: center;
}

// === DATE INDICATOR ===
.mcf-stat-date {
  font-size: 10px;
  color: var(--mcf-text-muted);
  font-weight: 500;
  padding: 2px 6px;
  background-color: var(--mcf-bg-secondary);
  border-radius: 4px;

  @media (min-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
  }
}

.mcf-stat-progress {
  display: flex;
  align-items: center;
}

.mcf-stat-content {
  // === TREND IN CONTENT ===
  .mcf-stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;

    @media (min-width: 768px) {
      font-size: 12px;
    }

    &.mcf-stat-trend--up {
      color: var(--mcf-error);
    }

    &.mcf-stat-trend--down {
      color: var(--mcf-accent);
    }
  }

  // === PROGRESS INLINE ===
  .mcf-stat-progress-inline {
    display: flex;
    align-items: center;
    gap: 8px;

    .mcf-progress-text {
      font-size: 11px;
      color: var(--mcf-text-muted);
      font-weight: 500;

      @media (min-width: 768px) {
        font-size: 12px;
      }
    }
  }

  // === DESCRIPTION ===
  .mcf-stat-description {
    font-size: 12px;
    color: var(--mcf-text-secondary);
    font-weight: 500;
    margin-bottom: 2px;
    line-height: 1.3;

    @media (min-width: 768px) {
      font-size: 13px;
    }
  }

  // === DATE INLINE ===
  .mcf-stat-date-inline {
    font-size: 10px;
    color: var(--mcf-text-muted);
    font-weight: 400;

    @media (min-width: 768px) {
      font-size: 11px;
    }
  }
}

// === QUICK ACTIONS ===
.mcf-quick-actions {
  margin-bottom: 32px;
}

.mcf-quick-actions-compact {
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
}

.mcf-section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;

  @media (min-width: 768px) {
    font-size: 20px;
    margin: 0 0 20px 0;
  }
}

.mcf-actions-grid-square {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    gap: 10px;
  }
}

.mcf-action-widget {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  aspect-ratio: 1;

  @media (max-width: 768px) {
    padding: 12px 8px;
    gap: 8px;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.mcf-action-icon-large {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  &.mcf-action-icon--primary {
    background-color: #dbeafe;
    color: #0c4a6e;
  }

  &.mcf-action-icon--accent {
    background-color: #fef3c7;
    color: #92400e;
  }

  &.mcf-action-icon--tertiary {
    background-color: #d1fae5;
    color: #065f46;
  }
}

.mcf-action-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

// Old styles kept for compatibility
.mcf-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.mcf-action-content {
  flex: 1;
  min-width: 0;

  .mcf-action-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--mcf-text-primary);
    margin-bottom: 1px;
    line-height: 1.3;

    @media (min-width: 768px) {
      font-size: 16px;
      margin-bottom: 2px;
    }
  }

  .mcf-action-subtitle {
    font-size: 11px;
    color: var(--mcf-text-muted);
    line-height: 1.3;

    @media (min-width: 768px) {
      font-size: 12px;
    }
  }
}

// === RECENT EXPENSES ===
.mcf-recent-expenses {
  margin-bottom: 40px;
}

.mcf-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.mcf-section-header-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;

  .mcf-section-title {
    margin: 0;
  }
}

.mcf-btn-link {
  color: #0c4a6e;
  font-size: 0.875rem;

  &:hover {
    color: #0ea5e9;
  }
}

.mcf-expenses-list {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  overflow: hidden;
}

// Compact expense card
.mcf-expense-card {
  background: white;
  border-radius: 10px !important;
  transition: all 0.2s ease;
  padding: 12px 16px;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    border-radius: 12px !important;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
  }

  &.expense-paid {
    border-left: 4px solid #10b981;
  }

  &.expense-pending {
    border-left: 4px solid #f59e0b;
  }

  &.expense-unpaid {
    border-left: 4px solid #ef4444;
  }
}

.expense-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.expense-left {
  flex: 1;
  min-width: 0;
}

.expense-description {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
}

.paid-icon {
  flex-shrink: 0;
}

.expense-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #6b7280;
}

.category-chip {
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  color: #374151;
}

.date-text {
  font-weight: 500;
}

.expense-right {
  text-align: right;
  flex-shrink: 0;
}

.expense-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.expense-status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;

  &.status-pagata {
    background: #d1fae5;
    color: #065f46;
  }

  &.status-in_sospeso {
    background: #fef3c7;
    color: #92400e;
  }

  &.status-non_pagata {
    background: #fee2e2;
    color: #991b1b;
  }
}

.mcf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;

  .mcf-empty-icon {
    color: var(--mcf-text-muted);
    margin-bottom: 16px;
  }

  .mcf-empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--mcf-text-secondary);
    margin-bottom: 4px;
  }

  .mcf-empty-subtitle {
    font-size: 14px;
    color: var(--mcf-text-muted);
  }
}

// === FAB STYLING ===
.mcf-fab {
  box-shadow: var(--mcf-shadow-lg);

  .mcf-fab-action {
    &.mcf-fab-action--accent {
      background-color: var(--mcf-accent);
    }

    &.mcf-fab-action--secondary {
      background-color: var(--mcf-secondary);
    }

    &.mcf-fab-action--warning {
      background-color: var(--mcf-warning);
    }
  }
}
</style>
