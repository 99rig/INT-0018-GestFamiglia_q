<template>
  <q-select
    v-bind="$attrs"
    :class="['mcf-autocomplete', $attrs.class]"
    :bg-color="bgColor"
    :outlined="outlined"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    use-input
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
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
.mcf-autocomplete {
  /* Additional custom styles can go here */
}
</style>