<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <!-- Header -->
        <div class="flex items-center justify-between q-mb-lg">
          <div>
            <h1 class="text-h4 q-ma-none">
              <q-icon name="account_balance_wallet" class="q-mr-sm" />
              Contributi Famiglia
            </h1>
            <p class="text-body2 text-grey-6 q-ma-none q-mt-sm">
              Gestisci le entrate e i contributi della famiglia
            </p>
          </div>
          <q-btn-dropdown
            color="primary"
            icon="add"
            label="Azioni"
            auto-close
          >
            <q-list>
              <q-item clickable @click="openAddContribution">
                <q-item-section avatar>
                  <q-icon name="add" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Nuovo Contributo</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="currentView = 'dashboard'">
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Dashboard</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="currentView = 'list'">
                <q-item-section avatar>
                  <q-icon name="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Lista Completa</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- Navigation Tabs -->
        <q-tabs
          v-model="currentView"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab name="dashboard" icon="dashboard" label="Dashboard" />
          <q-tab name="list" icon="list" label="Lista Contributi" />
        </q-tabs>

        <q-separator class="q-mb-lg" />

        <!-- Content -->
        <q-tab-panels v-model="currentView" animated>
          <!-- Dashboard -->
          <q-tab-panel name="dashboard" class="q-pa-none">
            <ContributionsDashboard
              @showAll="currentView = 'list'"
              @showReport="showReport"
            />
          </q-tab-panel>

          <!-- Lista -->
          <q-tab-panel name="list" class="q-pa-none">
            <ContributionsList />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Dialog Aggiungi Contributo -->
    <ContributionForm
      v-model="showAddContribution"
      @saved="onContributionSaved"
    />

    <!-- Dialog Report -->
    <q-dialog v-model="showReportDialog" maximized>
      <ContributionsReport @close="showReportDialog = false" />
    </q-dialog>

    <!-- Floating Action Button per mobile -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      class="mobile-only"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="openAddContribution"
      >
        <q-tooltip>Nuovo Contributo</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useContributionsStore } from '@/stores/contributions'
import ContributionsDashboard from '@/components/contributions/ContributionsDashboard.vue'
import ContributionsList from '@/components/contributions/ContributionsList.vue'
import ContributionForm from 'src/components/contributions/ContributionForm.vue'
import ContributionsReport from '@/components/contributions/ContributionsReport.vue'

export default defineComponent({
  name: 'ContributionsPage',

  components: {
    ContributionsDashboard,
    ContributionsList,
    ContributionForm,
    ContributionsReport
  },

  setup() {
    const contributionsStore = useContributionsStore()

    const currentView = ref('dashboard')
    const showAddContribution = ref(false)
    const showReportDialog = ref(false)

    // Debug watcher per showAddContribution
    watch(showAddContribution, (newValue) => {
      console.log('🔍 DEBUG ContributionsPage: showAddContribution changed to:', newValue)
    })

    onMounted(async () => {
      // Carica i dati iniziali
      try {
        await Promise.all([
          contributionsStore.fetchContributions(),
          contributionsStore.fetchBalance(),
          contributionsStore.fetchStats()
        ])
      } catch (error) {
        console.error('Errore nel caricamento dati contributi:', error)
      }

      // Test debug: apri automaticamente il modal dopo 3 secondi
      setTimeout(() => {
        console.log('🔍 DEBUG: Auto-opening modal for test')
        showAddContribution.value = true
      }, 3000)
    })

    const openAddContribution = () => {
      console.log('🔍 DEBUG: Trying to open ContributionForm')
      console.log('🔍 DEBUG: showAddContribution before:', showAddContribution.value)
      showAddContribution.value = true
      console.log('🔍 DEBUG: showAddContribution after:', showAddContribution.value)
    }

    const onContributionSaved = () => {
      // I dati vengono aggiornati automaticamente dal store
    }

    const showReport = () => {
      showReportDialog.value = true
    }

    return {
      currentView,
      showAddContribution,
      showReportDialog,
      openAddContribution,
      onContributionSaved,
      showReport
    }
  }
})
</script>

<style lang="scss" scoped>
.contributions-page {
  .mobile-only {
    @media (min-width: 768px) {
      display: none;
    }
  }
}
</style>