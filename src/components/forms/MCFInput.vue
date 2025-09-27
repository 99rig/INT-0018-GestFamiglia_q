<template>
  <q-input
    v-bind="filteredAttrs"
    :class="['mcf-input', $attrs.class]"
    :bg-color="bgColor"
    :outlined="outlined"
    :model-value="modelValue"
    :placeholder="computedPlaceholder"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'

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
const attrs = useAttrs()

// Inherit attributes
defineOptions({
  inheritAttrs: false
})

// Gestione placeholder: se c'è una label, non mostrare il placeholder
const computedPlaceholder = computed(() => {
  // Se c'è una label, non usare il placeholder per evitare sovrapposizioni
  if (attrs.label) {
    return undefined
  }
  return attrs.placeholder
})

// Filtra gli attributi per evitare duplicazioni
const filteredAttrs = computed(() => {
  const { placeholder, ...rest } = attrs
  return rest
})
</script>

<style scoped>
.mcf-input {
  border-radius: 15px !important;
}

/* Miglioramenti per label e animazioni */
:deep(.q-field__label) {
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

/* Label quando è in alto (filled state) */
:deep(.q-field--float .q-field__label) {
  font-size: 12px;
  font-weight: 600;
  transform: translateY(-12px) scale(0.85);
}

/* Migliora il contrasto della label */
:deep(.q-field--outlined .q-field__label) {
  background: white;
  padding: 0 4px;
}

/* Rimuove qualsiasi placeholder quando c'è una label */
:deep(.q-field--labeled .q-field__control input::placeholder) {
  opacity: 0;
}

/* Assicura che il focus funzioni correttamente */
:deep(.q-field--focused .q-field__label) {
  color: var(--q-primary);
}
</style>
