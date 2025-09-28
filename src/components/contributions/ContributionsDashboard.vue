<template>
  <div class="contributions-dashboard">
    <!-- Saldo Famiglia -->
    <q-card class="q-mb-md family-balance-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 flex items-center">
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Saldo Contributi Famiglia
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <div class="text-h4 text-positive">
              €{{ formatCurrency(familyBalance?.current_balance) }}
            </div>
            <div class="text-caption text-grey-6">Disponibile ora</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-h6">
              €{{ formatCurrency(familyBalance?.total_contributions) }}
            </div>
            <div class="text-caption text-grey-6">Totale contributi</div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-h6">
              €{{ formatCurrency(familyBalance?.total_expenses) }}
            </div>
            <div class="text-caption text-grey-6">Utilizzato</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Statistiche -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="trending_up" class="q-mr-sm" />
              Statistiche
            </div>
            <div v-if="stats" class="q-gutter-sm">
              <div class="flex justify-between">
                <span>Contributori attivi:</span>
                <span class="text-weight-bold">{{ stats.contributors_count }}</span>
              </div>
              <div class="flex justify-between">
                <span>Totale disponibile:</span>
                <span class="text-positive text-weight-bold">
                  €{{ formatCurrency(stats.total_available) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Totale utilizzato:</span>
                <span class="text-negative text-weight-bold">
                  €{{ formatCurrency(stats.total_used) }}
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="leaderboard" class="q-mr-sm" />
              Top Contributori
            </div>
            <div v-if="stats?.top_contributors" class="q-gutter-sm">
              <div
                v-for="(contributor, index) in stats.top_contributors"
                :key="contributor.user__id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center">
                  <q-avatar
                    :color="getAvatarColor(index)"
                    text-color="white"
                    size="sm"
                    class="q-mr-sm"
                  >
                    {{ index + 1 }}
                  </q-avatar>
                  <span>{{ contributor.user__first_name }} {{ contributor.user__last_name }}</span>
                </div>
                <span class="text-weight-bold">€{{ formatCurrency(contributor.total) }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Azioni rapide -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Azioni Rapide</div>
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="add"
                label="Aggiungi Contributo"
                @click="showAddContribution = true"
                class="col-12 col-sm-auto"
              />
              <q-btn
                color="secondary"
                icon="list"
                label="Visualizza Tutti"
                @click="$emit('showAll')"
                class="col-12 col-sm-auto"
              />
              <q-btn
                color="info"
                icon="analytics"
                label="Report Dettagliato"
                @click="$emit('showReport')"
                class="col-12 col-sm-auto"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Ultimi contributi -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="history" class="q-mr-sm" />
          Ultimi Contributi
        </div>
        <div v-if="stats?.recent_contributions?.length">
          <div
            v-for="contribution in stats.recent_contributions"
            :key="contribution.id"
            class="contribution-item q-py-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <q-avatar
                  :color="getContributionTypeColor(contribution.contribution_type)"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm"
                >
                  <q-icon :name="getContributionTypeIcon(contribution.contribution_type)" />
                </q-avatar>
                <div>
                  <div class="text-weight-medium">{{ contribution.description }}</div>
                  <div class="text-caption text-grey-6">
                    {{ contribution.user_name }} • {{ formatDate(contribution.date) }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-weight-bold">€{{ formatCurrency(contribution.amount) }}</div>
                <div class="text-caption" :class="getStatusClass(contribution.status)">
                  {{ getStatusLabel(contribution.status) }}
                </div>
              </div>
            </div>
            <q-separator class="q-mt-sm" v-if="stats.recent_contributions.indexOf(contribution) < stats.recent_contributions.length - 1" />
          </div>
        </div>
        <div v-else class="text-center text-grey-6 q-py-md">
          Nessun contributo recente
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog Aggiungi Contributo -->
    <ContributionForm
      v-model="showAddContribution"
      @saved="onContributionSaved"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useContributionsStore } from 'src/stores/contributions'
import { date } from 'quasar'
import ContributionForm from './ContributionForm.vue'

export default defineComponent({
  name: 'ContributionsDashboard',

  components: {
    ContributionForm
  },

  emits: ['showAll', 'showReport'],

  setup() {
    const contributionsStore = useContributionsStore()
    const showAddContribution = ref(false)

    const familyBalance = computed(() => contributionsStore.familyBalance)
    const stats = computed(() => contributionsStore.stats)

    onMounted(async () => {
      try {
        await Promise.all([
          contributionsStore.fetchBalance(),
          contributionsStore.fetchStats()
        ])
      } catch (error) {
        console.error('Errore nel caricamento dashboard:', error)
      }
    })

    const formatCurrency = (value) => {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD/MM/YYYY')
    }

    const getAvatarColor = (index) => {
      const colors = ['primary', 'secondary', 'accent']
      return colors[index] || 'grey'
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
        parzialmente_utilizzato: 'Parziale',
        esaurito: 'Esaurito'
      }
      return labels[status] || status
    }

    const onContributionSaved = async () => {
      // Ricarica i dati
      await Promise.all([
        contributionsStore.fetchBalance(),
        contributionsStore.fetchStats()
      ])
    }

    return {
      familyBalance,
      stats,
      showAddContribution,
      formatCurrency,
      formatDate,
      getAvatarColor,
      getContributionTypeColor,
      getContributionTypeIcon,
      getStatusClass,
      getStatusLabel,
      onContributionSaved
    }
  }
})
</script>

<style lang="scss" scoped>
.contributions-dashboard {
  .family-balance-card {
    .q-card__section--vert {
      padding: 16px;
    }
  }

  .contribution-item {
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
    }
  }
}
</style>