<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { updateService } from 'src/services/updateService'
import { useAuthStore } from 'src/stores/auth'

onMounted(async () => {
  // Inizializza l'auth store per recuperare i token salvati
  const authStore = useAuthStore()
  await authStore.initialize()

  // Inizializza il servizio di aggiornamento
  await updateService.init()

  // Controlla aggiornamenti dopo 2 secondi (per dare tempo al login)
  setTimeout(() => {
    updateService.checkForUpdates(false)
  }, 2000)
})
</script>
