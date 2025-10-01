<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center ticket-page">
        <div class="ticket-container">
          <!-- Ticket Card -->
          <div class="ticket-card">
            <!-- Header Section -->
            <div class="ticket-header">
              <div class="ticket-logo">
                <img src="~/assets/wallet-icon-only.svg" alt="Logo" class="logo-img" />
                <div class="brand-section">
                  <div class="brand-badge">
                    <span class="logo-text">MyCrisisFamily</span>
                  </div>
                  <svg class="barcode" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="3" height="30" fill="#000"/>
                    <rect x="5" y="0" width="2" height="30" fill="#000"/>
                    <rect x="9" y="0" width="4" height="30" fill="#000"/>
                    <rect x="15" y="0" width="2" height="30" fill="#000"/>
                    <rect x="19" y="0" width="3" height="30" fill="#000"/>
                    <rect x="24" y="0" width="2" height="30" fill="#000"/>
                    <rect x="28" y="0" width="5" height="30" fill="#000"/>
                    <rect x="35" y="0" width="2" height="30" fill="#000"/>
                    <rect x="39" y="0" width="3" height="30" fill="#000"/>
                    <rect x="44" y="0" width="2" height="30" fill="#000"/>
                    <rect x="48" y="0" width="4" height="30" fill="#000"/>
                    <rect x="54" y="0" width="2" height="30" fill="#000"/>
                    <rect x="58" y="0" width="3" height="30" fill="#000"/>
                    <rect x="63" y="0" width="5" height="30" fill="#000"/>
                    <rect x="70" y="0" width="2" height="30" fill="#000"/>
                    <rect x="74" y="0" width="3" height="30" fill="#000"/>
                    <rect x="79" y="0" width="2" height="30" fill="#000"/>
                    <rect x="83" y="0" width="4" height="30" fill="#000"/>
                    <rect x="89" y="0" width="2" height="30" fill="#000"/>
                    <rect x="93" y="0" width="3" height="30" fill="#000"/>
                    <rect x="98" y="0" width="2" height="30" fill="#000"/>
                    <rect x="102" y="0" width="5" height="30" fill="#000"/>
                    <rect x="109" y="0" width="2" height="30" fill="#000"/>
                    <rect x="113" y="0" width="4" height="30" fill="#000"/>
                  </svg>
                </div>
              </div>
              <div class="checkin-code">
                <img src="~/assets/wallet-icon-only.svg" alt="Logo" class="logo-img-right" />
              </div>
            </div>


            <!-- PIN Login (se configurato) -->
            <div v-if="hasPinSetup && !showEmailLogin" class="event-info">
              <div class="info-label">INSERT PIN</div>

              <!-- PIN Input Fields -->
              <div class="pin-input-container">
                <q-input
                  v-for="i in 4"
                  :key="i"
                  v-model="pinDigits[i-1]"
                  class="pin-field"
                  outlined
                  dense
                  maxlength="1"
                  inputmode="numeric"
                  pattern="[0-9]"
                  @update:model-value="(val) => handlePinInput(i-1, val)"
                  @keydown.delete="() => handleBackspace(i-1)"
                  :ref="el => { if (el) pinInputs[i-1] = el }"
                />
              </div>

              <!-- Switch to Email & Delete PIN -->
              <div class="login-actions" style="margin-top: 15px;">
                <q-btn
                  label="Usa Email"
                  flat
                  dense
                  color="grey-7"
                  size="sm"
                  @click="showEmailLogin = true"
                  class="switch-btn"
                />
                <q-btn
                  label="Cancella PIN"
                  flat
                  dense
                  color="negative"
                  size="sm"
                  @click="confirmDeletePin"
                  class="delete-pin-btn"
                />
              </div>
            </div>

            <!-- Email/Password Login -->
            <div v-else class="event-info">
              <div class="info-label">INSERT EMAIL</div>
              <q-input
                v-model="email"
                type="email"
                outlined
                dense
                class="login-input"
                placeholder="your.email@example.com"
              />
              <div class="info-label">INSERT PASSWORD</div>
              <q-input
                v-model="password"
                type="password"
                outlined
                dense
                class="login-input"
                placeholder="Enter your password"
                @keyup.enter="handleLogin"
              />

              <!-- Remember Me & Login Button -->
              <div class="login-actions">
                <q-checkbox
                  v-model="rememberMe"
                  label="Ricordami"
                  dense
                  class="remember-checkbox"
                />
                <q-btn
                  label="ACCEDI"
                  flat
                  icon-right="arrow_forward"
                  class="login-btn"
                  @click="handleLogin"
                  :loading="loading"
                />
              </div>

              <!-- Back to PIN (if available) -->
              <div v-if="hasPinSetup" class="text-center" style="margin-top: 10px;">
                <q-btn
                  label="Usa PIN"
                  flat
                  dense
                  color="grey-7"
                  size="sm"
                  @click="showEmailLogin = false"
                />
              </div>
            </div>

            <!-- Dashed Line Separator -->
            <div class="ticket-separator">
              <div class="dashed-line"></div>
            </div>

            <!-- Bottom Section -->
            <div class="ticket-bottom">
              <div class="bottom-left">
                <div class="info-label">PASSWORD DIMENTICATA?</div>
                <router-link to="/forgot-password" class="info-value reset-link">REIMPOSTA PASSWORD</router-link>
                <div class="info-label">NON HAI UN ACCOUNT?</div>
                <router-link to="/register" class="info-value reset-link">REGISTRATI</router-link>
              </div>
              <div class="bottom-right">
                <div class="info-label">SEAT NUMBER</div>
                <div class="seat-number">A6</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="ticket-footer">
              <div class="footer-text">MUMBLE.GROUP</div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <!-- PIN Components -->
  <PinActionModals2
    :show-want-pin="showSetupPinModal"
    @update:show-want-pin="showSetupPinModal = $event"
    @confirm="confirmPin"
    @cancel="cancelPin"
  />

  <PinSetupModal
    v-model="showPinSetupModal"
    :loading="setupPinLoading"
    @confirm="confirmSetupPin"
    @cancel="closePinSetupModal"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth.js'
