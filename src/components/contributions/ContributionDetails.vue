<template>
  <q-card style="min-width: 500px; max-width: 600px;">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6 flex items-center">
        <q-icon :name="getContributionTypeIcon(contribution.contribution_type)" class="q-mr-sm" />
        Dettagli Contributo
      </div>
    </q-card-section>

    <q-card-section>
      <!-- Info principale -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12">
          <div class="text-h5 text-weight-medium">{{ contribution.description }}</div>
          <div class="text-body2 text-grey-6">
            {{ contribution.user_detail?.first_name || contribution.user_name }} •
            {{ formatDate(contribution.date) }}
          </div>
        </div>
      </div>

      <!-- Importi -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h4 text-positive">€{{ formatCurrency(contribution.amount) }}</div>
              <div class="text-caption text-grey-6">Importo Totale</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h4 text-primary">€{{ formatCurrency(contribution.available_balance) }}</div>
              <div class="text-caption text-grey-6">Disponibile</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h4 text-negative">€{{ formatCurrency(contribution.used_amount) }}</div>
              <div class="text-caption text-grey-6">Utilizzato</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="q-mb-lg">
        <div class="flex justify-between items-center q-mb-sm">
          <span class="text-body2 text-weight-medium">Utilizzo</span>
          <span class="text-body2">{{ contribution.usage_percentage?.toFixed(1) || 0 }}%</span>
        </div>
        <q-linear-progress
          :value="(contribution.usage_percentage || 0) / 100"
          :color="getProgressColor(contribution.usage_percentage || 0)"
          size="12px"
          class="rounded-borders"
        />
      </div>

      <!-- Dettagli -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-list bordered separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="category" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Tipo</q-item-label>
                <q-item-label>{{ getTypeLabel(contribution.contribution_type) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="flag" :color="getStatusColor(contribution.status)" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Stato</q-item-label>
                <q-item-label :class="getStatusClass(contribution.status)">
                  {{ getStatusLabel(contribution.status) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-12 col-md-6">
          <q-list bordered separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="schedule" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Creato</q-item-label>
                <q-item-label>{{ formatDateTime(contribution.created_at) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="contribution.updated_at !== contribution.created_at">
              <q-item-section avatar>
                <q-icon name="update" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Aggiornato</q-item-label>
                <q-item-label>{{ formatDateTime(contribution.updated_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <!-- Note -->
      <div v-if="contribution.notes" class="q-mb-lg">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-body2 text-weight-medium q-mb-sm">
              <q-icon name="note" class="q-mr-sm" />
              Note
            </div>
            <div class="text-body2">{{ contribution.notes }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Spese collegate -->
      <div v-if="relatedExpenses.length" class="q-mb-lg">
        <div class="text-h6 q-mb-md">
          <q-icon name="receipt" class="q-mr-sm" />
          Spese Collegate ({{ relatedExpenses.length }})
        </div>
        <q-list bordered separator>
          <q-item
            v-for="expense in relatedExpenses"
            :key="expense.id"
            clickable
            @click="viewExpense(expense)"
          >
            <q-item-section>
              <q-item-label>{{ expense.expense_description }}</q-item-label>
              <q-item-label caption>
                {{ formatDate(expense.created_at) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>€{{ formatCurrency(expense.amount_used) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Chiudi" color="grey" @click="$emit('close')" />
      <q-btn
        v-if="contribution.available_balance > 0"
        color="primary"
        label="Usa per Spesa"
        @click="$emit('useForExpense', contribution)"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { contributionsAPI } from 'src/services/api/contributions'
import { date } from 'quasar'

export default defineComponent({
  name: 'ContributionDetails',

  props: {
    contribution: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'useForExpense'],

  setup(props) {
    const relatedExpenses = ref([])

    onMounted(async () => {
      if (props.contribution.id) {
        try {
          const response = await contributionsAPI.getExpenseContributions({
            contribution: props.contribution.id
          })
          relatedExpenses.value = response.data
        } catch (error) {
          console.error('Errore nel caricamento spese collegate:', error)
        }
      }
    })

    const formatCurrency = (value) => {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY')
    }

    const formatDateTime = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY HH:mm')
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
      const labels = {
        contanti: 'Contanti',
        bonifico: 'Bonifico Ricevuto',
        stipendio: 'Stipendio',
        regalo: 'Regalo',
        rimborso: 'Rimborso',
        vendita: 'Vendita',
        altro: 'Altro'
      }
      return labels[type] || type
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
      const labels = {
        disponibile: 'Disponibile',
        parzialmente_utilizzato: 'Parzialmente Utilizzato',
        esaurito: 'Esaurito'
      }
      return labels[status] || status
    }

    const getStatusColor = (status) => {
      const colors = {
        disponibile: 'positive',
        parzialmente_utilizzato: 'warning',
        esaurito: 'negative'
      }
      return colors[status] || 'grey-6'
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return 'positive'
      if (percentage < 70) return 'warning'
      return 'negative'
    }

    const viewExpense = (expense) => {
      // TODO: Navigate to expense details
      console.log('View expense:', expense)
    }

    return {
      relatedExpenses,
      formatCurrency,
      formatDate,
      formatDateTime,
      getContributionTypeIcon,
      getTypeLabel,
      getStatusClass,
      getStatusLabel,
      getStatusColor,
      getProgressColor,
      viewExpense
    }
  }
})
</script>

<style lang="scss" scoped>
.q-card {
  .q-linear-progress {
    border-radius: 6px;
  }
}
</style>