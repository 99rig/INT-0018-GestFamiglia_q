<template>
  <q-page class="mcf-page-container-fullwidth">
    <div class="mcf-settings-page-content">
      <!-- Modern Header -->
      <div class="mcf-settings-header">
        <div class="mcf-settings-illustration">
          <div class="mcf-settings-icon-container">
            <q-icon name="settings" class="mcf-settings-icon" />
            <div class="mcf-settings-gears">
              <div class="mcf-gear mcf-gear-1"></div>
              <div class="mcf-gear mcf-gear-2"></div>
            </div>
          </div>
        </div>

        <div class="mcf-settings-content">
          <h2 class="mcf-settings-title">Impostazioni</h2>
          <p class="mcf-settings-description">
            Configura l'app, visualizza informazioni di sistema e gestisci le preferenze.
          </p>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="mcf-settings-sections">

        <!-- System Information -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="info" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Informazioni Sistema</h3>
          </div>

          <div class="mcf-info-grid">
            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="dns" class="mcf-info-icon" />
                <span class="mcf-info-label">Server API</span>
                <q-btn
                  round
                  flat
                  size="sm"
                  icon="refresh"
                  color="primary"
                  @click="refreshNetworkInfo"
                  :loading="refreshing"
                  class="mcf-refresh-btn"
                >
                  <q-tooltip>Aggiorna informazioni</q-tooltip>
                </q-btn>
              </div>
              <div class="mcf-info-value" :class="serverClass">{{ apiServer }}</div>
              <div class="mcf-info-status">
                <q-icon name="circle" :color="serverStatus.color" />
                <span :class="'text-' + serverStatus.color">{{ serverStatus.text }}</span>
              </div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="wifi" class="mcf-info-icon" />
                <span class="mcf-info-label">IP Pubblico</span>
              </div>
              <div class="mcf-info-value">{{ publicIP }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="devices" class="mcf-info-icon" />
                <span class="mcf-info-label">IP Dispositivo</span>
              </div>
              <div class="mcf-info-value">{{ deviceIP }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="smartphone" class="mcf-info-icon" />
                <span class="mcf-info-label">Piattaforma</span>
              </div>
              <div class="mcf-info-value">{{ platform }}</div>
            </div>

            <div class="mcf-info-card">
              <div class="mcf-info-header">
                <q-icon name="info" class="mcf-info-icon" />
                <span class="mcf-info-label">Versione App</span>
              </div>
              <div class="mcf-info-value">{{ appVersion }}</div>
            </div>

            <!-- Download APK for Android -->
            <div v-if="isAndroidDevice" class="mcf-info-card mcf-download-card">
              <div class="mcf-info-header">
                <q-icon name="android" class="mcf-info-icon" />
                <span class="mcf-info-label">App Android</span>
              </div>
              <div class="mcf-info-value">Migliore esperienza</div>
              <q-btn
                flat
                dense
                color="primary"
                label="Scarica APK"
                icon="download"
                @click="downloadAPK"
                class="mcf-download-btn"
              />
            </div>
          </div>
        </div>

        <!-- Camera Testing -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="camera_alt" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Test Fotocamera</h3>
          </div>

          <div class="mcf-camera-section">
            <p class="mcf-section-description">
              Testa la funzionalità della fotocamera posteriore per verificare il corretto funzionamento dello scanner.
            </p>

            <div class="mcf-camera-controls">
              <q-btn
                class="mcf-btn-primary mcf-camera-btn"
                label="Apri Fotocamera"
                icon="camera_alt"
                @click="openBackCamera"
                :loading="cameraLoading"
                no-caps
                unelevated
              />
            </div>

            <!-- Camera preview -->
            <div v-if="showCamera" class="mcf-camera-container">
              <video
                ref="videoElement"
                autoplay
                playsinline
                class="mcf-camera-preview"
              ></video>
              <div class="mcf-camera-actions">
                <q-btn
                  class="mcf-btn-primary"
                  icon="camera"
                  label="Scatta"
                  @click="takePhoto"
                  no-caps
                  unelevated
                />
                <q-btn
                  class="mcf-btn-secondary"
                  icon="close"
                  label="Chiudi"
                  @click="closeCamera"
                  no-caps
                  unelevated
                />
              </div>
            </div>

            <!-- Photo preview -->
            <div v-if="capturedPhoto" class="mcf-photo-container">
              <div class="mcf-photo-header">
                <q-icon name="photo" class="mcf-photo-icon" />
                <span class="mcf-photo-label">Foto Acquisita</span>
              </div>
              <img :src="capturedPhoto" alt="Foto acquisita" class="mcf-captured-photo" />
            </div>
          </div>
        </div>

        <!-- App Updates Section -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="system_update" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Aggiornamenti</h3>
          </div>

          <div class="mcf-updates-section">
            <p class="mcf-section-description">
              Controlla e installa gli aggiornamenti dell'applicazione per avere sempre le ultime funzionalità.
            </p>

            <div class="mcf-update-controls">
              <q-btn
                class="mcf-btn-primary mcf-update-btn"
                label="Controlla Aggiornamenti"
                icon="system_update"
                @click="checkForUpdates"
                :loading="updateChecking"
                no-caps
                unelevated
              />
            </div>

            <div v-if="currentVersion" class="mcf-version-info">
              <div class="mcf-version-current">
                <q-icon name="info" class="mcf-version-icon" />
                <span class="mcf-version-text">
                  Versione corrente: v{{ currentVersion.name }} ({{ currentVersion.code }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Font Settings Section -->
        <div class="mcf-settings-section">
          <div class="mcf-section-header">
            <q-icon name="text_fields" class="mcf-section-icon" />
            <h3 class="mcf-section-title">Impostazioni Font</h3>
          </div>

          <div class="mcf-font-section">
            <p class="mcf-section-description">
              Personalizza i font dell'applicazione per migliorare la tua esperienza di lettura.
            </p>

            <!-- Logo Font Selection -->
            <div class="mcf-font-group">
              <h4 class="mcf-font-group-title">
                <q-icon name="account_balance_wallet" class="mcf-font-group-icon" />
                Font Logo "My Crazy Family"
              </h4>

              <div class="mcf-font-preview-container">
                <div class="mcf-font-preview" :style="{ fontFamily: selectedLogoFont }">
                  My Crazy Family
                </div>
              </div>

              <div class="mcf-font-options">
                <q-btn-toggle
                  v-model="selectedLogoFont"
                  toggle-color="primary"
                  :options="logoFontOptions"
                  class="mcf-font-toggle"
                  @update:model-value="updateLogoFont"
                />
              </div>
            </div>

            <!-- App Font Selection -->
            <div class="mcf-font-group">
              <h4 class="mcf-font-group-title">
                <q-icon name="article" class="mcf-font-group-icon" />
                Font Applicazione
              </h4>

              <div class="mcf-font-preview-container">
                <div class="mcf-font-preview mcf-app-font-preview" :style="{ fontFamily: selectedAppFont }">
                  <div class="mcf-preview-title">Titolo Esempio</div>
                  <div class="mcf-preview-text">Questo è un esempio di testo dell'applicazione con il font selezionato.</div>
                  <div class="mcf-preview-small">Testo piccolo e dettagli</div>
                </div>
              </div>

              <div class="mcf-font-options">
                <q-btn-toggle
                  v-model="selectedAppFont"
                  toggle-color="primary"
                  :options="appFontOptions"
                  class="mcf-font-toggle"
                  @update:model-value="updateAppFont"
                />
              </div>
            </div>

            <!-- Reset Button -->
            <div class="mcf-font-reset">
              <q-btn
                flat
                color="secondary"
                icon="refresh"
                label="Ripristina Font Predefiniti"
                @click="resetFonts"
                class="mcf-reset-btn"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { updateService } from 'src/services/updateService'

const $q = useQuasar()

// Camera refs
const videoElement = ref(null)
const showCamera = ref(false)
const cameraLoading = ref(false)
const capturedPhoto = ref(null)
let mediaStream = null

// Update refs
const updateChecking = ref(false)
const currentVersion = ref(null)

// Debug info refs (moved from LoginPage)
const publicIP = ref('Rilevamento...')
const deviceIP = ref('Rilevamento...')
const platform = ref('Sconosciuto')
const appVersion = ref('1.0.6')
const serverStatus = ref({ text: 'Controllo...', color: 'grey' })
const refreshing = ref(false)

// Font settings refs
const selectedLogoFont = ref('Fredoka One')
const selectedAppFont = ref('Nunito')

// Font options
const logoFontOptions = [
  { label: 'Fredoka One', value: 'Fredoka One' },
  { label: 'Comfortaa', value: 'Comfortaa' },
  { label: 'Quicksand', value: 'Quicksand' },
  { label: 'Poppins', value: 'Poppins' }
]

const appFontOptions = [
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' }
]

// Computed properties (moved from LoginPage)
const apiServer = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  return url.replace(/^https?:\/\//, '')
})

const serverClass = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  return url.includes('localhost') ? 'text-orange-8' : 'text-green-7'
})

const isAndroidDevice = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('android') && (userAgent.includes('mobile') || userAgent.includes('tablet'))
})

