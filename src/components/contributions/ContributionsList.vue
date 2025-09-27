<template>
  <div class="contributions-list">
    <!-- Filtri -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Filtri</div>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <MCFSelect
              v-model="filters.status"
              label="Stato"
              :options="statusOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              clearable
              @update:model-value="applyFilters"
            />
          </div>
          <div class="col-12 col-md-3">
            <MCFSelect
              v-model="filters.contribution_type"
              label="Tipo"
              :options="contributionTypeOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              clearable
              @update:model-value="applyFilters"
            />
          </div>
          <div class="col-12 col-md-3">
            <MCFInput
              v-model="filters.date_from"
              label="Da Data"
              type="date"
              @update:model-value="applyFilters"
            />
          </div>
          <div class="col-12 col-md-3">
            <MCFInput
              v-model="filters.date_to"
              label="A Data"
              type="date"
              @update:model-value="applyFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista Contributi -->
    <q-card>
      <q-card-section>
        <div class="flex items-center justify-between q-mb-md">
          <div class="text-h6">
            Contributi ({{ contributions.length }})
          </div>
          <q-btn
            color="primary"
            icon="add"
            label="Nuovo Contributo"
            @click="showAddForm = true"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner-dots size="xl" color="primary" />
          <div class="text-grey-6 q-mt-md">Caricamento contributi...</div>
        </div>

        <!-- Lista -->
        <div v-else-if="contributions.length" class="q-gutter-sm">
          <q-card
            v-for="contribution in contributions"
            :key="contribution.id"
            flat
            bordered
            class="contribution-card"
          >
            <q-card-section class="q-pa-md">
              <div class="flex items-start justify-between">
                <!-- Info principale -->
                <div class="flex items-start q-gutter-md flex-grow">
                  <q-avatar
                    :color="getContributionTypeColor(contribution.contribution_type)"
                    text-color="white"
                    size="md"
                  >
                    <q-icon :name="getContributionTypeIcon(contribution.contribution_type)" />
                  </q-avatar>

                  <div class="flex-grow">
                    <div class="text-h6 text-weight-medium">
                      {{ contribution.description }}
                    </div>
                    <div class="text-body2 text-grey-6 q-mb-sm">
                      {{ contribution.user_detail?.first_name || contribution.user_name }} •
                      {{ formatDate(contribution.date) }} •
                      {{ getTypeLabel(contribution.contribution_type) }}
                    </div>

                    <!-- Progress bar per utilizzo -->
                    <div v-if="contribution.usage_percentage > 0" class="q-mt-sm">
                      <div class="text-caption text-grey-6 q-mb-xs">
                        Utilizzato: {{ contribution.usage_percentage.toFixed(1) }}%
                      </div>
                      <q-linear-progress
                        :value="contribution.usage_percentage / 100"
                        :color="getProgressColor(contribution.usage_percentage)"
                        class="q-mb-xs"
                        size="8px"
                      />
                    </div>

                    <!-- Note -->
                    <div v-if="contribution.notes" class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="note" size="xs" class="q-mr-xs" />
                      {{ contribution.notes }}
                    </div>
                  </div>
                </div>

                <!-- Importi e azioni -->
                <div class="text-right q-ml-md">
                  <div class="text-h6 text-weight-bold">
                    €{{ formatCurrency(contribution.amount) }}
                  </div>
                  <div class="text-body2" :class="getStatusClass(contribution.status)">
                    {{ getStatusLabel(contribution.status) }}
                  </div>
                  <div class="text-caption text-grey-6">
                    Disponibile: €{{ formatCurrency(contribution.available_balance) }}
                  </div>

                  <!-- Azioni -->
                  <div class="q-mt-sm">
                    <q-btn-group flat>
                      <q-btn
                        flat
                        dense
                        icon="edit"
                        size="sm"
                        @click="editContribution(contribution)"
                      >
                        <q-tooltip>Modifica</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        icon="visibility"
                        size="sm"
                        @click="viewDetails(contribution)"
                      >
                        <q-tooltip>Dettagli</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        icon="delete"
                        size="sm"
                        color="negative"
                        @click="confirmDelete(contribution)"
                      >
                        <q-tooltip>Elimina</q-tooltip>
                      </q-btn>
                    </q-btn-group>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="account_balance_wallet" size="4rem" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">Nessun contributo trovato</div>
          <div class="text-body2 text-grey-6">
            Aggiungi il primo contributo per iniziare a tracciare le entrate della famiglia
          </div>
          <q-btn
            color="primary"
            icon="add"
            label="Aggiungi Contributo"
            class="q-mt-md"
            @click="showAddForm = true"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog Aggiungi/Modifica -->
    <q-dialog v-model="showAddForm" persistent>
      <ContributionForm
        :contribution="selectedContribution"
        @saved="onContributionSaved"
        @cancel="closeForm"
      />
    </q-dialog>

    <!-- Dialog Dettagli -->
    <q-dialog v-model="showDetails">
      <ContributionDetails
        :contribution="selectedContribution"
        @close="showDetails = false"
      />
    </q-dialog>

    <!-- Dialog Conferma Eliminazione -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Conferma Eliminazione</div>
        </q-card-section>
        <q-card-section>
          Sei sicuro di voler eliminare il contributo "{{ selectedContribution?.description }}"?
          <br><br>
          <strong>Questa azione non può essere annullata.</strong>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annulla" @click="showDeleteConfirm = false" />
          <q-btn
            color="negative"
            label="Elimina"
            @click="deleteContribution"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useContributionsStore } from 'src/stores/contributions'
