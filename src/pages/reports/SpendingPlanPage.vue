<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="spending-plan-page-content">

      <!-- Action Buttons -->
      <div class="mcf-action-header">
        <div class="action-buttons-grid">
          <q-btn
            icon="event_note"
            label="Nuovo Piano di Spesa"
            class="mcf-btn-primary"
            @click="showCreateDialog = true"
            :disable="!authStore.user?.family"
          />
          <q-btn
            icon="account_balance_wallet"
            label="Aggiungi Contributo"
            class="mcf-btn-secondary"
            @click="showContributionDialog = true"
            :disable="!authStore.user?.family"
          />
        </div>
      </div>

      <!-- Avviso mancanza famiglia -->
      <q-banner
        v-if="!authStore.user?.family"
        class="bg-warning text-white q-mb-md"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        <div class="text-weight-medium">Attenzione: Famiglia richiesta</div>
        <div class="text-body2 q-mt-xs">
          Prima di creare un piano di spesa, è necessario
          <router-link to="/settings" class="text-white text-decoration-underline">
            creare o unirti a una famiglia
          </router-link>.
          I piani di spesa senza famiglia non saranno visibili nell'app.
        </div>
      </q-banner>

      <!-- Bilancio Famiglia -->
      <div v-if="authStore.user?.family && familyBalanceText !== null" class="mcf-balance-section">
        <q-card flat bordered class="balance-card">
          <q-card-section class="balance-content">
            <div class="balance-info">
              <div class="balance-icon">
                <q-icon name="account_balance_wallet" />
              </div>
              <div class="balance-details">
                <div class="balance-label">Bilancio Famiglia Disponibile</div>
                <div class="balance-amount" v-html="familyBalanceText"></div>
              </div>
            </div>
            <q-btn
              flat
              round
              icon="refresh"
              size="sm"
              @click="loadFamilyBalance"
              :loading="loadingBalance"
              class="balance-refresh"
            >
              <q-tooltip>Aggiorna bilancio</q-tooltip>
            </q-btn>
          </q-card-section>
        </q-card>
      </div>

      <!-- Filtri e Controlli -->
      <div class="mcf-filters-section">
        <div class="filter-row">
          <div class="filter-item">
            <q-toggle
              v-model="showAllFuturePlans"
              left-label
              icon="event"
              color="primary"
              @update:model-value="onFilterChange"
            />
            <span class="filter-label">
              {{ showAllFuturePlans ? 'Limita ai prossimi 3 mesi' : 'Mostra tutti i piani futuri' }}
            </span>
          </div>
          <div v-if="filteredPlansCount !== totalPlansCount" class="filter-info">
            <q-chip
              color="grey-4"
              text-color="grey-8"
              size="sm"
              icon="filter_list"
            >
              {{ filteredPlansCount }} di {{ totalPlansCount }} piani
            </q-chip>
          </div>
        </div>
      </div>

      <!-- Lista Piani di Spesa -->
        <MCFLoading
          v-if="loading"
          message="Caricamento piani di spesa..."
          submessage="Recupero pianificazioni e spese future"
        />

        <div v-else-if="filteredSpendingPlans.length === 0" class="mcf-empty-state">
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
          <CardPianoSpesa2
            v-for="plan in filteredSpendingPlans"
            :key="plan.id"
            :plan="plan"
            :expanded="isExpanded(plan.id)"
            @click="openPlanDetail"
            @edit="editPlan"
            @clone="clonePlan"
            @delete="deletePlan"
            @toggle-expansion="toggleExpanded"
          />
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

    <!-- Dialog Contributo -->
    <q-dialog v-model="showContributionDialog" persistent>
      <ContributionForm
        @saved="handleContributionSaved"
        @cancel="showContributionDialog = false"
      />
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { reportsAPI } from 'src/services/api/reports.js'
import { useContributionsStore } from 'src/stores/contributions.js'
import { useAuthStore } from 'stores/auth.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import SpendingPlanDialog from 'components/SpendingPlanDialog.vue'
import CloneSpendingPlanDialog from 'components/CloneSpendingPlanDialog.vue'
import ContributionForm from 'src/components/contributions/ContributionForm.vue'
import CardPianoSpesa2 from 'src/components/CardPianoSpesa2.vue'
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
const showContributionDialog = ref(false)
const editingPlan = ref(null)
const cloningPlan = ref(null)
const expandedPlans = ref(new Set())
const familyBalance = computed(() => {
  const balance = contributionsStore.familyBalance
  return (balance !== null && balance !== undefined) ? balance : null
})

const familyTotalContributions = computed(() => {
  const total = contributionsStore.familyTotalContributions
  return (total !== null && total !== undefined) ? total : 0
})

const familyBalanceText = computed(() => {
  const balance = familyBalance.value
  const total = familyTotalContributions.value

  if (balance === null) return null

  if (total > 0) {
    return `<span style="font-weight: 600;">€${formatAmount(balance)}</span><span style="color: #666; margin: 0 2px;">/</span><span style="font-size: 0.85em; color: #888;">€${formatAmount(total)}</span>`
  } else {
    return `€${formatAmount(balance)}`
  }
})
const loadingBalance = ref(false)

// Filtri
const showAllFuturePlans = ref(false)

const authStore = useAuthStore()
const contributionsStore = useContributionsStore()

