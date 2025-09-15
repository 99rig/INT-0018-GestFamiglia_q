<template>
  <q-footer v-if="$q.screen.lt.md" class="mumble-bottom-menu">
    <q-tabs
      v-model="currentTab"
      dense
      class="text-mumble-accent"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab
        v-for="item in menuItems"
        :key="item.name"
        :name="item.name"
        :icon="item.icon"
        :label="item.label"
        @click="navigateTo(item.route)"
        class="mumble-tab"
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
    label: 'Dashboard',
    route: '/'
  },
  {
    name: 'settings',
    icon: 'settings',
    label: 'Settings',
    route: '/settings'
  },
  {
    name: 'help',
    icon: 'help',
    label: 'Help',
    route: '/help'
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
.mumble-bottom-menu {
  background: white;
  border-top: 1px solid rgba(160, 150, 163, 0.2);
  box-shadow: 0 -2px 8px rgba(58, 63, 74, 0.1);
}

.mumble-tab {
  min-height: 60px;
  padding: 8px 4px;
}

.mumble-tab .q-tab__content {
  flex-direction: column;
  gap: 4px;
}

.mumble-tab .q-tab__icon {
  font-size: 20px;
}

.mumble-tab .q-tab__label {
  font-size: 11px;
  font-weight: 500;
}
</style>