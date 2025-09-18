<template>
  <q-page class="flex flex-center mcf-page-container">
    <div class="ocr-test-content">
      <!-- Header -->
      <div class="text-center q-mb-lg">
        <q-icon
          name="text_fields"
          size="64px"
          class="text-mcf-primary"
        />
        <h4 class="text-h4 q-mt-md q-mb-sm text-mcf-primary">Test OCR</h4>
        <p class="text-subtitle1 text-mcf-accent">
          Testa l'estrazione automatica di testi da immagini
        </p>
      </div>

      <!-- Test con immagine di esempio -->
      <q-card class="mcf-card q-mb-md">
        <q-card-section>
          <div class="text-h6 text-mcf-primary q-mb-md">Test con Testo di Esempio</div>

          <!-- Canvas per generare immagine test -->
          <canvas
            ref="testCanvas"
            width="400"
            height="300"
            style="border: 1px solid #ccc; max-width: 100%;"
            class="q-mb-md"
          ></canvas>

          <div class="q-mb-md">
            <q-btn
              @click="generateTestImage"
              label="Genera Ricevuta Test"
              class="mcf-btn-secondary q-mr-sm"
              icon="receipt"
            />
            <q-btn
              @click="runOCRTest"
              label="Testa OCR"
              class="mcf-btn-primary"
              icon="text_fields"
              :loading="testing"
              :disable="!testImageGenerated"
            />
          </div>

          <!-- Risultati OCR -->
          <div v-if="ocrResult" class="ocr-result-section">
            <div class="text-h6 text-mcf-primary q-mb-sm">Risultato OCR:</div>

            <q-chip
              :icon="ocrResult.provider === 'tesseract' ? 'text_fields' : 'auto_awesome'"
              :label="`Provider: ${ocrResult.provider}`"
              color="positive"
              text-color="white"
              class="q-mb-sm"
            />

            <q-chip
              v-if="ocrResult.confidence"
              :label="`Affidabilità: ${Math.round(ocrResult.confidence)}%`"
              color="info"
              text-color="white"
              class="q-ml-xs q-mb-sm"
            />

            <q-expansion-item
              icon="text_snippet"
              label="Testo estratto"
              default-opened
            >
              <q-card>
                <q-card-section>
                  <pre class="ocr-text-display">{{ ocrResult.text }}</pre>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item
              v-if="ocrResult.patterns"
              icon="analytics"
              label="Pattern rilevati"
              class="q-mt-sm"
            >
              <q-card>
                <q-card-section>
                  <div class="text-subtitle2">Importi:</div>
                  <div class="q-mb-sm">{{ ocrResult.patterns.amounts.join(', ') || 'Nessuno' }}</div>

                  <div class="text-subtitle2">Date:</div>
                  <div class="q-mb-sm">{{ ocrResult.patterns.dates.join(', ') || 'Nessuna' }}</div>

                  <div class="text-subtitle2">Negozi:</div>
                  <div class="q-mb-sm">{{ ocrResult.patterns.merchants.join(', ') || 'Nessuno' }}</div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>
      </q-card>

      <!-- Info sui provider disponibili -->
      <q-card class="mcf-card">
        <q-card-section>
          <div class="text-h6 text-mcf-primary q-mb-md">Provider OCR Disponibili</div>

          <div v-for="provider in availableProviders" :key="provider.id" class="q-mb-sm">
            <q-chip
              :icon="provider.platform === 'native' ? 'smartphone' : 'web'"
              :label="provider.name"
              :color="provider.platform === 'native' ? 'positive' : 'accent'"
              text-color="white"
            />
            <span class="q-ml-sm text-caption">
              {{ provider.accuracy }} accuratezza, {{ provider.speed }} velocità
            </span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSnackbar } from 'src/composables/useSnackbar'
import { ocrService } from 'src/services/ocr.js'

const snackbar = useSnackbar()

// State
const testing = ref(false)
const testImageGenerated = ref(false)
const ocrResult = ref(null)
const testCanvas = ref(null)
const availableProviders = ref([])

// Methods
const generateTestImage = () => {
  if (!testCanvas.value) return

  const canvas = testCanvas.value
  const ctx = canvas.getContext('2d')

  // Pulisci canvas
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Simula una ricevuta
  ctx.fillStyle = 'black'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'

  // Header
  ctx.font = 'bold 20px Arial'
  ctx.fillText('SUPERMERCATO CONAD', canvas.width / 2, 30)

  ctx.font = '14px Arial'
  ctx.fillText('Via Roma 123, Milano', canvas.width / 2, 50)
  ctx.fillText('Tel: 02-1234567', canvas.width / 2, 70)

  // Separatore
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(50, 85)
  ctx.lineTo(canvas.width - 50, 85)
  ctx.stroke()

  // Prodotti
  ctx.textAlign = 'left'
  ctx.font = '12px Arial'
  ctx.fillText('PANE INTEGRALE          €2.50', 50, 110)
  ctx.fillText('LATTE FRESCO 1L         €1.20', 50, 130)
  ctx.fillText('PASTA BARILLA 500G      €1.80', 50, 150)
  ctx.fillText('POMODORI PELATI         €0.90', 50, 170)

  // Separatore
  ctx.beginPath()
  ctx.moveTo(50, 185)
  ctx.lineTo(canvas.width - 50, 185)
  ctx.stroke()

  // Totale
  ctx.font = 'bold 14px Arial'
  ctx.fillText('TOTALE: €6.40', 50, 210)

  // Data
  ctx.font = '12px Arial'
  ctx.fillText('Data: 16/09/2024  Ora: 14:30', 50, 230)

  // Footer
  ctx.textAlign = 'center'
  ctx.font = '10px Arial'
  ctx.fillText('Grazie per la visita!', canvas.width / 2, 260)
  ctx.fillText('Scontrino fiscale n. 1234567', canvas.width / 2, 280)

  testImageGenerated.value = true

  snackbar.success('Ricevuta test generata!')
}

const runOCRTest = async () => {
  if (!testCanvas.value || !testImageGenerated.value) return

  try {
    testing.value = true
    ocrResult.value = null

    // Converti canvas in data URL
    const imageDataUrl = testCanvas.value.toDataURL('image/png')

    snackbar.info('Avvio test OCR...')

    // Testa OCR
    const result = await ocrService.extractText(imageDataUrl, {
      language: 'ita+eng',
      provider: 'auto'
    })

    ocrResult.value = result

    if (result.success) {
      snackbar.success(`OCR completato con ${result.provider}!`)
    } else {
      snackbar.error(`OCR fallito: ${result.error}`)
    }

  } catch (error) {
    console.error('Test OCR error:', error)
    snackbar.error(`Errore test: ${error.message}`)
  } finally {
    testing.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Carica provider disponibili
  availableProviders.value = ocrService.getAvailableProviders()

  // Genera immagine di default
  setTimeout(() => {
    generateTestImage()
  }, 100)
})
</script>

<style scoped>
.ocr-test-content {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.ocr-text-display {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
}

.ocr-result-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

canvas {
  display: block;
  margin: 0 auto;
}

.flex-center {
  min-height: calc(100vh - 100px);
}
</style>