onMounted(async () => {
  // Ottieni versione corrente
  await updateService.init()
  currentVersion.value = updateService.currentVersion

  // Get device info for debugging (moved from LoginPage)
  getDeviceInfo()

  // Load saved font preferences
  loadSavedFonts()

  // Test connection every 30 seconds (less frequent than login page)
  setInterval(testServerConnection, 30000)
})

async function openBackCamera() {
  try {
    cameraLoading.value = true
    capturedPhoto.value = null

    // Request camera permission with back camera preference
    const constraints = {
      video: {
        facingMode: 'environment', // Back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    showCamera.value = true

    // Wait for next tick to ensure video element is rendered
    await new Promise(resolve => setTimeout(resolve, 100))

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
    }

    $q.notify({
      type: 'positive',
      message: 'Camera opened successfully',
      position: 'top'
    })

  } catch (error) {
    console.error('Error accessing camera:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to access camera: ' + error.message,
      position: 'top'
    })
  } finally {
    cameraLoading.value = false
  }
}

function takePhoto() {
  if (!videoElement.value) return

  try {
    const canvas = document.createElement('canvas')
    const video = videoElement.value

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.8)

    $q.notify({
      type: 'positive',
      message: 'Photo captured successfully',
      position: 'top'
    })

  } catch (error) {
    console.error('Error taking photo:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to capture photo',
      position: 'top'
    })
  }
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  showCamera.value = false

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
}

