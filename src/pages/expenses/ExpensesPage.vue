<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="expenses-page-content">
      <!-- Action Button -->
      <div class="mcf-action-header">
        <q-btn-dropdown
          icon="add"
          label="Nuova Spesa"
          class="mcf-btn-primary mcf-btn-fullwidth"
          dropdown-icon="expand_more"
        >
          <q-list>
            <q-item clickable v-close-popup @click="showManualForm = true">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Inserimento Manuale</q-item-label>
                <q-item-label caption>Inserisci i dati della spesa manualmente</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$router.push('/scanner')">
              <q-item-section avatar>
                <q-icon name="document_scanner" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Scansiona Ricevuta</q-item-label>
                <q-item-label caption>Usa la fotocamera per scansionare</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$router.push('/scanner')">
              <q-item-section avatar>
                <q-icon name="photo_camera" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Scatta Foto</q-item-label>
                <q-item-label caption>Fotografa la ricevuta</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Category Filters -->
      <div v-if="!loading" class="mcf-filters-section">
        <div class="mcf-filters-header">
          <span class="mcf-filters-label">Filtra per categoria:</span>
        </div>
        <div class="mcf-filters-chips">
          <q-chip
            :outline="selectedCategoryFilter !== null"
            :color="selectedCategoryFilter === null ? 'primary' : 'grey-5'"
            :text-color="selectedCategoryFilter === null ? 'white' : 'grey-8'"
            clickable
            @click="filterByCategory(null)"
            class="mcf-filter-chip"
          >
            Tutte ({{ expenses.length }})
          </q-chip>

          <q-chip
            v-for="category in visibleCategories"
            :key="category.id"
            :outline="selectedCategoryFilter !== category.id"
            :color="selectedCategoryFilter === category.id ? 'primary' : 'grey-5'"
            :text-color="selectedCategoryFilter === category.id ? 'white' : 'grey-8'"
            clickable
            @click="filterByCategory(category.id)"
            class="mcf-filter-chip"
          >
            {{ category.name }}
          </q-chip>

          <q-chip
            v-if="hasMoreCategories && !showAllCategories"
            outline
            color="grey-6"
            text-color="grey-8"
            clickable
            @click="showAllCategories = true"
            class="mcf-filter-chip mcf-more-chip"
          >
            ... ({{ availableCategories.length - 3 }} altre)
          </q-chip>

          <q-chip
            v-if="showAllCategories && hasMoreCategories"
            outline
            color="grey-6"
            text-color="grey-8"
            clickable
            @click="showAllCategories = false"
            class="mcf-filter-chip mcf-less-chip"
          >
            meno
          </q-chip>
        </div>
      </div>



      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="40px" color="grey-5" />
        <div class="q-mt-md" style="color: #666; font-weight: 400;">Caricamento spese...</div>
      </div>

      <!-- Lista spese moderna -->
      <div v-else-if="filteredExpenses.length > 0" class="mcf-expenses-list">
        <div
          v-for="expense in filteredExpenses"
          :key="expense.id"
          class="mcf-expense-card"
        >
          <!-- Header della card -->
          <div class="mcf-expense-header">
            <div class="mcf-expense-content">
              <div class="mcf-expense-left">
                <div class="mcf-expense-title">
                  {{ expense.description }}
                  <q-icon
                    v-if="expense.status === 'pagata'"
                    name="check_circle"
                    class="mcf-paid-badge"
                  />
                </div>
                <div v-if="expense.notes" class="mcf-expense-notes">{{ expense.notes }}</div>
              </div>
              <div class="mcf-expense-right">
                <div class="mcf-amount-value">€{{ expense.amount }}</div>
                <div v-if="expense.shared_with && expense.shared_with.length > 0" class="mcf-shared-indicator">
                  <q-icon name="people" size="14px" />
                  <span>Condivisa</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata della spesa -->
          <div class="mcf-expense-metadata">
            <div class="mcf-metadata-left">
              <div class="mcf-metadata-item mcf-metadata-category">
                <q-icon :name="getCategoryIcon(expense.category_detail?.name)" />
                <span>{{ expense.category_detail?.name || 'Categoria non specificata' }}</span>
              </div>

              <div class="mcf-metadata-item mcf-metadata-date">
                <q-icon name="calendar_today" />
                <span>{{ formatDate(expense.date) }}</span>
              </div>
            </div>

            <div class="mcf-metadata-right">
              <q-btn
                flat
                dense
                round
                icon="more_vert"
                class="mcf-expense-menu-btn"
                @click.stop
              >
                <q-menu
                  class="mcf-expense-menu"
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="bottom right"
                  self="top right"
                >
                  <q-list class="mcf-menu-list">
                    <q-item
                      clickable
                      v-close-popup
                      @click="openEditModal(expense)"
                      class="mcf-menu-item mcf-menu-edit"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit" class="mcf-menu-icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="mcf-menu-title">Modifica</q-item-label>
                        <q-item-label caption class="mcf-menu-subtitle">Modifica i dettagli della spesa</q-item-label>
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
                        <q-item-label caption class="mcf-menu-subtitle">Rimuovi questa spesa</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <!-- Note OCR (se presenti) -->
          <div v-if="expense.note && expense.note.includes('OCR')" class="mcf-expense-ocr">
            <q-expansion-item
              icon="text_snippet"
              label="Testo OCR riconosciuto"
              class="mcf-ocr-expansion"
              header-class="mcf-ocr-header"
            >
              <div class="mcf-ocr-content">
                {{ expense.note }}
              </div>
            </q-expansion-item>
          </div>
        </div>
      </div>

      <!-- Stato vuoto -->
      <div v-else class="empty-state text-center q-pa-xl">
        <q-icon
          name="receipt_long"
          size="64px"
          style="color: #d1d5db;"
          class="q-mb-md"
        />
        <div class="text-h6 q-mb-sm text-weight-semibold" style="color: #374151;">Nessuna spesa trovata</div>
        <div class="text-body2 q-mb-lg" style="color: #6b7280;">
          Inizia aggiungendo la tua prima spesa!
        </div>
        <div class="row q-gutter-md justify-center">
          <q-btn
            icon="edit"
            label="Inserimento Manuale"
            class="mcf-btn-primary"
            size="lg"
            @click="showManualForm = true"
          />
          <q-btn
            icon="document_scanner"
            label="Scansiona Ricevuta"
            class="mcf-btn-secondary"
            size="lg"
            @click="$router.push('/scanner')"
          />
        </div>
      </div>

      <!-- FAB per aggiungere spesa -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab
          icon="add"
          direction="up"
          class="mcf-fab-main"
        >
          <q-fab-action
            @click="showManualForm = true"
            icon="edit"
            label="Manuale"
            external-label
            label-position="left"
            class="mcf-fab-action mcf-fab-manual"
          />
          <q-fab-action
            @click="$router.push('/scanner')"
            icon="document_scanner"
            label="Scanner"
            external-label
            label-position="left"
            class="mcf-fab-action mcf-fab-scanner"
          />
        </q-fab>
      </q-page-sticky>

      <!-- Dialog inserimento manuale -->
      <q-dialog
        v-model="showManualForm"
        persistent
        maximized
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">Nuova Spesa</div>
            <div class="text-caption text-grey-6">Scegli come inserire la spesa</div>
          </q-card-section>

          <!-- Method Selection -->
          <q-card-section class="q-pt-none q-pb-sm">
            <div class="mcf-method-tabs">
              <q-btn-toggle
                v-model="inputMethod"
                spread
                no-caps
                toggle-color="primary"
                color="grey-3"
                text-color="grey-8"
                :options="[
                  {label: 'Manuale', value: 'manual', icon: 'edit'},
                  {label: 'Scanner', value: 'scanner', icon: 'document_scanner'}
                ]"
                class="mcf-toggle-buttons"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <!-- Manual Form -->
            <div v-if="inputMethod === 'manual'">
              <q-form @submit.prevent="submitManualExpense" class="q-gutter-md">
                <q-input
                v-model="manualExpense.description"
                label="Descrizione *"
                required
                outlined
                :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
              />

              <q-input
                v-model="manualExpense.amount"
                label="Importo *"
                type="number"
                step="0.01"
                required
                outlined
                prefix="€"
                :rules="[val => val > 0 || 'Importo deve essere maggiore di 0']"
              />

              <MCFAutocomplete
                v-model="manualExpense.category"
                :options="categoryOptions"
                label="Categoria *"
                required
                outlined
                option-value="value"
                option-label="label"
                @update:model-value="onCategoryChange"
                :rules="[val => val !== null && val !== undefined || 'Categoria richiesta']"
                prepend-icon="category"
                :multiple="false"
              />

              <MCFAutocomplete
                v-model="manualExpense.subcategory"
                :options="subcategoryOptions"
                label="Sottocategoria"
                outlined
                option-value="value"
                option-label="label"
                :disable="!manualExpense.category"
                clearable
                prepend-icon="label"
                :multiple="false"
              />

              <MCFAutocomplete
                v-model="manualExpense.spending_plan"
                :options="spendingPlanOptions"
                label="Piano di Spesa"
                outlined
                option-value="value"
                option-label="label"
                clearable
                prepend-icon="event_note"
                :hint="manualExpense.spending_plan ? 'Spesa collegata a un piano' : 'Spesa generica (non collegata a nessun piano)'"
                :multiple="false"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.description" caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected v-if="manualExpense.spending_plan">
                  <div class="mcf-selected-option">
                    <q-icon
                      name="event_note"
                      color="primary"
                      size="sm"
                      class="q-mr-sm"
                    />
                    {{ getSelectedSpendingPlanLabel(manualExpense.spending_plan) }}
                  </div>
                </template>
              </MCFAutocomplete>

              <MCFDatePicker
                v-model="manualExpense.date"
                label="Data *"
                required
                outlined
                :rules="[val => val && val.length > 0 || 'Data richiesta']"
              />

              <q-input
                v-model="manualExpense.notes"
                label="Note"
                type="textarea"
                outlined
                rows="3"
              />

              <q-separator class="q-my-md" />

              <div class="mcf-receipt-section">
                <div class="mcf-receipt-header">
                  <q-icon name="receipt" size="20px" color="primary" />
                  <span class="mcf-receipt-title">Ricevuta (opzionale)</span>
                </div>

                <q-file
                  v-model="manualExpense.receiptFile"
                  label="Carica ricevuta"
                  outlined
                  accept="image/*"
                  max-file-size="5242880"
                  @rejected="onReceiptRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      v-if="manualExpense.receiptFile"
                      round
                      dense
                      flat
                      icon="clear"
                      @click.stop.prevent="manualExpense.receiptFile = null"
                    />
                  </template>
                </q-file>

                <div v-if="manualExpense.receiptFile" class="mcf-receipt-preview">
                  <q-img
                    :src="receiptPreviewUrl"
                    style="max-width: 200px; max-height: 150px;"
                    class="mcf-receipt-image"
                  />
                </div>

                <div class="mcf-receipt-actions">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="photo_camera"
                    label="Scatta foto"
                    color="primary"
                    @click="takeReceiptPhoto"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <q-checkbox
                v-model="manualExpense.shared"
                label="Spesa condivisa con la famiglia"
              />
              </q-form>
            </div>

            <!-- Scanner Form -->
            <div v-else-if="inputMethod === 'scanner'">
              <div class="mcf-scanner-section">
                <div class="mcf-scanner-header">
                  <q-icon name="document_scanner" size="48px" color="primary" />
                  <h6 class="mcf-scanner-title">Scansiona Ricevuta</h6>
                  <p class="mcf-scanner-subtitle">Fotografa o carica un'immagine della ricevuta per estrarre automaticamente i dati</p>
                </div>

                <div class="mcf-scanner-actions">
                  <q-btn
                    icon="photo_camera"
                    label="Scatta Foto"
                    class="mcf-btn-primary"
                    size="lg"
                    @click="openCamera"
                  />
                  <q-btn
                    icon="upload_file"
                    label="Carica Immagine"
                    class="mcf-btn-secondary"
                    size="lg"
                    @click="uploadImage"
                  />
                </div>

                <div class="mcf-scanner-note">
                  <q-icon name="info" size="16px" color="grey-6" />
                  <span>Assicurati che la ricevuta sia ben illuminata e leggibile</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Annulla"
              color="grey"
              @click="closeManualForm"
            />
            <q-btn
              v-if="inputMethod === 'manual'"
              label="Salva Spesa"
              color="primary"
              :loading="saving"
              @click="submitManualExpense"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog modifica spesa -->
      <q-dialog
        v-model="showEditForm"
        persistent
        maximized
      >
        <q-card>
          <q-card-section>
            <div class="text-h6">Modifica Spesa</div>
            <div class="text-caption text-grey-6">Modifica i dati della spesa</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit.prevent="submitEditExpense" class="q-gutter-md">
              <q-input
                v-model="editForm.description"
                label="Descrizione *"
                required
                outlined
                :rules="[val => val && val.length > 0 || 'Descrizione richiesta']"
              />

              <q-input
                v-model="editForm.amount"
                label="Importo *"
                required
                outlined
                type="number"
                step="0.01"
                min="0"
                prefix="€"
                :rules="[
                  val => val && val > 0 || 'Importo richiesto',
                  val => val <= 999999 || 'Importo troppo alto'
                ]"
              />

              <MCFAutocomplete
                v-model="editForm.category"
                :options="categoryOptions"
                label="Categoria *"
                :required="true"
                :icon="getCategoryIcon(editForm.category)"
                @update:model-value="onEditCategoryChange"
                :multiple="false"
              />

              <MCFAutocomplete
                v-model="editForm.subcategory"
                :options="subcategoryOptions"
                label="Sottocategoria"
                :icon="editForm.subcategory ? 'label' : null"
                :disable="!editForm.category"
                :multiple="false"
              />

              <MCFDatePicker
                v-model="editForm.date"
                label="Data *"
                :required="true"
                icon="event"
              />

              <MCFAutocomplete
                v-model="editForm.spending_plan"
                :options="spendingPlanOptions"
                label="Piano di Spesa"
                icon="event_note"
                :multiple="false"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="scope.opt.description" caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected v-if="editForm.spending_plan">
                  <div class="mcf-selected-option">
                    <q-icon
                      name="event_note"
                      color="primary"
                      size="sm"
                      class="q-mr-sm"
                    />
                    {{ getSelectedSpendingPlanLabel(editForm.spending_plan) }}
                  </div>
                </template>
              </MCFAutocomplete>

              <q-input
                v-model="editForm.notes"
                label="Note (opzionale)"
                outlined
                type="textarea"
                rows="3"
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Annulla" v-close-popup @click="closeEditForm" />
            <q-btn
              flat
              label="Salva Modifiche"
              color="primary"
              :loading="saving"
              @click="submitEditExpense"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api.js'
