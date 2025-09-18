<template>
  <q-page-sticky 
    position="bottom-right" 
    :offset="[fabPosition.x, fabPosition.y]"
  >
    <q-fab
      :icon="mainIcon"
      :direction="direction"
      :class="[
        'mcf-draggable-fab',
        { 'mcf-fab-dragging': draggingFab }
      ]"
      :disable="draggingFab"
      v-touch-pan.prevent.mouse="moveFab"
    >
      <slot />
    </q-fab>
  </q-page-sticky>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  mainIcon: {
    type: String,
    default: 'add'
  },
  direction: {
    type: String,
    default: 'up',
    validator: (value) => ['up', 'down', 'left', 'right'].includes(value)
  },
  initialPosition: {
    type: Object,
    default: () => ({ x: 18, y: 18 })
  },
  boundaries: {
    type: Object,
    default: () => ({ 
      minX: 18, 
      minY: 18, 
      maxOffsetX: 80, 
      maxOffsetY: 80 
    })
  }
})

// FAB dragging state
const draggingFab = ref(false)
const fabPosition = ref({ ...props.initialPosition })

// FAB dragging function
const moveFab = (details) => {
  if (details.isFirst) {
    draggingFab.value = true
  }
  
  if (details.isFinal) {
    draggingFab.value = false
    return
  }
  
  // Aggiorna posizione con boundaries
  const newX = fabPosition.value.x - details.delta.x
  const newY = fabPosition.value.y - details.delta.y
  
  fabPosition.value = {
    x: Math.max(
      props.boundaries.minX, 
      Math.min(window.innerWidth - props.boundaries.maxOffsetX, newX)
    ),
    y: Math.max(
      props.boundaries.minY, 
      Math.min(window.innerHeight - props.boundaries.maxOffsetY, newY)
    )
  }
}

// Expose methods for parent components
defineExpose({
  resetPosition: () => {
    fabPosition.value = { ...props.initialPosition }
  },
  getCurrentPosition: () => ({ ...fabPosition.value }),
  setPosition: (newPosition) => {
    fabPosition.value = { ...newPosition }
  }
})
</script>

<style lang="scss" scoped>
/* === DRAGGABLE FAB STYLES === */
.mcf-draggable-fab {
  background: linear-gradient(135deg, var(--mcf-primary) 0%, var(--mcf-secondary) 100%) !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(35, 157, 176, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;

  &:hover {
    box-shadow: 0 6px 20px rgba(35, 157, 176, 0.5) !important;
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
  }
}

.mcf-fab-dragging {
  transition: none !important;
  transform: scale(1.05) !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
  box-shadow: 0 8px 24px rgba(35, 157, 176, 0.6) !important;
}

/* === FAB ACTIONS STYLING === */
:deep(.q-fab__actions) {
  .q-fab__action {
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }

  .q-fab__action .q-btn {
    min-width: 52px;
    min-height: 52px;
    border-radius: 50%;
  }

  .q-fab__action .q-btn__content {
    font-size: 20px;
  }
}

:deep(.q-fab__label) {
  background: linear-gradient(135deg, var(--mcf-text-primary) 0%, var(--mcf-text-secondary) 100%) !important;
  color: white !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(4px);
}

/* Animazioni FAB */
:deep(.q-fab) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.q-fab__action) {
  transition: all 0.2s ease;
}
</style>
