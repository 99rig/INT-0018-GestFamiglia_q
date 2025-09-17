<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="spending-plan-page-content">

      <!-- Action Button -->
      <div class="mcf-action-header">
        <q-btn
          icon="add"
          label="Nuovo Piano di Spesa"
          class="mcf-btn-primary mcf-btn-fullwidth"
          @click="showCreateDialog = true"
        />
      </div>

      <!-- Lista Piani di Spesa -->
      <div class="container">
        <div v-if="loading" class="loading-container">
          <q-circular-progress
            indeterminate
            size="50px"
            color="primary"
          />
          <div class="q-mt-md text-center">Caricamento piani di spesa...</div>
        </div>

        <div v-else-if="spendingPlans.length === 0" class="mcf-empty-state">
          <div class="mcf-empty-illustration">
            <div class="mcf-empty-icon-container">
              <q-icon name="event_note" class="mcf-empty-icon" />
              <div class="mcf-empty-sparkles">
                <div class="mcf-sparkle mcf-sparkle-1"></div>
                <div class="mcf-sparkle mcf-sparkle-2"></div>
                <div class="mcf-sparkle mcf-sparkle-3"></div>
              </div>
            </div>
          </div>

          <div class="mcf-empty-content">
            <h3 class="mcf-empty-title">Inizia a Pianificare</h3>
            <p class="mcf-empty-description">
              Crea il tuo primo piano di spesa per organizzare meglio le tue finanze.
              <br>Perfetto per eventi, vacanze o spese mensili!
            </p>

            <div class="mcf-empty-features">
              <div class="mcf-feature-item">
                <q-icon name="schedule" class="mcf-feature-icon" />
                <span>Organizza per periodo</span>
              </div>
              <div class="mcf-feature-item">
                <q-icon name="trending_up" class="mcf-feature-icon" />
                <span>Monitora i progressi</span>
              </div>
              <div class="mcf-feature-item">
                <q-icon name="check_circle" class="mcf-feature-icon" />
                <span>Raggiungi i tuoi obiettivi</span>
              </div>
            </div>

            <q-btn
              icon="add"
              label="Crea il Tuo Primo Piano"
              class="mcf-btn-primary mcf-empty-cta"
              size="lg"
              @click="showCreateDialog = true"
            />
          </div>
        </div>

        <!-- Grid dei Piani -->
        <div v-else class="spending-plans-grid">
          <div
            v-for="plan in spendingPlans"
            :key="plan.id"
            class="spending-plan-card"
            @click="openPlanDetail(plan)"
          >
            <!-- Header della card -->
            <div class="plan-header">
              <div class="plan-main">
                <div class="plan-name">{{ plan.name }}</div>
                <div class="plan-period">
                  {{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}
                </div>
                <div v-if="plan.description" class="plan-description">
                  {{ plan.description }}
                </div>
              </div>
              <div class="plan-actions" @click.stop>
                <q-btn-dropdown
                  flat
                  round
                  icon="more_vert"
                  size="sm"
                  class="text-grey-6"
                >
                  <q-list>
                    <q-item clickable v-close-popup @click="addExpenseToPlan(plan)">
                      <q-item-section avatar>
                        <q-icon name="add" />
                      </q-item-section>
                      <q-item-section>Aggiungi Spesa</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="editPlan(plan)">
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Modifica</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="deletePlan(plan)">
                      <q-item-section avatar>
                        <q-icon name="delete" color="red" />
                      </q-item-section>
                      <q-item-section class="text-red">Elimina</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>

            <!-- Statistiche del Piano -->
            <div class="plan-stats">
              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-label">Spese Pianificate</div>
                  <div class="stat-value">{{ plan.planned_expenses?.length || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Completate</div>
                  <div class="stat-value completed">{{ getCompletedCount(plan) }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Totale Stimato</div>
                  <div class="stat-value primary">€{{ formatAmount(getTotalAmount(plan)) }}</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="progress-container">
                <q-linear-progress
                  :value="getProgressValue(plan)"
                  size="8px"
                  :color="getProgressColor(plan)"
                  track-color="grey-3"
                  class="progress-bar"
                />
                <div class="progress-text">
                  {{ Math.round(getProgressValue(plan) * 100) }}% completato
                </div>
              </div>
            </div>

            <!-- Anteprima Spese -->
            <div v-if="plan.planned_expenses?.length > 0" class="plan-expenses-preview">
              <div class="preview-header">Prime {{ Math.min(3, plan.planned_expenses.length) }} spese:</div>
              <div
                v-for="expense in plan.planned_expenses.slice(0, 3)"
                :key="expense.id"
                class="expense-preview-item"
              >
                <div class="expense-info">
                  <div class="expense-name">{{ expense.description }}</div>
                  <div class="expense-amount">€{{ formatAmount(expense.amount) }}</div>
                </div>
                <q-icon
                  v-if="expense.is_completed"
                  name="check_circle"
                  class="expense-status completed"
                />
                <q-chip
                  v-else
                  :color="getPriorityColor(expense.priority)"
                  text-color="white"
                  size="xs"
                  :label="getPriorityLabel(expense.priority)"
                />
              </div>
              <div v-if="plan.planned_expenses.length > 3" class="more-expenses">
                +{{ plan.planned_expenses.length - 3 }} altre spese
              </div>
            </div>

            <!-- Badge del tipo -->
            <div class="plan-badges">
              <q-chip
                :color="getPlanTypeColor(plan.plan_type)"
                text-color="white"
                size="sm"
                :label="getPlanTypeLabel(plan.plan_type)"
              />
              <q-chip
                v-if="plan.is_current"
                color="green"
                text-color="white"
                size="sm"
                label="Attivo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Creazione Piano -->
    <q-dialog
      v-model="showCreateDialog"
      persistent
      :full-width="$q.screen.lt.md"
      :full-height="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 500px; max-width: 600px;'">
        <q-card-section>
          <div class="text-h6">Nuovo Piano di Spesa</div>
          <div class="text-caption text-grey-6">Crea un contenitore per organizzare le tue spese future</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="createPlan" class="q-gutter-md">
            <q-input
              v-model="newPlan.name"
              label="Nome Piano *"
              required
              outlined
              placeholder="es. Ottobre 2025, Natale 2025, Estate 2026..."
              :rules="[val => val && val.length > 0 || 'Nome richiesto']"
            />

            <q-input
              v-model="newPlan.description"
              label="Descrizione (opzionale)"
              outlined
              type="textarea"
              rows="2"
              placeholder="Descrivi a cosa serve questo piano..."
            />

            <q-select
              v-model="newPlan.plan_type"
              :options="planTypeOptions"
              label="Tipo Piano *"
              outlined
              emit-value
              map-options
            />

            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="newPlan.start_date"
                  label="Data Inizio *"
                  outlined
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="newPlan.start_date" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-input
                  v-model="newPlan.end_date"
                  label="Data Fine *"
                  outlined
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="newPlan.end_date" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetForm" />
          <q-btn
            flat
            label="Crea Piano"
            color="primary"
            @click="createPlan"
            :loading="saving"
            :disable="!canCreatePlan"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const router = useRouter()

// Stato reattivo
const spendingPlans = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)

// Form nuovo piano
const newPlan = ref({
  name: '',
  description: '',
  plan_type: 'custom',
  start_date: '',
  end_date: ''
})

// Opzioni per il tipo piano
const planTypeOptions = [
  { label: 'Mensile', value: 'monthly' },
  { label: 'Stagionale', value: 'seasonal' },
  { label: 'Evento/Occasione', value: 'event' },
  { label: 'Annuale', value: 'yearly' },
  { label: 'Personalizzato', value: 'custom' }
]

// Computed
const canCreatePlan = computed(() => {
  return newPlan.value.name &&
         newPlan.value.start_date &&
         newPlan.value.end_date
})

// Metodi
const loadSpendingPlans = async () => {
  loading.value = true
  try {
    const response = await api.getBudgets() // Manteniamo l'endpoint esistente per ora
    spendingPlans.value = response.results || response || []
    console.log('📋 Piani di spesa caricati:', spendingPlans.value.length)
  } catch (error) {
    console.error('Errore nel caricamento dei piani:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento dei piani di spesa',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const createPlan = async () => {
  if (!canCreatePlan.value) return

  saving.value = true
  try {
    await api.createBudget(newPlan.value) // Manteniamo l'endpoint esistente

    $q.notify({
      type: 'positive',
      message: 'Piano di spesa creato con successo!',
      position: 'top'
    })

    showCreateDialog.value = false
    resetForm()
    await loadSpendingPlans()

  } catch (error) {
    console.error('Errore nella creazione del piano:', error)

    let errorMessage = 'Errore nella creazione del piano'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  newPlan.value = {
    name: '',
    description: '',
    plan_type: 'custom',
    start_date: '',
    end_date: ''
  }
}

const openPlanDetail = (plan) => {
  // TODO: Navigare alla pagina di dettaglio del piano
  $q.notify({
    type: 'info',
    message: `Aprendo dettagli del piano "${plan.name}"`,
    position: 'top'
  })
}

const addExpenseToPlan = (plan) => {
  // TODO: Aprire dialog per aggiungere spesa al piano
  $q.notify({
    type: 'info',
    message: 'Funzione in sviluppo',
    position: 'top'
  })
}

const editPlan = (plan) => {
  $q.notify({
    type: 'info',
    message: 'Modifica in sviluppo',
    position: 'top'
  })
}

const deletePlan = (plan) => {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Sei sicuro di voler eliminare il piano "${plan.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.deleteBudget(plan.id)

      $q.notify({
        type: 'positive',
        message: 'Piano eliminato con successo',
        position: 'top'
      })

      await loadSpendingPlans()
    } catch (error) {
      console.error('Errore nell\'eliminazione del piano:', error)
      $q.notify({
        type: 'negative',
        message: 'Errore nell\'eliminazione del piano',
        position: 'top'
      })
    }
  })
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const getCompletedCount = (plan) => {
  if (!plan.planned_expenses) return 0
  return plan.planned_expenses.filter(exp => exp.is_completed).length
}

const getTotalAmount = (plan) => {
  if (!plan.planned_expenses) return 0
  return plan.planned_expenses.reduce((total, exp) => total + parseFloat(exp.amount || 0), 0)
}

const getProgressValue = (plan) => {
  if (!plan.planned_expenses || plan.planned_expenses.length === 0) return 0
  const completed = getCompletedCount(plan)
  return completed / plan.planned_expenses.length
}

const getProgressColor = (plan) => {
  const progress = getProgressValue(plan)
  if (progress >= 1) return 'green'
  if (progress >= 0.5) return 'orange'
  return 'primary'
}

const getPlanTypeLabel = (type) => {
  const option = planTypeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

const getPlanTypeColor = (type) => {
  switch (type) {
    case 'monthly': return 'blue'
    case 'seasonal': return 'green'
    case 'event': return 'purple'
    case 'yearly': return 'orange'
    default: return 'grey'
  }
}

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'blue'
    default: return 'grey'
  }
}

// Lifecycle
onMounted(async () => {
  const authStore = useAuthStore()

  // Attendi che l'auth store sia inizializzato
  let attempts = 0
  while (authStore.accessToken === null && attempts < 100) {
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }

  if (authStore.isAuthenticated) {
    await loadSpendingPlans()
  }
})
</script>

<style lang="scss" scoped>
.spending-plan-page-content {
  width: 100%;
  margin: 0;
  padding: 16px 12px;

  @media (min-width: 768px) {
    padding: 24px 16px;
  }

  @media (min-width: 1200px) {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
  }
}

.mcf-page-container-fullwidth {
  background-color: var(--mcf-bg-primary);
  min-height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

// === ACTION HEADER ===
.mcf-action-header {
  margin-bottom: 20px;
  padding: 0;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

.mcf-btn-fullwidth {
  width: 100%;
  justify-content: center;
  padding: 12px 16px;

  @media (min-width: 768px) {
    padding: 14px 20px;
  }

  :deep(.q-btn__content) {
    justify-content: center;
    width: 100%;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  @media (min-width: 768px) {
    padding: 0 24px;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.header-main {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 8px 0;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 32px;
  }
}

.page-subtitle {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

// === MODERN EMPTY STATE ===
.mcf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 500px;

  @media (min-width: 768px) {
    padding: 60px 40px;
    min-height: 600px;
  }
}

.mcf-empty-illustration {
  position: relative;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    margin-bottom: 40px;
  }
}

.mcf-empty-icon-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mcf-primary-light) 0%, var(--mcf-secondary-light) 100%);
  border-radius: 50%;

  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
  }
}

.mcf-empty-icon {
  font-size: 60px;
  color: var(--mcf-primary);

  @media (min-width: 768px) {
    font-size: 70px;
  }
}

.mcf-empty-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.mcf-sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--mcf-accent);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;

  &.mcf-sparkle-1 {
    top: 20%;
    right: 15%;
    animation-delay: 0s;
  }

  &.mcf-sparkle-2 {
    bottom: 25%;
    left: 10%;
    animation-delay: 0.7s;
  }

  &.mcf-sparkle-3 {
    top: 60%;
    right: 20%;
    animation-delay: 1.4s;
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.mcf-empty-content {
  max-width: 480px;
  margin: 0 auto;
}

.mcf-empty-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 20px;
  }
}

.mcf-empty-description {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 40px;
  }
}

