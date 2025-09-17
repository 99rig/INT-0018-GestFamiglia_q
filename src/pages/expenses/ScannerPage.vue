<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="mcf-scanner-page-content">
      <!-- Modern Header -->
      <div class="mcf-scanner-header">
        <div class="mcf-scanner-illustration">
          <div class="mcf-scanner-icon-container">
            <q-icon name="document_scanner" class="mcf-scanner-icon" />
            <div class="mcf-scanner-pulse"></div>
          </div>
        </div>

        <div class="mcf-scanner-content">
          <h2 class="mcf-scanner-title">Scanner Ricevute</h2>
          <p class="mcf-scanner-description">
            Scansiona le tue ricevute per creare automaticamente le spese.
            <br>Veloce, preciso e intelligente.
          </p>

          <div class="mcf-scanner-features">
            <div class="mcf-scanner-feature">
              <q-icon name="auto_awesome" class="mcf-feature-icon" />
              <span>Riconoscimento automatico</span>
            </div>
            <div class="mcf-scanner-feature">
              <q-icon name="speed" class="mcf-feature-icon" />
              <span>Elaborazione rapida</span>
            </div>
            <div class="mcf-scanner-feature">
              <q-icon name="verified" class="mcf-feature-icon" />
              <span>Dati accurati</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Scanner Component -->
      <div class="mcf-scanner-component">
        <DocumentScanner
          :show-debug-info="false"
          :show-buttons="true"
          @document-scanned="onDocumentScanned"
          @data-extracted="onDataExtracted"
          @expense-created="onExpenseCreated"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import DocumentScanner from 'components/common/DocumentScanner.vue'

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

<style lang="scss" scoped>
/* === MAIN CONTAINER === */
.mcf-scanner-page-content {
  width: 100%;
  margin: 0;
  padding: 16px 12px;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 24px 16px;
  }

  @media (min-width: 1200px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
  }
}

.mcf-page-container-fullwidth {
  background-color: var(--mcf-bg-primary);
  min-height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* === MODERN HEADER === */
.mcf-scanner-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    padding: 60px 40px;
    margin-bottom: 40px;
  }
}

.mcf-scanner-illustration {
  position: relative;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    margin-bottom: 40px;
  }
}

.mcf-scanner-icon-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  border-radius: 50%;

  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
  }
}

.mcf-scanner-icon {
  font-size: 60px;
  color: white;
  z-index: 2;

  @media (min-width: 768px) {
    font-size: 70px;
  }
}

.mcf-scanner-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mcf-primary-light) 0%, var(--mcf-secondary-light) 100%);
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.mcf-scanner-content {
  max-width: 600px;
  margin: 0 auto;
}

.mcf-scanner-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 36px;
    margin-bottom: 20px;
  }
}

.mcf-scanner-description {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 40px;
  }
}

.mcf-scanner-features {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 32px;
  }
}

.mcf-scanner-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--mcf-text-secondary);
  font-weight: 500;

  @media (min-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 6px;
    font-size: 15px;
  }
}

.mcf-feature-icon {
  font-size: 20px;
  color: var(--mcf-primary);
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

/* === SCANNER COMPONENT === */
.mcf-scanner-component {
  max-width: 600px;
  margin: 0 auto;
  background: var(--mcf-bg-surface);
  border-radius: 16px;
  box-shadow: var(--mcf-shadow-md);
  padding: 24px;

  @media (min-width: 768px) {
    padding: 32px;
  }
}
</style>
