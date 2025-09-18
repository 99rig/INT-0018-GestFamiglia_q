<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="planned-expense-detail-content">
      <!-- Header -->
      <div class="mcf-action-header">
        <q-btn
          icon="arrow_back"
          label="Torna ai Piani"
          class="mcf-btn-secondary"
          flat
          @click="$router.go(-1)"
        />
      </div>

      <!-- Loading State -->
      <MCFLoading
        v-if="loading"
        message="Caricamento spese pianificate..."
        submessage="Recupero dettagli del piano di spesa"
      />

      <!-- Content -->
      <div v-else>
        <!-- Plan Info Card -->
        <div v-if="currentPlan" class="plan-info-card">
          <div class="plan-header">
            <div class="plan-main">
              <div class="plan-name">{{ currentPlan.name }}</div>
              <div class="plan-period">
                {{ formatDate(currentPlan.start_date) }} - {{ formatDate(currentPlan.end_date) }}
              </div>
              <div v-if="currentPlan.description" class="plan-description">
                {{ currentPlan.description }}
              </div>
            </div>
            <q-btn
              icon="add"
              label="Nuova Spesa"
              class="mcf-btn-primary"
              @click="showCreateExpenseDialog = true"
            />
          </div>

          <!-- Plan Summary -->
          <div class="plan-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value">{{ plannedExpenses.length }}</div>
                <div class="stat-label">Spese Pianificate</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalPlanned) }}</div>
                <div class="stat-label">Totale Pianificato</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalPaid) }}</div>
                <div class="stat-label">Già Pagato</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">€{{ formatAmount(totalRemaining) }}</div>
                <div class="stat-label">Rimanente</div>
              </div>
            </div>
            <div class="progress-container">
              <q-linear-progress
                :value="progressValue"
                size="8px"
                :color="progressColor"
                track-color="grey-3"
                class="progress-bar"
              />
              <div class="progress-text">
                {{ Math.round(progressValue * 100) }}% completato
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <q-tabs
            v-model="activeTab"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="all" label="Tutte" />
            <q-tab name="pending" label="In Attesa" />
            <q-tab name="partial" label="Parziali" />
            <q-tab name="completed" label="Completate" />
            <q-tab name="overdue" label="Scadute" />
          </q-tabs>
        </div>

        <!-- Expenses List -->
        <div class="expenses-list">
          <div
            v-for="expense in filteredExpenses"
            :key="expense.id"
            class="expense-card"
            :class="getExpenseStatusClass(expense)"
          >
            <div class="expense-header">
              <div class="expense-main">
                <div class="expense-name">{{ expense.description }}</div>
                <div class="expense-details">
                  <span v-if="expense.category_detail" class="expense-category">
                    {{ expense.category_detail.name }}
                  </span>
                  <div v-if="expense.due_date" class="expense-due-date">
                    <span class="due-date-text">
                      <span class="due-date-label">Scad.:</span> {{ formatDate(expense.due_date) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="expense-amount">
                <div class="amount-main">€{{ formatAmount(expense.amount) }}</div>
                <div class="amount-mobile-status">
                  <span class="status-badge mobile-status" :class="expense.payment_status">
                    {{ getStatusLabel(expense.payment_status) }}
                  </span>
                </div>
                <div class="amount-status">
                  <span class="status-badge" :class="expense.payment_status">
                    {{ getStatusLabel(expense.payment_status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Payment Progress -->
            <div class="payment-progress">
              <div class="progress-info">
                <span class="paid-amount">Pagato: €{{ expense.total_paid }}</span>
                <span class="remaining-amount">Rimanente: €{{ expense.remaining_amount }}</span>
              </div>
              <q-linear-progress
                :value="expense.completion_percentage / 100"
                size="6px"
                :color="getProgressColor(expense.completion_percentage)"
                track-color="grey-2"
                class="payment-progress-bar"
              />
              <!-- Payment Details -->
              <div v-if="expense.actual_payments_count > 0" class="payment-details">
                <span class="payment-by-text">{{ getPaymentByText(expense) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="expense-actions">
              <!-- Desktop view with labels -->
              <template v-if="$q.screen.gt.sm">
                <q-btn
                  v-if="!expense.is_fully_paid"
                  icon="payment"
                  label="Aggiungi Pagamento"
                  size="sm"
                  color="primary"
                  outline
                  @click="openPaymentDialog(expense)"
                />
                <q-btn
                  icon="receipt"
                  label="Pagamenti"
                  size="sm"
                  color="secondary"
                  outline
                  @click="viewPayments(expense)"
                />
                <q-btn
                  flat
                  round
                  icon="more_vert"
                  size="sm"
                  class="mcf-planned-expense-menu-btn"
                  @click.stop
                >
                  <q-menu
                    class="mcf-planned-expense-menu"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="bottom right"
                    self="top right"
                  >
                    <q-list class="mcf-menu-list">
                      <q-item
                        clickable
                        v-close-popup
                        @click="editExpense(expense)"
                        class="mcf-menu-item mcf-menu-edit"
                      >
                        <q-item-section avatar>
                          <q-icon name="edit" class="mcf-menu-icon" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="mcf-menu-title">Modifica</q-item-label>
                          <q-item-label caption class="mcf-menu-subtitle">Modifica i dettagli della spesa pianificata</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator class="mcf-menu-separator" />

                      <q-item
                        clickable
                        v-close-popup
                        @click="deleteExpense(expense)"
                        class="mcf-menu-item mcf-menu-delete"
                      >
                        <q-item-section avatar>
                          <q-icon name="delete" class="mcf-menu-icon" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="mcf-menu-title">Elimina</q-item-label>
                          <q-item-label caption class="mcf-menu-subtitle">Rimuovi questa spesa pianificata</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>

              <!-- Mobile view with icons only -->
              <template v-else>
                <q-btn
                  v-if="!expense.is_fully_paid"
                  flat
                  round
                  icon="payment"
                  size="sm"
                  color="primary"
                  class="mcf-mobile-action-btn"
                  @click="openPaymentDialog(expense)"
                >
                  <q-tooltip>Aggiungi Pagamento</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="receipt"
                  size="sm"
                  color="secondary"
                  class="mcf-mobile-action-btn"
                  @click="viewPayments(expense)"
                >
                  <q-tooltip>Visualizza Pagamenti</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="edit"
                  size="sm"
                  color="grey-7"
                  class="mcf-mobile-action-btn"
                  @click="editExpense(expense)"
                >
                  <q-tooltip>Modifica Spesa</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete"
                  size="sm"
                  color="red-5"
                  class="mcf-mobile-action-btn"
                  @click="deleteExpense(expense)"
                >
                  <q-tooltip>Elimina Spesa</q-tooltip>
                </q-btn>
              </template>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredExpenses.length === 0" class="empty-expenses">
            <q-icon name="receipt_long" size="48px" class="text-grey-4" />
            <div class="empty-title">Nessuna spesa {{ getEmptyStateText() }}</div>
            <div class="empty-subtitle">
              <span v-if="activeTab === 'all'">
                Inizia aggiungendo una spesa pianificata a questo piano.
              </span>
              <span v-else>
                Cambia filtro per vedere altre spese.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Expense Dialog -->
    <q-dialog
      v-model="showCreateExpenseDialog"
      persistent
      :full-width="$q.screen.lt.md"
      :full-height="$q.screen.lt.md"
      maximized
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 500px; max-width: 600px;'">
        <q-card-section>
          <div class="text-h6">Nuova Spesa Pianificata</div>
          <div class="text-caption text-grey-6">Aggiungi una spesa al piano "{{ currentPlan?.name }}"</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="createExpense" class="q-gutter-md">
            <q-input
              v-model="newExpense.description"
              label="Descrizione *"
              required
              outlined
              placeholder="es. Retta Thomas, Spesa supermercato..."
              :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
            />

            <q-input
              v-model="newExpense.amount"
              label="Importo Stimato *"
              required
              outlined
              type="number"
              step="0.01"
              min="0"
              prefix="€"
              :rules="[val => val > 0 || 'Importo deve essere maggiore di zero']"
            />

            <div class="mcf-form-row">
              <div class="mcf-form-col">
                <CategorySelect
                  v-model="newExpense.category"
                  label="Categoria"
                  outlined
                  clearable
                  :return-object="true"
                />
              </div>
              <div class="mcf-form-col">
                <MCFAutocomplete
                  v-model="newExpense.priority"
                  :options="priorityOptions"
                  label="Priorità"
                  outlined
                  option-value="value"
                  option-label="label"
                  :search-fields="['label']"
                  prepend-icon="priority_high"
                />
              </div>
            </div>

            <MCFDatePicker
              v-model="newExpense.due_date"
              label="Data Scadenza"
              outlined
              clearable
            />

            <q-input
              v-model="newExpense.notes"
              label="Note (opzionali)"
              outlined
              type="textarea"
              rows="2"
              placeholder="Note aggiuntive..."
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetExpenseForm" />
          <q-btn
            flat
            label="Crea Spesa"
            color="primary"
            @click="createExpense"
            :loading="saving"
            :disable="!canCreateExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Dialog -->
    <q-dialog
      v-model="showPaymentDialog"
      persistent
      :full-width="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 400px; max-width: 500px;'">
        <q-card-section>
          <div class="text-h6">Aggiungi Pagamento</div>
          <div class="text-caption text-grey-6">
            {{ selectedExpense?.description }}
            <br>Rimanente: €{{ selectedExpense?.remaining_amount }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="addPayment" class="q-gutter-md">
            <q-input
              v-model="newPayment.amount"
              label="Importo Pagamento *"
              required
              outlined
              type="number"
              step="0.01"
              min="0"
              :max="selectedExpense?.remaining_amount"
              prefix="€"
              :rules="[val => val > 0 && val <= parseFloat(selectedExpense?.remaining_amount || 0) || 'Importo non valido']"
            />

            <q-input
              v-model="newPayment.description"
              label="Descrizione Pagamento"
              outlined
              placeholder="es. Pagamento Marco..."
            />

            <MCFDatePicker
              v-model="newPayment.date"
              label="Data Pagamento"
              outlined
              clearable
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetPaymentForm" />
          <q-btn
            flat
            label="Aggiungi Pagamento"
            color="primary"
            @click="addPayment"
            :loading="savingPayment"
            :disable="!canAddPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Expense Dialog -->
    <q-dialog
      v-model="showEditExpenseDialog"
      persistent
      maximized
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">Modifica Spesa Pianificata</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="updateExpense" class="q-gutter-md">
            <q-input
              v-model="editExpenseForm.description"
              label="Descrizione *"
              outlined
              :rules="[val => val && val.length > 0 || 'Descrizione obbligatoria']"
            />

            <q-input
              v-model="editExpenseForm.amount"
              label="Importo (€) *"
              type="number"
              step="0.01"
              min="0"
              outlined
              :rules="[
                val => val && parseFloat(val) > 0 || 'Importo obbligatorio e maggiore di zero'
              ]"
            />

            <CategorySelect
              v-model="editExpenseForm.category"
              label="Categoria"
              outlined
              clearable
              :return-object="true"
            />

            <MCFAutocomplete
              v-model="editExpenseForm.priority"
              :options="priorityOptions"
              label="Priorità"
              outlined
              option-value="value"
              option-label="label"
              :search-fields="['label']"
              prepend-icon="priority_high"
            />

            <MCFDatePicker
              v-model="editExpenseForm.due_date"
              label="Data scadenza"
              outlined
              clearable
            />

            <q-input
              v-model="editExpenseForm.notes"
              label="Note"
              type="textarea"
              outlined
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup @click="resetEditExpenseForm" />
          <q-btn
            flat
            label="Salva Modifiche"
            color="primary"
            @click="updateExpense"
            :loading="saving"
            :disable="!canEditExpense"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payments View Dialog -->
    <q-dialog
      v-model="showPaymentsDialog"
      persistent
      :full-width="$q.screen.lt.md"
      :full-height="$q.screen.lt.md"
    >
      <q-card :style="$q.screen.lt.md ? '' : 'min-width: 600px; max-width: 800px;'">
        <q-card-section>
          <div class="text-h6">Pagamenti Effettuati</div>
          <div class="text-caption text-grey-6">
            {{ selectedExpense?.description }}
            <br>Totale spesa: €{{ selectedExpense?.amount }} - Pagato: €{{ selectedExpense?.total_paid }} - Rimanente: €{{ selectedExpense?.remaining_amount }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Loading payments -->
          <div v-if="loading" class="text-center q-pa-lg">
            <q-spinner-dots size="40px" color="primary" />
            <div class="q-mt-md">Caricamento pagamenti...</div>
          </div>

          <!-- Payments list -->
          <div v-else-if="payments.length > 0" class="payments-list">
            <div
              v-for="payment in payments"
              :key="payment.id"
              class="payment-item"
            >
              <div class="payment-header">
                <div class="payment-main">
                  <div class="payment-description">{{ payment.description }}</div>
                  <div class="payment-date">{{ formatDate(payment.date) }}</div>
                </div>
                <div class="payment-amount">€{{ formatAmount(payment.amount) }}</div>
              </div>
              <div v-if="payment.notes" class="payment-notes">{{ payment.notes }}</div>
            </div>

            <!-- Summary -->
            <div class="payments-summary">
              <div class="summary-row">
                <span>Totale pagamenti:</span>
                <span class="summary-amount">€{{ formatAmount(totalPayments) }}</span>
              </div>
              <div class="summary-row">
                <span>Importo rimanente:</span>
                <span class="summary-amount remaining">€{{ formatAmount(selectedExpense?.remaining_amount || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-payments">
            <q-icon name="receipt" size="48px" class="text-grey-4" />
            <div class="empty-title">Nessun pagamento effettuato</div>
            <div class="empty-subtitle">Questa spesa non ha ancora ricevuto pagamenti.</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Chiudi" v-close-popup @click="closePaymentsDialog" />
          <q-btn
            v-if="!selectedExpense?.is_fully_paid"
            flat
            label="Aggiungi Pagamento"
            color="primary"
            @click="addPaymentFromPaymentsView"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Expense Modal -->
    <DeleteExpenseModal
      v-model="showDeleteModal"
      :expense-name="expenseToDelete?.description || ''"
      :loading="deleting"
      @confirm="confirmDeleteExpense"
      @cancel="cancelDeleteExpense"
    />

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { api } from 'src/services/api.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import MCFDatePicker from 'components/MCFDatePicker.vue'
import MCFAutocomplete from 'components/MCFAutocomplete.vue'
import CategorySelect from 'components/CategorySelect.vue'
import DeleteExpenseModal from 'components/DeleteExpenseModal.vue'
import MCFLoading from 'src/components/MCFLoading.vue'

const $q = useQuasar()
const route = useRoute()
const snackbar = useSnackbar()

// Stato reattivo
const plannedExpenses = ref([])
const currentPlan = ref(null)
const loading = ref(false)

// Cache per i pagamenti
const expensePaymentsCache = ref(new Map())
const saving = ref(false)
const savingPayment = ref(false)
const activeTab = ref('all')
const showCreateExpenseDialog = ref(false)
const showPaymentDialog = ref(false)
const showEditExpenseDialog = ref(false)
const showPaymentsDialog = ref(false)
const selectedExpense = ref(null)
const editingExpense = ref(null)
const payments = ref([])

// Delete modal state
const showDeleteModal = ref(false)
const expenseToDelete = ref(null)
const deleting = ref(false)

// Form nuova spesa
const newExpense = ref({
  description: '',
  amount: '',
  category: { category: null, subcategory: null },
  priority: 'medium',
  due_date: '',
  notes: ''
})

// Form nuovo pagamento
const newPayment = ref({
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0]
})

// Form modifica spesa
const editExpenseForm = ref({
  description: '',
  amount: '',
  category: null,
  priority: 'medium',
  due_date: '',
  notes: ''
})

// Opzioni priorità
const priorityOptions = [
  { label: 'Bassa', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' }
]

// Computed
const planId = computed(() => route.params.id)

const filteredExpenses = computed(() => {
  if (activeTab.value === 'all') return plannedExpenses.value
  return plannedExpenses.value.filter(expense => {
    return expense.payment_status === activeTab.value
  })
})

const totalPlanned = computed(() => {
  // Usa il dato calcolato dal backend che include tutte le spese
  return parseFloat(currentPlan.value?.total_estimated_amount || 0)
})

const totalPaid = computed(() => {
  // Usa il dato calcolato dal backend che include spese pianificate + effettive
  return parseFloat(currentPlan.value?.completed_expenses_amount || 0)
})

const totalRemaining = computed(() => {
  // Usa il dato calcolato dal backend
  return parseFloat(currentPlan.value?.pending_expenses_amount || 0)
})

const progressValue = computed(() => {
  // Usa la percentuale già calcolata dal backend
  const percentage = parseFloat(currentPlan.value?.completion_percentage || 0)
  return percentage / 100
})

const progressColor = computed(() => {
  const progress = progressValue.value
  if (progress >= 1) return 'green'
  if (progress >= 0.7) return 'orange'
  return 'primary'
})

const canCreateExpense = computed(() => {
  return newExpense.value.description &&
         newExpense.value.amount &&
         parseFloat(newExpense.value.amount) > 0
})

const canAddPayment = computed(() => {
  return newPayment.value.amount &&
         parseFloat(newPayment.value.amount) > 0 &&
         parseFloat(newPayment.value.amount) <= parseFloat(selectedExpense.value?.remaining_amount || 0)
})

const canEditExpense = computed(() => {
  return editExpenseForm.value.description &&
         editExpenseForm.value.amount &&
         parseFloat(editExpenseForm.value.amount) > 0
})

const totalPayments = computed(() => {
  return payments.value.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
})


// Metodi
const loadPlanData = async () => {
  loading.value = true
  try {
    // Carica il piano di spesa
    const spendingPlan = await api.getSpendingPlan(planId.value)
    currentPlan.value = spendingPlan

    // Carica le spese pianificate del piano
    const plannedResponse = await api.getPlannedExpenses()
    const plannedExpensesData = plannedResponse.results || plannedResponse
    const filteredPlannedExpenses = plannedExpensesData.filter(exp =>
      exp.spending_plan === parseInt(planId.value)
    )

    // Carica anche le spese reali collegate al piano
    const realExpensesResponse = await api.getExpenses()
    const realExpensesData = realExpensesResponse.results || realExpensesResponse || []

    // Filtra solo le spese reali che appartengono a questo piano
    const filteredRealExpenses = realExpensesData.filter(exp =>
      exp.spending_plan === parseInt(planId.value)
    )

    // Combina spese pianificate e spese reali
    plannedExpenses.value = [
      ...filteredPlannedExpenses,
      ...filteredRealExpenses.map(exp => ({
        ...exp,
        is_real_expense: true // Flag per distinguere spese reali da pianificate
      }))
    ]

    console.log('📋 Piano caricato:', currentPlan.value)
    console.log('💰 Spese pianificate:', filteredPlannedExpenses.length)
    console.log('💳 Spese reali collegate:', filteredRealExpenses.length)
    console.log('📝 Piano ID cercato:', parseInt(planId.value))
    console.log('💰 Totale spese caricate:', plannedExpenses.value.length)

    // Carica i dati dei pagamenti in background
    loadPaymentsData()
  } catch (error) {
    console.error('Errore nel caricamento dei dati del piano:', error)
    snackbar.error('Errore nel caricamento dei dati')
  } finally {
    loading.value = false
  }
}


const createExpense = async () => {
  if (!canCreateExpense.value) return

  saving.value = true
  try {
    const expenseData = {
      ...newExpense.value,
      spending_plan: parseInt(planId.value),
      amount: parseFloat(newExpense.value.amount),
      category: newExpense.value.category?.category || newExpense.value.category,
      subcategory: newExpense.value.category?.subcategory || null
    }

    await api.createPlannedExpense(expenseData)

    snackbar.success('Spesa pianificata creata con successo!')

    showCreateExpenseDialog.value = false
    resetExpenseForm()
    await loadPlanData()

  } catch (error) {
    console.error('Errore nella creazione della spesa:', error)
    snackbar.error('Errore nella creazione della spesa')
  } finally {
    saving.value = false
  }
}

const openPaymentDialog = (expense) => {
  selectedExpense.value = expense
  newPayment.value = {
    amount: parseFloat(expense.remaining_amount || 0).toString(),
    description: `Pagamento per ${expense.description}`,
    date: new Date().toISOString().split('T')[0]
  }
  showPaymentDialog.value = true
}

const addPayment = async () => {
  if (!canAddPayment.value) return

  savingPayment.value = true
  try {
    const paymentData = {
      amount: parseFloat(newPayment.value.amount),
      description: newPayment.value.description,
      date: newPayment.value.date
    }

    await api.addPaymentToPlannedExpense(selectedExpense.value.id, paymentData)

    snackbar.success('Pagamento aggiunto con successo!')

    showPaymentDialog.value = false
    resetPaymentForm()
    await loadPlanData()

  } catch (error) {
    console.error('Errore nell\'aggiunta del pagamento:', error)
    snackbar.error(error.response?.data?.detail || 'Errore nell\'aggiunta del pagamento')
  } finally {
    savingPayment.value = false
  }
}

const resetExpenseForm = () => {
  newExpense.value = {
    description: '',
    amount: '',
    category: { category: null, subcategory: null },
    priority: 'medium',
    due_date: '',
    notes: ''
  }
}

const resetPaymentForm = () => {
  newPayment.value = {
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  }
  selectedExpense.value = null
}

const resetEditExpenseForm = () => {
  editExpenseForm.value = {
    description: '',
    amount: '',
    category: { category: null, subcategory: null },
    priority: 'medium',
    due_date: '',
    notes: ''
  }
  editingExpense.value = null
}

const updateExpense = async () => {
  if (!canEditExpense.value || !editingExpense.value) return

  saving.value = true
  try {
    const expenseData = {
      ...editExpenseForm.value,
      spending_plan: parseInt(planId.value),
      amount: parseFloat(editExpenseForm.value.amount),
      category: editExpenseForm.value.category?.category || editExpenseForm.value.category,
      subcategory: editExpenseForm.value.category?.subcategory || null
    }

    await api.updatePlannedExpense(editingExpense.value.id, expenseData)

    snackbar.success('Spesa pianificata aggiornata con successo!')

    showEditExpenseDialog.value = false
    resetEditExpenseForm()
    await loadPlanData()

  } catch (error) {
    console.error('Errore nell\'aggiornamento della spesa:', error)
    snackbar.error('Errore nell\'aggiornamento della spesa')
  } finally {
    saving.value = false
  }
}

const editExpense = (expense) => {
  editingExpense.value = expense
  editExpenseForm.value = {
    description: expense.description,
    amount: expense.amount,
    category: {
      category: expense.category,
      subcategory: expense.subcategory || null
    },
    priority: expense.priority,
    due_date: expense.due_date,
    notes: expense.notes || ''
  }
  showEditExpenseDialog.value = true
}

const deleteExpense = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

const confirmDeleteExpense = async () => {
  if (!expenseToDelete.value) return

  deleting.value = true
  try {
    await api.deletePlannedExpense(expenseToDelete.value.id)
    snackbar.success('Spesa eliminata con successo')
    await loadPlanData()

    // Chiudi la modale
    showDeleteModal.value = false
    expenseToDelete.value = null
  } catch (error) {
    console.error('Errore nell\'eliminazione della spesa:', error)
    snackbar.error('Errore nell\'eliminazione della spesa')
  } finally {
    deleting.value = false
  }
}

const cancelDeleteExpense = () => {
  showDeleteModal.value = false
  expenseToDelete.value = null
}

const viewPayments = async (expense) => {
  selectedExpense.value = expense
  showPaymentsDialog.value = true

  try {
    loading.value = true
    const response = await api.getPlannedExpensePayments(expense.id)
    payments.value = response.results || response || []
    console.log('📋 Pagamenti caricati:', payments.value.length)
  } catch (error) {
    console.error('Errore nel caricamento dei pagamenti:', error)
    snackbar.error('Errore nel caricamento dei pagamenti')
    payments.value = []
  } finally {
    loading.value = false
  }
}

const closePaymentsDialog = () => {
  showPaymentsDialog.value = false
  selectedExpense.value = null
  payments.value = []
}

const addPaymentFromPaymentsView = () => {
  showPaymentsDialog.value = false
  openPaymentDialog(selectedExpense.value)
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'In Attesa',
    partial: 'Parziale',
    completed: 'Completata',
    overdue: 'Scaduta'
  }
  return labels[status] || status
}

const getExpenseStatusClass = (expense) => {
  return `status-${expense.payment_status}`
}

const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'green'
  if (percentage >= 50) return 'orange'
  return 'primary'
}

// Nuovo metodo per il testo dei pagatori
const getPaymentByText = (expense) => {
  const paymentsData = expensePaymentsCache.value.get(expense.id)

  if (paymentsData && paymentsData.length > 0) {
    // Raggruppa i pagamenti per utente
    const paymentsByUser = paymentsData.reduce((acc, payment) => {
      const userName = payment.user.first_name || payment.user.username
      acc[userName] = (acc[userName] || 0) + 1
      return acc
    }, {})

    const users = Object.keys(paymentsByUser)
    if (users.length === 1) {
      const count = paymentsByUser[users[0]]
      return count === 1
        ? `Pagamento di ${users[0]}`
        : `${count} pagamenti di ${users[0]}`
    } else if (users.length === 2) {
      return `Pagamenti di ${users[0]} e ${users[1]}`
    } else {
      return `Pagamenti di ${users[0]} e altri ${users.length - 1}`
    }
  }

  // Fallback: mostra solo il numero di pagamenti
  if (expense.actual_payments_count === 1) {
    return `1 pagamento effettuato`
  }
  return `${expense.actual_payments_count} pagamenti effettuati`
}

const getEmptyStateText = () => {
  const texts = {
    all: 'trovata',
    pending: 'in attesa',
    partial: 'parzialmente pagata',
    completed: 'completata',
    overdue: 'scaduta'
  }
  return texts[activeTab.value] || 'trovata'
}

// Carica i dati dei pagamenti per tutte le spese con pagamenti
const loadPaymentsData = async () => {
  for (const expense of plannedExpenses.value) {
    if (expense.actual_payments_count > 0) {
      try {
        const paymentsResponse = await api.getPlannedExpensePayments(expense.id)
        const paymentsData = paymentsResponse.results || paymentsResponse || []
        expensePaymentsCache.value.set(expense.id, paymentsData)
      } catch (error) {
        console.warn(`Errore nel caricamento pagamenti per spesa ${expense.id}:`, error)
      }
    }
  }
}


// Lifecycle
onMounted(async () => {
  // Le route guards garantiscono che l'utente sia autenticato
  await loadPlanData()
})
</script>

<style lang="scss" scoped>
.planned-expense-detail-content {
  width: 100%;
  margin: 0;
  padding: 12px;

  @media (min-width: 768px) {
    padding: 24px;
  }
}

// Override gestito nel CSS globale

.mcf-action-header {
  margin-bottom: 16px;
  padding: 0;

  @media (min-width: 768px) {
    margin-bottom: 24px;
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


// === PLAN INFO CARD ===
.plan-info-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 16px;
    margin-bottom: 24px;
  }
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  gap: 12px;

  @media (min-width: 768px) {
    padding: 24px;
    gap: 16px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.plan-main {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  line-height: 1.3;
  margin-bottom: 6px;

  @media (min-width: 768px) {
    font-size: 24px;
    margin-bottom: 8px;
  }
}

.plan-period {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
}

.plan-description {
  font-size: 16px;
  color: var(--mcf-text-muted);
  line-height: 1.4;
}

.plan-summary {
  padding: 0 16px 16px 16px;
  border-top: 1px solid var(--mcf-border-light);
  background-color: var(--mcf-bg-secondary);

  @media (min-width: 768px) {
    padding: 0 24px 24px 24px;
  }
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }
}

.stat-item {
  text-align: center;
  padding: 2px 6px;

  @media (min-width: 768px) {
    padding: 16px 8px;
  }
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--mcf-primary);
  margin-bottom: 3px;
  font-feature-settings: 'tnum';

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.stat-label {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-container {
  margin-top: 8px;
}

.progress-bar {
  border-radius: 4px;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  text-align: center;
  font-weight: 500;
}

// === FILTER TABS ===
.filter-tabs {
  margin-bottom: 16px;

  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
}

// === EXPENSES LIST ===
.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 14px;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 20px;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-sm);
  }

  &.status-completed {
    border-left: 4px solid var(--mcf-accent);
  }

  &.status-partial {
    border-left: 4px solid orange;
  }

  &.status-overdue {
    border-left: 4px solid var(--mcf-error);
  }

  &.status-pending {
    border-left: 4px solid var(--mcf-primary);
  }
}

.expense-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;

  @media (min-width: 768px) {
    margin-bottom: 16px;
    gap: 16px;
  }
}

.expense-main {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.3;
  margin-bottom: 6px;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
}

.expense-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--mcf-text-secondary);
}

.expense-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.expense-due-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-status {
  display: none; // Nascosto di default su desktop
}

.amount-mobile-status {
  display: none; // Nascosto di default su desktop
}

.expense-category {
  padding: 2px 8px;
  background-color: var(--mcf-bg-secondary);
  border-radius: 4px;
  font-weight: 500;
}

.expense-amount {
  text-align: right;
}

.amount-main {
  font-size: 18px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin-bottom: 3px;
  font-feature-settings: 'tnum';

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.pending {
    background-color: var(--mcf-primary-light);
    color: var(--mcf-primary);
  }

  &.partial {
    background-color: #fff3cd;
    color: #856404;
  }

  &.completed {
    background-color: var(--mcf-accent-light);
    color: var(--mcf-accent);
  }

  &.overdue {
    background-color: var(--mcf-error-light);
    color: var(--mcf-error);
  }
}

.payment-progress {
  margin-bottom: 12px;

  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--mcf-text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.payment-progress-bar {
  border-radius: 3px;
}

.payment-details {
  margin-top: 4px;
  text-align: center;
}

.payment-by-text {
  font-size: 11px;
  color: var(--mcf-text-secondary);
  font-style: italic;
}

.expense-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    justify-content: center;
    gap: 12px;
  }
}

.mcf-mobile-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
  }
}

// === EMPTY STATE ===
.empty-expenses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 12px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 16px 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  line-height: 1.4;
}

// === MOBILE COMPACT LAYOUT ===
@media (max-width: 480px) {
  .planned-expense-detail-content {
    padding: 8px;
  }

  .plan-header {
    padding: 12px;
  }

  .plan-summary {
    padding: 0 12px 12px 12px;
  }

  .expense-card {
    padding: 12px;
  }

  .expenses-list {
    gap: 12px;
  }

  .stat-item {
    padding: 6px 6px !important;
  }

  .summary-stats .stat-item {
    padding: 6px 0 !important;
  }
}

// === RESPONSIVE ===
@media (max-width: 600px) {
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    padding: 2px 0;
    border-bottom: 1px solid var(--mcf-border-light);

    &:last-child {
      border-bottom: none;
    }
  }

  .stat-label {
    margin-bottom: 0;
  }

  .expense-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .expense-main {
    flex: 1;
    min-width: 0;
  }

  .expense-amount {
    text-align: right;
    flex-shrink: 0;
    margin-left: 12px;
  }

  .expense-amount .amount-status {
    display: none; // Nasconde il badge desktop
  }

  .amount-mobile-status {
    display: block;
    text-align: right;
    margin-top: 4px;
  }

  .mobile-status {
    display: inline-block;
  }
}


