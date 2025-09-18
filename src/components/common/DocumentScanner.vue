<template>
  <div class="document-scanner-container">
    <!-- Header info -->
    <q-banner v-if="showDebugInfo" class="mcf-bg-primary text-white q-mb-sm">
      <div class="text-h6">📄 MCF Document Scanner v1.0 📄</div>
      <div class="text-caption">ML Kit Document Scanner</div>
    </q-banner>

    <!-- Platform Debug Info -->
    <q-card v-if="showDebugInfo" class="q-mb-md" flat bordered>
      <q-card-section class="text-caption">
        <div><strong>🔍 Platform Info:</strong></div>
        <div>Capacitor Native: {{ platformInfo.capacitorNative }}</div>
        <div>Platform: {{ platformInfo.platform }}</div>
        <div>Android: {{ platformInfo.isAndroid }}</div>
        <div>iOS: {{ platformInfo.isIOS }}</div>
        <div>iOS PWA: {{ platformInfo.isIOSPWA }}</div>
        <div><strong>Scanner Available: {{ isNativePlatform }}</strong></div>
        <div><strong>Camera Method: {{ isIOSPWA ? 'HTML5 File Input' : 'Capacitor Camera' }}</strong></div>
      </q-card-section>
    </q-card>

    <!-- Modern Scanner buttons -->
    <div v-if="!scanning && showButtons" class="mcf-scanner-buttons">
      <!-- Primary Action -->
      <div class="mcf-primary-action">
        <q-btn
          v-if="isNativePlatform"
          icon="document_scanner"
          label="Scansiona Ricevuta"
          @click="startDocumentScan"
          class="mcf-btn-primary mcf-scanner-primary-btn"
          size="lg"
          no-caps
          unelevated
        />

        <q-btn
          v-if="!isNativePlatform"
          icon="camera_alt"
          :label="isIOSPWA ? 'Scatta Foto (iOS)' :
                 isDesktop ? 'Seleziona Immagine' :
                 'Fotografia Ricevuta'"
          @click="startCameraCapture"
          class="mcf-btn-primary mcf-scanner-primary-btn"
          size="lg"
          no-caps
          unelevated
        />
      </div>

      <!-- Secondary Actions -->
      <div class="mcf-secondary-actions">
        <q-btn
          icon="photo_library"
          label="Dalla Galleria"
          @click="selectFromGallery"
          class="mcf-btn-secondary mcf-scanner-secondary-btn"
          size="md"
          no-caps
          unelevated
          outline
        />
      </div>

      <!-- Help Text -->
      <div class="mcf-scanner-help">
        <q-icon name="info" class="mcf-help-icon" />
        <span class="mcf-help-text">
          {{ isNativePlatform ? 'Inquadra la ricevuta e lascia che il sistema la rilevi automaticamente' :
             isIOSPWA ? 'Tocca il pulsante per aprire la camera iOS e scattare una foto della ricevuta' :
             isDesktop ? 'Seleziona un\'immagine della ricevuta dal tuo computer' :
             'Scatta una foto chiara della ricevuta' }}
        </span>
      </div>
    </div>

    <!-- Modern Scanning indicator -->
    <div v-if="scanning" class="mcf-scanning-indicator">
      <div class="mcf-scanning-card">
        <div class="mcf-scanning-animation">
          <q-circular-progress
            indeterminate
            size="60px"
            color="primary"
            class="mcf-scanning-progress"
          />
          <div class="mcf-scanning-pulse"></div>
        </div>

        <div class="mcf-scanning-content">
          <h3 class="mcf-scanning-title">
            <q-icon name="document_scanner" class="mcf-scanning-icon" />
            Scansione in corso
          </h3>
          <p class="mcf-scanning-message">
            {{ scanningMessage || 'Preparazione scanner...' }}
          </p>

          <div class="mcf-scanning-tips">
            <div class="mcf-tip">
              <q-icon name="center_focus_strong" class="mcf-tip-icon" />
              <span>Mantieni il documento al centro</span>
            </div>
            <div class="mcf-tip">
              <q-icon name="wb_sunny" class="mcf-tip-icon" />
              <span>Assicurati di avere buona illuminazione</span>
            </div>
          </div>

          <q-btn
            label="Annulla"
            @click="cancelScan"
            class="mcf-btn-secondary mcf-cancel-btn"
            flat
            no-caps
          />
        </div>
      </div>
    </div>

    <!-- Scan result -->
    <div v-if="scanResult && !scanning" class="scan-result">
      <q-card class="mcf-card">
        <q-card-section>
          <div class="text-h6 text-mcf-primary q-mb-md">
            <q-icon name="check_circle" class="q-mr-sm" />
            Documento Scansionato
          </div>

          <!-- Preview dell'immagine -->
          <div class="document-preview q-mb-md">
            <img
              :src="scanResult.imageUri"
              alt="Documento scansionato"
              class="document-image"
              @click="previewImage"
            />
          </div>

          <!-- Info documento -->
          <div class="document-info q-mb-md">
            <div class="text-body2 text-mcf-accent">
              <q-icon name="info" class="q-mr-xs" />
              Pagine: {{ scanResult.pages?.length || 1 }}
            </div>
            <div class="text-caption text-grey-6">
              Tocca l'immagine per ingrandire
            </div>
          </div>

          <!-- Azioni -->
          <div class="document-actions">
            <q-btn
              label="Estrai Dati"
              @click="extractReceiptData"
              class="mcf-btn-primary q-mr-sm"
              :loading="extracting"
              no-caps
              unelevated
              rounded
            />
            <q-btn
              label="Scansiona Altro"
              @click="resetScan"
              class="mcf-btn-accent"
              no-caps
              unelevated
              rounded
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Extracted data result -->
    <div v-if="extractedData" class="extracted-data q-mt-md">
      <q-card class="mcf-card">
        <q-card-section>
          <div class="text-h6 text-mcf-primary q-mb-md">
            <q-icon name="receipt" class="q-mr-sm" />
            Dati Estratti
          </div>

          <!-- Info OCR -->
          <div v-if="extractedData.ocrProvider" class="ocr-info q-mb-md">
            <q-chip
              :icon="extractedData.ocrProvider === 'mlkit' ? 'auto_awesome' :
                    extractedData.ocrProvider === 'tesseract' ? 'text_fields' : 'camera'"
              :label="`Estratto con ${extractedData.ocrProvider}`"
              color="positive"
              text-color="white"
              size="sm"
            />
            <q-chip
              v-if="extractedData.confidence"
              :label="`${Math.round(extractedData.confidence)}% affidabilità`"
              color="info"
              text-color="white"
              size="sm"
              class="q-ml-xs"
            />
          </div>

          <!-- Dati della ricevuta -->
          <div class="receipt-data">
            <q-input
              v-model="extractedData.amount"
              label="Importo"
              type="number"
              step="0.01"
              prefix="€"
              outlined
              dense
              class="q-mb-sm"
              :hint="extractedData.amount ? 'Rilevato automaticamente' : 'Inserisci manualmente'"
            />

            <q-input
              v-model="extractedData.merchant"
              label="Negozio"
              outlined
              dense
              class="q-mb-sm"
              :hint="extractedData.merchant ? 'Rilevato automaticamente' : 'Inserisci manualmente'"
            />

            <q-input
              v-model="extractedData.date"
              label="Data"
              type="date"
              outlined
              dense
              class="q-mb-sm"
              :hint="extractedData.date ? 'Rilevata automaticamente' : 'Data odierna'"
            />

            <CategorySelect
              v-model="categorySelection"
              label="Categoria"
              subcategory-label="Sottocategoria"
              return-object
              class="q-mb-md"
              @category-changed="onCategoryChanged"
              @subcategory-changed="onSubcategoryChanged"
            />

            <!-- Testo OCR (collassabile) -->
            <q-expansion-item
              v-if="extractedData.ocrText"
              icon="text_snippet"
              label="Testo estratto (OCR)"
              class="q-mb-sm"
            >
              <q-card>
                <q-card-section>
                  <div class="text-caption text-grey-6 q-mb-sm">
                    Testo rilevato dall'immagine:
                  </div>
                  <div class="ocr-text-content">
                    {{ extractedData.ocrText }}
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>

          <!-- Azioni finali -->
          <div class="final-actions">
            <q-btn
              label="Crea Spesa"
              @click="createExpense"
              class="mcf-btn-primary q-mr-sm"
              :loading="creating"
              no-caps
              unelevated
              rounded
            />
            <q-btn
              label="Modifica"
              @click="editData"
              class="mcf-btn-secondary"
              no-caps
              unelevated
              rounded
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSnackbar } from 'src/composables/useSnackbar'
import { Capacitor } from '@capacitor/core'
import { DocumentScanner } from '@capacitor-mlkit/document-scanner'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { ocrService } from 'src/services/ocr'
import { expensesAPI } from 'src/services/api/expenses.js'
import CategorySelect from 'components/CategorySelect.vue'