import { useAuthStore } from 'stores/auth.js'
import MCFAutocomplete from 'components/MCFAutocomplete.vue'
import MCFDatePicker from 'components/MCFDatePicker.vue'

const $q = useQuasar()

// State
const loading = ref(false)
const expenses = ref([])
const showManualForm = ref(false)
const showEditForm = ref(false)
const saving = ref(false)
const categoryOptions = ref([])
const subcategoryOptions = ref([])
const categoriesData = ref([])
const editingExpense = ref(null)
const selectedCategoryFilter = ref(null)
const showAllCategories = ref(false)
const inputMethod = ref('manual')
const spendingPlans = ref([])
const spendingPlanOptions = ref([])

// Form data
const manualExpense = ref({
  description: '',
  amount: null,
  category: null,
  subcategory: null,
  date: new Date().toISOString().split('T')[0], // Today's date
  notes: '',
  shared: false,
  spending_plan: null,
  receiptFile: null
})

const editForm = ref({
  description: '',
  amount: null,
  category: null,
  subcategory: null,
  date: '',
  notes: '',
  spending_plan: null
})

// Computed
const filteredExpenses = computed(() => {
  // Con filtri backend, expenses contiene già i risultati filtrati
  return expenses.value
})

const availableCategories = computed(() => {
  return categoriesData.value.map(category => ({
    id: category.id,
    name: category.name,
    count: null // Il conteggio verrà gestito dal backend se necessario
  }))
})

