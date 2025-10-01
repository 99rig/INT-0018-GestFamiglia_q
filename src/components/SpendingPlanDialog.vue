<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    full-width
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;" class="mcf-dialog">
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

        <q-form @submit="onSubmit" class="q-gutter-xs" :disable="!authStore.user?.family">

          <MCFInput
            v-model="formData.name"
            label="Nome Piano *"
            required
            :rules="[val => val && val.length > 0 || 'Nome richiesto']"
          />

          <MCFInput
            v-model="formData.description"
            label="Descrizione (opzionale)"
            type="textarea"
            rows="3"
          />

          <MCFInput
            v-model.number="formData.total_budget"
            label="Budget Pianificato (opzionale)"
            type="number"
            step="1"
            min="0"
            suffix="€"
            :rules="[
              val => val === null || val === undefined || val === '' || val >= 0 || 'Budget deve essere positivo'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="account_balance_wallet" />
            </template>
          </MCFInput>

          <MCFSelect
            v-model="formData.plan_type"
            :options="planTypeOptions"
            label="Tipo Piano *"
            emit-value
            map-options
          />

          <div class="mcf-date-fields">
            <div class="mcf-date-field">
              <MCFDatePicker
                v-model="formData.start_date"
                label="Data Inizio *"
                :rules="[val => val && val.length > 0 || 'Data inizio richiesta']"
              />
            </div>
            <div class="mcf-date-field">
              <MCFDatePicker
                v-model="formData.end_date"
                label="Data Fine *"
                :rules="[val => val && val.length > 0 || 'Data fine richiesta']"
              />
            </div>
          </div>

          <!-- Toggle condivisione famiglia (solo se l'utente ha una famiglia) -->
          <q-item v-if="userHasFamily" class="q-px-none mcf-family-toggle">
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ formData.plan_scope === 'family' ? 'Piano famigliare' : 'Piano personale' }}</q-item-label>
              <q-item-label caption>
                {{ formData.plan_scope === 'family' ? 'Se attivato, il piano sarà condiviso con tutti i membri della famiglia' : 'Se disattivato, il piano sarà solo per te' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="formData.plan_scope === 'family'"
                @update:model-value="formData.plan_scope = $event ? 'family' : 'personal'"
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
          unelevated
          no-caps
          rounded
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import MCFInput from 'src/components/forms/MCFInput.vue'
import MCFSelect from 'src/components/forms/MCFSelect.vue'
import MCFDatePicker from 'src/components/MCFDatePicker.vue'

// Locale italiana per il datepicker
const italianLocale = {
  days: 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
  daysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
  months: 'Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre'.split('_'),
  monthsShort: 'Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic'.split('_'),
  firstDayOfWeek: 1 // Lunedì come primo giorno della settimana
}

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

// Store
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
  plan_scope: 'family'
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
         !props.saving &&
         !!authStore.user?.family  // Richiede famiglia
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
    plan_scope: 'family'
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
      plan_scope: newPlan.plan_scope || 'family'
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
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0c4a6e;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 2px solid #bae6fd;

  .text-h6 {
    font-weight: 600;
    color: #0c4a6e;
  }

  .q-btn {
    color: #0369a1;
  }
}

.mcf-dialog-content {
  padding: 32px 24px 24px 24px;
  flex: 1;
  overflow-y: auto;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

/* === DATE FIELDS RESPONSIVE === */
.mcf-date-fields {
  display: flex;
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.mcf-date-field {
  flex: 1;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }

  /* Rimuovi lo spazio del bottom field di Quasar */
  :deep(.q-field__bottom) {
    min-height: 0 !important;
    padding-top: 0 !important;
    margin-top: 2px !important;
  }
}

/* === COMPATTA SPACING GENERALE === */
.q-gutter-sm > * {
  margin-bottom: 8px !important; /* Riduce spacing tra i campi */
}

.q-gutter-sm > *:last-child {
  margin-bottom: 0 !important;
}

/* === FAMILY TOGGLE SECTION === */
.mcf-family-toggle {
  border: 2px dashed var(--q-primary);
  border-radius: 8px;
  padding: 12px 16px !important;
  margin: 8px 0 8px 12px;
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.08);
    border-color: var(--q-primary-dark, #1976d2);
  }

  :deep(.q-item__section--avatar) {
    color: var(--q-primary);
    min-width: 40px;
  }

  :deep(.q-item__label) {
    font-weight: 600;
    color: var(--q-text-primary);
  }

  :deep(.q-item__label--caption) {
    color: var(--q-text-secondary);
    font-size: 12px;
    margin-top: 2px;
  }
}

/* === DATE FIELDS RESPONSIVE === */
.mcf-date-fields {
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.mcf-date-field {
  flex: 1;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }
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
