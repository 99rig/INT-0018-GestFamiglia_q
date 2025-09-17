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
          {{ isEdit ? 'Modifica Piano di Spesa' : 'Nuovo Piano di Spesa' }}
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
        <q-form @submit="onSubmit" class="q-gutter-md">

          <q-input
            v-model="formData.name"
            label="Nome Piano *"
            required
            outlined
            :rules="[val => val && val.length > 0 || 'Nome richiesto']"
          />

          <q-input
            v-model="formData.description"
            label="Descrizione (opzionale)"
            outlined
            type="textarea"
            rows="3"
          />

          <q-input
            v-model.number="formData.total_budget"
            label="Budget Pianificato (opzionale)"
            outlined
            type="number"
            step="0.01"
            min="0"
            suffix="€"
            :rules="[
              val => val === null || val === undefined || val === '' || val >= 0 || 'Budget deve essere positivo'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="account_balance_wallet" />
            </template>
          </q-input>

          <q-select
            v-model="formData.plan_type"
            :options="planTypeOptions"
            label="Tipo Piano *"
            outlined
            emit-value
            map-options
          />

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="formData.start_date"
                label="Data Inizio *"
                outlined
                readonly
                :rules="[val => val && val.length > 0 || 'Data inizio richiesta']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.start_date" mask="YYYY-MM-DD">
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
                v-model="formData.end_date"
                label="Data Fine *"
                outlined
                readonly
                :rules="[val => val && val.length > 0 || 'Data fine richiesta']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.end_date" mask="YYYY-MM-DD">
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

          <!-- Toggle condivisione famiglia (solo se l'utente ha una famiglia) -->
          <q-item v-if="userHasFamily" class="q-px-none">
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Piano famigliare</q-item-label>
              <q-item-label caption>
                Se attivato, il piano sarà condiviso con tutti i membri della famiglia
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="formData.is_shared"
                color="primary"
              />
            </q-item-section>
          </q-item>

        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="mcf-dialog-actions">
        <q-btn
          flat
          label="Annulla"
          @click="onCancel"
          :disable="saving"
        />
        <q-btn
          :label="isEdit ? 'Aggiorna' : 'Crea Piano'"
          color="primary"
          :loading="saving"
          :disable="!canSubmit"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const $q = useQuasar()
const authStore = useAuthStore()

// Computed
const isEdit = computed(() => !!props.plan)

const userHasFamily = computed(() => {
  // Mostra il toggle se l'utente ha una famiglia
  return !!authStore.user?.family_detail
})

// Form data
const formData = ref({
  name: '',
  description: '',
  total_budget: 0,
  plan_type: 'custom',
  start_date: '',
  end_date: '',
  is_shared: true
})

// Options
const planTypeOptions = [
  { label: 'Mensile', value: 'monthly' },
  { label: 'Trimestrale', value: 'quarterly' },
  { label: 'Semestrale', value: 'semester' },
  { label: 'Annuale', value: 'yearly' },
  { label: 'Personalizzato', value: 'custom' }
]

// Validation
const canSubmit = computed(() => {
  return formData.value.name &&
         formData.value.start_date &&
         formData.value.end_date &&
         !props.saving
})

// Methods (defined before watchers to avoid hoisting issues)
const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    total_budget: 0,
    plan_type: 'custom',
    start_date: '',
    end_date: '',
    is_shared: true
  }
}

// Watch for plan changes to populate form
watch(() => props.plan, (newPlan) => {
  if (newPlan) {
    // Edit mode - populate with existing data
    formData.value = {
      name: newPlan.name || '',
      description: newPlan.description || '',
      total_budget: parseFloat(newPlan.total_budget) || 0,
      plan_type: newPlan.plan_type || 'custom',
      start_date: newPlan.start_date || '',
      end_date: newPlan.end_date || '',
      is_shared: newPlan.is_shared !== undefined ? newPlan.is_shared : true
    }
  } else {
    // Create mode - reset form
    resetForm()
  }
}, { immediate: true })

// Watch for dialog close to reset form
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen && !props.plan) {
    resetForm()
  }
})

const onSubmit = () => {
  if (!canSubmit.value) return

  const submitData = {
    ...formData.value
  }

  // Add ID for edit mode
  if (isEdit.value) {
    submitData.id = props.plan.id
  }

  emit('submit', submitData)
}

const onCancel = () => {
  emit('cancel')
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
  max-width: 600px;
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