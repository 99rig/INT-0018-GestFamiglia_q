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

  // Inizializza il servizio di aggiornamento (solo init, no auto-check)
  await updateService.init()

  // Controllo aggiornamenti rimosso - ora solo manuale dalle settings
})
</script>
