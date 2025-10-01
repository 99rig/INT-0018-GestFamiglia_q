<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    full-width
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="margin: 0; border-radius: 0 0 16px 16px; display: flex; flex-direction: column;" class="mcf-pin-setup-modal">
      <!-- Header -->
      <q-card-section class="mcf-pin-header">
        <div class="mcf-pin-icon-container">
          <q-icon name="lock" class="mcf-pin-icon" />
        </div>
        <h3 class="mcf-pin-title">{{ step === 1 ? 'Imposta PIN' : 'Conferma PIN' }}</h3>
        <p class="mcf-pin-subtitle">
          {{ step === 1 ? 'Scegli un PIN di 4 cifre per accessi più veloci e sicuri' : 'Reinserisci il PIN per confermare' }}
        </p>
      </q-card-section>

      <!-- PIN Input -->
      <q-card-section class="mcf-pin-input-section">
        <div class="mcf-pin-inputs-container">
          <q-input
            v-for="(digit, index) in pinDigits"
            :key="index"
            :ref="el => pinInputs[index] = el"
            v-model="pinDigits[index]"
            class="mcf-pin-input"
            outlined
            dense
            maxlength="1"
            input-class="text-center"
            inputmode="numeric"
            pattern="[0-9]"
            @update:model-value="(val) => handlePinInput(index, val)"
            @keydown="handleKeydown($event, index)"
            :disable="loading"
          />
        </div>

        <!-- PIN Strength Indicator -->
        <div class="mcf-pin-strength">
          <div class="mcf-strength-dots">
            <div
              v-for="i in 4"
              :key="i"
              class="mcf-strength-dot"
              :class="{ 'active': pinDigits[i-1] !== '' }"
            />
          </div>
          <p class="mcf-strength-text">
            Inserisci 4 cifre per creare il tuo PIN
          </p>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="mcf-pin-actions">
        <q-btn
          flat
          label="Annulla"
          color="grey-7"
          @click="onCancel"
          :disable="loading"
          class="mcf-pin-cancel-btn"
        />
        <q-btn
          unelevated
          label="Conferma PIN"
          color="primary"
          @click="onConfirm"
          :loading="loading"
          :disable="pinDigits.filter(d => d !== '').length < 4"
          class="mcf-pin-confirm-btn"
        />
      </q-card-actions>

      <!-- Security Note -->
      <q-card-section class="mcf-pin-security-note">
        <div class="mcf-security-info">
          <q-icon name="info" class="mcf-security-icon" />
          <span class="mcf-security-text">
            Il PIN viene salvato in modo sicuro sul tuo dispositivo
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// State
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const step = ref(1) // 1 = inserimento, 2 = conferma
const firstPin = ref('')

// Methods
const handlePinInput = (index, value) => {
  // Prendi solo l'ultima cifra se inserito più di un carattere
  const digit = value.toString().slice(-1)

  // Accetta solo numeri
  if (!/^\d*$/.test(digit)) {
    pinDigits.value[index] = ''
    return
  }

  pinDigits.value[index] = digit

  // Auto-focus al campo successivo
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

  // Auto-passa allo step 2 o auto-conferma quando tutti i 4 campi sono compilati
  const fullPin = pinDigits.value.join('')
  if (fullPin.length === 4 && !/[^0-9]/.test(fullPin)) {
    if (step.value === 1) {
      // Primo step: passa automaticamente allo step 2
      setTimeout(() => {
        firstPin.value = fullPin
        step.value = 2
        pinDigits.value = ['', '', '', '']
        // Focus sul primo campo
        setTimeout(() => {
          const firstInput = pinInputs.value[0]
          if (firstInput && firstInput.$el) {
            const inputEl = firstInput.$el.querySelector('input')
            if (inputEl) {
              inputEl.focus()
            }
          }
        }, 100)
      }, 300)
    } else {
      // Secondo step: verifica e conferma automaticamente
      setTimeout(() => {
        if (fullPin === firstPin.value) {
          emit('confirm', fullPin)
          resetForm()
        } else {
          // I PIN non corrispondono
          alert('I PIN non corrispondono. Riprova.')
          step.value = 1
          firstPin.value = ''
          pinDigits.value = ['', '', '', '']
          setTimeout(() => {
            const firstInput = pinInputs.value[0]
            if (firstInput && firstInput.$el) {
              const inputEl = firstInput.$el.querySelector('input')
              if (inputEl) {
                inputEl.focus()
              }
            }
          }, 100)
        }
      }, 300)
    }
  }
}