import { date } from 'quasar'
import MCFInput from 'src/components/forms/MCFInput.vue'
import MCFSelect from 'src/components/forms/MCFSelect.vue'
import ContributionForm from './ContributionForm.vue'
import ContributionDetails from './ContributionDetails.vue'

export default defineComponent({
  name: 'ContributionsList',

  components: {
    MCFInput,
    MCFSelect,
    ContributionForm,
    ContributionDetails
  },

  setup() {
    const contributionsStore = useContributionsStore()

    const showAddForm = ref(false)
    const showDetails = ref(false)
    const showDeleteConfirm = ref(false)
    const selectedContribution = ref(null)
    const deleting = ref(false)

    // Filtri
    const filters = ref({
      status: null,
      contribution_type: null,
      date_from: null,
      date_to: null
    })

    const loading = computed(() => contributionsStore.loading)
    const contributions = computed(() => contributionsStore.contributions)

    // Opzioni filtri
    const statusOptions = [
      { value: 'disponibile', label: 'Disponibile' },
      { value: 'parzialmente_utilizzato', label: 'Parzialmente Utilizzato' },
      { value: 'esaurito', label: 'Esaurito' }
    ]

    const contributionTypeOptions = [
      { value: 'contanti', label: 'Contanti' },
      { value: 'bonifico', label: 'Bonifico Ricevuto' },
      { value: 'stipendio', label: 'Stipendio' },
      { value: 'regalo', label: 'Regalo' },
      { value: 'rimborso', label: 'Rimborso' },
      { value: 'vendita', label: 'Vendita' },
      { value: 'altro', label: 'Altro' }
    ]

    onMounted(() => {
      loadContributions()
    })

    const loadContributions = async () => {
      try {
        await contributionsStore.fetchContributions(filters.value)
      } catch (error) {
        console.error('Errore nel caricamento contributi:', error)
      }
    }

    const applyFilters = () => {
      loadContributions()
    }

    const formatCurrency = (value) => {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY')
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

    const getTypeLabel = (type) => {
      const option = contributionTypeOptions.find(o => o.value === type)
      return option?.label || type
    }

    const getStatusClass = (status) => {
      const classes = {
        disponibile: 'text-positive',
        parzialmente_utilizzato: 'text-warning',
        esaurito: 'text-negative'
      }
      return classes[status] || 'text-grey-6'
    }

    const getStatusLabel = (status) => {
      const option = statusOptions.find(o => o.value === status)
      return option?.label || status
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return 'positive'
      if (percentage < 70) return 'warning'
      return 'negative'
    }

    const editContribution = (contribution) => {
      selectedContribution.value = contribution
      showAddForm.value = true
    }

    const viewDetails = (contribution) => {
      selectedContribution.value = contribution
      showDetails.value = true
    }

    const confirmDelete = (contribution) => {
      selectedContribution.value = contribution
      showDeleteConfirm.value = true
    }

    const deleteContribution = async () => {
      deleting.value = true
      try {
        await contributionsStore.deleteContribution(selectedContribution.value.id)
        showDeleteConfirm.value = false
        selectedContribution.value = null
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error)
      } finally {
        deleting.value = false
      }
    }

    const onContributionSaved = () => {
      closeForm()
      loadContributions()
    }

    const closeForm = () => {
      showAddForm.value = false
      selectedContribution.value = null
    }

    return {
      loading,
      contributions,
      filters,
      statusOptions,
      contributionTypeOptions,
      showAddForm,
      showDetails,
      showDeleteConfirm,
      selectedContribution,
      deleting,
      applyFilters,
      formatCurrency,
      formatDate,
      getContributionTypeColor,
      getContributionTypeIcon,
      getTypeLabel,
      getStatusClass,
      getStatusLabel,
      getProgressColor,
      editContribution,
      viewDetails,
      confirmDelete,
      deleteContribution,
      onContributionSaved,
      closeForm
    }
  }
})
</script>

<style lang="scss" scoped>
.contributions-list {
  .contribution-card {
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>