const visibleCategories = computed(() => {
  if (showAllCategories.value) {
    return availableCategories.value
  }
  return availableCategories.value.slice(0, 3) // Mostra solo le prime 3
})

const hasMoreCategories = computed(() => {
  return availableCategories.value.length > 3
})

const receiptPreviewUrl = computed(() => {
  if (manualExpense.value.receiptFile) {
    return URL.createObjectURL(manualExpense.value.receiptFile)
  }
  return null
})

// Methods
const loadExpenses = async (filters = {}) => {
  try {
    loading.value = true

    console.log('📊 Loading expenses with filters:', filters)
    const expensesData = await api.getExpenses(filters)

    expenses.value = expensesData.results || expensesData || []
    console.log('📊 Expenses loaded:', expenses.value.length)

  } catch (error) {
    console.error('Failed to load expenses:', error)

    let errorMessage = 'Errore nel caricamento delle spese'
    if (error.response?.status === 401) {
      errorMessage = 'Accesso negato. Effettua il login.'
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Data non specificata'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const getCategoryIcon = (categoryIdOrName) => {
  if (!categoryIdOrName) return 'category'

  // Se è un numero (ID), trova il nome della categoria
  let categoryName = categoryIdOrName
  if (typeof categoryIdOrName === 'number') {
    const category = categoryOptions.value.find(opt => opt.value === categoryIdOrName)
    categoryName = category ? category.label : ''
  }

  if (!categoryName) return 'category'

  const categoryLower = categoryName.toLowerCase()

  if (categoryLower.includes('alimentari')) return 'restaurant'
  if (categoryLower.includes('trasporti')) return 'directions_car'
  if (categoryLower.includes('salute')) return 'local_hospital'
  if (categoryLower.includes('casa')) return 'home'
  if (categoryLower.includes('intrattenimento')) return 'movie'
  if (categoryLower.includes('tempo libero')) return 'sports_esports'
  if (categoryLower.includes('viaggi')) return 'flight'
  if (categoryLower.includes('abbigliamento')) return 'checkroom'
  if (categoryLower.includes('elettronica')) return 'devices'
  if (categoryLower.includes('sport')) return 'fitness_center'
  if (categoryLower.includes('educazione')) return 'school'
  if (categoryLower.includes('assicurazioni')) return 'security'
  if (categoryLower.includes('tasse')) return 'receipt_long'
  if (categoryLower.includes('regali')) return 'card_giftcard'
  if (categoryLower.includes('animali')) return 'pets'

  return 'category'
}

const getSelectedSpendingPlanLabel = (planId) => {
  if (!planId) return ''
  const plan = spendingPlanOptions.value.find(opt => opt.value === planId)
  return plan ? plan.label : ''
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pagata': return 'check_circle'
    case 'pianificata': return 'schedule'
    case 'da_pagare': return 'pending'
    case 'parzialmente_pagata': return 'hourglass_half'
    case 'annullata': return 'cancel'
    default: return 'help'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pagata': return 'positive'
    case 'pianificata': return 'warning'
    case 'da_pagare': return 'orange'
    case 'parzialmente_pagata': return 'amber'
    case 'annullata': return 'negative'
    default: return 'grey'
  }
}

// Manual form methods
const loadCategories = async () => {
  try {
    console.log('📂 Loading categories for manual form...')
    const response = await api.getCategories()
    // Handle paginated response
    const categories = Array.isArray(response) ? response : (response.results || response)

    if (!Array.isArray(categories)) {
      console.error('Categories response is not an array:', response)
      return
    }

    // Store full categories data for subcategory lookup
    categoriesData.value = categories

    // Create options for main categories
    categoryOptions.value = categories.map(cat => ({
      label: cat.name || cat.nome,
      value: cat.id,
      subcategories: cat.subcategories || []
    }))

    console.log('📂 Categories loaded for form:', categoryOptions.value.length)
  } catch (error) {
    console.error('Failed to load categories for form:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore nel caricamento delle categorie',
      position: 'top'
    })
  }
}

