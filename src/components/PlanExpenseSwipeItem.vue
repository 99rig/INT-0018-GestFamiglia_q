<template>
  <div class="plan-expense-swipe-wrapper" :class="swipeClass">
    <!-- Mobile: Swipe Item -->
    <q-slide-item
      v-if="$q.screen.lt.md"
      v-bind="$attrs"
      @left="onSwipeLeft"
      @right="onSwipeRight"
      left-color="blue-grey-5"
      right-color="amber-7"
    >
      <!-- Swipe LEFT - Individual -->
      <template v-slot:left>
        <div class="row items-center q-gutter-sm">
          <q-icon name="person" size="24px" />
          <span class="text-weight-medium">Individuale</span>
        </div>
      </template>

      <!-- Swipe RIGHT - Partial -->
      <template v-slot:right>
        <div class="row items-center q-gutter-sm">
          <q-icon name="call_split" size="24px" />
          <span class="text-weight-medium">Parziale</span>
        </div>
      </template>

      <!-- Default slot - contenuto della spesa -->
      <slot></slot>
    </q-slide-item>

    <!-- Desktop: Container normale -->
    <div v-else class="desktop-expense-container">
      <slot :paymentTypeMenu="paymentTypeMenu"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  expense: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-payment-type'])

const swipeClass = computed(() => {
  return props.expense.payment_type === 'individual'
    ? 'expense-individual'
    : props.expense.payment_type === 'partial'
    ? 'expense-partial'
    : ''
})

const onSwipeLeft = ({ reset }) => {
  emit('update-payment-type', {
    expense: props.expense,
    paymentType: 'individual'
  })
  reset()
}

const onSwipeRight = ({ reset }) => {
  emit('update-payment-type', {
    expense: props.expense,
    paymentType: 'partial'
  })
  reset()
}

</script>

<style scoped lang="scss">
.plan-expense-swipe-wrapper {
  position: relative;
}

.desktop-expense-container {
  position: relative;
}

.desktop-payment-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

// Evidenziazione visiva dello stato
.expense-individual {
  border-left: 3px solid var(--q-blue-grey-5);
}

.expense-partial {
  border-left: 3px solid var(--q-amber-7);
}
</style>