// Props
const props = defineProps({
  showDebugInfo: {
    type: Boolean,
    default: false
  },
  showButtons: {
    type: Boolean,
    default: true
  },
  autoStart: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['document-scanned', 'data-extracted', 'expense-created'])

const $q = useQuasar()
const snackbar = useSnackbar()

// State
const scanning = ref(false)
const scanResult = ref(null)
const extracting = ref(false)
const creating = ref(false)
const extractedData = ref(null)
const scanningMessage = ref('')
// Platform detection
const platform = Capacitor.getPlatform()
const isNativePlatform = ref(platform === 'android' || platform === 'ios')

// Detect iOS PWA (problematic for Camera API) - safe navigation
const isIOSPWA = ref(
  typeof navigator !== 'undefined' &&
  platform === 'web' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  typeof window !== 'undefined' &&
  window.navigator?.standalone === true
)

// Detect desktop (not mobile)
const isDesktop = ref(
  typeof navigator !== 'undefined' &&
  platform === 'web' &&
  !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
)

const platformInfo = ref({
  capacitorNative: Capacitor.isNativePlatform(),
  platform: platform,
  isAndroid: platform === 'android',
  isIOS: platform === 'ios',
  isIOSPWA: isIOSPWA.value,
  isDesktop: isDesktop.value
})

// Category selection for CategorySelect component
const categorySelection = ref({ category: null, subcategory: null })


// Methods
const startDocumentScan = async () => {
  try {
    scanning.value = true
    scanningMessage.value = 'Preparazione scanner...'

    console.log('🚀 Starting ML Kit Document Scanner...')

    // Verifica disponibilità del modulo
    const isAvailable = await DocumentScanner.isSupported()
    console.log('Document Scanner supported:', isAvailable)

    if (!isAvailable) {
      throw new Error('Document Scanner non supportato su questo dispositivo')
    }

    scanningMessage.value = 'Scanner pronto, inquadra il documento...'

    // Avvia la scansione
    const result = await DocumentScanner.scanDocument()

    console.log('📄 Document scan result:', result)

    if (result.pages && result.pages.length > 0) {
      scanResult.value = {
        imageUri: result.pages[0].imageUri,
        pages: result.pages
      }

      emit('document-scanned', scanResult.value)

      snackbar.success('Documento scansionato con successo!')
    } else {
      throw new Error('Nessun documento rilevato')
    }

  } catch (error) {
    console.error('Document scan error:', error)

    let errorMessage = 'Errore durante la scansione'
    if (error?.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    scanning.value = false
    scanningMessage.value = ''
  }
}

const startCameraCapture = async () => {
  // Use HTML5 method for all web platforms (iOS PWA and desktop)
  if (platform === 'web') {
    return startCameraCaptureHTML5()
  }

  // Use Capacitor Camera only for native platforms (Android/iOS app)
  try {
    scanning.value = true
    scanningMessage.value = 'Apertura camera...'

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false
    })

    scanResult.value = {
      imageUri: image.dataUrl,
      pages: [{ imageUri: image.dataUrl }]
    }

    emit('document-scanned', scanResult.value)

    snackbar.success('Foto acquisita con successo!')

  } catch (error) {
    console.error('Camera capture error:', error)

    // Fallback to HTML5 if Capacitor fails
    console.log('📱 Capacitor camera failed, falling back to HTML5...')
    return startCameraCaptureHTML5()
  } finally {
    scanning.value = false
    scanningMessage.value = ''
  }
}

