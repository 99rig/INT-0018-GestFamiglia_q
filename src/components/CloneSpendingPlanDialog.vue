<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized
  >
    <q-card class="mcf-dialog">
      <q-card-section class="mcf-dialog-header">
        <div class="text-h6">
          <q-icon name="content_copy" class="q-mr-sm" />
          Clona Piano di Spesa Intelligente
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="onCancel"
        />
      </q-card-section>

      <q-card-section class="mcf-dialog-content">
        <div v-if="!clonePreview" class="q-gutter-md">
          <!-- Piano originale -->
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              <q-icon name="description" class="q-mr-sm" />
              Piano Originale
            </div>
            <div class="text-body2 text-grey-7 q-mb-xs">{{ plan.name }}</div>
            <div class="text-caption text-grey-6">
              {{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}
            </div>
            <div v-if="plan.total_budget" class="text-caption text-primary q-mt-xs">
              Budget: €{{ plan.total_budget }}
            </div>
          </q-card>

          <!-- Info pattern recognition -->
          <q-banner class="bg-blue-1 text-blue-8" rounded>
            <template v-slot:avatar>
              <q-icon name="auto_awesome" color="blue" />
            </template>
            <div class="text-body2">
              <strong>Clonazione Intelligente:</strong>
              Il sistema analizzerà automaticamente il titolo del piano per riconoscere pattern temporali
              (es. "Settembre 2025") e suggerirà il periodo successivo con date e titolo adattati.
            </div>
          </q-banner>

          <!-- Opzioni avanzate -->
          <q-expansion-item
            icon="settings"
            label="Opzioni Avanzate"
            class="bg-grey-1"
          >
            <div class="q-pa-md q-gutter-md">
              <q-input
                v-model="customTitle"
                label="Titolo personalizzato (opzionale)"
                outlined
                dense
                hint="Lascia vuoto per utilizzare il titolo suggerito automaticamente"
              />

              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="customStartDate"
                    label="Data inizio personalizzata"
                    outlined
                    dense
                    readonly
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="customStartDate" mask="YYYY-MM-DD">
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
                    v-model="customEndDate"
                    label="Data fine personalizzata"
                    outlined
                    dense
                    readonly
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="customEndDate" mask="YYYY-MM-DD">
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

              <q-toggle
                v-model="adjustExpenseDates"
                label="Adatta automaticamente le date delle spese pianificate"
                color="primary"
              />
            </div>
          </q-expansion-item>
        </div>

        <!-- Anteprima del clone -->
        <div v-if="clonePreview" class="q-gutter-md">
          <q-card flat bordered class="q-pa-md bg-green-1">
            <div class="text-subtitle1 text-weight-medium q-mb-sm text-green-8">
              <q-icon name="preview" class="q-mr-sm" />
              Anteprima Clone
            </div>

            <!-- Dettagli pattern detection -->
            <div v-if="clonePreview.cloning_details.pattern_detection.title_pattern_used"
                 class="bg-blue-2 q-pa-sm rounded-borders q-mb-md">
              <div class="text-caption text-blue-8">
                <q-icon name="smart_toy" class="q-mr-xs" />
                <strong>Pattern Rilevato:</strong>
                {{ getPatternDescription() }}
              </div>
            </div>

            <!-- Nuovo piano -->
            <div class="q-mb-md">
              <div class="text-body1 text-weight-medium">{{ clonePreview.cloned_plan.name }}</div>
              <div class="text-caption text-grey-6">
                {{ formatDate(clonePreview.cloned_plan.start_date) }} -
                {{ formatDate(clonePreview.cloned_plan.end_date) }}
              </div>
              <div v-if="clonePreview.cloned_plan.total_budget" class="text-caption text-primary">
                Budget: €{{ clonePreview.cloned_plan.total_budget }}
              </div>
            </div>

            <!-- Statistiche clone -->
            <div class="row q-gutter-md text-center">
              <div class="col bg-white q-pa-sm rounded-borders">
                <div class="text-h6 text-primary">{{ clonePreview.cloning_details.expenses_cloned }}</div>
                <div class="text-caption">Spese Clonate</div>
              </div>
              <div class="col bg-white q-pa-sm rounded-borders">
                <div class="text-h6 text-orange">{{ clonePreview.cloning_details.expenses_with_dates_adjusted }}</div>
                <div class="text-caption">Date Adattate</div>
              </div>
            </div>
          </q-card>

          <!-- Lista spese clonate -->
          <q-card v-if="clonePreview.cloned_plan.planned_expenses_detail?.length" flat bordered>
            <q-card-section>
              <div class="text-subtitle2 q-mb-md">
                <q-icon name="list" class="q-mr-sm" />
                Spese Pianificate Clonate
              </div>
              <div class="q-gutter-sm">
                <div
                  v-for="expense in clonePreview.cloned_plan.planned_expenses_detail"
                  :key="expense.id"
                  class="row items-center q-pa-sm bg-grey-1 rounded-borders"
                >
                  <div class="col">
                    <div class="text-body2">{{ expense.description }}</div>
                    <div class="text-caption text-grey-6">
                      {{ expense.category_name }} • €{{ expense.amount }}
                      <span v-if="expense.due_date"> • {{ formatDate(expense.due_date) }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      :color="getPriorityColor(expense.priority)"
                      text-color="white"
                      size="sm"
                    >
                      {{ expense.priority }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="mcf-dialog-actions">
        <q-btn
          flat
          label="Annulla"
          @click="onCancel"
          :disable="cloning"
        />
        <q-btn
          v-if="!clonePreview"
          label="Genera Anteprima"
          color="primary"
          outline
          :loading="generating"
          @click="generatePreview"
        />
        <q-btn
          v-if="clonePreview"
          label="Indietro"
          color="grey"
          outline
          @click="backToOptions"
        />
        <q-btn
          v-if="clonePreview"
          label="Conferma Clone"
          color="primary"
          :loading="cloning"
          @click="confirmClone"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useSnackbar } from 'src/composables/useSnackbar'
import { api } from 'src/services/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'cloned'])

// const $q = useQuasar() - not used yet
const snackbar = useSnackbar()

// Reactive data
const clonePreview = ref(null)
const generating = ref(false)
const cloning = ref(false)

// Advanced options
const customTitle = ref('')
const customStartDate = ref('')
const customEndDate = ref('')
const adjustExpenseDates = ref(true)

// Methods
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('it-IT')
}

const getPriorityColor = (priority) => {
  const colors = {
    'alta': 'red',
    'media': 'orange',
    'bassa': 'green'
  }
  return colors[priority] || 'grey'
}

const getPatternDescription = () => {
  if (!clonePreview.value) return ''

  const details = clonePreview.value.cloning_details.pattern_detection
  let description = ''

  if (details.detected_month && details.detected_year) {
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                   'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
    description = `Mese "${months[details.detected_month - 1]}" e anno "${details.detected_year}"`
  } else if (details.detected_month) {
    description = `Mese rilevato nel titolo`
  } else if (details.detected_year) {
    description = `Anno "${details.detected_year}" rilevato nel titolo`
  }

  return description
}

const generatePreview = async () => {
  if (!props.plan?.id) return

  generating.value = true
  try {
    // Chiamata API per smart clone in modalità preview
    const response = await api.smartCloneSpendingPlan(props.plan.id, { preview_only: true })
    clonePreview.value = response

    snackbar.success('Anteprima generata con successo')
  } catch (error) {
    console.error('Error generating preview:', error)

    if (error.response?.status === 400) {
      // Piano già esistente
      snackbar.warning(error.response.data.detail || 'Piano già esistente per il periodo selezionato')
    } else {
      snackbar.error('Errore nella generazione dell\'anteprima')
    }
  } finally {
    generating.value = false
  }
}

const backToOptions = () => {
  clonePreview.value = null
}

const confirmClone = async () => {
  if (!clonePreview.value) return

  cloning.value = true
  try {
    // Il clone è già stato creato durante la preview
    // Emettiamo l'evento con i dati del piano clonato
    emit('cloned', clonePreview.value.cloned_plan)

    snackbar.success(`Piano "${clonePreview.value.cloned_plan.name}" clonato con successo!`)

    onCancel()
  } catch (error) {
    console.error('Error confirming clone:', error)
    snackbar.error('Errore nella conferma del clone')
  } finally {
    cloning.value = false
  }
}

const onCancel = () => {
  // Reset state
  clonePreview.value = null
  customTitle.value = ''
  customStartDate.value = ''
  customEndDate.value = ''
  adjustExpenseDates.value = true

  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.mcf-dialog {
  width: 100%;
  height: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
}

.mcf-dialog-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mcf-dialog-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.mcf-dialog-actions {
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

// Responsive
@media (max-width: 600px) {
  .mcf-dialog {
    margin: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
  }

  .mcf-dialog-header {
    padding: 16px 20px;
  }

  .mcf-dialog-content {
    padding: 20px;
  }

  .mcf-dialog-actions {
    padding: 16px 20px;
  }
}
</style>