// Controllo manuale aggiornamenti
async function checkForUpdates() {
  updateChecking.value = true
  try {
    await updateService.checkForUpdates(true, true) // Forza la visualizzazione anche se già mostrato
  } finally {
    updateChecking.value = false
  }
}

// Debug functions (moved from LoginPage)
const getDeviceInfo = async () => {
  // Get platform info
  if (window.Capacitor) {
    const { Capacitor } = window
    platform.value = `${Capacitor.getPlatform()} (${Capacitor.isNativePlatform() ? 'Native' : 'Web'})`
  } else {
    platform.value = 'Web Browser'
  }

  // Get public IP
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    publicIP.value = data.ip || 'Sconosciuto'
  } catch (error) {
    publicIP.value = 'Non rilevabile'
  }

  // Get local device IP (approximation)
  try {
    if (window.Capacitor) {
      // For mobile app, try to create a WebRTC connection to detect local IP
      const pc = new RTCPeerConnection({iceServers: []})
      pc.createDataChannel('')
      pc.createOffer().then(offer => pc.setLocalDescription(offer))

      pc.onicecandidate = (ice) => {
        if (ice && ice.candidate && ice.candidate.candidate) {
          const candidate = ice.candidate.candidate
          const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
          if (match && match[1] && !match[1].startsWith('127.')) {
            deviceIP.value = match[1]
            pc.close()
          }
        }
      }

      // Fallback after 2 seconds
      setTimeout(() => {
        if (deviceIP.value === 'Rilevamento...') {
          deviceIP.value = 'Rilevamento fallito'
        }
        pc.close()
      }, 2000)
    } else {
      // For web, show a basic approximation
      deviceIP.value = 'Controlla impostazioni WiFi'
    }
  } catch (error) {
    deviceIP.value = 'Non rilevabile'
  }

  // Test server connection
  testServerConnection()
}

const testServerConnection = async () => {
  serverStatus.value = { text: 'Test...', color: 'orange' }

  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const testUrl = `${baseUrl}/api/auth/login/`
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      mode: 'cors'
    })

    if (response.ok || response.status === 200 || response.status === 405) {
      serverStatus.value = { text: 'Connesso', color: 'green' }
    } else {
      serverStatus.value = { text: `Errore ${response.status}`, color: 'red' }
    }
  } catch (error) {
    console.error('Server test error:', error)
    serverStatus.value = { text: 'Non raggiungibile', color: 'red' }
  }
}

const refreshNetworkInfo = async () => {
  refreshing.value = true
  try {
    await getDeviceInfo()
    $q.notify({
      type: 'positive',
      message: 'Informazioni aggiornate',
      position: 'top'
    })
  } catch (error) {
    console.error('Error refreshing network info:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore durante l\'aggiornamento',
      position: 'top'
    })
  } finally {
    refreshing.value = false
  }
}