const loadSpendingPlans = async () => {
  try {
    console.log('📋 Loading spending plans for form...')
    const response = await api.getSpendingPlans()
    const plans = Array.isArray(response) ? response : (response.results || response)

    if (!Array.isArray(plans)) {
      console.error('Spending plans response is not an array:', response)
      return
    }

    spendingPlans.value = plans

    // Create options for spending plans (only active/current ones)
    spendingPlanOptions.value = [
      { label: 'Nessun piano (spesa generica)', value: null },
      ...plans
        .filter(plan => plan.is_current || new Date(plan.end_date) >= new Date()) // Solo piani attivi o futuri
        .map(plan => ({
          label: plan.name,
          value: plan.id,
          description: `${plan.plan_type} - ${plan.start_date} / ${plan.end_date}`
        }))
    ]

    console.log('📋 Spending plans loaded for form:', spendingPlanOptions.value.length - 1) // -1 per escludere "Nessun piano"
  } catch (error) {
    console.error('Failed to load spending plans for form:', error)
    // Non mostro errore all'utente perché è un campo opzionale
  }
}

const onCategoryChange = (categoryId) => {
  // Reset subcategory when category changes
  manualExpense.value.subcategory = null
  subcategoryOptions.value = []

  if (!categoryId) return

  // Find selected category and populate subcategories
  const selectedCategory = categoriesData.value.find(cat => cat.id === categoryId)
  if (selectedCategory && selectedCategory.subcategories) {
    subcategoryOptions.value = selectedCategory.subcategories.map(sub => ({
      label: sub.name || sub.nome,
      value: sub.id
    }))
    console.log('📂 Subcategories loaded:', subcategoryOptions.value.length)
  }
}

