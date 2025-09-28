<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="mcf-reset-password-page">
    <div class="mcf-reset-password-container">
      <!-- Header -->
      <div class="mcf-header">
        <div class="mcf-header-content">
          <h1 class="mcf-page-title">Nuova Password</h1>
          <p class="mcf-page-subtitle">Inserisci la tua nuova password</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="mcf-content">
        <div class="mcf-reset-card">
          <div class="mcf-card-header">
            <q-icon name="lock_open" class="mcf-card-icon" />
            <h2 class="mcf-card-title">Reimposta Password</h2>
          </div>

          <!-- Token Error -->
          <div v-if="tokenError" class="mcf-error-message">
            <q-icon name="error" />
            <div>
              <h3>Link non valido</h3>
              <p>{{ tokenError }}</p>
              <router-link to="/forgot-password" class="mcf-link">
                Richiedi un nuovo link
              </router-link>
            </div>
          </div>

          <!-- Reset Form -->
          <q-form v-else @submit="handleSubmit" class="mcf-form">
            <div class="mcf-form-field">
              <q-input
                v-model="formData.new_password"
                type="password"
                label="Nuova Password *"
                outlined
                required
                :error="!!errors.new_password"
                :error-message="errors.new_password"
                class="mcf-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </div>

            <div class="mcf-form-field">
              <q-input
                v-model="formData.new_password2"
                type="password"
                label="Conferma Nuova Password *"
                outlined
                required
                :error="!!errors.new_password2"
                :error-message="errors.new_password2"
                class="mcf-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </div>

            <div class="mcf-form-actions">
              <q-btn
                type="submit"
                unelevated
                color="primary"
                :loading="loading"
                :disable="!isFormValid"
                class="mcf-submit-btn"
              >
                Cambia Password
              </q-btn>

              <div class="mcf-login-link">
                <span>Password cambiata?</span>
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
              <h3>Password cambiata!</h3>
              <p>La tua password è stata cambiata con successo. Ora puoi effettuare il login.</p>
              <router-link to="/login" class="mcf-btn-link">
                Vai al Login
              </router-link>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usersAPI } from 'src/services/api/users.js'
import { useSnackbar } from 'src/composables/useSnackbar'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbar()

// Form data
const formData = ref({
  token: '',
  new_password: '',
  new_password2: ''
})

const errors = ref({})
const loading = ref(false)
const showSuccess = ref(false)
const tokenError = ref('')

// Computed
const isFormValid = computed(() => {
  return formData.value.new_password &&
         formData.value.new_password2 &&
         formData.value.new_password === formData.value.new_password2
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (formData.value.new_password !== formData.value.new_password2) {
      errors.value.new_password2 = 'Le password non corrispondono'
    }
    return
  }

  loading.value = true
  errors.value = {}

  try {
    await usersAPI.confirmPasswordReset({
      token: formData.value.token,
      new_password: formData.value.new_password,
      new_password2: formData.value.new_password2
    })

    showSuccess.value = true
    snackbar.success('Password cambiata con successo!')

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)

  } catch (error) {
    console.error('Password reset confirm error:', error)

    if (error.response?.data) {
      const errorData = error.response.data

      if (typeof errorData === 'object') {
        // Field-specific errors
        errors.value = errorData

        // Handle token-specific errors
        if (errorData.token) {
          tokenError.value = Array.isArray(errorData.token)
            ? errorData.token[0]
            : errorData.token
        }
      } else {
        snackbar.error(errorData.detail || 'Errore durante il reset della password')
      }
    } else {
      snackbar.error('Errore di connessione durante il reset della password')
    }
  } finally {
    loading.value = false
  }
}

// Get token from URL on mount
onMounted(() => {
  const token = route.query.token
  if (!token) {
    tokenError.value = 'Token mancante nell\'URL'
  } else {
    formData.value.token = token
  }
})
</script>

<style lang="scss" scoped>
.mcf-reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.mcf-reset-password-container {
  width: 100%;
  max-width: 480px;
}

.mcf-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
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

.mcf-reset-card {
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

.mcf-error-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .q-icon {
    font-size: 24px;
    color: #f44336;
    margin-top: 2px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #c62828;
  }

  p {
    font-size: 14px;
    margin: 0 0 8px 0;
    color: #d32f2f;
    line-height: 1.4;
  }

  .mcf-link {
    color: var(--mcf-primary);
    text-decoration: none;
    font-weight: 500;

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
    margin: 0 0 12px 0;
    color: #388e3c;
    line-height: 1.4;
  }

  .mcf-btn-link {
    display: inline-block;
    background: var(--mcf-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.3s ease;

    &:hover {
      background: #1e7a8c;
    }
  }
}

@media (max-width: 600px) {
  .mcf-reset-password-page {
    padding: 16px;
  }

  .mcf-page-title {
    font-size: 24px;
  }

  .mcf-reset-card {
    padding: 24px;
  }

  .mcf-card-title {
    font-size: 20px;
  }
}
</style>