/* === PLANNED EXPENSE MENU STYLES === */
.mcf-planned-expense-menu-btn {
  color: var(--mcf-text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--mcf-primary);
    background: rgba(35, 157, 176, 0.1);
  }
}

.mcf-planned-expense-menu {
  min-width: 220px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--mcf-border-light);
  overflow: hidden;
  background: var(--mcf-bg-surface);
}

.mcf-menu-list {
  padding: 8px 0;
}

.mcf-menu-item {
  padding: 12px 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--mcf-bg-hover);
    transform: translateX(2px);
  }
}

.mcf-menu-edit:hover {
  background: rgba(35, 157, 176, 0.08);

  .mcf-menu-icon {
    color: var(--mcf-primary);
  }

  .mcf-menu-title {
    color: var(--mcf-primary);
  }
}

.mcf-menu-delete:hover {
  background: rgba(239, 68, 68, 0.08);

  .mcf-menu-icon {
    color: #ef4444;
  }

  .mcf-menu-title {
    color: #ef4444;
  }
}

.mcf-menu-icon {
  font-size: 20px;
  color: var(--mcf-text-secondary);
  transition: color 0.2s ease;
}

.mcf-menu-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--mcf-text-primary);
  transition: color 0.2s ease;
}

.mcf-menu-subtitle {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  opacity: 0.8;
  margin-top: 2px;
}

