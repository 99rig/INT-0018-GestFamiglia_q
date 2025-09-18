<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center mcf-login-page">
        <div class="mcf-login-container">
          <!-- Modern App Logo -->
          <div class="mcf-login-header">
            <div class="mcf-welcome-text">
              <h1 class="mcf-app-title">Registrazione</h1>
              <p class="mcf-app-subtitle">Crea il tuo account My Crazy Family</p>
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

          <!-- Registration Form -->
          <q-card class="mcf-login-card q-pa-md">
            <q-card-section>
              <q-input
                v-model="firstName"
                label="Nome"
                type="text"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Nome richiesto']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="lastName"
                label="Cognome"
                type="text"
                outlined
                dense
                class="q-mb-md"
                :rules="[val => !!val || 'Cognome richiesto']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                dense
                class="q-mb-md"
                :rules="[
                  val => !!val || 'Email richiesta',
                  val => /.+@.+\..+/.test(val) || 'Email non valida'
                ]"
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
                :rules="[
                  val => !!val || 'Password richiesta',
                  val => val.length >= 6 || 'Password deve essere di almeno 6 caratteri'
                ]"
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

              <q-input
                v-model="confirmPassword"
                label="Conferma Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                outlined
                dense
                class="q-mb-md"
                :rules="[
                  val => !!val || 'Conferma password richiesta',
                  val => val === password || 'Le password non coincidono'
                ]"
                @keyup.enter="register"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>

              <!-- Family Invitation Code (Optional) -->
              <q-input
                v-model="invitationCode"
                label="Codice Invito Famiglia (opzionale)"
                type="text"
                outlined
                dense
                class="q-mb-md"
                hint="Se hai ricevuto un codice invito, inseriscilo qui"
              >
                <template v-slot:prepend>
                  <q-icon name="group_add" />
                </template>
              </q-input>

              <!-- Terms and Conditions -->
              <q-checkbox
                v-model="acceptTerms"
                class="q-mb-md"
              >
                <span class="text-body2">
                  Accetto i <a href="#" class="text-primary">termini e condizioni</a>
                </span>
              </q-checkbox>

              <!-- Register Button -->
              <q-btn
                label="Registrati"
                @click="register"
                class="full-width mcf-btn-primary q-mb-md"
                :loading="loading"
                :disable="!isFormValid"
              />

              <!-- Login Link -->
              <div class="text-center">
                <span class="text-body2 text-grey-7">Hai già un account? </span>
                <q-btn
                  label="Accedi"
                  flat
                  dense
                  no-caps
                  color="primary"
                  @click="goToLogin"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth.js'
import { api } from 'src/services/api'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Form data
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const invitationCode = ref('')
const acceptTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

// Computed
const isFormValid = computed(() => {
  return firstName.value &&
         lastName.value &&
         email.value &&
         /.+@.+\..+/.test(email.value) &&
         password.value &&
         password.value.length >= 6 &&
         confirmPassword.value &&
         password.value === confirmPassword.value &&
         acceptTerms.value
})

// Methods
const register = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    // Prepara i dati per la registrazione
    const userData = {
      email: email.value,
      password: password.value,
      password2: confirmPassword.value,
      first_name: firstName.value,
      last_name: lastName.value
    }

    // Se c'è un codice invito, aggiungilo
    if (invitationCode.value) {
      userData.invitation_code = invitationCode.value
    }

    // Chiama l'API di registrazione
    const response = await api.register(userData)

    $q.notify({
      type: 'positive',
      message: 'Registrazione completata con successo!',
      position: 'top',
      timeout: 2000
    })

    // Se la registrazione include già i token, effettua il login automatico
    if (response.access && response.refresh) {
      // Salva i token e i dati utente
      authStore.accessToken = response.access
      authStore.refreshToken = response.refresh
      authStore.user = response.user || { email: email.value }

      // Vai alla dashboard
      router.push('/dashboard')
    } else {
      // Altrimenti vai al login
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }

  } catch (error) {
    console.error('Errore registrazione:', error)

    // Gestisci errori specifici
    let errorMessage = 'Errore durante la registrazione. Riprova.'

    if (error.response?.data) {
      if (error.response.data.email) {
        errorMessage = 'Email già registrata'
      } else if (error.response.data.invitation_code) {
        errorMessage = 'Codice invito non valido'
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0]
      }
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
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

/* === BUTTON STYLES === */
.mcf-btn-primary {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(35, 157, 176, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(35, 157, 176, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>