const handleKeydown = (event, index) => {
  if (event.key === 'Backspace' && pinDigits.value[index] === '' && index > 0) {
    setTimeout(() => {
      const prevInput = pinInputs.value[index - 1]
      if (prevInput && prevInput.$el) {
        const inputEl = prevInput.$el.querySelector('input')
        if (inputEl) {
          inputEl.focus()
          inputEl.select()
        }
      }
    }, 10)
  }
}

const onConfirm = () => {
  const fullPin = pinDigits.value.join('')

  if (step.value === 1) {
    // Primo step: salva il PIN e passa al secondo step
    firstPin.value = fullPin
    step.value = 2
    pinDigits.value = ['', '', '', '']
    // Focus sul primo campo
    setTimeout(() => {
      const firstInput = pinInputs.value[0]
      if (firstInput && firstInput.$el) {
        const inputEl = firstInput.$el.querySelector('input')
        if (inputEl) {
          inputEl.focus()
        }
      }
    }, 100)
  } else {
    // Secondo step: verifica che i PIN corrispondano
    if (fullPin === firstPin.value) {
      emit('confirm', fullPin)
      resetForm()
    } else {
      // I PIN non corrispondono, mostra errore e ricomincia
      alert('I PIN non corrispondono. Riprova.')
      step.value = 1
      firstPin.value = ''
      pinDigits.value = ['', '', '', '']
      setTimeout(() => {
        const firstInput = pinInputs.value[0]
        if (firstInput && firstInput.$el) {
          const inputEl = firstInput.$el.querySelector('input')
          if (inputEl) {
            inputEl.focus()
          }
        }
      }, 100)
    }
  }
}

const onCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  pinDigits.value = ['', '', '', '']
  step.value = 1
  firstPin.value = ''
}

// Reset form when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    resetForm()
  } else {
    // Focus sul primo campo quando si apre
    setTimeout(() => {
      const firstInput = pinInputs.value[0]
      if (firstInput && firstInput.$el) {
        const inputEl = firstInput.$el.querySelector('input')
        if (inputEl) {
          inputEl.focus()
        }
      }
    }, 300)
  }
})
</script>

<style lang="scss" scoped>
/* === PIN SETUP MODAL === */
.mcf-pin-setup-modal {
  min-width: 400px;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.mcf-pin-header {
  text-align: center;
  padding: 32px 24px 24px;
  background: linear-gradient(135deg, #239db0 0%, #2a5f82 100%);
  color: white;
  position: relative;
}

.mcf-pin-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mcf-pin-icon {
  font-size: 36px;
  color: white;
}

.mcf-pin-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: white;
}

.mcf-pin-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.mcf-pin-input-section {
  padding: 32px 24px;
  text-align: center;
}

.mcf-pin-inputs-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.mcf-pin-input {
  width: 60px;
  height: 60px;
}

.mcf-pin-input :deep(.q-field__control) {
  height: 60px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.mcf-pin-input :deep(.q-field__control):hover {
  border-color: #239db0;
  box-shadow: 0 0 0 3px rgba(35, 157, 176, 0.1);
}

.mcf-pin-input :deep(.q-field--focused .q-field__control) {
  border-color: #239db0 !important;
  box-shadow: 0 0 0 3px rgba(35, 157, 176, 0.2) !important;
}

.mcf-pin-input :deep(.q-field__native) {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
}

.mcf-pin-strength {
  margin-top: 16px;
}

.mcf-strength-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.mcf-strength-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.mcf-strength-dot.active {
  background: #239db0;
  transform: scale(1.2);
}

.mcf-strength-text {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.mcf-pin-actions {
  padding: 0 24px 24px;
  justify-content: space-between;
  gap: 12px;
}

.mcf-pin-cancel-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
}

.mcf-pin-confirm-btn {
  flex: 2;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.mcf-pin-security-note {
  padding: 16px 24px 24px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
}

.mcf-security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mcf-security-icon {
  font-size: 16px;
  color: #64748b;
}

.mcf-security-text {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

// Responsive
@media (max-width: 600px) {
  .mcf-pin-setup-modal {
    margin: 0;
    width: 100vw;
    max-width: none;
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }

  .mcf-pin-header {
    padding: 24px 20px 20px;
  }

  .mcf-pin-input-section {
    padding: 24px 20px;
  }

  .mcf-pin-actions {
    padding: 0 20px 24px;
    justify-content: space-between;
  }

  .mcf-pin-security-note {
    padding: 16px 20px 24px;
  }
}
</style>