const resetManualForm = () => {
  manualExpense.value = {
    description: '',
    amount: null,
    category: null,
    subcategory: null,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    shared: false,
    spending_plan: null,
    receiptFile: null
  }
  subcategoryOptions.value = []
}

const closeManualForm = () => {
  showManualForm.value = false
  inputMethod.value = 'manual' // Reset to default
  resetManualForm()
}

// Scanner functions
const openCamera = () => {
  // Reindirizza alla pagina scanner
  $q.notify({
    type: 'info',
    message: 'Apertura fotocamera...',
    position: 'top'
  })
  closeManualForm()
  // Qui potresti implementare la logica della fotocamera o reindirizzare
  // router.push('/scanner?mode=camera')
}

const uploadImage = () => {
  // Implementa il caricamento di immagini
  $q.notify({
    type: 'info',
    message: 'Caricamento immagine...',
    position: 'top'
  })
  closeManualForm()
  // Qui potresti implementare il file picker per le immagini
  // router.push('/scanner?mode=upload')
}

// Receipt handling functions
const onReceiptRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `File troppo grande o formato non supportato. Max 5MB, solo immagini.`,
    position: 'top'
  })
}

const takeReceiptPhoto = () => {
  // Implementa l'apertura della fotocamera
  $q.notify({
    type: 'info',
    message: 'Funzionalità fotocamera in sviluppo',
    position: 'top'
  })
}