import { useSnackbar } from 'src/composables/useSnackbar'
import { useQuasar } from 'quasar'
import PinActionModals2 from 'components/users/PinActionModals2.vue'
import PinSetupModal from 'components/users/PinSetupModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const snackbar = useSnackbar()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// PIN data
const pin = ref('')
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const hasPinSetup = ref(false)
const showEmailLogin = ref(false)

// PIN setup
const showSetupPinModal = ref(false)
const showPinSetupModal = ref(false)
const setupPinLoading = ref(false)

// Check if PIN is setup on mount
onMounted(async () => {
  hasPinSetup.value = authStore.hasPinSetup()
})

// PIN Login Functions
const handlePinInput = (index, value) => {
  const digit = value.toString().slice(-1)

  if (!/^\d*$/.test(digit)) {
    pinDigits.value[index] = ''
    return
  }

  pinDigits.value[index] = digit
  pin.value = pinDigits.value.join('')

  // Auto-focus next field
  if (digit && index < 3) {
    setTimeout(() => {
      const nextInput = pinInputs.value[index + 1]
      if (nextInput && nextInput.$el) {
        const inputEl = nextInput.$el.querySelector('input')
        if (inputEl) {
          inputEl.focus()
          inputEl.select()
        }
      }
    }, 50)
  }

  // Auto-login when complete
  if (pin.value.length === 4 && !/[^0-9]/.test(pin.value)) {
    setTimeout(() => loginWithPin(), 300)
  }
}

