<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { updateService } from 'src/services/updateService'

onMounted(async () => {
  // Inizializza il servizio di aggiornamento
  await updateService.init()
  
  // Controlla aggiornamenti dopo 2 secondi (per dare tempo al login)
  setTimeout(() => {
    updateService.checkForUpdates(false)
  }, 2000)
})
</script>
