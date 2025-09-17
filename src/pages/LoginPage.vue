<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center mcf-login-page">
        <div class="mcf-login-container">
          <!-- Debug Info -->
          <div class="text-center q-mb-lg">
            <div class="text-h5 text-mcf-primary q-mb-md">My Crazy Family</div>
            
            <!-- Debug Information Box -->
            <q-card class="debug-info-card q-pa-sm">
              <div class="row">
                <div class="col">
                  <div class="text-caption">
                    <div class="row q-gutter-xs">
                      <div class="col-12">
                        <q-icon name="dns" size="xs" /> Server: 
                        <span :class="serverClass">{{ apiServer }}</span>
                      </div>
                      <div class="col-12">
                        <q-icon name="wifi" size="xs" /> Public IP: 
                        <span class="text-weight-bold">{{ publicIP }}</span>
                      </div>
                      <div class="col-12">
                        <q-icon name="devices" size="xs" /> Device IP: 
                        <span class="text-weight-bold">{{ deviceIP }}</span>
                      </div>
                      <div class="col-12">
                        <q-icon name="smartphone" size="xs" /> Platform: 
                        <span>{{ platform }}</span>
                      </div>
                      <div class="col-12">
                        <q-icon name="info" size="xs" /> Version: 
                        <span>{{ appVersion }}</span>
                      </div>
                      <div class="col-12">
                        <q-icon name="circle" size="xs" :color="serverStatus.color" /> Status: 
                        <span :class="'text-' + serverStatus.color">{{ serverStatus.text }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-auto self-center">
                  <q-btn 
                    round 
                    flat 
                    size="sm" 
                    icon="refresh" 
                    color="primary"
                    @click="refreshNetworkInfo"
                    :loading="refreshing"
                  >
                    <q-tooltip>Aggiorna info di rete</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card>
            
            <!-- Download APK for Android -->
            <div v-if="isAndroidDevice" class="text-center q-mt-md">
              <q-banner class="bg-primary text-white" rounded>
                <template v-slot:avatar>
                  <q-icon name="android" />
                </template>
                <div class="text-caption q-mb-xs">Per una migliore esperienza su Android</div>
                <q-btn 
                  flat 
                  dense 
                  color="white"
                  label="Scarica l'App"
                  icon="download"
                  @click="downloadAPK"
                  class="text-weight-bold"
                />
              </q-banner>
            </div>
          </div>

          <!-- PIN Login (se configurato) -->
          <q-card v-if="hasPinSetup && !showEmailLogin" class="mcf-login-card q-pa-md">
            <q-card-section>
              <div class="text-center q-mb-md">
                <q-avatar size="72px" class="mcf-bg-primary text-white">
                  <span style="font-size: 24px; font-weight: 500;">{{ userInitials }}</span>
                </q-avatar>
                <div class="text-h6 q-mt-sm text-grey-8">Bentornato!</div>
                <div class="text-caption text-grey-6">{{ lastUserEmail }}</div>
              </div>

              <!-- PIN Input Fields -->
              <div class="pin-input-container">
                <div class="pin-fields">
                  <q-input
                    v-for="i in 4"
                    :key="i"
                    v-model="pinDigits[i-1]"
                    class="pin-field"
                    input-class="pin-input"
                    maxlength="1"
                    inputmode="numeric"
                    pattern="[0-9]"
                    dense
                    outlined
                    @update:model-value="(val) => handlePinInput(i-1, val)"
                    @keydown.delete="() => handleBackspace(i-1)"
                    :ref="el => { if (el) pinInputs[i-1] = el }"
                  />
                </div>
              </div>

              <!-- Switch to Email -->
              <div class="text-center q-mt-md">
                <q-btn
                  label="Usa email e password"
                  flat
                  dense
                  no-caps
                  color="grey-7"
                  @click="showEmailLogin = true"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Email/Password Login -->
          <q-card v-else class="mcf-login-card q-pa-md">
            <q-card-section>
              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Email richiesta']"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Password richiesta']"
                @keyup.enter="loginWithEmail"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <!-- Remember Me -->
              <q-checkbox
                v-model="rememberMe"
                label="Ricordami"
                class="q-mb-md"
              />

              <!-- Login Button -->
              <q-btn
                label="Accedi"
                @click="loginWithEmail"
                class="full-width mcf-btn-primary"
                :loading="loading"
                :disable="!email || !password"
              />

              <!-- Back to PIN (if available) -->
              <div v-if="hasPinSetup" class="text-center q-mt-md">
                <q-btn
                  label="Usa PIN"
                  flat
                  dense
                  color="grey-7"
                  @click="showEmailLogin = false"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Server info
