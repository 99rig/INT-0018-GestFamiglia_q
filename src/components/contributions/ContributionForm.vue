<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @show="console.log('🔍 DEBUG: ContributionForm dialog SHOW event')"
    @hide="console.log('🔍 DEBUG: ContributionForm dialog HIDE event')"
    persistent
    full-width
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card class="mcf-dialog" style="margin: 0; border-radius: 0 0 16px 16px; max-height: 90vh; display: flex; flex-direction: column;">
    <q-card-section class="mcf-dialog-header">
      <div class="text-h6">
        {{ isEdit ? 'Modifica Contributo' : 'Nuovo Contributo' }}
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
      <q-form @submit="onSubmit" class="q-gutter-xs">
        <!-- Descrizione -->
        <MCFInput
          v-model="form.description"
          label="Descrizione *"
          placeholder="Es: Stipendio novembre, Regalo nonni..."
          :rules="[val => !!val || 'Descrizione richiesta']"
          maxlength="255"
        />

        <!-- Importo -->
        <MCFInput
          v-model.number="form.amount"
          label="Importo *"
          type="number"
          step="0.01"
          min="0.01"
          prefix="€"
          :rules="[
            val => !!val || 'Importo richiesto',
            val => val > 0 || 'L\'importo deve essere maggiore di zero'
          ]"
        />

        <!-- Tipo di contributo -->
        <MCFSelect
          v-model="form.contribution_type"
          label="Tipo di Contributo *"
          :options="contributionTypeOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          :rules="[val => !!val || 'Tipo di contributo richiesto']"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon
                  :name="getContributionTypeIcon(scope.opt.value)"
                  :color="getContributionTypeColor(scope.opt.value)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </MCFSelect>

        <!-- Data -->
        <MCFDatePicker
          v-model="form.date"
          label="Data Contributo *"
          :rules="[val => !!val || 'Data richiesta']"
        />

        <!-- Note -->
        <MCFInput
          v-model="form.notes"
          label="Note aggiuntive"
          type="textarea"
          rows="3"
          maxlength="500"
          counter
        />
      </q-form>

      <!-- Informativa Contributi -->
      <q-banner class="contribution-info-banner" rounded>
        <template v-slot:avatar>
          <q-icon name="info" color="primary" />
        </template>
        <div class="text-caption">
          <strong>Cos'è un contributo?</strong><br>
          Un contributo è una somma che aggiungi alla cassa comune della famiglia.
          Può essere uno stipendio, un regalo ricevuto, o qualsiasi altra entrata.
          Questo aumenta la disponibilità cash totale per le spese familiari.
        </div>
      </q-banner>
    </q-card-section>

    <q-card-actions align="right" class="mcf-dialog-actions">
      <q-btn
        flat
        label="Annulla"
        @click="onCancel"
        :disable="loading"
        unelevated
        no-caps
      />
      <q-btn
        :label="isEdit ? 'Aggiorna' : 'Aggiungi'"
        color="primary"
        :loading="loading"
        :disable="loading"
        @click="onSubmit"
        unelevated
        no-caps
        rounded
      />
    </q-card-actions>
  </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useContributionsStore } from 'src/stores/contributions'
import { useAuthStore } from 'src/stores/auth'
import { date } from 'quasar'
import MCFInput from 'src/components/forms/MCFInput.vue'
import MCFSelect from 'src/components/forms/MCFSelect.vue'
import MCFDatePicker from 'src/components/MCFDatePicker.vue'

export default defineComponent({
  name: 'ContributionForm',

  components: {
    MCFInput,
    MCFSelect,
    MCFDatePicker
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    contribution: {
      type: Object,
      default: null
    }
  },

  emits: ['update:modelValue', 'saved', 'cancel'],

  setup(props, { emit }) {
    const contributionsStore = useContributionsStore()
    const authStore = useAuthStore()
    const loading = ref(false)

    const isEdit = computed(() => !!props.contribution)

    // Debug watcher
    watch(() => props.modelValue, (newValue) => {
      console.log('🔍 DEBUG ContributionForm: modelValue changed to:', newValue)
    }, { immediate: true })

    // Opzioni per tipo di contributo
    const contributionTypeOptions = [
      { value: 'contanti', label: 'Contanti' },
      { value: 'bonifico', label: 'Bonifico Ricevuto' },
      { value: 'stipendio', label: 'Stipendio' },
      { value: 'regalo', label: 'Regalo' },
      { value: 'rimborso', label: 'Rimborso' },
      { value: 'vendita', label: 'Vendita' },
      { value: 'altro', label: 'Altro' }
    ]

    // Form data
    const form = ref({
      description: '',
      amount: null,
      contribution_type: 'contanti',
      date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
      notes: ''
    })

    // Inizializza form se in modalità modifica
    onMounted(() => {
      if (isEdit.value && props.contribution) {
        form.value = {
          description: props.contribution.description || '',
          amount: props.contribution.amount || null,
          contribution_type: props.contribution.contribution_type || 'contanti',
          date: props.contribution.date || date.formatDate(Date.now(), 'YYYY-MM-DD'),
          notes: props.contribution.notes || ''
        }
      }
    })

    const getContributionTypeIcon = (type) => {
      const icons = {
        contanti: 'payments',
        bonifico: 'account_balance',
        stipendio: 'work',
        regalo: 'card_giftcard',
        rimborso: 'assignment_return',
        vendita: 'sell',
        altro: 'more_horiz'
      }
      return icons[type] || 'more_horiz'
    }

    const getContributionTypeColor = (type) => {
      const colors = {
        contanti: 'green',
        bonifico: 'blue',
        stipendio: 'purple',
        regalo: 'pink',
        rimborso: 'orange',
        vendita: 'teal',
        altro: 'grey'
      }
      return colors[type] || 'grey'
    }

    const onSubmit = async () => {
      loading.value = true
      try {
        const submitData = {
          ...form.value,
          user: authStore.user.id // Aggiungi l'ID dell'utente corrente
        }

        if (isEdit.value) {
          await contributionsStore.updateContribution(props.contribution.id, submitData)
        } else {
          await contributionsStore.createContribution(submitData)
        }
        emit('saved')
        emit('update:modelValue', false)
      } catch (error) {
        console.error('Errore nel salvataggio contributo:', error)
      } finally {
        loading.value = false
      }
    }

    const onCancel = () => {
      emit('cancel')
      emit('update:modelValue', false)
    }

    return {
      form,
      loading,
      isEdit,
      contributionTypeOptions,
      getContributionTypeIcon,
      getContributionTypeColor,
      onSubmit,
      onCancel
    }
  }
})
</script>

<style lang="scss" scoped>
.contribution-info-banner {
  margin-top: 16px;
  background: #f0f7ff !important;
  border: 1px solid #d0e7ff !important;
  border-radius: 16px !important;

  .text-caption {
    color: #374151;
    line-height: 1.5;

    strong {
      color: #1e40af;
    }
  }
}
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

.mcf-dialog-actions {
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* === COMPATTA SPACING GENERALE === */
.q-gutter-sm > * {
  margin-bottom: 8px !important; /* Riduce spacing tra i campi */
}

.q-gutter-sm > *:last-child {
  margin-bottom: 0 !important;
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