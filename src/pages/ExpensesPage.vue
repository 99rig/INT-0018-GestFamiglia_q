<template>
  <q-page class="mcf-page-container">
    <div class="expenses-page-content">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h4 class="text-h4 q-ma-none text-mcf-primary">Le Tue Spese</h4>
            <p class="text-subtitle1 text-mcf-accent q-ma-none">
              Gestisci le spese della famiglia
            </p>
          </div>
          <q-btn 
            icon="add"
            label="Nuova Spesa"
            class="mcf-btn-primary"
            @click="$router.push('/scanner')"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner-dots size="50px" color="mcf-primary" />
        <div class="text-mcf-primary q-mt-md">Caricamento spese...</div>
      </div>

      <!-- Lista spese -->
      <div v-else-if="expenses.length > 0" class="expenses-list">
        <q-card 
          v-for="expense in expenses" 
          :key="expense.id"
          class="mcf-card q-mb-md expense-card"
        >
          <q-card-section>
            <div class="row items-start justify-between">
              <div class="col">
                <div class="text-h6 text-mcf-primary">{{ expense.titolo }}</div>
                <div class="text-body2 text-mcf-accent q-mt-xs">
                  {{ expense.descrizione }}
                </div>
                <div class="expense-meta q-mt-sm">
                  <q-chip 
                    :icon="getCategoryIcon(expense.categoria_nome)"
                    :label="expense.categoria_nome || 'Categoria non specificata'"
                    size="sm"
                    color="mcf-accent"
                    text-color="white"
                  />
                  <q-chip 
                    icon="calendar_today"
                    :label="formatDate(expense.data_spesa)"
                    size="sm"
                    color="mcf-secondary"
                    text-color="white"
                    class="q-ml-xs"
                  />
                  <q-chip 
                    v-if="expense.stato"
                    :icon="getStatusIcon(expense.stato)"
                    :label="expense.stato"
                    size="sm"
                    :color="getStatusColor(expense.stato)"
                    text-color="white"
                    class="q-ml-xs"
                  />
                </div>
              </div>
              <div class="text-right">
                <div class="text-h5 text-mcf-primary">€{{ expense.importo }}</div>
                <div v-if="expense.condivisa" class="text-caption text-positive">
                  <q-icon name="people" size="xs" class="q-mr-xs" />
                  Condivisa
                </div>
              </div>
            </div>
          </q-card-section>
          
          <!-- Note OCR -->
          <q-card-section v-if="expense.note && expense.note.includes('OCR')" class="q-pt-none">
            <q-expansion-item
              icon="text_snippet"
              label="Testo OCR"
              class="text-caption"
            >
              <div class="ocr-note-content">
                {{ expense.note }}
              </div>
            </q-expansion-item>
          </q-card-section>
        </q-card>
      </div>

      <!-- Stato vuoto -->
      <div v-else class="empty-state text-center q-pa-xl">
        <q-icon 
          name="receipt_long" 
          size="64px" 
          class="text-mcf-accent q-mb-md"
        />
        <div class="text-h6 text-mcf-primary q-mb-sm">Nessuna spesa trovata</div>
        <div class="text-body2 text-mcf-accent q-mb-lg">
          Inizia scansionando la tua prima ricevuta!
        </div>
        <q-btn
          icon="document_scanner"
          label="Scansiona Ricevuta"
          class="mcf-btn-primary"
          size="lg"
          @click="$router.push('/scanner')"
        />
      </div>

      <!-- FAB per aggiungere spesa -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="add"
          class="mcf-bg-primary text-white"
          @click="$router.push('/scanner')"
        />
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api'

const $q = useQuasar()

// State
const loading = ref(false)
const expenses = ref([])

// Methods
const loadExpenses = async () => {
  try {
    loading.value = true
    
    console.log('📊 Loading expenses...')
    const expensesData = await api.getExpenses()
    
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

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return 'category'
  
  const categoryLower = categoryName.toLowerCase()
  
  if (categoryLower.includes('alimentari')) return 'restaurant'
  if (categoryLower.includes('trasporti')) return 'directions_car'
  if (categoryLower.includes('salute')) return 'local_hospital'
  if (categoryLower.includes('casa')) return 'home'
  if (categoryLower.includes('intrattenimento')) return 'movie'
  
  return 'category'
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'effettuata': return 'check_circle'
    case 'pianificata': return 'schedule'
    case 'in_sospeso': return 'pause_circle'
    default: return 'help'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'effettuata': return 'positive'
    case 'pianificata': return 'warning'
    case 'in_sospeso': return 'negative'
    default: return 'grey'
  }
}

// Lifecycle
onMounted(() => {
  loadExpenses()
})
</script>

<style scoped>
.expenses-page-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  background: linear-gradient(135deg, var(--mcf-light) 0%, var(--mcf-warm) 100%);
  padding: 20px;
  border-radius: 12px;
  margin: -20px -20px 20px -20px;
}

.expense-card {
  transition: transform 0.2s;
}

.expense-card:hover {
  transform: translateY(-2px);
}

.expense-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.ocr-note-content {
  font-family: monospace;
  font-size: 11px;
  line-height: 1.3;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  max-height: 100px;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .page-header .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .expense-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>