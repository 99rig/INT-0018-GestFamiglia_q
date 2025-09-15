import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

/**
 * Boot file per configurazione Pinia
 * Configura il store manager globale per l'applicazione
 */
export default boot(({ app }) => {
  // Controlla se Pinia è già installato
  if (app.config.globalProperties.$pinia) {
    if (process.env.DEV) {
      console.log('🍍 Pinia already installed, skipping')
    }
    return
  }

  const pinia = createPinia()

  // Plugin per persistenza automatica dello stato
  pinia.use(createPersistedState({
    storage: localStorage,
    serializer: JSON
  }))

  // Plugin per dev tools in sviluppo
  if (process.env.DEV) {
    // Plugin per logging delle mutazioni
    pinia.use(({ store }) => {
      store.$subscribe((mutation) => {
        console.debug(`[Pinia] Store ${store.$id}`, {
          mutationType: mutation.type,
          payload: mutation.payload
        })
      })
    })

    // Esponi Pinia per Vue DevTools
    if (typeof window !== 'undefined') {
      window.__PINIA__ = pinia
    }
  }

  // Installa Pinia nell'app
  app.use(pinia)

  // Esponi pinia globalmente per debug (solo in dev)
  if (process.env.DEV && typeof window !== 'undefined') {
    window.$pinia = pinia
  }
})