// HTML5 fallback for web platforms
const startCameraCaptureHTML5 = () => {
  try {
    scanning.value = true
    scanningMessage.value = isIOSPWA.value ? 'Apertura camera iOS...' : 'Selezione immagine...'

    // Create hidden file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    // Use capture only on mobile devices (not desktop)
    if (!isDesktop.value) {
      input.capture = 'camera' // Request camera on mobile
    }

    input.style.display = 'none'

    input.onchange = async (event) => {
      const file = event.target.files[0]
      if (!file) {
        scanning.value = false
        return
      }

      try {
        // Convert file to data URL
        const dataUrl = await fileToDataUrl(file)

        scanResult.value = {
          imageUri: dataUrl,
          pages: [{ imageUri: dataUrl }]
        }

        emit('document-scanned', scanResult.value)

        snackbar.success('Foto acquisita con successo!')
      } catch (error) {
        console.error('File processing error:', error)
        snackbar.error('Errore nel processamento file')
      } finally {
        scanning.value = false
        scanningMessage.value = ''
        // Cleanup
        input.remove()
      }
    }

    input.oncancel = () => {
      scanning.value = false
      scanningMessage.value = ''
      input.remove()
    }

    // Trigger file picker
    document.body.appendChild(input)
    input.click()

  } catch (error) {
    console.error('HTML5 camera capture error:', error)
    snackbar.error('Errore durante la cattura')
    scanning.value = false
    scanningMessage.value = ''
  }
}