const apiServer = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  // Rimuovi http:// o https:// per display più pulito
  return url.replace(/^https?:\/\//, '')
})

const serverClass = computed(() => {
  const url = process.env.API_BASE_URL || 'http://localhost:8000'
  // Verde per produzione, arancione per sviluppo
  return url.includes('localhost') ? 'text-orange-8' : 'text-green-7'
})

const isAndroidDevice = computed(() => {
  // Rileva se è un dispositivo Android (mobile o tablet)
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('android') && (userAgent.includes('mobile') || userAgent.includes('tablet'))
})

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)

// PIN data
const pin = ref('')
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const hasPinSetup = ref(false)
const showEmailLogin = ref(false)
const lastUserEmail = ref('')

// Debug info
const publicIP = ref('Detecting...')
const deviceIP = ref('Detecting...')
const platform = ref('Unknown')
const appVersion = ref('1.0.6')
const serverStatus = ref({ text: 'Checking...', color: 'grey' })
const refreshing = ref(false)

// Computed
const userInitials = computed(() => {
  if (!lastUserEmail.value) return '?'
  const parts = lastUserEmail.value.split('@')[0].split('.')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return lastUserEmail.value.substring(0, 2).toUpperCase()
})

// Methods
const handlePinInput = (index, value) => {
  console.log('handlePinInput:', index, value)
  
  // Prendi solo l'ultima cifra se inserito più di un carattere
  const digit = value.toString().slice(-1)
  
  // Accetta solo numeri
  if (!/^\d*$/.test(digit)) {
    pinDigits.value[index] = ''
    return
  }
  
  pinDigits.value[index] = digit
  
  // Aggiorna il PIN completo
  pin.value = pinDigits.value.join('')
  console.log('PIN completo:', pin.value)
  
  // Auto-focus al campo successivo
  if (digit && index < 3) {
    console.log('Trying to focus next field:', index + 1)
    setTimeout(() => {
      const nextInput = pinInputs.value[index + 1]
      console.log('Next input ref:', nextInput)
      if (nextInput) {
        // Prova diversi metodi per il focus
        if (nextInput.focus) {
          nextInput.focus()
        } else if (nextInput.$el) {
          const inputEl = nextInput.$el.querySelector('input')
          console.log('Input element:', inputEl)
          if (inputEl) {
            inputEl.focus()
            inputEl.select()
          }
        }
      }
    }, 50)
  }
  
  // Auto-login quando tutti i 4 campi sono compilati
  if (pin.value.length === 4 && !/[^0-9]/.test(pin.value)) {
    console.log('Auto-login triggered')
    setTimeout(() => loginWithPin(), 300)
  }
}

const handleBackspace = (index) => {
  // Focus al campo precedente se il corrente è vuoto
  if (!pinDigits.value[index] && index > 0) {
    setTimeout(() => {
      const prevInput = pinInputs.value[index - 1]
      if (prevInput) {
        prevInput.$el.querySelector('input')?.focus()
      }
    }, 10)
  }
}

const loginWithPin = async () => {
  if (pin.value.length !== 4) return
  
  loading.value = true
  try {
    const success = await authStore.loginWithPin(pin.value)
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Accesso riuscito!',
        position: 'top'
      })
      router.push('/')
    } else {
      $q.notify({
        type: 'negative',
        message: 'PIN non corretto',
        position: 'top'
      })
      pin.value = ''
      pinDigits.value = ['', '', '', '']
    }
  } finally {
    loading.value = false
  }
}

const loginWithEmail = async () => {
  if (!email.value || !password.value) return
  
  loading.value = true
  try {
    const success = await authStore.login(email.value, password.value)
    
    if (success) {
      // Se Remember Me, chiedi di impostare PIN
      if (rememberMe.value && !hasPinSetup.value) {
        const wantPin = await new Promise((resolve) => {
          $q.dialog({
            title: 'Accesso Veloce',
            message: 'Vuoi impostare un PIN per accessi più veloci?',
            cancel: true,
            persistent: false
          }).onOk(() => resolve(true))
            .onCancel(() => resolve(false))
        })
        
        if (wantPin) {
          await setupPin()
        }
      }
      
      $q.notify({
        type: 'positive',
        message: 'Accesso riuscito!',
        position: 'top'
      })
      router.push('/')
    } else {
      $q.notify({
        type: 'negative',
        message: 'Credenziali non valide',
        position: 'top'
      })
    }
  } finally {
    loading.value = false
  }
}

