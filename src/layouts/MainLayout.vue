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
import { ref } from 'vue'
import AppHeader from 'components/layout/AppHeader.vue'
import AppSidebar from 'components/layout/AppSidebar.vue'
import AppMenu from 'components/layout/AppMenu.vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>