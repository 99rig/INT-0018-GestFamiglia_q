<template>
  <q-layout view="lHh Lpr lFf" class="mcf-layout">
    <AppHeader @toggle-sidebar="toggleLeftDrawer" />

    <AppSidebar v-model="leftDrawerOpen" />

    <q-page-container class="mcf-page-container">
      <div class="mcf-page-wrapper">
        <router-view />
      </div>
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

<style lang="scss" scoped>
.mcf-layout {
  background-color: var(--mcf-bg-primary);
}

.mcf-page-container {
  background-color: var(--mcf-bg-primary);
}

.mcf-page-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;

  @media (min-width: 1400px) {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

// Ensure proper spacing for mobile with bottom navigation
@media (max-width: 767px) {
  .mcf-page-wrapper {
    padding-bottom: 80px; // Account for bottom navigation
  }
}
</style>