const downloadAPK = () => {
  // URL per scaricare l'ultima versione dell'APK
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
  const apkUrl = `${baseUrl}/api/updates/latest/download/`

  // Apri il link di download in una nuova finestra
  window.open(apkUrl, '_blank')

  // Mostra un messaggio informativo
  $q.notify({
    message: 'Download APK avviato. Installa l\'app per una migliore esperienza!',
    color: 'primary',
    icon: 'android',
    position: 'top'
  })
}

// Font management functions
const updateLogoFont = (fontFamily) => {
  // Aggiorna il CSS custom property per il logo
  document.documentElement.style.setProperty('--mcf-logo-font', fontFamily)

  // Salva la preferenza nel localStorage
  localStorage.setItem('mcf-logo-font', fontFamily)

  $q.notify({
    type: 'positive',
    message: `Font logo aggiornato: ${fontFamily}`,
    position: 'top'
  })
}

const updateAppFont = (fontFamily) => {
  // Aggiorna il CSS custom property per l'app
  document.documentElement.style.setProperty('--mcf-app-font', fontFamily)

  // Salva la preferenza nel localStorage
  localStorage.setItem('mcf-app-font', fontFamily)

  $q.notify({
    type: 'positive',
    message: `Font applicazione aggiornato: ${fontFamily}`,
    position: 'top'
  })
}

const resetFonts = () => {
  selectedLogoFont.value = 'Fredoka One'
  selectedAppFont.value = 'Nunito'

  updateLogoFont('Fredoka One')
  updateAppFont('Nunito')

  $q.notify({
    type: 'info',
    message: 'Font ripristinati ai valori predefiniti',
    position: 'top'
  })
}

const loadSavedFonts = () => {
  // Carica le preferenze salvate
  const savedLogoFont = localStorage.getItem('mcf-logo-font')
  const savedAppFont = localStorage.getItem('mcf-app-font')

  if (savedLogoFont) {
    selectedLogoFont.value = savedLogoFont
    updateLogoFont(savedLogoFont)
  }

  if (savedAppFont) {
    selectedAppFont.value = savedAppFont
    updateAppFont(savedAppFont)
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  closeCamera()
})
</script>

<style lang="scss" scoped>
/* === MAIN CONTAINER === */
.mcf-settings-page-content {
  width: 100%;
  margin: 0;
  padding: 16px 4px;
  min-height: 100vh;

  @media (min-width: 768px) {
    padding: 24px 8px;
  }

  @media (min-width: 1200px) {
    padding: 24px 8px;
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
.mcf-settings-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 4px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    padding: 40px 8px;
    margin-bottom: 24px;
  }
}

.mcf-settings-illustration {
  position: relative;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    margin-bottom: 40px;
  }
}

.mcf-settings-icon-container {
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

.mcf-settings-icon {
  font-size: 60px;
  color: white;
  z-index: 3;
  animation: rotate 8s linear infinite;

  @media (min-width: 768px) {
    font-size: 70px;
  }
}

.mcf-settings-gears {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.mcf-gear {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  &.mcf-gear-1 {
    top: 20%;
    right: 15%;
    animation: rotate 6s linear infinite;
  }

  &.mcf-gear-2 {
    bottom: 25%;
    left: 10%;
    animation: rotate 4s linear infinite reverse;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mcf-settings-content {
  max-width: 600px;
  margin: 0 auto;
}

.mcf-settings-title {
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

.mcf-settings-description {
  font-size: 16px;
  color: var(--mcf-text-secondary);
  margin: 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

/* === SETTINGS SECTIONS === */
.mcf-settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    gap: 20px;
  }
}

.mcf-settings-section {
  background: var(--mcf-bg-surface);
  border-radius: 8px;
  box-shadow: var(--mcf-shadow-md);
  padding: 12px;
  margin: 0 2px;

  @media (min-width: 768px) {
    padding: 16px;
    margin: 0 4px;
  }

  @media (min-width: 1200px) {
    padding: 20px;
    margin: 0;
  }
}

.mcf-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
}

.mcf-section-icon {
  font-size: 28px;
  color: var(--mcf-primary);

  @media (min-width: 768px) {
    font-size: 32px;
  }
}

.mcf-section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

.mcf-section-description {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 15px;
    margin-bottom: 24px;
  }
}

/* === INFO GRID === */
.mcf-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

.mcf-info-card {
  background: var(--mcf-bg-primary);
  border: 1px solid var(--mcf-border-light);
  border-radius: 8px;
  padding: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--mcf-shadow-sm);
  }

  @media (min-width: 768px) {
    padding: 12px;
  }
}

