<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center mcf-login-page">
        <div class="mcf-login-container">
          <!-- Modern App Logo -->
          <div class="mcf-login-header">
            <!-- Logo with overlap effect -->
            <div class="mcf-logo-overlay">
              <div class="mcf-logo-circle"></div>
              <img
                src="~/assets/wallet-icon-only.svg"
                alt="App Logo"
                class="mcf-logo-icon"
              />
            </div>

            <div class="mcf-welcome-text">
              <h6 class="mcf-app-title">MyCrisisFamily</h6>
              <p class="mcf-app-subtitle">Gestione Spese Familiari</p>
            </div>

          </div>

          <!-- PIN Login (se configurato) -->
          <q-card v-if="hasPinSetup && !showEmailLogin" class="mcf-login-card">
            <q-card-section class="q-pa-lg">
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

              <!-- Delete PIN -->
              <div class="text-center q-mt-sm">
                <q-btn
                  label="Cancella PIN"
                  flat
                  dense
                  no-caps
                  color="negative"
                  size="sm"
                  @click="confirmDeletePin"
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

              <!-- Remember Me and Forgot Password -->
              <div class="row items-center justify-between q-mb-md">
                <q-checkbox
                  v-model="rememberMe"
                  label="Ricordami"
                />
                <q-btn
                  label="Password dimenticata?"
                  flat
                  dense
                  no-caps
                  color="primary"
                  size="sm"
                  @click="goToForgotPassword"
                  class="forgot-password-btn"
                />
              </div>

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

              <!-- Registration Link -->
              <div class="text-center q-mt-md">
                <span class="text-body2 text-grey-7">Non hai ancora un account? </span>
                <q-btn
                  label="Registrati"
                  flat
                  dense
                  no-caps
                  color="primary"
                  @click="goToRegister"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <!-- PIN Components -->
  <PinSetupModal
    v-model="showPinSetupModal"
    :loading="setupPinLoading"
    @confirm="confirmSetupPin"
    @cancel="closePinSetupModal"
  />

  <PinActionModals
    :show-want-pin="showWantPinModal"
    :show-delete-pin="showDeletePinModal"
    @update:show-want-pin="showWantPinModal = $event"
    @update:show-delete-pin="showDeletePinModal = $event"
    @accept="openSetupPinModal"
    @decline="declinePin"
    @confirm-delete="handleDeletePin"
    @cancel-delete="cancelDeletePin"
  />

  <PinActionModals2
    :show-want-pin="showSetupPinModal"
    @update:show-want-pin="showSetupPinModal = $event"
    @confirm="confirmPin"
    @cancel="cancelPin"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import PinSetupModal from 'components/users/PinSetupModal.vue'
import PinActionModals from 'components/users/PinActionModals.vue'
import PinActionModals2 from 'components/users/PinActionModals2.vue'

const router = useRouter()
const authStore = useAuthStore()
const snackbar = useSnackbar()

// Removed server info - now in settings page

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

// PIN Setup Modal
const showPinSetupModal = ref(false)
const setupPinLoading = ref(false)

// Removed debug info - now in settings page

// Computed

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
      snackbar.success('Accesso riuscito!')

      try {
        console.log('🔐 loginWithPin - Router push to /dashboard')
        await router.push('/dashboard')
        console.log('🔐 loginWithPin - Router push completed successfully')
      } catch (error) {
        console.error('🔐 loginWithPin - Router push failed:', error)
        // Fallback
        try {
          await router.replace('/dashboard')
        } catch (replaceError) {
          console.error('🔐 loginWithPin - Router replace failed:', replaceError)
          window.location.href = '/dashboard'
        }
      }
    } else {
      snackbar.error('PIN non corretto')
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
        showWantPinModal.value = true
        // Non fare redirect qui, la modale gestirà il flusso
        return
      }

      snackbar.success('Accesso riuscito!')

      try {
        console.log('🔐 loginWithEmail - Router push to /dashboard')
        await router.push('/dashboard')
        console.log('🔐 loginWithEmail - Router push completed successfully')
      } catch (error) {
        console.error('🔐 loginWithEmail - Router push failed:', error)
        // Fallback
        try {
          await router.replace('/dashboard')
        } catch (replaceError) {
          console.error('🔐 loginWithEmail - Router replace failed:', replaceError)
          window.location.href = '/dashboard'
        }
      }
    } else {
      snackbar.error('Credenziali non valide')
    }
  } finally {
    loading.value = false
  }
}