// Helper function to convert File to DataURL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const selectFromGallery = async () => {
  try {
    scanning.value = true
    scanningMessage.value = 'Apertura galleria...'

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      saveToGallery: false
    })

    scanResult.value = {
      imageUri: image.dataUrl,
      pages: [{ imageUri: image.dataUrl }]
    }

    emit('document-scanned', scanResult.value)

    snackbar.success('Immagine selezionata dalla galleria!')

  } catch (error) {
    console.error('Gallery selection error:', error)
    snackbar.error('Errore durante la selezione')
  } finally {
    scanning.value = false
    scanningMessage.value = ''
  }
}

const cancelScan = () => {
  scanning.value = false
  scanningMessage.value = ''
}

const previewImage = () => {
  if (scanResult.value?.imageUri) {
    $q.dialog({
      title: 'Anteprima Documento',
      message: `<img src="${scanResult.value.imageUri}" style="max-width: 100%; max-height: 400px;" />`,
      html: true,
      ok: 'Chiudi'
    })
  }
}

const extractReceiptData = async () => {
  if (!scanResult.value?.imageUri) {
    snackbar.warning('Nessuna immagine da processare')
    return
  }

  try {
    extracting.value = true

    snackbar.info('Estrazione dati in corso...')

    // Estrazione OCR
    console.log('🔍 Starting OCR extraction for receipt...')
    const ocrResult = await ocrService.extractText(scanResult.value.imageUri, {
      language: 'ita+eng',
      provider: 'auto'
    })

    console.log('📄 OCR Result:', ocrResult)

    if (!ocrResult.success) {
      throw new Error(ocrResult.error || 'Estrazione OCR fallita')
    }

    // Parsing automatico dei dati estratti
    const parsedData = parseReceiptData(ocrResult)

    extractedData.value = {
      amount: parsedData.amount || '',
      merchant: parsedData.merchant || '',
      date: parsedData.date || new Date().toISOString().split('T')[0],
      items: parsedData.items || [],
      ocrText: ocrResult.text,
      ocrProvider: ocrResult.provider,
      confidence: ocrResult.confidence || 0
    }

    // Set category selection if available - categorizeByMerchant now returns category name string
    if (parsedData.category) {
      // Let CategorySelect handle the category lookup by name
      categorySelection.value = { category: parsedData.category, subcategory: null }
    }

    emit('data-extracted', extractedData.value)

    snackbar.success(`Dati estratti con ${ocrResult.provider}! Controlla e modifica se necessario.`)

  } catch (error) {
    console.error('Data extraction error:', error)

    // Fallback con dati vuoti
    extractedData.value = {
      amount: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      ocrText: '',
      error: error.message
    }

    // Reset category selection
    categorySelection.value = { category: null, subcategory: null }

    snackbar.error(`Estrazione automatica fallita: ${error.message}. Inserisci i dati manualmente.`)
  } finally {
    extracting.value = false
  }
}

const editData = () => {
  // Form editing is already enabled
  snackbar.info('Modifica i dati nei campi sopra')
}

