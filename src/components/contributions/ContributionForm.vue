<template>
  <q-card style="min-width: 400px; max-width: 500px;">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">
        <q-icon name="add" class="q-mr-sm" />
        {{ isEdit ? 'Modifica Contributo' : 'Nuovo Contributo' }}
      </div>
    </q-card-section>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-card-section>
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
        <MCFInput
          v-model="form.date"
          label="Data Contributo *"
          type="date"
          :rules="[val => !!val || 'Data richiesta']"
        />

        <!-- Note -->
        <q-input
          v-model="form.notes"
          label="Note aggiuntive"
          type="textarea"
          rows="3"
          maxlength="500"
          counter
          outlined
          class="q-mb-md"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Annulla"
          color="grey"
          @click="$emit('cancel')"
          :disable="loading"
        />
        <q-btn
          type="submit"
          :label="isEdit ? 'Aggiorna' : 'Aggiungi'"
          color="primary"
          :loading="loading"
          :disable="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useContributionsStore } from 'src/stores/contributions'
import { useAuthStore } from 'src/stores/auth'
import { date } from 'quasar'
import MCFInput from 'src/components/forms/MCFInput.vue'
import MCFSelect from 'src/components/forms/MCFSelect.vue'

export default defineComponent({
  name: 'ContributionForm',

  components: {
    MCFInput,
    MCFSelect
  },

  props: {
    contribution: {
      type: Object,
      default: null
    }
  },

  emits: ['saved', 'cancel'],

  setup(props, { emit }) {
    const contributionsStore = useContributionsStore()
    const authStore = useAuthStore()
    const loading = ref(false)

    const isEdit = computed(() => !!props.contribution)

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
      } catch (error) {
        console.error('Errore nel salvataggio contributo:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      isEdit,
      contributionTypeOptions,
      getContributionTypeIcon,
      getContributionTypeColor,
      onSubmit
    }
  }
})
</script>

<style lang="scss" scoped>
.q-card {
  .q-card__section--vert {
    padding: 16px;
  }
}
</style>