const submitManualExpense = async () => {
  try {
    saving.value = true

    // Validate form
    if (!manualExpense.value.description || !manualExpense.value.amount || !manualExpense.value.category || !manualExpense.value.date) {
      $q.notify({
        type: 'warning',
        message: 'Compila tutti i campi obbligatori',
        position: 'top'
      })
      return
    }

    console.log('💾 Saving manual expense...', manualExpense.value)
    console.log('🏷️ Selected subcategory:', manualExpense.value.subcategory)

    // Prepare expense data for API
    const expenseData = {
      description: manualExpense.value.description,
      amount: manualExpense.value.amount,
      category: manualExpense.value.category,
      subcategory: manualExpense.value.subcategory || null,
      date: manualExpense.value.date,
      notes: manualExpense.value.notes || '',
      shared_with: manualExpense.value.shared ? [] : null, // Empty array means shared with all family
      spending_plan: manualExpense.value.spending_plan || null
    }

    console.log('📤 Expense data to send:', expenseData)

    // Se c'è un file ricevuta, crea FormData per l'upload
    if (manualExpense.value.receiptFile) {
      const formData = new FormData()

      // Aggiungi tutti i campi della spesa
      Object.keys(expenseData).forEach(key => {
        if (expenseData[key] !== null && expenseData[key] !== undefined) {
          formData.append(key, expenseData[key])
        }
      })

      // Aggiungi il file
      formData.append('receipt_image', manualExpense.value.receiptFile)

      await api.createExpenseWithFile(formData)
    } else {
      await api.createExpense(expenseData)
    }

    $q.notify({
      type: 'positive',
      message: 'Spesa salvata con successo!',
      position: 'top'
    })

    // Close form and reload expenses with current filter
    closeManualForm()

    const currentFilters = {}
    if (selectedCategoryFilter.value !== null) {
      currentFilters.category = selectedCategoryFilter.value
    }
    await loadExpenses(currentFilters)

  } catch (error) {
    console.error('Failed to save manual expense:', error)

    let errorMessage = 'Errore nel salvataggio della spesa'
    if (error.response?.status === 401) {
      errorMessage = 'Accesso negato. Effettua il login.'
    } else if (error.response?.data?.detail) {
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

// Filter functions
const filterByCategory = async (categoryId) => {
  selectedCategoryFilter.value = categoryId

  // Prepara i filtri per il backend
  const filters = {}
  if (categoryId !== null) {
    filters.category = categoryId
  }

  // Ricarica le spese con i filtri
  await loadExpenses(filters)
}

// Edit functions
const openEditModal = async (expense) => {
  editingExpense.value = expense

  console.log('🔧 Opening edit modal for expense:', expense)
  console.log('💰 Expense spending_plan:', expense.spending_plan)

  // Populate edit form
  editForm.value = {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    subcategory: expense.subcategory || null,
    date: expense.date,
    notes: expense.notes || '',
    spending_plan: expense.spending_plan || null
  }

  console.log('📝 EditForm populated:', editForm.value)

  // Load subcategories for selected category
  if (expense.category) {
    onEditCategoryChange(expense.category)
  }

  // Load spending plans if not already loaded
  if (spendingPlanOptions.value.length === 0) {
    await loadSpendingPlans()
  }

  showEditForm.value = true
}

const closeEditForm = () => {
  showEditForm.value = false
  editingExpense.value = null
  editForm.value = {
    description: '',
    amount: null,
    category: null,
    subcategory: null,
    date: '',
    notes: '',
    spending_plan: null
  }
}

const onEditCategoryChange = (categoryId) => {
  const category = categoriesData.value.find(cat => cat.id === categoryId)
  if (category && category.subcategories) {
    subcategoryOptions.value = category.subcategories.map(sub => ({
      label: sub.name,
      value: sub.id
    }))
  } else {
    subcategoryOptions.value = []
  }
  editForm.value.subcategory = null
}

const submitEditExpense = async () => {
  try {
    saving.value = true

    // Validate form
    if (!editForm.value.description || !editForm.value.amount || !editForm.value.category || !editForm.value.date) {
      $q.notify({
        type: 'warning',
        message: 'Compila tutti i campi obbligatori',
        position: 'top'
      })
      return
    }

    console.log('💾 Updating expense...', editForm.value)

    // Prepare expense data for API
    const expenseData = {
      description: editForm.value.description,
      amount: editForm.value.amount,
      category: editForm.value.category,
      subcategory: editForm.value.subcategory,
      date: editForm.value.date,
      notes: editForm.value.notes,
      spending_plan: editForm.value.spending_plan || null
    }

    // Call API to update expense
    const response = await api.updateExpense(editingExpense.value.id, expenseData)
    console.log('✅ Expense updated:', response)

    $q.notify({
      type: 'positive',
      message: 'Spesa modificata con successo!',
      position: 'top'
    })

    closeEditForm()

    // Reload list with current filter
    const currentFilters = {}
    if (selectedCategoryFilter.value !== null) {
      currentFilters.category = selectedCategoryFilter.value
    }
    await loadExpenses(currentFilters)

  } catch (error) {
    console.error('❌ Error updating expense:', error)

    let errorMessage = 'Errore durante la modifica della spesa'
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

// Delete expense function
const deleteExpense = async (expense) => {
  $q.dialog({
    title: 'Conferma Eliminazione',
    message: `Sei sicuro di voler eliminare la spesa "${expense.description}"?`,
    cancel: true,
    persistent: false,
    ok: {
      label: 'Elimina',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Annulla',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.deleteExpense(expense.id)

      $q.notify({
        type: 'positive',
        message: 'Spesa eliminata con successo',
        position: 'top'
      })

      // Ricarica le spese
      const currentFilters = {}
      if (selectedCategoryFilter.value !== null) {
        currentFilters.category = selectedCategoryFilter.value
      }
      await loadExpenses(currentFilters)

    } catch (error) {
      console.error('❌ Error deleting expense:', error)

      let errorMessage = 'Errore durante l\'eliminazione della spesa'
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
    }
  })
}

// Lifecycle
onMounted(async () => {
  const authStore = useAuthStore()

  // Aspetta che l'auth store sia inizializzato
  let attempts = 0
  while (authStore.accessToken === null && attempts < 100) {
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }

  // Ora carica i dati se autenticato
  if (authStore.isAuthenticated) {
    console.log('✅ User authenticated, loading data...')
    // Carica prima le categorie e i piani, poi le spese
    await loadCategories()
    await loadSpendingPlans()
    await loadExpenses()
  } else {
    console.log('⏭️ User not authenticated, skipping data load')
  }
})
</script>

<style lang="scss" scoped>
.expenses-page-content {
  width: 100%;
  margin: 0;
  padding: 16px;

  @media (min-width: 768px) {
    padding: 24px;
  }
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
  justify-content: space-between;
  padding: 12px 16px;

  @media (min-width: 768px) {
    padding: 14px 20px;
  }

  :deep(.q-btn__content) {
    justify-content: space-between;
    width: 100%;
  }

  :deep(.q-btn-dropdown__arrow) {
    margin-left: auto;
  }

  :deep(.q-icon) {
    margin-right: 8px;
  }
}

// === METHOD TOGGLE BUTTONS ===
.mcf-method-tabs {
  margin-bottom: 16px;
}

.mcf-toggle-buttons {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    padding: 12px 16px;
    font-weight: 500;

    &.q-btn--active {
      background-color: var(--mcf-primary) !important;
      color: white !important;
    }
  }
}

// === RECEIPT SECTION ===
.mcf-receipt-section {
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--mcf-bg-secondary);
}

.mcf-receipt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mcf-receipt-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

.mcf-receipt-preview {
  margin: 12px 0;
  text-align: center;
}

.mcf-receipt-image {
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mcf-receipt-actions {
  margin-top: 8px;
}

// === SCANNER SECTION ===
.mcf-scanner-section {
  text-align: center;
  padding: 32px 16px;
}

.mcf-scanner-header {
  margin-bottom: 32px;
}

.mcf-scanner-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 16px 0 8px 0;
}

.mcf-scanner-subtitle {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.mcf-scanner-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }
}

.mcf-scanner-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--mcf-text-muted);
  background-color: var(--mcf-bg-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0 auto;
  max-width: 400px;
}

// === CATEGORY FILTERS ===
.mcf-filters-section {
  margin-bottom: 16px;
  padding: 0 4px;

  @media (min-width: 768px) {
    margin-bottom: 20px;
    padding: 0 8px;
  }
}

.mcf-filters-header {
  margin-bottom: 8px;
}

.mcf-filters-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--mcf-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (min-width: 768px) {
    gap: 10px;
  }
}