const handleBackspace = (index) => {
  if (!pinDigits.value[index] && index > 0) {
    setTimeout(() => {
      const prevInput = pinInputs.value[index - 1]
      if (prevInput && prevInput.$el) {
        const inputEl = prevInput.$el.querySelector('input')
        if (inputEl) {
          inputEl.focus()
        }
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
      router.push('/dashboard')
    } else {
      snackbar.error('PIN non corretto')
      pin.value = ''
      pinDigits.value = ['', '', '', '']
    }
  } finally {
    loading.value = false
  }
}

const confirmDeletePin = async () => {
  try {
    await authStore.clearPinData()
    hasPinSetup.value = false
    showEmailLogin.value = true
  } catch (error) {
    console.error('Errore cancellazione PIN:', error)
    snackbar.error('Errore nella cancellazione del PIN')
  }
}

// Email Login Function
const handleLogin = async () => {
  if (!email.value || !password.value) {
    snackbar.error('Inserisci email e password')
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value)

    // Se "Ricordami" è selezionato e non ha già un PIN, chiedi se vuole impostarlo
    if (rememberMe.value && !authStore.hasPinSetup()) {
      showSetupPinModal.value = true
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Errore login:', error)
    snackbar.error('Credenziali non valide')
  } finally {
    loading.value = false
  }
}

const confirmPin = () => {
  showSetupPinModal.value = false
  showPinSetupModal.value = true
}

const cancelPin = () => {
  showSetupPinModal.value = false
  router.push('/dashboard')
}

const confirmSetupPin = async (pin) => {
  setupPinLoading.value = true
  try {
    await authStore.setupPin(pin)
    snackbar.success('PIN impostato con successo!')
  } catch (error) {
    console.error('Errore setup PIN:', error)
    snackbar.error('Errore durante l\'impostazione del PIN')
  } finally {
    setupPinLoading.value = false
    showPinSetupModal.value = false

    // Naviga alla dashboard dopo un piccolo delay per permettere alla modale di chiudersi
    setTimeout(() => {
      router.push('/dashboard')
    }, 300)
  }
}

const closePinSetupModal = () => {
  showPinSetupModal.value = false
  setupPinLoading.value = false
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
.ticket-page {
  background: linear-gradient(135deg, #f0f4f8 0%, #e8eef3 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.ticket-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.ticket-card {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 25px 20px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: visible;

  /* Perforations using radial gradients */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20px;
    bottom: 20px;
    width: 8px;
    background:
      radial-gradient(circle at 0 10px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 0 30px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 0 50px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 0 70px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 0 90px, transparent 4px, #f5f5f5 4px);
    background-size: 8px 20px;
    background-repeat: repeat-y;
    z-index: 10;
  }

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20px;
    bottom: 20px;
    width: 8px;
    background:
      radial-gradient(circle at 8px 10px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 8px 30px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 8px 50px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 8px 70px, transparent 4px, #f5f5f5 4px),
      radial-gradient(circle at 8px 90px, transparent 4px, #f5f5f5 4px);
    background-size: 8px 20px;
    background-repeat: repeat-y;
    z-index: 10;
  }

  @media (min-width: 768px) {
    padding: 30px 25px;
  }
}

/* Header */
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.ticket-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: -20px;
}

.logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-left: 20px;
}

.brand-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-badge {
  background: #2a5f82;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
  align-self: flex-start;
  margin-left: -40px;
  padding-left: 20px;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.barcode {
  width: 100px;
  height: 20px;
  margin-left: -40px;
  padding-left: 20px;
}

.checkin-code {
  text-align: right;
  margin-right: -10px;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.logo-img-right {
  width: 80px;
  height: 80px;
  margin-top: -20px;
  position: relative;
  filter: brightness(0) saturate(100%) invert(32%) sepia(38%) saturate(863%) hue-rotate(162deg) brightness(93%) contrast(87%);
  border: 1px solid #2a5f82;
  border-radius: 25px;
}

@keyframes hologram {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 200%;
  }
}

.code-value {
  font-size: 12px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
}

/* Logo Section */
.qr-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.logo-placeholder {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.main-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Event Info */
.event-info {
  margin-bottom: 20px;
}

.info-label {
  font-size: 9px;
  font-weight: 600;
  color: #666666;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  margin-top: 10px;

  &:first-child {
    margin-top: 0;
  }
}

.info-value {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

.reset-link {
  text-decoration: none;
  color: #000000;
  display: block;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
}

.login-input {
  margin-bottom: 6px;

  :deep(.q-field__control) {
    background: #ffffff;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    min-height: 40px;
  }

  :deep(.q-field__native) {
    font-weight: 500;
    color: #000000;
  }

  :deep(input::placeholder) {
    color: #999999;
    font-weight: 400;
  }
}

.login-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
}

.remember-checkbox {
  :deep(.q-checkbox__label) {
    font-size: 13px;
    font-weight: 500;
    color: #000000;
  }
}

.login-btn {
  flex: 1;
  max-width: 180px;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 16px;
  color: #000000;
}

/* Dashed Separator */
.ticket-separator {
  margin: 20px -20px;
  padding: 0 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    background: #B4B8BB;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 20;
  }

  &::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    background: #B3B6B9;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 20;
  }
}

.dashed-line {
  width: 100%;
  height: 2px;
  background-image: repeating-linear-gradient(
    to right,
    #cccccc 0,
    #cccccc 8px,
    transparent 8px,
    transparent 16px
  );
}

/* Bottom Section */
.ticket-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.bottom-left {
  flex: 1;
}

.bottom-right {
  text-align: right;
}

.seat-number {
  font-size: 48px;
  font-weight: 900;
  color: #000000;
  line-height: 1;
  letter-spacing: -2px;
}

/* Footer */
.ticket-footer {
  text-align: center;
}

.footer-text {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
}

/* PIN Input Styles */
.pin-input-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pin-field {
  width: 50px;

  :deep(.q-field__control) {
    background: #ffffff;
    border-radius: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #000000;
    min-height: 50px;
    text-align: center;
  }

  :deep(.q-field__native) {
    font-weight: 700;
    color: #000000;
    text-align: center;
  }

  // Focus styling
  :deep(.q-field--focused .q-field__control) {
    box-shadow: 0 0 0 2px #2a5f82 !important;
  }

  :deep(.q-field__control:before),
  :deep(.q-field__control:after) {
    border: none !important;
  }
}

.switch-btn,
.delete-pin-btn {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
</style>
