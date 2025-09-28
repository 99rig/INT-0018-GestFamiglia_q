<template>
  <MCFModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    content-style="overflow-y: auto;"
  >
    <!-- Header with Stats -->
    <template #header>
      <div class="text-h6">{{ title }}</div>
      <div class="q-mt-sm">
        <div class="text-subtitle1 text-weight-medium">{{ subtitle }}</div>
        <div v-if="stats" class="q-mt-sm">
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

    <!-- Content -->
    <slot></slot>

    <!-- Actions -->
    <template #actions>
      <slot name="actions"></slot>
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
  stats: {
    type: Array,
    default: () => []
    // Expected format: [{ label: 'Totale spesa', value: '€100', colorClass: '' }]
  }
})

defineEmits(['update:modelValue'])
</script>