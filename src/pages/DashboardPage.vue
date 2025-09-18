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
      <div class="mcf-header-actions">
        <q-btn
          class="mcf-btn-primary"
          icon="add"
          label="Nuova Spesa"
          @click="goToAddExpense"
        />

      </div>
    </div>

    <!-- Modern Stats Cards -->
    <div class="mcf-stats-grid">
      <!-- Spese del mese -->
      <div class="mcf-stat-card">
        <div class="mcf-stat-header">
          <div class="mcf-stat-label">
            <q-icon name="receipt_long" class="mcf-stat-label-icon" />
            Spese {{ currentMonth }}
          </div>
          <div class="mcf-stat-value-header">€ {{ monthExpenses }}</div>
        </div>
        <div class="mcf-stat-content">
          <div class="mcf-stat-trend" :class="monthTrend > 0 ? 'mcf-stat-trend--up' : 'mcf-stat-trend--down'">
            <q-icon :name="monthTrend > 0 ? 'trending_up' : 'trending_down'" />
            {{ Math.abs(monthTrend).toFixed(1) }}% vs mese scorso
          </div>
        </div>
      </div>

      <!-- Budget rimanente -->
      <div class="mcf-stat-card">
        <div class="mcf-stat-header">
          <div class="mcf-stat-label">
            <q-icon name="account_balance_wallet" class="mcf-stat-label-icon" />
            Piano di Spesa
          </div>
          <div class="mcf-stat-value-header" :class="budgetRemaining > 0 ? 'text-positive' : 'text-negative'">
            € {{ Math.abs(budgetRemaining) }}
          </div>
        </div>
        <div class="mcf-stat-content">
          <div class="mcf-stat-progress-inline">
            <q-circular-progress
              :value="budgetProgress * 100"
              size="16px"
              :thickness="0.3"
              :color="budgetProgress > 0.8 ? 'red' : budgetProgress > 0.6 ? 'orange' : 'green'"
              track-color="grey-3"
            />
            <span class="mcf-progress-text">{{ (budgetProgress * 100).toFixed(0) }}% di € {{ budgetTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Ultima spesa -->
      <div class="mcf-stat-card">
        <div class="mcf-stat-header">
          <div class="mcf-stat-label">
            <q-icon name="schedule" class="mcf-stat-label-icon" />
            Ultima spesa
          </div>
          <div class="mcf-stat-value-header">€ {{ lastExpense.amount || '0' }}</div>
        </div>
        <div class="mcf-stat-content">
          <div class="mcf-stat-description">{{ lastExpense.description || 'Nessuna spesa' }}</div>
          <div class="mcf-stat-date-inline">{{ lastExpense.date || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- Modern Quick Actions -->
    <div class="mcf-quick-actions">
      <h2 class="mcf-section-title">Azioni rapide</h2>
      <div class="mcf-actions-grid">
        <div class="mcf-action-card" @click="goToAddExpense">
          <div class="mcf-action-icon mcf-action-icon--primary">
            <q-icon name="add_circle" />
          </div>
          <div class="mcf-action-content">
            <div class="mcf-action-title">Nuova spesa</div>
            <div class="mcf-action-subtitle">Aggiungi manualmente</div>
          </div>
        </div>

        <div class="mcf-action-card" @click="goToScanner">
          <div class="mcf-action-icon mcf-action-icon--accent">
            <q-icon name="document_scanner" />
          </div>
          <div class="mcf-action-content">
            <div class="mcf-action-title">Scansiona</div>
            <div class="mcf-action-subtitle">Fotografa scontrino</div>
          </div>
        </div>

        <div class="mcf-action-card" @click="goToBudget">
          <div class="mcf-action-icon mcf-action-icon--tertiary">
            <q-icon name="account_balance_wallet" />
          </div>
          <div class="mcf-action-content">
            <div class="mcf-action-title">Piani Spesa</div>
            <div class="mcf-action-subtitle">Gestisci pianificazione</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Recent Expenses -->
    <div class="mcf-recent-expenses">
      <div class="mcf-section-header">
        <h2 class="mcf-section-title">Ultime spese</h2>
        <q-btn
          flat
          class="mcf-btn-ghost"
          label="Vedi tutte"
          icon-right="arrow_forward"
          @click="goToExpenses"
        />
      </div>

      <div class="mcf-expenses-list">
        <div
          v-for="expense in recentExpenses"
          :key="expense.id"
          class="mcf-expense-item"
          @click="viewExpense(expense)"
        >
          <div class="mcf-expense-avatar">
            <q-avatar
              :style="{ backgroundColor: getCategoryColor(expense.category) }"
              text-color="white"
              size="40px"
            >
              <q-icon :name="getCategoryIcon(expense.category)" />
            </q-avatar>
          </div>

          <div class="mcf-expense-content">
            <div class="mcf-expense-title">{{ expense.description }}</div>
            <div class="mcf-expense-meta">{{ expense.category }} • {{ formatDate(expense.date) }}</div>
          </div>

          <div class="mcf-expense-amount">
            <div class="mcf-expense-value">€ {{ expense.amount }}</div>
          </div>
        </div>

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
import { useQuasar, date } from 'quasar'
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
const budgetRemaining = ref(0)
const budgetTotal = ref(0)
const activePlans = ref([])
const lastExpense = ref({})

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

    // Ultime 5 spese con mapping corretto dei campi
    recentExpenses.value = expenses.slice(0, 5).map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount).toFixed(2),
      category: expense.category?.name || 'Altro',
      date: expense.date
    }))

    // Ultima spesa
    if (expenses.length > 0) {
      const last = expenses[0]
      lastExpense.value = {
        description: last.description,
        amount: parseFloat(last.amount).toFixed(2),
        date: formatDate(last.date)
      }
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

.mcf-action-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 768px) {
    padding: 18px;
    gap: 14px;
    border-radius: 12px;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
    transform: translateY(-1px);
  }
}

.mcf-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px;
  }

  &.mcf-action-icon--primary {
    background-color: var(--mcf-primary-light);
    color: var(--mcf-primary);
  }

  &.mcf-action-icon--accent {
    background-color: var(--mcf-accent-light);
    color: var(--mcf-accent);
  }

  &.mcf-action-icon--secondary {
    background-color: var(--mcf-secondary-light);
    color: var(--mcf-secondary);
  }

  &.mcf-action-icon--tertiary {
    background-color: var(--mcf-tertiary-light);
    color: var(--mcf-tertiary);
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

.mcf-expenses-list {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  overflow: hidden;
}

.mcf-expense-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--mcf-border-light);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--mcf-bg-secondary);
  }
}

.mcf-expense-avatar {
  margin-right: 16px;
}

.mcf-expense-content {
  flex: 1;

  .mcf-expense-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--mcf-text-primary);
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .mcf-expense-meta {
    font-size: 12px;
    color: var(--mcf-text-muted);
  }
}

.mcf-expense-amount {
  text-align: right;

  .mcf-expense-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--mcf-text-primary);
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
