<template>
  <Teleport to="body">
    <Transition
      enter-active-class="snackbar-enter-active"
      leave-active-class="snackbar-leave-active"
      enter-from-class="snackbar-enter-from"
      enter-to-class="snackbar-enter-to"
      leave-from-class="snackbar-leave-from"
      leave-to-class="snackbar-leave-to"
    >
      <div
        v-if="visible"
        class="mcf-top-snackbar"
        :class="[
          `mcf-snackbar--${type}`
        ]"
        @click="dismiss"
      >
        <div class="mcf-snackbar__container">
          <!-- Icon -->
          <div class="mcf-snackbar__icon">
            <q-icon
              :name="iconName"
              :color="iconColor"
              size="sm"
            />
          </div>

          <!-- Content -->
          <div class="mcf-snackbar__content">
            <div class="mcf-snackbar__title" v-if="title">
              {{ title }}
            </div>
            <div class="mcf-snackbar__message">
              {{ message }}
            </div>
          </div>

          <!-- Actions -->
          <div class="mcf-snackbar__actions" v-if="!autoClose">
            <q-btn
              flat
              round
              dense
              icon="close"
              color="white"
              size="sm"
              @click="dismiss"
            />
          </div>
        </div>

        <!-- Progress bar for auto-close -->
        <div
          v-if="autoClose && showProgress"
          class="mcf-snackbar__progress"
          :style="{ width: progressWidth + '%' }"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: value => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  timeout: {
    type: Number,
    default: 4000 // 4 secondi
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['dismiss'])

// State
const visible = ref(false)
const progressWidth = ref(100)
let timeoutId = null
let progressInterval = null

// Computed
const iconName = computed(() => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return icons[props.type] || 'info'
})

const iconColor = computed(() => {
  return 'white' // Always white for contrast
})

// Methods
const show = () => {
  visible.value = true

  if (props.autoClose) {
    // Start progress animation
    if (props.showProgress) {
      startProgress()
    }

    // Auto dismiss
    timeoutId = setTimeout(() => {
      dismiss()
    }, props.timeout)
  }
}

const dismiss = () => {
  clearTimeout(timeoutId)
  clearInterval(progressInterval)
  visible.value = false
  emit('dismiss')
}

const startProgress = () => {
  const steps = 50
  const stepTime = props.timeout / steps
  let currentStep = steps

  progressInterval = setInterval(() => {
    currentStep--
    progressWidth.value = (currentStep / steps) * 100

    if (currentStep <= 0) {
      clearInterval(progressInterval)
    }
  }, stepTime)
}

// Lifecycle
onMounted(() => {
  // Show immediately for stack management
  show()
})

onUnmounted(() => {
  clearTimeout(timeoutId)
  clearInterval(progressInterval)
})

// Expose methods
defineExpose({
  show,
  dismiss
})
</script>

<style lang="scss" scoped>
.mcf-top-snackbar {
  width: 100%;
  cursor: pointer;
  border-radius: 0;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.mcf-snackbar__container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.mcf-snackbar__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.mcf-snackbar__content {
  flex: 1;
  min-width: 0;
}

.mcf-snackbar__title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  color: white;
  opacity: 0.95;
}

.mcf-snackbar__message {
  font-size: 0.9rem;
  line-height: 1.4;
  color: white;
  opacity: 0.9;
}

.mcf-snackbar__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.mcf-snackbar__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  transition: width 100ms ease-out;
}

// Color variants
.mcf-snackbar--success {
  background: #4CAF50;

  .mcf-snackbar__progress {
    background: rgba(255, 255, 255, 0.4);
  }
}

.mcf-snackbar--error {
  background: #f44336;

  .mcf-snackbar__progress {
    background: rgba(255, 255, 255, 0.4);
  }
}

.mcf-snackbar--warning {
  background: #ff9800;

  .mcf-snackbar__progress {
    background: rgba(255, 255, 255, 0.4);
  }
}

.mcf-snackbar--info {
  background: #2196F3;

  .mcf-snackbar__progress {
    background: rgba(255, 255, 255, 0.4);
  }
}

// Animations
.snackbar-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.snackbar-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 1, 1);
}

.snackbar-enter-from {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;
}

.snackbar-enter-to {
  max-height: 200px; // Sufficient height for content
  opacity: 1;
  transform: scaleY(1);
  transform-origin: top;
}

.snackbar-leave-from {
  max-height: 200px;
  opacity: 1;
  transform: scaleY(1);
  transform-origin: top;
}

.snackbar-leave-to {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;
}

// Hover effects
.mcf-top-snackbar:hover {
  .mcf-snackbar__progress {
    opacity: 0.6;
  }
}

// Mobile adjustments
@media (max-width: 600px) {
  .mcf-snackbar__container {
    padding: 14px 16px;
    gap: 10px;
  }

  .mcf-snackbar__title {
    font-size: 0.9rem;
  }

  .mcf-snackbar__message {
    font-size: 0.85rem;
  }
}
</style>