const setupPin = () => {
  showPinSetupModal.value = true
}

// PIN Setup Modal Functions
const confirmSetupPin = async (pin) => {
  setupPinLoading.value = true
  try {
    await authStore.setupPin(pin)
    snackbar.success('PIN configurato con successo!')
    closePinSetupModal()

    // Procedi con il redirect dopo aver configurato il PIN
    router.push('/dashboard')
  } catch (error) {
    console.error('Errore setup PIN:', error)
    snackbar.error('Errore nella configurazione del PIN')
  } finally {
    setupPinLoading.value = false
  }
}

const closePinSetupModal = () => {
  showPinSetupModal.value = false
  setupPinLoading.value = false
}

// Want PIN Modal
const showWantPinModal = ref(false)
const showSetupPinModal = ref(false)

// Delete PIN Function
const showDeletePinModal = ref(false)



const confirmDeletePin = () => {
  showDeletePinModal.value = true
}

const handleDeletePin = async () => {

  try {
    await authStore.clearPinData()
    snackbar.success('PIN cancellato con successo')

    // Aggiorna lo stato locale
    hasPinSetup.value = false
    showEmailLogin.value = true
    showDeletePinModal.value = false

  } catch (error) {
    console.error('Errore cancellazione PIN:', error)
    snackbar.error('Errore nella cancellazione del PIN')
  }
}

const cancelDeletePin = () => {
  showDeletePinModal.value = false
}

// Want PIN Modal Functions
const openSetupPinModal = () => {
  showWantPinModal.value = false
  showSetupPinModal.value = true
}

const closeSetupPinModal = () => {
  showSetupPinModal.value = false
}

const confirmPin = async (pin) => {
  if (!pin || pin.length !== 4) {
    snackbar.error('PIN deve essere di 4 cifre')
    return
  }

  try {
    // Qui puoi salvare il PIN
    console.log('PIN da salvare:', pin)

    // Simula il salvataggio
    await new Promise(resolve => setTimeout(resolve, 500))

    showSetupPinModal.value = false
    snackbar.success('PIN impostato con successo!')

    // Redirect alla dashboard dopo aver impostato il PIN
    console.log('🔐 confirmPin - Router push to /dashboard')
    await router.push('/dashboard')
    console.log('🔐 confirmPin - Router push completed successfully')
  } catch (error) {
    console.error('Errore impostazione PIN:', error)
    snackbar.error('Errore nell\'impostazione del PIN')
  }
}

const cancelPin = () => {
  showSetupPinModal.value = false
  snackbar.info('Impostazione PIN annullata')
}

