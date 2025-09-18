<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center mcf-login-page">
        <div class="mcf-login-container">
          <!-- Modern App Logo -->
          <div class="mcf-login-header">
            <div class="mcf-welcome-text">
              <h1 class="mcf-app-title">My Crazy Family</h1>
              <p class="mcf-app-subtitle">Gestione Spese Familiari</p>
            </div>
          </div>

          <!-- Logo positioned to overlap the card -->
          <div class="mcf-logo-overlay">
            <div class="mcf-logo-background">
              <div class="mcf-logo-glass-effect"></div>
              <div class="mcf-logo-shine"></div>
              <q-icon
                name="account_balance_wallet"
                class="mcf-logo-icon"
              />
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
    @accept="acceptPin"
    @decline="declinePin"
    @confirm-delete="handleDeletePin"
    @cancel-delete="cancelDeletePin"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth.js'
import PinSetupModal from 'components/users/PinSetupModal.vue'
import PinActionModals from 'components/users/PinActionModals.vue'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

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
        showWantPinModal.value = true
        // Non fare redirect qui, la modale gestirà il flusso
        return
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

const setupPin = () => {
  showPinSetupModal.value = true
}

// PIN Setup Modal Functions
const confirmSetupPin = async (pin) => {
  setupPinLoading.value = true
  try {
    await authStore.setupPin(pin)
    $q.notify({
      type: 'positive',
      message: 'PIN configurato con successo!',
      position: 'top'
    })
    closePinSetupModal()

    // Procedi con il redirect dopo aver configurato il PIN
    router.push('/')
  } catch (error) {
    console.error('Errore setup PIN:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore nella configurazione del PIN',
      position: 'top'
    })
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

// Delete PIN Function
const showDeletePinModal = ref(false)

const confirmDeletePin = () => {
  showDeletePinModal.value = true
}

const handleDeletePin = async () => {

  try {
    await authStore.clearPinData()
    $q.notify({
      type: 'positive',
      message: 'PIN cancellato con successo',
      position: 'top'
    })

    // Aggiorna lo stato locale
    hasPinSetup.value = false
    showEmailLogin.value = true
    showDeletePinModal.value = false

  } catch (error) {
    console.error('Errore cancellazione PIN:', error)
    $q.notify({
      type: 'negative',
      message: 'Errore nella cancellazione del PIN',
      position: 'top'
    })
  }
}

const cancelDeletePin = () => {
  showDeletePinModal.value = false
}

// Want PIN Modal Functions
const acceptPin = () => {
  showWantPinModal.value = false
  setupPin()
}

const declinePin = () => {
  showWantPinModal.value = false

  $q.notify({
    type: 'positive',
    message: 'Accesso riuscito!',
    position: 'top'
  })
  router.push('/')
}

const goToRegister = () => {
  router.push('/register')
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
  text-align: center;
  margin-bottom: 60px;

  @media (min-width: 768px) {
    margin-bottom: 70px;
  }
}

/* === LOGO OVERLAY === */
.mcf-logo-overlay {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: -60px;
  z-index: 10;

  @media (min-width: 768px) {
    margin-bottom: -70px;
  }
}

.mcf-logo-background {
  width: 120px;
  height: 120px;
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 25%,
    var(--mcf-primary) 50%,
    var(--mcf-secondary) 75%,
    rgba(0, 0, 0, 0.1) 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 2px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
  }

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow:
      0 15px 45px rgba(0, 0, 0, 0.4),
      inset 0 3px 12px rgba(255, 255, 255, 0.4),
      inset 0 -3px 12px rgba(0, 0, 0, 0.3);

    .mcf-logo-shine {
      animation: shine 0.8s ease-in-out;
    }
  }
}

.mcf-logo-glass-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.3) 60%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  animation: rotate-glass 8s linear infinite;
}

.mcf-logo-shine {
  position: absolute;
  top: 15%;
  left: 20%;
  width: 30%;
  height: 40%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  border-radius: 50% 30% 40% 60%;
  filter: blur(1px);
  pointer-events: none;
  opacity: 0.7;
}

@keyframes rotate-glass {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shine {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.7; transform: scale(1); }
}

.mcf-logo-icon {
  font-size: 65px;
  color: white;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 75px;
  }
}

.mcf-welcome-text {
  color: white;
}

.mcf-app-title {
  font-family: var(--mcf-logo-font, 'Fredoka One'), cursive;
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 6px;
  }
}

.mcf-app-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

/* === LOGIN CARD === */
.mcf-login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  padding-top: 60px;

  @media (min-width: 768px) {
    padding-top: 70px;
  }
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

</style>
