<template>
  <q-file
    v-bind="$attrs"
    :class="['mcf-file', $attrs.class]"
    :bg-color="bgColor"
    :outlined="outlined"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: File,
    default: null
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
.mcf-file {
  /* Additional custom styles can go here */
}
</style>