const declinePin = async () => {
  console.log('🔐 declinePin - Starting redirect to dashboard')
  showWantPinModal.value = false

  snackbar.success('Accesso riuscito!')

  try {
    console.log('🔐 Router push to /dashboard')
    await router.push('/dashboard')
    console.log('🔐 Router push completed successfully')
  } catch (error) {
    console.error('🔐 Router push failed:', error)
    // Fallback: prova con replace
    try {
      console.log('🔐 Trying router replace as fallback')
      await router.replace('/dashboard')
      console.log('🔐 Router replace completed successfully')
    } catch (replaceError) {
      console.error('🔐 Router replace also failed:', replaceError)
      // Ultimo fallback: ricarica la pagina direttamente
      console.log('🔐 Final fallback: direct window location change')
      window.location.href = '/dashboard'
    }
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
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


// Debug functions removed - moved to settings page

// Lifecycle
onMounted(() => {
  // Check if user has PIN setup
  hasPinSetup.value = authStore.hasPinSetup()
  lastUserEmail.value = authStore.getLastUserEmail()

  // If no PIN, show email login
  if (!hasPinSetup.value) {
    showEmailLogin.value = true
  }
})
</script>

<style lang="scss" scoped>
.mcf-login-page {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  min-height: 100vh;
  padding: 20px;
}

.mcf-login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* === MODERN LOGIN HEADER === */
.mcf-login-header {
  background: linear-gradient(135deg, #ffffff 0%, #F4F8FA 100%);
  border-radius: 20px 20px 0 0;
  text-align: center;
  margin-bottom: 0;
  padding: 20px 15px 20px;
  position: relative;
  clip-path: polygon(
    0 20px,
    5px 20px, 5px 15px, 0 15px,
    0 40px,
    5px 40px, 5px 35px, 0 35px,
    0 60px,
    5px 60px, 5px 55px, 0 55px,
    0 80px,
    5px 80px, 5px 75px, 0 75px,
    0 100px,
    5px 100px, 5px 95px, 0 95px,
    0 120px,
    5px 120px, 5px 115px, 0 115px,
    0 140px,
    5px 140px, 5px 135px, 0 135px,
    0 160px,
    5px 160px, 5px 155px, 0 155px,
    0 180px,
    5px 180px, 5px 175px, 0 175px,
    0 200px,
    5px 200px, 5px 195px, 0 195px,
    0 100%,
    100% 100%,
    100% 200px,
    calc(100% - 5px) 200px, calc(100% - 5px) 195px, 100% 195px,
    100% 180px,
    calc(100% - 5px) 180px, calc(100% - 5px) 175px, 100% 175px,
    100% 160px,
    calc(100% - 5px) 160px, calc(100% - 5px) 155px, 100% 155px,
    100% 140px,
    calc(100% - 5px) 140px, calc(100% - 5px) 135px, 100% 135px,
    100% 120px,
    calc(100% - 5px) 120px, calc(100% - 5px) 115px, 100% 115px,
    100% 100px,
    calc(100% - 5px) 100px, calc(100% - 5px) 95px, 100% 95px,
    100% 80px,
    calc(100% - 5px) 80px, calc(100% - 5px) 75px, 100% 75px,
    100% 60px,
    calc(100% - 5px) 60px, calc(100% - 5px) 55px, 100% 55px,
    100% 40px,
    calc(100% - 5px) 40px, calc(100% - 5px) 35px, 100% 35px,
    100% 20px,
    calc(100% - 5px) 20px, calc(100% - 5px) 15px, 100% 15px,
    100% 20px,
    20px 20px, 20px 0, 0 0
  );

  @media (min-width: 768px) {
    margin-bottom: 0;
    padding: 25px 20px 25px;
  }
}

/* === LOGO OVERLAY === */
.mcf-logo-overlay {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  z-index: 10;

  @media (min-width: 768px) {
    margin-bottom: 15px;
  }
}

.mcf-logo-circle {
  position: absolute;
  width: 80px;
  height: 80px;
  background: #239db0;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1;

  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
  }
}

.mcf-logo-icon {
  position: relative;
  width: 100px;
  height: 100px;
  z-index: 2;

  @media (min-width: 768px) {
    width: 120px;
    height: 120px;
  }
}

.mcf-welcome-text {
  margin-top: 8px;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    margin-top: 10px;
    margin-bottom: 10px;
  }
}

.mcf-app-title {
  font-family: 'Nunito', sans-serif;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 2px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    font-size: 28px;
    margin-bottom: 4px;
  }
}

.mcf-app-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;

  @media (min-width: 768px) {
    font-size: 16px;
  }
}

/* === ZIGZAG DIVIDER === */
.mcf-zigzag-divider {
  width: calc(100% + 2px);
  height: 12px;
  position: absolute;
  bottom: -6px;
  left: -1px;
  z-index: 150;
  overflow: hidden;

  svg {
    display: block;
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 1px 2px rgba(35, 157, 176, 0.4));
  }
}

