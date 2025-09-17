<template>
  <q-page class="flex flex-center mcf-page-container">
    <div class="scanner-page-content">
      <!-- Header -->
      <div class="text-center q-mb-lg">
        <q-icon 
          name="document_scanner" 
          size="64px" 
          class="text-mcf-primary"
        />
        <h4 class="text-h4 q-mt-md q-mb-sm text-mcf-primary">Scanner Ricevute</h4>
        <p class="text-subtitle1 text-mcf-accent">
          Scansiona le tue ricevute per creare automaticamente le spese
        </p>
      </div>

      <!-- Document Scanner Component -->
      <DocumentScanner
        :show-debug-info="false"
        :show-buttons="true"
        @document-scanned="onDocumentScanned"
        @data-extracted="onDataExtracted"
        @expense-created="onExpenseCreated"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import DocumentScanner from 'src/components/common/DocumentScanner.vue'

const $q = useQuasar()
const router = useRouter()

// Event handlers
const onDocumentScanned = (scanResult) => {
  console.log('📄 Document scanned:', scanResult)
  
  $q.notify({
    type: 'positive',
    message: 'Documento acquisito! Ora estrai i dati.',
    position: 'top'
  })
}

const onDataExtracted = (extractedData) => {
  console.log('📊 Data extracted:', extractedData)
}

const onExpenseCreated = (expenseData) => {
  console.log('💰 Expense created:', expenseData)
  
  $q.notify({
    type: 'positive',
    message: `Spesa "${expenseData.merchant || 'Ricevuta'}" salvata nel sistema!`,
    position: 'top',
    actions: [
      {
        label: 'Vedi Spese',
        color: 'white',
        handler: () => {
          router.push('/')
        }
      }
    ],
    timeout: 5000
  })
  
  // Auto-naviga alla dashboard dopo 3 secondi se l'utente non clicca
  setTimeout(() => {
    router.push('/')
  }, 3000)
}
</script>

<style scoped>
.scanner-page-content {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

.flex-center {
  min-height: calc(100vh - 100px);
}
</style>