<template>
  <MCFModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    content-style="overflow-y: auto;"
  >
    <!-- Header with Stats (optional) -->
    <template #header>
      <div class="text-h6">{{ title }}</div>
      <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">{{ subtitle }}</div>

      <!-- Stats section for forms like "Add Payment" -->
      <div v-if="stats" class="q-mt-sm">
        <div class="text-subtitle1 text-weight-medium">{{ statsTitle }}</div>
        <div class="q-mt-sm">
          <div class="row q-col-gutter-md">
            <div v-for="stat in stats" :key="stat.label" class="col-4">
              <div class="text-caption text-grey-6">{{ stat.label }}</div>
              <div class="text-body2 text-weight-medium" :class="stat.colorClass">
                {{ stat.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Form Content -->
    <q-form @submit.prevent="$emit('submit')" class="q-gutter-sm">
      <slot></slot>
    </q-form>

    <!-- Actions -->
    <template #actions>
      <q-btn flat :label="cancelLabel" v-close-popup @click="$emit('cancel')"/>
      <q-btn
        flat
        :label="submitLabel"
        color="primary"
        @click="$emit('submit')"
        :loading="loading"
        :disable="disable"
      />
    </template>
  </MCFModal>
</template>

<script setup>
import MCFModal from './MCFModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  statsTitle: {
    type: String,
    default: ''
  },
  stats: {
    type: Array,
    default: () => []
    // Expected format: [{ label: 'Totale spesa', value: '€100', colorClass: '' }]
  },
  cancelLabel: {
    type: String,
    default: 'Annulla'
  },
  submitLabel: {
    type: String,
    default: 'Salva'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue', 'submit', 'cancel'])
</script>