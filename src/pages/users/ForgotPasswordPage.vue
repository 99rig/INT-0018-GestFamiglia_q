<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="mcf-forgot-password-page">
    <div class="mcf-forgot-password-container">
      <!-- Header with back button -->
      <div class="mcf-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="$router.go(-1)"
          class="mcf-back-btn"
        />
        <div class="mcf-header-content">
          <h1 class="mcf-page-title">Password Dimenticata</h1>
          <p class="mcf-page-subtitle">Inserisci la tua email per ricevere un link di reset</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="mcf-content">
        <div class="mcf-forgot-card">
          <div class="mcf-card-header">
            <q-icon name="lock_reset" class="mcf-card-icon" />
            <h2 class="mcf-card-title">Recupera Account</h2>
          </div>

          <q-form @submit="handleSubmit" class="mcf-form">
            <div class="mcf-form-field">
              <q-input
                v-model="email"
                type="email"
                label="Email *"
                outlined
                required
                :error="!!emailError"
                :error-message="emailError"
                class="mcf-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <div class="mcf-form-actions">
              <q-btn
                type="submit"
                unelevated
                color="primary"
                :loading="loading"
                :disable="!email"
                class="mcf-submit-btn"
              >
                Invia Link di Reset
              </q-btn>

              <div class="mcf-login-link">
                <span>Ti sei ricordato della password?</span>
                <router-link to="/login" class="mcf-link">
                  Accedi ora
                </router-link>
              </div>
            </div>
          </q-form>

          <!-- Success message -->
          <div v-if="showSuccess" class="mcf-success-message">
            <q-icon name="check_circle" />
            <div>
              <h3>Email inviata!</h3>
              <p>Se l'email esiste nel nostro sistema, riceverai un link per reimpostare la password.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usersAPI } from 'src/services/api/users.js'
import { useSnackbar } from 'src/composables/useSnackbar'

const router = useRouter()
const snackbar = useSnackbar()

// Form data
const email = ref('')
const emailError = ref('')
const loading = ref(false)
const showSuccess = ref(false)

const handleSubmit = async () => {
  if (!email.value) {
    emailError.value = 'Email richiesta'
    return
  }

  loading.value = true
  emailError.value = ''

  try {
    const response = await usersAPI.requestPasswordReset(email.value)

    showSuccess.value = true
    snackbar.success('Se l\'email esiste, riceverai un link di reset')

    // Per testing, mostra il token se presente
    if (response.token) {
      console.log('Reset token (for testing):', response.token)
      // In produzione questo non dovrebbe essere esposto
    }

  } catch (error) {
    console.error('Password reset request error:', error)

    if (error.response?.data?.email) {
      emailError.value = error.response.data.email[0]
    } else {
      snackbar.error('Errore durante la richiesta di reset. Riprova.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.mcf-forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.mcf-forgot-password-container {
  width: 100%;
  max-width: 480px;
}

.mcf-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  color: white;
}

.mcf-back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.mcf-header-content {
  flex: 1;
}

.mcf-page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: white;
}

.mcf-page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  color: white;
}

.mcf-content {
  width: 100%;
}

.mcf-forgot-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.mcf-card-header {
  text-align: center;
  margin-bottom: 32px;
}

.mcf-card-icon {
  font-size: 48px;
  color: var(--mcf-primary);
  margin-bottom: 16px;
}

.mcf-card-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--mcf-text-primary);
}

.mcf-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mcf-form-field {
  width: 100%;
}

.mcf-input {
  width: 100%;
}

.mcf-form-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mcf-submit-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  text-transform: none;
}

.mcf-login-link {
  text-align: center;
  font-size: 14px;
  color: var(--mcf-text-secondary);

  .mcf-link {
    color: var(--mcf-primary);
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.mcf-success-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;

  .q-icon {
    font-size: 24px;
    color: #4caf50;
    margin-top: 2px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #2e7d32;
  }

  p {
    font-size: 14px;
    margin: 0;
    color: #388e3c;
    line-height: 1.4;
  }
}

@media (max-width: 600px) {
  .mcf-forgot-password-page {
    padding: 16px;
  }

  .mcf-page-title {
    font-size: 24px;
  }

  .mcf-forgot-card {
    padding: 24px;
  }

  .mcf-card-title {
    font-size: 20px;
  }
}
</style>
