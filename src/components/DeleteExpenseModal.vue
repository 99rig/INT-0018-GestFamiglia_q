<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="mcf-delete-expense-modal">
      <!-- Header -->
      <q-card-section class="mcf-delete-header">
        <div class="mcf-delete-icon">
          <q-icon name="delete_forever" />
        </div>
        <h3 class="mcf-delete-title">Elimina Spesa</h3>
      </q-card-section>

      <!-- Message -->
      <q-card-section class="mcf-delete-message">
        <p>Sei sicuro di voler eliminare la spesa</p>
        <p class="mcf-expense-name">"{{ expenseName }}"?</p>
        <p class="mcf-delete-subtitle">Questa azione non può essere annullata.</p>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="mcf-delete-actions">
        <q-btn
          flat
          label="Annulla"
          @click="$emit('cancel')"
          class="mcf-delete-cancel-btn"
        />
        <q-btn
          unelevated
          label="Elimina Spesa"
          color="negative"
          @click="$emit('confirm')"
          class="mcf-delete-confirm-btn"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  expenseName: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:modelValue',
  'confirm',
  'cancel'
])
</script>

<style lang="scss" scoped>
/* === DELETE EXPENSE MODAL === */
.mcf-delete-expense-modal {
  min-width: 360px;
  max-width: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.mcf-delete-header {
  text-align: center;
  padding: 24px 20px 16px;
  background: linear-gradient(135deg, #f5c6ca 0%, #e09398 100%);
  color: #5a5a5a;
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

.mcf-expense-name {
  font-weight: 600 !important;
  color: #1f2937 !important;
  font-size: 16px !important;
  margin: 8px 0 !important;
}

.mcf-delete-subtitle {
  font-size: 14px !important;
  color: #6b7280 !important;
  margin: 12px 0 0 !important;
}

.mcf-delete-actions {
  padding: 0 20px 20px;
  gap: 12px;
}

.mcf-delete-cancel-btn,
.mcf-delete-confirm-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
}

// Responsive
@media (max-width: 600px) {
  .mcf-delete-expense-modal {
    margin: 16px;
    width: calc(100vw - 32px);
    max-width: none;
  }

  .mcf-delete-header {
    padding: 20px 16px 12px;
  }

  .mcf-delete-message {
    padding: 16px 20px;
  }

  .mcf-delete-actions {
    padding: 0 16px 16px;
  }
}
</style>
