/**
 * Composable per gestire l'autenticazione nelle pagine
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

export function useAuthGuard() {
  const authStore = useAuthStore()
  const router = useRouter()

  onMounted(async () => {
    // Le route guards dovrebbero già aver gestito l'autenticazione
    // Questo è solo un doppio controllo per sicurezza
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated in page - redirecting to login')
      await router.push('/login')
    }
  })

  return {
    authStore,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user
  }
}