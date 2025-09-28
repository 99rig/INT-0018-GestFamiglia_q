<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { updateService } from 'src/services/updateService'
import { useAuthStore } from 'src/stores/auth'

// Funzione per caricare le preferenze UI
const loadUIPreferences = () => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && authStore.user?.profile?.ui_preferences) {
    const preferences = authStore.user.profile.ui_preferences

    // Applica font logo
    if (preferences.logoFont) {
      document.documentElement.style.setProperty('--mcf-logo-font', preferences.logoFont)
    }

    // Applica font app
    if (preferences.appFont) {
      document.documentElement.style.setProperty('--mcf-app-font', preferences.appFont)
    }
  } else {
    // Fallback al localStorage
    const savedLogoFont = localStorage.getItem('mcf-logo-font')
    const savedAppFont = localStorage.getItem('mcf-app-font')

    if (savedLogoFont) {
      document.documentElement.style.setProperty('--mcf-logo-font', savedLogoFont)
    }

    if (savedAppFont) {
      document.documentElement.style.setProperty('--mcf-app-font', savedAppFont)
    }

    if (savedLogoFont || savedAppFont) {
      console.log('✅ UI preferences applied from localStorage')
    }
  }
}

onMounted(async () => {
  // Inizializza l'auth store per recuperare i token salvati
  const authStore = useAuthStore()
  await authStore.initialize()

  // Carica e applica le preferenze UI
  loadUIPreferences()

  // Inizializza il servizio di aggiornamento (solo init, no auto-check)
  await updateService.init()

  // Controllo aggiornamenti rimosso - ora solo manuale dalle settings
})
</script>
