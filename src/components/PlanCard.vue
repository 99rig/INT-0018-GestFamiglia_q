<template>
  <q-card
    class="plan-card"
    :class="[statusClass, customClass, isMobile ? mobileShadowClass : shadowClass]"
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
  plan: {
    type: Object,
    required: true
  },
  statusClass: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: true
  },
  elevated: {
    type: [Number, String],
    default: 6,
    validator: (value) => {
      const num = Number(value)
      return num >= 0 && num <= 24
    }
  },
  mobileElevated: {
    type: [Number, String],
    default: 8,
    validator: (value) => {
      const num = Number(value)
      return num >= 0 && num <= 24
    }
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.plan)
  }
}

const isMobile = computed(() => $q.screen.lt.md)
const shadowClass = computed(() => `shadow-${props.elevated}`)
const mobileShadowClass = computed(() => `shadow-${props.mobileElevated}`)
</script>

<style lang="scss" scoped>
.plan-card {
  background: white !important;
  border: 1px solid #E0E0E0 !important;
  border-radius: 20px !important;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .plan-card {
    border-radius: 16px !important;
  }
}
</style>
