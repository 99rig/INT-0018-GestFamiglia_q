import { boot } from 'quasar/wrappers'
import { defineCustomElements } from '@ionic/pwa-elements/loader'

/**
 * Boot file per inizializzare PWA Elements
 * RICHIESTO per Capacitor Camera Plugin su PWA/Web
 * 
 * Dalla documentazione Capacitor:
 * "PWA Elements are required for Camera plugin to work on web"
 */
export default boot(() => {
  // Inizializza PWA Elements per supporto camera su web/PWA
  defineCustomElements(window)
  
  if (process.env.DEV) {
    console.log('PWA Elements initialized for Capacitor Camera support')
  }
})