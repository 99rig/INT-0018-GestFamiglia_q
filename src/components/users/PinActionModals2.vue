<template>
  <q-dialog
    :model-value="showWantPin"
    @update:model-value="$emit('update:showWantPin', $event)"
    persistent
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card class="modal-wrapper" flat>
      <div class="ticket-container">
      <div class="ticket-card">
        <!-- Header Section -->
        <div class="ticket-header">
          <div class="ticket-logo">
            <img :src="walletIcon" alt="Logo" class="logo-img" />
            <div class="brand-section">
              <div class="brand-badge">
                <span class="logo-text">VUOI IMPOSTARE UN PIN?</span>
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
            <img :src="walletIcon" alt="Logo" class="logo-img-right" />
          </div>
        </div>

        <!-- Message Section -->
        <div class="event-info">
          <div class="info-label">ACCESSO VELOCE E SICURO</div>
          <div class="info-value">Scegli un PIN di 4 cifre per accessi più veloci e sicuri al tuo account</div>
        </div>

        <!-- Dashed Line Separator -->
        <div class="ticket-separator">
          <div class="dashed-line"></div>
        </div>

        <!-- Bottom Section with Actions -->
        <div class="ticket-bottom">
          <div class="bottom-actions">
            <q-btn
              flat
              label="NO, GRAZIE"
              color="grey-7"
              size="sm"
              @click="onCancel"
              class="action-btn cancel-btn"
            />
            <q-btn
              unelevated
              label="SÌ, IMPOSTA PIN"
              color="black"
              size="md"
              @click="onConfirm"
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
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import walletIcon from 'assets/wallet-icon-only.svg'

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

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.modal-wrapper {
  background: linear-gradient(135deg, #f0f4f8 0%, #e8eef3 100%);
  width: 100%;
  max-width: 100vw;
  margin: 0;
  border-radius: 0 0 24px 24px;
  padding: 0;
}

.ticket-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}

.ticket-card {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 25px 20px;
  position: relative;
  box-shadow: none;
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
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
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
  padding: 0 10px;
}

.info-label {
  font-size: 9px;
  font-weight: 600;
  color: #666666;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.3px;
  line-height: 1.5;
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
    background: #f0f4f8;
    border-radius: 50%;
    box-shadow: none;
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
    background: #f0f4f8;
    border-radius: 50%;
    box-shadow: none;
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

.bottom-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px;
}

.action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cancel-btn {
  flex: 1;
  font-size: 11px;
}

.confirm-btn {
  flex: 2;
  font-size: 13px;
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
}
</style>