.mcf-filter-chip {
  transition: all 0.2s ease;
  border-radius: 20px !important;
  font-size: 11px;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 12px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.mcf-more-chip,
  &.mcf-less-chip {
    font-style: italic;
    border: 1px dashed var(--mcf-border-light) !important;

    &:hover {
      background-color: var(--mcf-bg-secondary);
      border-color: var(--mcf-primary) !important;
    }
  }
}

// === MODERN EXPENSES LIST ===
.mcf-expenses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  width: 100%;

  @media (min-width: 768px) {
    gap: 10px;
  }
}

.mcf-expense-card {
  background: var(--mcf-bg-surface);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  box-shadow: var(--mcf-shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  width: 100%;

  @media (min-width: 768px) {
    border-radius: 10px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--mcf-shadow-md);
    border-color: var(--mcf-primary);
  }
}

// === EXPENSE HEADER ===
.mcf-expense-header {
  padding: 10px 12px 0 12px;

  @media (min-width: 768px) {
    padding: 12px 16px 0 16px;
  }

  @media (max-width: 600px) {
    padding: 8px 12px 0 12px;
  }
}

.mcf-expense-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }
}

.mcf-expense-left {
  flex: 1;
  min-width: 0;
}

.mcf-expense-right {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.mcf-expense-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.2;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  word-wrap: break-word;

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
  }
}

// === PAID BADGE ===
.mcf-paid-badge {
  font-size: 16px;
  color: var(--mcf-accent);
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 18px;
  }

  &:hover {
    opacity: 1;
  }
}

