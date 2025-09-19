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
        <MCFLoading
          v-if="loading"
          message="Caricamento piani di spesa..."
          submessage="Recupero pianificazioni e spese future"
        />

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
                <q-icon name="content_copy" class="mcf-feature-icon" />
                <span>Clona i piani</span>
              </div>
              <div class="mcf-feature-item">
                <q-icon name="trending_up" class="mcf-feature-icon" />
                <span>Monitora i progressi</span>
              </div>
            </div>
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
                <div class="plan-name-row">
                  <div class="plan-name">
                    {{ plan.name }}
                    <q-icon
                      v-if="!plan.is_shared"
                      name="lock"
                      size="xs"
                      color="grey-6"
                      class="q-ml-xs"
                    >
                      <q-tooltip>Piano personale</q-tooltip>
                    </q-icon>
                  </div>
                  <q-chip
                    :color="getPlanTypeColor(plan.plan_type)"
                    text-color="white"
                    size="sm"
                    :label="getPlanTypeLabel(plan.plan_type)"
                    class="plan-type-chip"
                  />
                </div>
                <div class="plan-period">
                  {{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}
                </div>
                <div v-if="plan.description" class="plan-description">
                  {{ plan.description }}
                </div>
              </div>
              <div class="plan-actions" @click.stop>
                <q-btn
                  flat
                  round
                  icon="more_vert"
                  size="sm"
                  class="text-grey-6 mcf-plan-menu-btn"
                >
                  <q-menu
                    class="mcf-plan-menu"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="bottom right"
                    self="top right"
                  >
                    <q-list class="mcf-plan-menu-list">
                      <q-item
                        clickable
                        v-close-popup
                        @click="editPlan(plan)"
                        class="mcf-menu-item mcf-menu-item-edit"
                      >
                        <q-item-section avatar class="mcf-menu-icon">
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section class="mcf-menu-text">
                          <q-item-label>Modifica Piano</q-item-label>
                          <q-item-label caption>Cambia nome, date o budget</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        @click="clonePlan(plan)"
                        class="mcf-menu-item mcf-menu-item-clone"
                      >
                        <q-item-section avatar class="mcf-menu-icon">
                          <q-icon name="content_copy" />
                        </q-item-section>
                        <q-item-section class="mcf-menu-text">
                          <q-item-label>Clona Piano</q-item-label>
                          <q-item-label caption>Crea copia intelligente per il periodo successivo</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator class="mcf-menu-separator" />

                      <q-item
                        clickable
                        v-close-popup
                        @click="deletePlan(plan)"
                        class="mcf-menu-item mcf-menu-item-delete"
                      >
                        <q-item-section avatar class="mcf-menu-icon">
                          <q-icon name="delete_outline" />
                        </q-item-section>
                        <q-item-section class="mcf-menu-text">
                          <q-item-label>Elimina Piano</q-item-label>
                          <q-item-label caption>Rimuovi definitivamente</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>

            <!-- Statistiche del Piano -->
            <div class="plan-stats">
              <div class="stats-row">
                <div class="stat-item stat-item-clickable" @click.stop="toggleExpanded(plan.id)">
                  <div class="stat-label">
                    Pianificate
                    <q-icon
                      :name="isExpanded(plan.id) ? 'expand_less' : 'expand_more'"
                      size="16px"
                      class="expand-icon"
                    />
                  </div>
                  <div class="stat-value">{{ plan.planned_expenses?.length || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Completate</div>
                  <div class="stat-value completed">{{ plan.completed_count || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Stimato</div>
                  <div class="stat-value primary">€{{ formatAmount(plan.total_estimated_amount || 0) }}</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="progress-container">
                <q-linear-progress
                  :value="(plan.completion_percentage || 0) / 100"
                  size="8px"
                  :color="getProgressColor(plan)"
                  track-color="grey-3"
                  class="progress-bar"
                />
                <div class="progress-text">
                  {{ Math.round(plan.completion_percentage || 0) }}% completato
                </div>
              </div>
            </div>

            <!-- Anteprima Spese Collassabile -->
            <q-slide-transition>
              <div v-if="plan.planned_expenses?.length > 0 && isExpanded(plan.id)" class="plan-expenses-preview">
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
            </q-slide-transition>

            <!-- Badge del tipo -->
            <div class="plan-badges" v-if="plan.is_current">
              <q-chip
                color="green"
                text-color="white"
                size="sm"
                label="Attivo"
              />
            </div>
          </div>
        </div>
    </div>

    <!-- Dialog Creazione/Modifica Piano -->
    <SpendingPlanDialog
      v-model="showCreateDialog"
      :plan="null"
      :saving="saving"
      @submit="handlePlanSubmit"
      @cancel="handlePlanCancel"
    />

    <SpendingPlanDialog
      v-model="showEditDialog"
      :plan="editingPlan"
      :saving="saving"
      @submit="handlePlanUpdate"
      @cancel="handlePlanCancel"
    />

    <!-- Dialog Clone Piano Intelligente -->
    <CloneSpendingPlanDialog
      v-model="showCloneDialog"
      :plan="cloningPlan"
      @cloned="handlePlanCloned"
    />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { reportsAPI } from 'src/services/api/reports.js'
import { useAuthStore } from 'stores/auth.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import SpendingPlanDialog from 'components/SpendingPlanDialog.vue'
import CloneSpendingPlanDialog from 'components/CloneSpendingPlanDialog.vue'
import MCFLoading from 'src/components/MCFLoading.vue'

const $q = useQuasar()
const router = useRouter()
const snackbar = useSnackbar()

// Stato reattivo
const spendingPlans = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showCloneDialog = ref(false)
const editingPlan = ref(null)
const cloningPlan = ref(null)
const expandedPlans = ref(new Set())

const authStore = useAuthStore()

// Opzioni per il tipo piano (per le funzioni helper)
const planTypeOptions = [
  { label: 'Mensile', value: 'monthly' },
  { label: 'Trimestrale', value: 'quarterly' },
  { label: 'Semestrale', value: 'semester' },
  { label: 'Annuale', value: 'yearly' },
  { label: 'Personalizzato', value: 'custom' }
]

// Metodi
const loadSpendingPlans = async () => {
  try {
    loading.value = true
    const response = await reportsAPI.getSpendingPlans()
    const allPlans = response.results || response || []

    // Filtra i piani nascosti (auto-generati dalle ricorrenze)
    spendingPlans.value = allPlans.filter(plan => !plan.is_hidden)

    console.log('📋 Piani di spesa caricati:', spendingPlans.value.length, 'di', allPlans.length, 'totali')
    if (allPlans.length > spendingPlans.value.length) {
      console.log('🔍 Nascosti', allPlans.length - spendingPlans.value.length, 'piani auto-generati')
    }
  } catch (error) {
    console.error('Errore nel caricamento dei piani:', error)
    snackbar.error('Errore nel caricamento dei piani di spesa')
  } finally {
    loading.value = false
  }
}

// Gestori del componente SpendingPlanDialog
const handlePlanSubmit = async (planData) => {
  saving.value = true
  try {
    // Se il piano è condiviso, aggiungi tutti gli utenti della famiglia
    // Altrimenti solo l'utente corrente
    const users = planData.is_shared && authStore.user.family_detail
      ? authStore.user.family_detail.members.map(m => m.id)
      : [authStore.user.id]

    const submitData = {
      ...planData,
      users
    }

    await reportsAPI.createSpendingPlan(submitData)

    snackbar.success('Piano di spesa creato con successo!')

    showCreateDialog.value = false
    await loadSpendingPlans()

  } catch (error) {
    console.error('Errore nella creazione del piano:', error)

    let errorMessage = 'Errore nella creazione del piano'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const handlePlanUpdate = async (planData) => {
  saving.value = true
  try {
    // Se il piano è condiviso, aggiungi tutti gli utenti della famiglia
    // Altrimenti solo l'utente corrente
    const users = planData.is_shared && authStore.user.family_detail
      ? authStore.user.family_detail.members.map(m => m.id)
      : [authStore.user.id]

    const submitData = {
      ...planData,
      users
    }

    await reportsAPI.updateSpendingPlan(planData.id, submitData)

    snackbar.success('Piano di spesa aggiornato con successo!')

    showEditDialog.value = false
    editingPlan.value = null
    await loadSpendingPlans()

  } catch (error) {
    console.error('Errore nell\'aggiornamento del piano:', error)

    let errorMessage = 'Errore nell\'aggiornamento del piano'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const handlePlanCancel = () => {
  editingPlan.value = null
}

const openPlanDetail = (plan) => {
  router.push(`/spending-plans/${plan.id}`)
}

const editPlan = (plan) => {
  editingPlan.value = plan
  showEditDialog.value = true
}

const deletePlan = (plan) => {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Sei sicuro di voler eliminare il piano "${plan.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await reportsAPI.deleteBudget(plan.id)

      snackbar.success('Piano eliminato con successo')

      await loadSpendingPlans()
    } catch (error) {
      console.error('Errore nell\'eliminazione del piano:', error)
      snackbar.error('Errore nell\'eliminazione del piano')
    }
  })
}

const clonePlan = (plan) => {
  cloningPlan.value = plan
  showCloneDialog.value = true
}

const handlePlanCloned = async (clonedPlan) => {
  snackbar.success(`Piano "${clonedPlan.name}" clonato con successo!`)

  // Ricarica la lista dei piani per mostrare il nuovo piano clonato
  await loadSpendingPlans()

  // Reset state
  cloningPlan.value = null
  showCloneDialog.value = false
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

// Funzioni rimosse - ora usiamo i dati calcolati dal backend

const getProgressColor = (plan) => {
  const progress = (plan.completion_percentage || 0) / 100
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

// Toggle funzioni
const toggleExpanded = (planId) => {
  if (expandedPlans.value.has(planId)) {
    expandedPlans.value.delete(planId)
  } else {
    expandedPlans.value.add(planId)
  }
}

const isExpanded = (planId) => {
  return expandedPlans.value.has(planId)
}

// Lifecycle
onMounted(async () => {
  // Le route guards garantiscono che l'utente sia autenticato
  await loadSpendingPlans()
})
</script>

<style lang="scss" scoped>
.spending-plan-page-content {
  width: 100%;
  margin: 0;
  padding: 16px;
  @media (min-width: 768px) {
    padding: 24px;
  }
}

// Override gestito nel CSS globale

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


// === MODERN EMPTY STATE ===
.mcf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 20px;
  min-height: 350px;

  @media (min-width: 768px) {
    padding: 32px 40px;
    min-height: 400px;
  }
}

.mcf-empty-illustration {
  position: relative;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

.mcf-empty-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mcf-primary-light) 0%, var(--mcf-secondary-light) 100%);
  border-radius: 50%;

  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
  }
}

.mcf-empty-icon {
  font-size: 40px;
  color: var(--mcf-primary);

  @media (min-width: 768px) {
    font-size: 50px;
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
  font-size: 22px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 12px 0;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 26px;
    margin-bottom: 16px;
  }
}

.mcf-empty-description {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
}

.mcf-empty-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 24px;
    margin-bottom: 32px;
  }
}

.mcf-feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;

  @media (min-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 4px;
    font-size: 14px;
  }
}

.mcf-feature-icon {
  font-size: 18px;
  color: var(--mcf-primary);
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 20px;
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

.plan-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.plan-type-chip {
  flex-shrink: 0;
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

.stat-item-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px;
  margin: -8px;

  &:hover {
    background: rgba(var(--mcf-primary-rgb, 35, 157, 176), 0.08);
    transform: translateY(-1px);
  }
}

.stat-label {
  font-size: 11px;
  color: var(--mcf-text-muted);
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-item-clickable .stat-label {
  border-bottom: 1px dotted var(--mcf-primary);
  padding-bottom: 2px;
  cursor: pointer;
}

.expand-icon {
  transition: transform 0.2s ease;
  color: var(--mcf-primary);
  opacity: 0.7;

  .stat-item-clickable:hover & {
    opacity: 1;
    transform: scale(1.1);
  }
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

/* === MENU PIANO MODERNO === */
.mcf-plan-menu-btn {
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--mcf-primary-rgb), 0.1) !important;
    color: var(--mcf-primary) !important;
  }
}

.mcf-plan-menu {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  overflow: hidden !important;
  min-width: 220px !important;
}

.mcf-plan-menu-list {
  padding: 8px !important;
}

.mcf-menu-item {
  border-radius: 8px !important;
  margin: 2px 0 !important;
  padding: 12px 16px !important;
  transition: all 0.2s ease !important;
  min-height: auto !important;

  &:hover {
    background: rgba(var(--mcf-primary-rgb), 0.08) !important;
    transform: translateX(2px);
  }
}

.mcf-menu-item-edit {
  &:hover {
    background: rgba(var(--mcf-primary-rgb), 0.1) !important;

    .mcf-menu-icon .q-icon {
      color: var(--mcf-primary) !important;
    }

    .mcf-menu-text .q-item__label:not(.q-item__label--caption) {
      color: var(--mcf-primary) !important;
    }
  }
}

.mcf-menu-item-clone {
  &:hover {
    background: rgba(76, 175, 80, 0.1) !important;

    .mcf-menu-icon .q-icon {
      color: #4caf50 !important;
    }

    .mcf-menu-text .q-item__label:not(.q-item__label--caption) {
      color: #4caf50 !important;
    }
  }
}

.mcf-menu-item-delete {
  &:hover {
    background: rgba(229, 62, 62, 0.1) !important;

    .mcf-menu-icon .q-icon {
      color: #e53e3e !important;
    }

    .mcf-menu-text .q-item__label:not(.q-item__label--caption) {
      color: #e53e3e !important;
    }
  }
}

.mcf-menu-icon {
  min-width: 40px !important;
  padding-right: 12px !important;

  .q-icon {
    font-size: 20px !important;
    color: var(--mcf-text-secondary) !important;
    transition: color 0.2s ease !important;
  }
}

.mcf-menu-text {
  .q-item__label {
    font-weight: 500 !important;
    font-size: 14px !important;
    color: var(--mcf-text-primary) !important;
    transition: color 0.2s ease !important;
    margin-bottom: 2px !important;
  }

  .q-item__label--caption {
    font-size: 12px !important;
    color: var(--mcf-text-muted) !important;
    font-weight: 400 !important;
    opacity: 0.8 !important;
  }
}

.mcf-menu-separator {
  margin: 8px 0 !important;
  background: rgba(0, 0, 0, 0.08) !important;
}

/* Animazione di entrata del menu */
:deep(.q-menu) {
  .q-transition--scale-enter-active,
  .q-transition--scale-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .q-transition--scale-enter-from,
  .q-transition--scale-leave-to {
    opacity: 0 !important;
    transform: scale(0.9) !important;
  }
}


</style>
