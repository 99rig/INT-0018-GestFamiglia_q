<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader @toggle-sidebar="toggleLeftDrawer" />
    
    <AppSidebar v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <AppMenu />
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import AppHeader from 'components/layout/AppHeader.vue'
import AppSidebar from 'components/layout/AppSidebar.vue'
import AppMenu from 'components/layout/AppMenu.vue'

const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Check authentication on mount
onMounted(async () => {
  await authStore.initialize()
  
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>