.mcf-expense-notes {
  font-size: 12px;
  color: var(--mcf-text-secondary);
  line-height: 1.2;
  margin-top: 1px;

  @media (min-width: 768px) {
    font-size: 13px;
    line-height: 1.3;
    margin-top: 2px;
  }
}

.mcf-amount-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--mcf-primary);
  font-feature-settings: 'tnum';
  line-height: 1;
  margin-bottom: 2px;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 4px;
  }
}

.mcf-shared-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--mcf-accent);

  span {
    line-height: 1;
  }
}

.mcf-expense-actions {
  margin-top: 2px;
}

.mcf-edit-btn {
  font-size: 11px;
  font-weight: 500;
  color: var(--mcf-primary);
  padding: 4px 8px;
  min-height: 28px;
  text-transform: lowercase;
  border: 1px solid var(--mcf-border-light);
  border-radius: 6px;

  &:hover {
    background-color: var(--mcf-primary);
    color: white;
    border-color: var(--mcf-primary);
  }
}

// === EXPENSE METADATA ===
.mcf-expense-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 10px 12px;

  @media (min-width: 768px) {
    padding: 10px 16px 12px 16px;
  }

  @media (max-width: 600px) {
    padding: 6px 12px 8px 12px;
  }
}

.mcf-metadata-left {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;

  @media (min-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 600px) {
    gap: 4px;
  }
}

.mcf-metadata-right {
  margin-left: 12px;
}

.mcf-metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    gap: 5px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
  }

  .q-icon {
    font-size: 12px;

    @media (min-width: 768px) {
      font-size: 14px;
    }
  }

  span {
    line-height: 1;
  }
}

.mcf-metadata-category {
  background-color: var(--mcf-primary-light);
  color: var(--mcf-primary);
}

.mcf-metadata-date {
  background-color: var(--mcf-secondary-light);
  color: var(--mcf-secondary);
}

// Status styles removed - now using discrete badge on title

// === OCR SECTION ===
.mcf-expense-ocr {
  border-top: 1px solid var(--mcf-border-light);
  padding: 12px 16px;
  background-color: var(--mcf-bg-secondary);

  @media (min-width: 768px) {
    padding: 16px 20px;
  }

  @media (max-width: 600px) {
    padding: 10px 16px;
  }
}

:deep(.mcf-ocr-expansion) {
  .mcf-ocr-header {
    padding: 0;
    min-height: auto;

    .q-item__section--main {
      font-size: 13px;
      color: var(--mcf-text-secondary);
    }

    .q-item__section--avatar {
      min-width: auto;
      margin-right: 8px;

      .q-icon {
        font-size: 16px;
        color: var(--mcf-text-muted);
      }
    }
  }
}

.mcf-ocr-content {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: var(--mcf-bg-surface);
  padding: 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
  color: var(--mcf-text-secondary);
  border: 1px solid var(--mcf-border-light);
  margin-top: 8px;
}

// === EMPTY STATE ===
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 24px 24px;
  }
}

// === RESPONSIVE ADJUSTMENTS ===
@media (max-width: 600px) {
  .page-header .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .row.q-gutter-md {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .row.q-gutter-md .q-btn {
    width: 100%;
    max-width: 250px;
  }
}

/* === FAB CUSTOM PALETTE === */
.mcf-fab-main {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%) !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(35, 157, 176, 0.4) !important;

  &:hover {
    box-shadow: 0 6px 20px rgba(35, 157, 176, 0.5) !important;
    transform: translateY(-2px);
  }
}

.mcf-fab-manual {
  background: var(--mcf-primary) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(35, 157, 176, 0.3) !important;

  &:hover {
    background: var(--mcf-primary-dark) !important;
    transform: translateY(-1px);
  }
}

.mcf-fab-scanner {
  background: var(--mcf-secondary) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(42, 95, 130, 0.3) !important;

  &:hover {
    background: var(--mcf-secondary-dark) !important;
    transform: translateY(-1px);
  }
}

:deep(.q-fab__actions) {
  .q-fab__action {
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }

  .q-fab__action .q-btn {
    min-width: 52px;
    min-height: 52px;
    border-radius: 50%;
  }

  .q-fab__action .q-btn__content {
    font-size: 20px;
  }
}

:deep(.q-fab__label) {
  background: linear-gradient(135deg, var(--mcf-text-primary) 0%, var(--mcf-text-secondary) 100%) !important;
  color: white !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(4px);
}

/* Animazioni FAB */
:deep(.q-fab) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.q-fab__action) {
  transition: all 0.2s ease;
}

/* === EXPENSE MENU STYLES === */
.mcf-expense-menu-btn {
  color: var(--mcf-text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--mcf-primary);
    background: rgba(35, 157, 176, 0.1);
  }
}

.mcf-expense-menu {
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

</style>
