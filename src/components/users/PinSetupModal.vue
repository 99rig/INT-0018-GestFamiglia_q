<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    full-width
    position="center"
  >
    <div class="ticket-container">
      <div class="ticket-card">
        <!-- Header Section -->
        <div class="ticket-header">
          <div class="ticket-logo">
            <img src="~/assets/wallet-icon-only.svg" alt="Logo" class="logo-img" />
            <div class="brand-section">
              <div class="brand-badge">
                <span class="logo-text">IMPOSTA PIN</span>
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

        <!-- PIN Setup Section -->
        <div class="event-info">
          <div class="info-label">SCEGLI UN PIN DI 4 CIFRE</div>

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
              @keydown="handleKeydown($event, i-1)"
              :ref="el => { if (el) pinInputs[i-1] = el }"
              :disable="loading"
            />
          </div>

          <!-- PIN Strength Indicator -->
          <div class="pin-strength">
            <div class="strength-dots">
              <div
                v-for="i in 4"
                :key="i"
                class="strength-dot"
                :class="{ 'active': pinDigits[i-1] !== '' }"
              />
            </div>
          </div>
        </div>

        <!-- Dashed Line Separator -->
        <div class="ticket-separator">
          <div class="dashed-line"></div>
        </div>

        <!-- Bottom Section with Actions -->
        <div class="ticket-bottom">
          <div class="bottom-left">
            <div class="info-label">SICUREZZA</div>
            <div class="info-value">Il PIN viene salvato in modo sicuro sul tuo dispositivo</div>
          </div>
          <div class="bottom-actions">
            <q-btn
              flat
              label="ANNULLA"
              color="grey-7"
              size="sm"
              @click="onCancel"
              :disable="loading"
              class="action-btn cancel-btn"
            />
            <q-btn
              unelevated
              label="CONFERMA"
              color="black"
              size="md"
              @click="onConfirm"
              :loading="loading"
              :disable="pinDigits.filter(d => d !== '').length < 4"
              class="action-btn confirm-btn"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="ticket-footer">
          <div class="footer-text">MUMBLE.GROUP</div>
        </div>
      </div>
    </div>
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

// Methods
const handlePinInput = (index, value) => {
  const digit = value.toString().slice(-1)

  if (!/^\d*$/.test(digit)) {
    pinDigits.value[index] = ''
    return
  }

  pinDigits.value[index] = digit

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

// Reset form when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    resetForm()
  } else {
    // Focus on first field when opening
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
.ticket-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.ticket-card {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 25px 20px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: visible;

  /* Perforations */
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
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
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

/* Event Info */
.event-info {
  margin-bottom: 20px;
}

.info-label {
  font-size: 9px;
  font-weight: 600;
  color: #666666;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.info-value {
  font-size: 11px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.3px;
  line-height: 1.4;
  margin-bottom: 8px;
}

/* PIN Input Styles */
.pin-input-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 15px;
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

/* PIN Strength */
.pin-strength {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.strength-dots {
  display: flex;
  gap: 8px;
}

.strength-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cccccc;
  transition: all 0.3s ease;
}

.strength-dot.active {
  background: #2a5f82;
  transform: scale(1.2);
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
  margin-bottom: 15px;
}

.bottom-left {
  margin-bottom: 15px;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cancel-btn {
  flex: 1;
  font-size: 12px;
}

.confirm-btn {
  flex: 2;
  font-size: 14px;
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

/* Responsive */
@media (max-width: 600px) {
  .ticket-container {
    padding: 10px;
  }

  .ticket-card {
    padding: 20px 15px;
  }

  .pin-field {
    width: 45px;

    :deep(.q-field__control) {
      min-height: 45px;
      font-size: 18px;
    }
  }
}
</style>