.mcf-empty-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 32px;
    margin-bottom: 48px;
  }
}

.mcf-feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--mcf-text-secondary);
  font-weight: 500;

  @media (min-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 6px;
    font-size: 15px;
  }
}

.mcf-feature-icon {
  font-size: 20px;
  color: var(--mcf-primary);
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

.mcf-empty-cta {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;

  @media (min-width: 768px) {
    padding: 16px 40px;
    font-size: 18px;
  }
}

// === SPENDING PLANS GRID ===
.spending-plans-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.spending-plan-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 16px;
  box-shadow: var(--mcf-shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
  }
}

// === PLAN HEADER ===
.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  gap: 16px;
}

.plan-main {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.3;
  margin-bottom: 4px;
}

.plan-period {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.plan-description {
  font-size: 14px;
  color: var(--mcf-text-muted);
  line-height: 1.3;
}

// === PLAN STATS ===
.plan-stats {
  padding: 0 20px 16px 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: var(--mcf-text-muted);
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  font-feature-settings: 'tnum';

  &.primary {
    color: var(--mcf-primary);
  }

  &.completed {
    color: var(--mcf-accent);
  }
}

.progress-container {
  margin-top: 8px;
}

.progress-bar {
  border-radius: 4px;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 11px;
  color: var(--mcf-text-secondary);
  text-align: center;
  font-weight: 500;
}

// === EXPENSES PREVIEW ===
.plan-expenses-preview {
  padding: 16px 20px;
  border-top: 1px solid var(--mcf-border-light);
  background-color: var(--mcf-bg-secondary);
}

.preview-header {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 600;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expense-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--mcf-border-light);

  &:last-child {
    border-bottom: none;
  }
}

.expense-info {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--mcf-text-primary);
  margin-bottom: 2px;
}

.expense-amount {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 600;
  font-feature-settings: 'tnum';
}

.expense-status {
  &.completed {
    color: var(--mcf-accent);
    font-size: 16px;
  }
}

.more-expenses {
  font-size: 12px;
  color: var(--mcf-text-muted);
  text-align: center;
  padding: 8px 0 4px 0;
  font-style: italic;
}

// === PLAN BADGES ===
.plan-badges {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px 20px;
  flex-wrap: wrap;
}

// === RESPONSIVE ===
@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }

  .stat-label {
    margin-bottom: 0;
  }
}
</style>
