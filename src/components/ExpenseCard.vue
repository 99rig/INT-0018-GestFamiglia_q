<template>
  <q-card
    class="expense-card"
    :class="[statusClass, isMobile ? mobileShadowClass : shadowClass]"
    @click="handleClick"
    :style="clickable ? 'cursor: pointer;' : ''"
    bordered
  >
    <slot></slot>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  expense: {
    type: Object,
    required: true
  },
  statusClass: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  },
  elevated: {
    type: [Number, String],
    default: 3,
    validator: (value) => {
      const num = Number(value)
      return num >= 0 && num <= 24
    }
  },
  mobileElevated: {
    type: [Number, String],
    default: 6,
    validator: (value) => {
      const num = Number(value)
      return num >= 0 && num <= 24
    }
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.expense)
  }
}

const isMobile = computed(() => $q.screen.lt.md)
const shadowClass = computed(() => `shadow-${props.elevated}`)
const mobileShadowClass = computed(() => `shadow-${props.mobileElevated}`)
</script>

<style lang="scss" scoped>
.expense-card {
  border-radius: 10px !important;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .expense-card {
    border-radius: 12px !important;
  }
}
</style>