const createExpense = async () => {
  try {
    creating.value = true

    // Validazione dati
    if (!extractedData.value.amount || !categorySelection.value.category) {
      snackbar.warning('Inserisci almeno importo e categoria')
      return
    }

    // Validazione importo
    const amount = parseFloat(extractedData.value.amount)
    if (isNaN(amount) || amount <= 0) {
      snackbar.warning('Inserisci un importo valido')
      return
    }

    // Prepara dati per API Django
    const expensePayload = {
      titolo: extractedData.value.merchant || 'Spesa da ricevuta',
      descrizione: `Spesa acquisita tramite scanner ricevuta${extractedData.value.ocrProvider ? ` (OCR: ${extractedData.value.ocrProvider})` : ''}`,
      importo: amount.toFixed(2),
      data_spesa: extractedData.value.date,
      categoria: categorySelection.value.category,
      sottocategoria: categorySelection.value.subcategory,
      stato: 'effettuata',
      condivisa: false,
      // Aggiungi metadati OCR
      note: extractedData.value.ocrText ? `Testo OCR:\n${extractedData.value.ocrText.substring(0, 500)}` : ''
    }

    console.log('💰 Creating expense with payload:', expensePayload)

    // Crea spesa tramite API
    const createdExpense = await expensesAPI.createExpense(expensePayload)

    console.log('✅ Expense created:', createdExpense)

    const expenseData = {
      ...extractedData.value,
      id: createdExpense.id,
      scannedImage: scanResult.value.imageUri,
      createdExpense: createdExpense
    }

    emit('expense-created', expenseData)

    snackbar.success(`Spesa creata con successo! ID: ${createdExpense.id}`)

    // Reset dopo un piccolo delay per mostrare il successo
    setTimeout(() => {
      resetScan()
    }, 1500)

  } catch (error) {
    console.error('Create expense error:', error)

    let errorMessage = 'Errore durante la creazione della spesa'

    if (error.response?.data) {
      // Errore API Django
      const errorData = error.response.data
      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData).map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages]
          return `${field}: ${messageArray.join(', ')}`
        })
        errorMessage = errors.join('\n')
      } else {
        errorMessage = errorData
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    snackbar.error(errorMessage)
  } finally {
    creating.value = false
  }
}

const parseReceiptData = (ocrResult) => {
  console.log('🔍 Parsing receipt data from OCR result...')

  const parsed = {
    amount: null,
    merchant: null,
    date: null,
    category: null,
    items: []
  }

  if (!ocrResult.patterns) {
    console.log('⚠️ No patterns found in OCR result')
    return parsed
  }

  const patterns = ocrResult.patterns

  // Estrai importo (prendi il più alto, probabilmente il totale)
  if (patterns.totals && patterns.totals.length > 0) {
    parsed.amount = patterns.totals[0].toString()
    console.log('💰 Found amount:', parsed.amount)
  }

  // Estrai data (prendi la prima data valida)
  if (patterns.dates && patterns.dates.length > 0) {
    const dateStr = patterns.dates[0]
    const parsedDate = parseItalianDate(dateStr)
    if (parsedDate) {
      parsed.date = parsedDate
      console.log('📅 Found date:', parsed.date)
    }
  }

  // Estrai nome negozio (prendi il primo merchant identificato)
  if (patterns.merchants && patterns.merchants.length > 0) {
    parsed.merchant = patterns.merchants[0]
    console.log('🏪 Found merchant:', parsed.merchant)
  }

  // Determina categoria basata sul tipo di negozio
  if (parsed.merchant) {
    parsed.category = categorizeByMerchant(parsed.merchant)
    console.log('📂 Suggested category:', parsed.category)
  }

  return parsed
}

