<template>
  <q-footer v-if="$q.screen.lt.md" class="mcf-bottom-menu">
    <q-tabs
      v-model="currentTab"
      dense
      class="text-mcf-primary"
      active-color="accent"
      indicator-color="accent"
      align="justify"
    >
      <q-tab
        v-for="item in menuItems"
        :key="item.name"
        :name="item.name"
        :icon="item.icon"
        :label="item.label"
        @click="navigateTo(item.route)"
        class="mcf-tab"
      />
    </q-tabs>
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

<style scoped>
.mcf-bottom-menu {
  background: white;
  border-top: 1px solid rgba(160, 150, 163, 0.2);
  box-shadow: 0 -2px 8px rgba(58, 63, 74, 0.1);
}

.mcf-tab {
  min-height: 60px;
  padding: 8px 4px;
}

.mcf-tab .q-tab__content {
  flex-direction: column;
  gap: 4px;
}

.mcf-tab .q-tab__icon {
  font-size: 20px;
}

.mcf-tab .q-tab__label {
  font-size: 11px;
  font-weight: 500;
}
</style>