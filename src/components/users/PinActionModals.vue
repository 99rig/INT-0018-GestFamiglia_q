<template>
  <!-- Want PIN Modal -->
  <q-dialog
    :model-value="showWantPin"
    @update:model-value="$emit('update:showWantPin', $event)"
    persistent
    full-width
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="margin: 0; border-radius: 0 0 16px 16px; display: flex; flex-direction: column;" class="mcf-want-pin-modal" flat>
      <!-- Header -->
      <q-card-section class="mcf-want-pin-header">
        <div class="mcf-want-pin-icon">
          <q-icon name="speed" />
        </div>
        <h3 class="mcf-want-pin-title">Accesso Veloce</h3>
      </q-card-section>

      <!-- Message -->
      <q-card-section class="mcf-want-pin-message">
        <p>Vuoi impostare un PIN per accessi più veloci?</p>
        <p class="mcf-want-pin-subtitle">Potrai accedere rapidamente con solo 4 cifre.</p>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="mcf-want-pin-actions">
        <q-btn
          flat
          label="No, grazie"
          @click="$emit('decline')"
          class="mcf-want-pin-decline-btn"
        />
        <q-btn
          unelevated
          label="Sì, imposta PIN"
          color="primary"
          @click="$emit('accept')"
          class="mcf-want-pin-accept-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Delete PIN Modal -->
  <q-dialog
    :model-value="showDeletePin"
    @update:model-value="$emit('update:showDeletePin', $event)"
    persistent
    full-width
    position="top"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="margin: 0; border-radius: 0 0 16px 16px; display: flex; flex-direction: column;" class="mcf-delete-pin-modal" flat>
      <!-- Header -->
      <q-card-section class="mcf-delete-header">
        <div class="mcf-delete-icon">
          <q-icon name="warning" />
        </div>
        <h3 class="mcf-delete-title">Cancella PIN</h3>
      </q-card-section>

      <!-- Message -->
      <q-card-section class="mcf-delete-message">
        <p>Sei sicuro di voler cancellare il PIN?</p>
        <p class="mcf-delete-subtitle">Dovrai usare email e password per accedere.</p>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="mcf-delete-actions">
        <q-btn
          flat
          label="Annulla"
          @click="$emit('cancelDelete')"
          class="mcf-delete-cancel-btn"
        />
        <q-btn
          unelevated
          label="Cancella PIN"
          color="negative"
          @click="$emit('confirmDelete')"
          class="mcf-delete-confirm-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  showWantPin: {
    type: Boolean,
    default: false
  },
  showDeletePin: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:showWantPin',
  'update:showDeletePin',
  'accept',
  'decline',
  'confirmDelete',
  'cancelDelete'
])
</script>

<style lang="scss" scoped>
/* === WANT PIN MODAL === */
.mcf-want-pin-modal {
  min-width: 360px;
  max-width: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: none;
}

.mcf-want-pin-header {
  text-align: center;
  padding: 24px 20px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.mcf-want-pin-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mcf-want-pin-icon .q-icon {
  font-size: 28px;
}

.mcf-want-pin-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.mcf-want-pin-message {
  padding: 20px 24px;
  text-align: center;
}

.mcf-want-pin-message p {
  margin: 0 0 8px;
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.mcf-want-pin-subtitle {
  font-size: 14px !important;
  color: #6b7280 !important;
  margin: 0 !important;
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

/* === DELETE PIN MODAL === */
.mcf-delete-pin-modal {
  min-width: 360px;
  max-width: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: none;
}

.mcf-delete-header {
  text-align: center;
  padding: 24px 20px 16px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.mcf-delete-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mcf-delete-icon .q-icon {
  font-size: 28px;
}

.mcf-delete-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.mcf-delete-message {
  padding: 20px 24px;
  text-align: center;
}

.mcf-delete-message p {
  margin: 0 0 8px;
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.mcf-delete-subtitle {
  font-size: 14px !important;
  color: #6b7280 !important;
  margin: 0 !important;
}

.mcf-delete-actions {
  padding: 0 24px 24px;
  justify-content: space-between;
  gap: 12px;
}

.mcf-delete-cancel-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
}

.mcf-delete-confirm-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: none;
}

// Responsive
@media (max-width: 600px) {
  .mcf-want-pin-modal,
  .mcf-delete-pin-modal {
    margin: 0;
    width: 100vw;
    max-width: none;
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }

  .mcf-want-pin-header,
  .mcf-delete-header {
    padding: 20px 16px 12px;
  }

  .mcf-want-pin-message,
  .mcf-delete-message {
    padding: 16px 20px;
  }

  .mcf-want-pin-actions,
  .mcf-delete-actions {
    padding: 0 20px 24px;
    justify-content: space-between;
  }

  .mcf-want-pin-decline-btn,
  .mcf-want-pin-accept-btn,
  .mcf-delete-cancel-btn,
  .mcf-delete-confirm-btn {
    flex: 1;
    height: 48px;
    border-radius: 12px;
    font-weight: 500;
  }

  .mcf-want-pin-accept-btn {
    flex: 2;
    font-weight: 600;
  }
}
</style>