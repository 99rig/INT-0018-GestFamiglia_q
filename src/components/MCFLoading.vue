<template>
  <div class="mcf-loading-container" :class="{ 'mcf-loading-fullscreen': fullscreen }">
    <div class="mcf-loading-content">
      <!-- Custom 3-dot loading animation -->
      <div class="mcf-loading-dots">
        <div class="mcf-dot mcf-dot-1"></div>
        <div class="mcf-dot mcf-dot-2"></div>
        <div class="mcf-dot mcf-dot-3"></div>
      </div>

      <!-- Loading message -->
      <div class="mcf-loading-message">
        {{ message }}
      </div>

      <!-- Optional submessage -->
      <div v-if="submessage" class="mcf-loading-submessage">
        {{ submessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Caricamento...'
  },
  submessage: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.mcf-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
  min-height: 200px;

  &.mcf-loading-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--mcf-bg-surface);
    z-index: 9999;
    min-height: 100vh;
  }
}

.mcf-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mcf-loading-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mcf-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--mcf-primary);
  animation: mcf-dot-bounce 1.4s ease-in-out infinite both;

  &.mcf-dot-1 {
    animation-delay: -0.32s;
  }

  &.mcf-dot-2 {
    animation-delay: -0.16s;
  }

  &.mcf-dot-3 {
    animation-delay: 0s;
  }
}

@keyframes mcf-dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.mcf-loading-message {
  font-size: 16px;
  font-weight: 500;
  color: var(--mcf-text-primary);
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 18px;
  }
}

.mcf-loading-submessage {
  font-size: 14px;
  color: var(--mcf-text-secondary);
  opacity: 0.8;

  @media (min-width: 768px) {
    font-size: 15px;
  }
}
</style>