/* === LOGIN CARD === */
.mcf-login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  clip-path: polygon(
    0 0,
    100% 0,
    100% 20px,
    calc(100% - 5px) 20px, calc(100% - 5px) 15px, 100% 15px,
    100% 40px,
    calc(100% - 5px) 40px, calc(100% - 5px) 35px, 100% 35px,
    100% 60px,
    calc(100% - 5px) 60px, calc(100% - 5px) 55px, 100% 55px,
    100% 80px,
    calc(100% - 5px) 80px, calc(100% - 5px) 75px, 100% 75px,
    100% 100px,
    calc(100% - 5px) 100px, calc(100% - 5px) 95px, 100% 95px,
    100% 120px,
    calc(100% - 5px) 120px, calc(100% - 5px) 115px, 100% 115px,
    100% 140px,
    calc(100% - 5px) 140px, calc(100% - 5px) 135px, 100% 135px,
    100% 160px,
    calc(100% - 5px) 160px, calc(100% - 5px) 155px, 100% 155px,
    100% 180px,
    calc(100% - 5px) 180px, calc(100% - 5px) 175px, 100% 175px,
    100% 200px,
    calc(100% - 5px) 200px, calc(100% - 5px) 195px, 100% 195px,
    100% 220px,
    calc(100% - 5px) 220px, calc(100% - 5px) 215px, 100% 215px,
    100% 240px,
    calc(100% - 5px) 240px, calc(100% - 5px) 235px, 100% 235px,
    100% calc(100% - 20px),
    20px calc(100% - 20px), 20px 100%, 0 100%,
    0 240px,
    5px 240px, 5px 235px, 0 235px,
    0 220px,
    5px 220px, 5px 215px, 0 215px,
    0 200px,
    5px 200px, 5px 195px, 0 195px,
    0 180px,
    5px 180px, 5px 175px, 0 175px,
    0 160px,
    5px 160px, 5px 155px, 0 155px,
    0 140px,
    5px 140px, 5px 135px, 0 135px,
    0 120px,
    5px 120px, 5px 115px, 0 115px,
    0 100px,
    5px 100px, 5px 95px, 0 95px,
    0 80px,
    5px 80px, 5px 75px, 0 75px,
    0 60px,
    5px 60px, 5px 55px, 0 55px,
    0 40px,
    5px 40px, 5px 35px, 0 35px,
    0 20px,
    5px 20px, 5px 15px, 0 15px
  );
}

/* === PIN STYLES === */
.pin-input-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;

  @media (min-width: 768px) {
    padding: 20px 0;
  }
}

.pin-fields {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;

  @media (min-width: 768px) {
    gap: 20px;
  }
}

.pin-field {
  width: 56px;
  height: 56px;

  @media (min-width: 768px) {
    width: 64px;
    height: 64px;
  }
}

.pin-field :deep(.q-field__control) {
  height: 56px !important;
  border-radius: 12px !important;
  border: 2px solid var(--mcf-border-light, #e0e0e0) !important;
  background: white !important;
  transition: all 0.2s ease !important;

  @media (min-width: 768px) {
    height: 64px !important;
    border-radius: 16px !important;
  }
}

.pin-field :deep(.q-field__control-container) {
  padding-top: 0 !important;
}

.pin-field :deep(.q-field__native) {
  padding: 0 !important;
  text-align: center !important;
  font-size: 24px !important;
  font-weight: 600 !important;
  color: var(--mcf-primary) !important;
  line-height: 56px !important;

  @media (min-width: 768px) {
    font-size: 28px !important;
    line-height: 64px !important;
  }
}

.pin-field :deep(.q-field__marginal) {
  height: 56px !important;

  @media (min-width: 768px) {
    height: 64px !important;
  }
}

.pin-field:hover :deep(.q-field__control) {
  border-color: var(--mcf-primary) !important;
  box-shadow: 0 0 0 2px rgba(35, 157, 176, 0.1) !important;
}

.pin-field.q-field--focused :deep(.q-field__control) {
  border-color: var(--mcf-primary) !important;
  box-shadow: 0 0 0 3px rgba(35, 157, 176, 0.2) !important;
}

/* Rimuovi il label e hint space */
.pin-field :deep(.q-field__label) {
  display: none !important;
}

.pin-field :deep(.q-field__bottom) {
  display: none !important;
}

/* === INPUT FIELDS ROUNDED === */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px !important;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-radius: 12px !important;
}





</style>
