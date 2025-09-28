<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="width: 500px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; border-radius: 16px;">
      <!-- Header Section -->
      <q-card-section
        v-if="$slots.header || title"
        class="flex-shrink-0 bg-grey-2"
        style="border-radius: 12px 12px 0 0;"
      >
        <slot name="header">
          <div class="text-h6">{{ title }}</div>
        </slot>
      </q-card-section>

      <!-- Content Section -->
      <q-card-section
        class="flex-grow-1"
        :class="contentClass"
        :style="contentStyle"
      >
        <slot></slot>
      </q-card-section>

      <!-- Actions Section -->
      <q-card-actions
        v-if="$slots.actions"
        align="right"
        class="flex-shrink-0 bg-grey-2"
        style="border-radius: 0 0 12px 12px;"
      >
        <slot name="actions"></slot>
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
  title: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: 'q-pt-none'
  },
  contentStyle: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>