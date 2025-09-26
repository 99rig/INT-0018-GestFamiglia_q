<template>
  <q-input
    v-bind="$attrs"
    :class="['mcf-input', $attrs.class]"
    :bg-color="bgColor"
    :outlined="outlined"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  bgColor: {
    type: String,
    default: 'white'
  },
  outlined: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Inherit attributes
defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
.mcf-input {
  border-radius: 15px !important;
  /* Additional custom styles can go here */
}
</style>