.mcf-menu-separator {
  margin: 4px 0;
  background: var(--mcf-border-light);
}

/* === RESPONSIVE FORM LAYOUT === */
.mcf-form-row {
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
}

.mcf-form-col {
  flex: 1;
  min-width: 0; /* Previene overflow */

  @media (max-width: 600px) {
    flex: none;
    width: 100%;
  }
}

/* === PAYMENTS VIEW STYLES === */
.payments-list {
  max-height: 400px;
  overflow-y: auto;
}

.payment-item {
  padding: 12px;
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--mcf-bg-surface);
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    box-shadow: var(--mcf-shadow-sm);
  }
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.payment-main {
  flex: 1;
  min-width: 0;
}

.payment-description {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
}

.payment-date {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  font-weight: 500;
}

.payment-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--mcf-primary);
  font-feature-settings: 'tnum';
}

.payment-notes {
  margin-top: 8px;
  font-size: 12px;
  color: var(--mcf-text-muted);
  font-style: italic;
  padding-top: 8px;
  border-top: 1px solid var(--mcf-border-light);
}

.payments-summary {
  margin-top: 16px;
  padding: 12px;
  background: var(--mcf-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 4px;
    border-top: 1px solid var(--mcf-border-light);
    font-weight: 600;
  }
}

.summary-amount {
  font-weight: 600;
  color: var(--mcf-primary);

  &.remaining {
    color: var(--mcf-text-secondary);
  }
}

.empty-payments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 12px 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
}
</style>