const setupPin = async () => {
  const pinInput = await new Promise((resolve) => {
    $q.dialog({
      title: 'Imposta PIN',
      message: 'Scegli un PIN di 4 cifre',
      prompt: {
        model: '',
        type: 'number',
        isValid: val => val && val.length === 4
      },
      cancel: true
    }).onOk(data => resolve(data))
      .onCancel(() => resolve(null))
  })
  
  if (pinInput) {
    await authStore.setupPin(pinInput)
    $q.notify({
      type: 'positive',
      message: 'PIN configurato con successo!',
      position: 'top'
    })
  }
}

// Watchers
watch(pinDigits, (newVal, oldVal) => {
  console.log('pinDigits changed:', oldVal, '->', newVal)
  
  // Trova quale campo è stato modificato
  for (let i = 0; i < 4; i++) {
    if (newVal[i] !== oldVal[i] && newVal[i]) {
      console.log(`Campo ${i} modificato con: ${newVal[i]}`)
      
      // Aggiorna PIN completo
      pin.value = newVal.join('')
      
      // Auto-focus al prossimo campo
      if (i < 3 && newVal[i]) {
        setTimeout(() => {
          const nextInput = pinInputs.value[i + 1]
          if (nextInput && nextInput.$el) {
            const inputEl = nextInput.$el.querySelector('input')
            if (inputEl) {
              inputEl.focus()
              inputEl.select()
            }
          }
        }, 100)
      }
      
      // Auto-login quando completo
      if (pin.value.length === 4) {
        console.log('PIN completo, auto-login...')
        setTimeout(() => loginWithPin(), 300)
      }
      break
    }
  }
}, { deep: true })

// Helper functions for debug info
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
    publicIP.value = data.ip || 'Unknown'
  } catch (error) {
    publicIP.value = 'Cannot detect'
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
        if (deviceIP.value === 'Detecting...') {
          deviceIP.value = 'Auto-detect failed'
        }
        pc.close()
      }, 2000)
    } else {
      // For web, show a basic approximation
      deviceIP.value = 'Check WiFi settings'
    }
  } catch (error) {
    deviceIP.value = 'Cannot detect'
  }
  
  // Test server connection
  testServerConnection()
}

const testServerConnection = async () => {
  serverStatus.value = { text: 'Testing...', color: 'orange' }
  
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const testUrl = `${baseUrl}/api/auth/login/`
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      mode: 'cors'
    })
    
    if (response.ok || response.status === 200 || response.status === 405) {
      serverStatus.value = { text: 'Connected', color: 'green' }
    } else {
      serverStatus.value = { text: `Error ${response.status}`, color: 'red' }
    }
  } catch (error) {
    console.error('Server test error:', error)
    serverStatus.value = { text: 'Unreachable', color: 'red' }
  }
}

const refreshNetworkInfo = async () => {
  refreshing.value = true
  try {
    await getDeviceInfo()
  } catch (error) {
    console.error('Error refreshing network info:', error)
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

// Lifecycle
onMounted(() => {
  // Check if user has PIN setup
  hasPinSetup.value = authStore.hasPinSetup()
  lastUserEmail.value = authStore.getLastUserEmail()
  
  // If no PIN, show email login
  if (!hasPinSetup.value) {
    showEmailLogin.value = true
  }
  
  // Get device info for debugging
  getDeviceInfo()
  
  // Test connection every 5 seconds
  setInterval(testServerConnection, 5000)
})
</script>

<style scoped>
.mcf-login-page {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  min-height: 100vh;
}

.mcf-login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.debug-info-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

.mcf-login-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* PIN Styles */
.pin-input-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pin-fields {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.pin-field {
  width: 60px;
  height: 60px;
}

.pin-field :deep(.q-field__control) {
  height: 60px !important;
  border-radius: 16px !important;
  border: 2px solid #e0e0e0 !important;
  background: white !important;
}

.pin-field :deep(.q-field__control-container) {
  padding-top: 0 !important;
}

.pin-field :deep(.q-field__native) {
  padding: 0 !important;
  text-align: center !important;
  font-size: 28px !important;
  font-weight: bold !important;
  color: var(--mcf-primary) !important;
  line-height: 60px !important;
}

.pin-field :deep(.q-field__marginal) {
  height: 60px !important;
}

.pin-field:hover :deep(.q-field__control) {
  border-color: var(--mcf-accent) !important;
}

.pin-field.q-field--focused :deep(.q-field__control) {
  border-color: var(--mcf-accent) !important;
  box-shadow: 0 0 0 3px rgba(157, 178, 234, 0.2) !important;
}

/* Rimuovi il label e hint space */
.pin-field :deep(.q-field__label) {
  display: none !important;
}

.pin-field :deep(.q-field__bottom) {
  display: none !important;
}
</style>