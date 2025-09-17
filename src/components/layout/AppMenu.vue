<template>
  <q-footer v-if="$q.screen.lt.md" class="mcf-bottom-nav">
    <div class="mcf-bottom-nav-container">
      <div
        v-for="item in menuItems"
        :key="item.name"
        :class="[
          'mcf-bottom-nav-item',
          { 'mcf-bottom-nav-item--active': currentTab === item.name }
        ]"
        @click="navigateTo(item.route)"
      >
        <div class="mcf-bottom-nav-icon">
          <q-icon :name="item.icon" />
        </div>
        <div class="mcf-bottom-nav-label">{{ item.label }}</div>
        <div
          v-if="currentTab === item.name"
          class="mcf-bottom-nav-indicator"
        ></div>
      </div>
    </div>
  </q-footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  {
    name: 'dashboard',
    icon: 'dashboard',
    label: 'Home',
    route: '/'
  },
  {
    name: 'expenses',
    icon: 'receipt_long',
    label: 'Spese',
    route: '/expenses'
  },
  {
    name: 'spending-plans',
    icon: 'list_alt',
    label: 'Piani',
    route: '/budget'
  },
  {
    name: 'scanner',
    icon: 'document_scanner',
    label: 'Scanner',
    route: '/scanner'
  },
  {
    name: 'settings',
    icon: 'settings',
    label: 'Settings',
    route: '/settings'
  }
]

const currentTab = computed(() => {
  const currentItem = menuItems.find(item => {
    if (item.route === '/' && route.path === '/') {
      return true
    }
    if (item.route !== '/' && route.path.startsWith(item.route)) {
      return true
    }
    return false
  })
  return currentItem ? currentItem.name : 'dashboard'
})

function navigateTo(routePath) {
  if (route.path !== routePath) {
    router.push(routePath)
  }
}
</script>

<style lang="scss" scoped>
.mcf-bottom-nav {
  background: var(--mcf-bg-surface);
  border-top: 1px solid var(--mcf-border-light);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.mcf-bottom-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  min-height: 64px;
}

.mcf-bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 60px;

  &:hover {
    background-color: var(--mcf-bg-secondary);
  }

  &.mcf-bottom-nav-item--active {
    .mcf-bottom-nav-icon {
      color: var(--mcf-primary);
      transform: scale(1.1);
    }

    .mcf-bottom-nav-label {
      color: var(--mcf-primary);
      font-weight: 600;
    }
  }
}

.mcf-bottom-nav-icon {
  font-size: 22px;
  color: var(--mcf-text-muted);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
}

.mcf-bottom-nav-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--mcf-text-muted);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  line-height: 1.2;
}

.mcf-bottom-nav-indicator {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: var(--mcf-primary);
  border-radius: 50%;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

// Safe area support for devices with notches
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mcf-bottom-nav-container {
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }
}
</style>
