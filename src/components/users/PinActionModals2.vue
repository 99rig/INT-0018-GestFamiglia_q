<template>
  <q-dialog
    :model-value="showWantPin"
    @update:model-value="$emit('update:showWantPin', $event)"
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
        <h3 class="mcf-pin-title">Imposta PIN</h3>
        <p class="mcf-pin-subtitle">
          Scegli un PIN di 4 cifre per accessi più veloci e sicuri
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
      <q-card-actions class="mcf-want-pin-actions">
        <q-btn
          flat
          label="Annulla"
          @click="onCancel"
          class="mcf-want-pin-decline-btn"
        />
        <q-btn
          unelevated
          label="Imposta PIN"
          color="primary"
          @click="onConfirm"
          class="mcf-want-pin-accept-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showWantPin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:showWantPin',
  'confirm',
  'cancel'
])

// State
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])

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

  // Auto-conferma quando tutti i 4 campi sono compilati
  const fullPin = pinDigits.value.join('')
  if (fullPin.length === 4 && !/[^0-9]/.test(fullPin)) {
    setTimeout(() => onConfirm(), 300)
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
  if (fullPin.length === 4) {
    emit('confirm', fullPin)
  }
}

const onCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  pinDigits.value = ['', '', '', '']
}

// Reset form when modal closes and focus first input when opens
watch(() => props.showWantPin, (isOpen) => {
  if (!isOpen) {
    resetForm()
  } else {
    // Focus sul primo input quando la modale si apre
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
})
</script>

<style lang="scss" scoped>
.mcf-pin-setup-modal {
  border-radius: 20px;
  overflow: hidden;
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

.mcf-want-pin-actions {
  padding: 0 24px 24px;
  justify-content: space-between;
  gap: 12px;
}

.mcf-want-pin-decline-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
}

.mcf-want-pin-accept-btn {
  flex: 2;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}
</style>