.mcf-download-card {
  border-color: var(--mcf-primary);
  background: linear-gradient(135deg, var(--mcf-primary-light) 0%, var(--mcf-bg-primary) 100%);
}

.mcf-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mcf-info-icon {
  font-size: 18px;
  color: var(--mcf-primary);
  margin-right: 8px;
}

.mcf-info-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--mcf-text-secondary);
  flex: 1;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.mcf-refresh-btn {
  margin-left: auto;
}

.mcf-info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin-bottom: 4px;
  word-break: break-all;

  @media (min-width: 768px) {
    font-size: 17px;
  }
}

.mcf-info-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 13px;
  }
}

.mcf-download-btn {
  margin-top: 8px;
  font-size: 12px;
  padding: 4px 12px;
}

/* === CAMERA SECTION === */
.mcf-camera-section {
  text-align: center;
}

.mcf-camera-controls {
  margin-bottom: 24px;
}

.mcf-camera-btn {
  padding: 12px 24px;
  font-size: 16px;

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 17px;
  }
}

.mcf-camera-container {
  background: var(--mcf-bg-primary);
  border: 2px solid var(--mcf-primary);
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;

  @media (min-width: 768px) {
    padding: 12px;
    margin-top: 16px;
  }
}

.mcf-camera-preview {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  background: var(--mcf-text-primary);
  border: 1px solid var(--mcf-border-light);
}

.mcf-camera-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.mcf-photo-container {
  background: var(--mcf-bg-primary);
  border: 2px solid var(--mcf-secondary);
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 12px;
    margin-top: 16px;
  }
}

.mcf-photo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mcf-photo-icon {
  font-size: 20px;
  color: var(--mcf-secondary);
}

.mcf-photo-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
}

.mcf-captured-photo {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--mcf-border-light);
  box-shadow: var(--mcf-shadow-sm);
}

/* === UPDATES SECTION === */
.mcf-updates-section {
  text-align: center;
}

.mcf-update-controls {
  margin-bottom: 24px;
}

.mcf-update-btn {
  padding: 12px 24px;
  font-size: 16px;

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 17px;
  }
}

.mcf-version-info {
  background: var(--mcf-bg-primary);
  border-radius: 6px;
  padding: 8px 12px;

  @media (min-width: 768px) {
    padding: 12px 16px;
  }
}

.mcf-version-current {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mcf-version-icon {
  font-size: 16px;
  color: var(--mcf-primary);
}

.mcf-version-text {
  font-size: 13px;
  color: var(--mcf-text-secondary);
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

/* === FONT SETTINGS === */
.mcf-font-section {
  text-align: left;
}

.mcf-font-group {
  background: var(--mcf-bg-primary);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--mcf-border-light);

  @media (min-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }
}

.mcf-font-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  margin: 0 0 16px 0;

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 20px;
  }
}

.mcf-font-group-icon {
  font-size: 18px;
  color: var(--mcf-primary);
}

.mcf-font-preview-container {
  background: var(--mcf-bg-surface);
  border: 2px solid var(--mcf-border-light);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
}

.mcf-font-preview {
  font-size: 24px;
  font-weight: 600;
  color: var(--mcf-text-primary);
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 28px;
  }
}

.mcf-app-font-preview {
  text-align: left;

  .mcf-preview-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--mcf-text-primary);

    @media (min-width: 768px) {
      font-size: 22px;
      margin-bottom: 12px;
    }
  }

  .mcf-preview-text {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 8px;
    color: var(--mcf-text-secondary);
    line-height: 1.5;

    @media (min-width: 768px) {
      font-size: 15px;
      margin-bottom: 12px;
    }
  }

  .mcf-preview-small {
    font-size: 12px;
    font-weight: 400;
    color: var(--mcf-text-tertiary);

    @media (min-width: 768px) {
      font-size: 13px;
    }
  }
}

.mcf-font-options {
  display: flex;
  justify-content: center;
}

.mcf-font-toggle {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    font-size: 13px;
    padding: 8px 12px;

    @media (min-width: 768px) {
      font-size: 14px;
      padding: 10px 16px;
    }
  }
}

.mcf-font-reset {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--mcf-border-light);
  margin-top: 24px;
}

.mcf-reset-btn {
  font-size: 13px;
  padding: 8px 16px;

  @media (min-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
}
</style>