const parseItalianDate = (dateStr) => {
  if (!dateStr) return null

  try {
    // Pattern DD/MM/YYYY o DD-MM-YYYY
    const dateRegex = /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/
    const match = dateStr.match(dateRegex)

    if (match) {
      const day = parseInt(match[1])
      const month = parseInt(match[2])
      let year = parseInt(match[3])

      // Converti anno a 2 cifre in 4 cifre
      if (year < 100) {
        year += year > 50 ? 1900 : 2000
      }

      // Valida la data
      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
        const date = new Date(year, month - 1, day)
        return date.toISOString().split('T')[0]
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

const categorizeByMerchant = (merchant) => {
  if (!merchant) return null

  const merchantLower = merchant.toLowerCase()

  // Mapping negozi -> nomi categorie - restituisce il nome della categoria per CategorySelect
  const categoryMappings = [
    { keywords: ['supermercato', 'supermarket', 'alimentari', 'market', 'coop', 'conad', 'esselunga', 'carrefour'], categoryName: 'Alimentari' },
    { keywords: ['farmacia', 'pharmacy'], categoryName: 'Salute' },
    { keywords: ['bar', 'caffè', 'coffee', 'ristorante', 'restaurant', 'pizzeria'], categoryName: 'Intrattenimento' },
    { keywords: ['benzina', 'gas', 'esso', 'eni', 'shell', 'agip'], categoryName: 'Trasporti' },
    { keywords: ['bricofer', 'leroy', 'obi', 'brico'], categoryName: 'Casa' }
  ]

  for (const mapping of categoryMappings) {
    if (mapping.keywords.some(keyword => merchantLower.includes(keyword))) {
      return mapping.categoryName
    }
  }

  return null // Categoria non determinata
}

const resetScan = () => {
  scanResult.value = null
  extractedData.value = null
  scanning.value = false
  extracting.value = false
  creating.value = false
  scanningMessage.value = ''
  categorySelection.value = { category: null, subcategory: null }
}

// Methods for CategorySelect component
const onCategoryChanged = (categoryId) => {
  if (extractedData.value) {
    extractedData.value.category = categoryId
  }
}

const onSubcategoryChanged = (subcategoryId) => {
  if (extractedData.value) {
    extractedData.value.subcategory = subcategoryId
  }
}

// Auto start se richiesto
onMounted(async () => {
  if (props.autoStart && isNativePlatform.value) {
    console.log('🚀 Auto-start document scanner')
    startDocumentScan()
  }
})

// Cleanup quando componente viene distrutto
onUnmounted(() => {
  // Cleanup OCR service
  ocrService.cleanup()
})
</script>

<style scoped>
.document-scanner-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* === MODERN SCANNER BUTTONS === */
.mcf-scanner-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0;
}

.mcf-primary-action {
  width: 100%;
  display: flex;
  justify-content: center;
}

.mcf-scanner-primary-btn {
  width: 100%;
  max-width: 300px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;

  @media (min-width: 768px) {
    padding: 18px 32px;
    font-size: 18px;
  }
}

.mcf-secondary-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.mcf-scanner-secondary-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 15px;
  }
}

.mcf-scanner-help {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 400px;
  text-align: left;
  padding: 16px;
  background: var(--mcf-bg-surface);
  border-radius: 8px;
  border-left: 4px solid var(--mcf-primary);

  @media (min-width: 768px) {
    padding: 20px;
  }
}

.mcf-help-icon {
  font-size: 18px;
  color: var(--mcf-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.mcf-help-text {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

/* === MODERN SCANNING INDICATOR === */
.mcf-scanning-indicator {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.mcf-scanning-card {
  background: var(--mcf-bg-surface);
  border-radius: 16px;
  box-shadow: var(--mcf-shadow-lg);
  padding: 32px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 40px 32px;
  }
}

.mcf-scanning-animation {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.mcf-scanning-progress {
  z-index: 2;
}

.mcf-scanning-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--mcf-primary-light);
  animation: scanningPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes scanningPulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
}

.mcf-scanning-content {
  text-align: center;
}

.mcf-scanning-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
}

.mcf-scanning-icon {
  font-size: 24px;
  color: var(--mcf-primary);
}

.mcf-scanning-message {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 15px;
  }
}

.mcf-scanning-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--mcf-bg-primary);
  border-radius: 8px;
}

.mcf-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--mcf-text-secondary);
  text-align: left;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-tip-icon {
  font-size: 16px;
  color: var(--mcf-primary);
  flex-shrink: 0;
}

.mcf-cancel-btn {
  margin-top: 8px;
}

.document-preview {
  text-align: center;
}

.document-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.document-image:hover {
  transform: scale(1.02);
}

.document-info {
  text-align: center;
}

.document-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.receipt-data {
  margin-bottom: 20px;
}

.final-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.ocr-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ocr-text-content {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

@media (max-width: 600px) {
  .document-actions,
  .final-actions {
    flex-direction: column;
    align-items: center;
  }

  .document-actions .q-btn,
  .final-actions .q-btn {
    width: 100%;
    margin: 4px 0;
  }

  .ocr-info {
    justify-content: center;
  }
}
</style>