// Opzioni per il tipo piano (per le funzioni helper)
const planTypeOptions = [
  { label: 'Mensile', value: 'monthly' },
  { label: 'Trimestrale', value: 'quarterly' },
  { label: 'Semestrale', value: 'semester' },
  { label: 'Annuale', value: 'yearly' },
  { label: 'Personalizzato', value: 'custom' }
]

// Computed Properties
const filteredSpendingPlans = computed(() => {
  // La logica di filtraggio ora è gestita dal backend
  // Questo computed property restituisce sempre i dati caricati
  return spendingPlans.value
})
const totalPlansCount = computed(() => allPlansCount.value)
const filteredPlansCount = computed(() => spendingPlans.value.length)

// Contatori
const allPlansCount = ref(0) // Memorizza il totale dei piani quando showAll è true

// Metodi
const onFilterChange = async () => {
  console.log('📅 Filtro piani cambiato:', showAllFuturePlans.value ? 'Tutti i piani' : 'Solo 3 mesi')
  await loadSpendingPlans()
}

const loadSpendingPlans = async () => {
  try {
    loading.value = true
    console.log('🔄 Caricamento piani con parametro show_all:', showAllFuturePlans.value)

    const response = await reportsAPI.getSpendingPlans(showAllFuturePlans.value)
    console.log('🔍 Risposta API ricevuta:', response)

    // Supporta sia il nuovo formato con metadati che il vecchio formato
    if (response.results) {
      // Nuovo formato con metadati - ottimizzato
      spendingPlans.value = response.results
      allPlansCount.value = response.total_count || response.results.length
      console.log('📊 Piani caricati (nuovo formato):', response.results.length, '- Totale:', response.total_count)
    } else {
      // Formato legacy - mantieni compatibilità
      const allPlans = response || []
      spendingPlans.value = allPlans.filter(plan => !plan.is_hidden)
      allPlansCount.value = spendingPlans.value.length
      console.log('📊 Piani caricati (formato legacy):', spendingPlans.value.length)
    }

    console.log('📋 Piani di spesa caricati:', spendingPlans.value.length, 'di', allPlansCount.value, 'totali')
    console.log('📅 Filtro attivo:', showAllFuturePlans.value ? 'Tutti i piani' : 'Solo 3 mesi')
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

    const planTypeMessage = planData.plan_scope === 'personal' ? 'Piano Personale' : 'Piano Familiare'
    snackbar.success(`${planTypeMessage} creato con successo!`)

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
      await reportsAPI.deleteSpendingPlan(plan.id)

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

const handleContributionSaved = async () => {
  snackbar.success('Contributo aggiunto con successo!')
  showContributionDialog.value = false

  // Ricarica il bilancio famiglia dopo aver aggiunto un contributo
  contributionsStore.invalidateBalanceCache()
  await loadFamilyBalance(true) // Force refresh dopo aggiunta contributo
}

const loadFamilyBalance = async (forceRefresh = false) => {
  if (!authStore.user?.family) return

  try {
    loadingBalance.value = true
    await contributionsStore.fetchBalance(forceRefresh)
  } catch (error) {
    console.error('Errore nel caricamento del bilancio famiglia:', error)
    // Non mostrare errore per evitare spam se l'API non è disponibile
  } finally {
    loadingBalance.value = false
  }
}

// Funzione per forzare refresh del cache (se necessario)
const forceRefreshBalance = async () => {
  contributionsStore.invalidateBalanceCache()
  await loadFamilyBalance(true)
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
  await Promise.all([
    loadSpendingPlans(),
    loadFamilyBalance()
  ])
})
</script>

<style lang="scss" scoped>
.spending-plan-page-content {
  width: 100%;
  margin: 0;
  padding: 16px;
  background: white;
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

.action-buttons-grid {
  display: flex;
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }
}

.mcf-btn-primary, .mcf-btn-secondary {
  width: 100%;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;

  @media (min-width: 768px) {
    padding: 14px 20px;
  }

  :deep(.q-btn__content) {
    justify-content: center;
    width: 100%;
    gap: 8px;
  }
}

.mcf-btn-secondary {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white !important;

  &:hover {
    background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
    color: white !important;
  }

  &:disabled {
    background: #e0e0e0;
    color: #9e9e9e !important;
  }

  :deep(.q-btn__content) {
    color: white !important;
  }
}

// === BALANCE SECTION ===
.mcf-balance-section {
  margin-bottom: 16px;

  @media (min-width: 768px) {
    margin-bottom: 20px;
  }
}

.balance-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f5e8 100%);
  border: 2px solid #4caf50;
  border-radius: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  }
}

.balance-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;

  @media (min-width: 768px) {
    padding: 20px 24px;
  }
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #4caf50;
  border-radius: 50%;
  color: white;

  .q-icon {
    font-size: 24px;
  }
}

.balance-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.balance-amount {
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
  font-feature-settings: 'tnum';

  @media (min-width: 768px) {
    font-size: 28px;
  }
}

.balance-refresh {
  color: #4caf50;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(76, 175, 80, 0.1);
    transform: rotate(180deg);
  }
}

// === FILTERS SECTION ===
.mcf-filters-section {
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);

  @media (min-width: 768px) {
    padding: 16px 20px;
  }
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary);

  @media (min-width: 768px) {
    font-size: 15px;
  }
}

.filter-info {
  flex-shrink: 0;
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
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
}

.spending-plan-card {
  background: #f1f8ff;
  border: 1px dashed var(--mcf-secondary);
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
