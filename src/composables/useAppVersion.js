import { computed } from 'vue'

// Versione unica dell'app - aggiornata automaticamente dallo script update_and_build.py
const APP_VERSION = '1.0.14'

/**
 * Composable per gestire la versione dell'app in modo centralizzato
 * La versione viene aggiornata automaticamente dallo script update_and_build.py
 *
 * @returns {Object} Oggetto con versione completa e numero formattato
 */
export function useAppVersion() {
  // Versione completa (es. "1.0.4")
  const fullVersion = computed(() => APP_VERSION)

  // Numero versione formattato per display (es. "V04" o "T08")
  const versionNumber = computed(() => {
    // Se inizia con T, mostra T + numero
    if (APP_VERSION.startsWith('T')) {
      const parts = APP_VERSION.split('.')
      return 'T' + parts[parts.length - 1].padStart(2, '0')
    }
    // Altrimenti versione normale con V
    const parts = APP_VERSION.split('.')
    return 'V' + parts[parts.length - 1].padStart(2, '0')
  })

  return {
    fullVersion,
    versionNumber
  }
}

// Esporta anche la versione come costante per uso diretto
export const appVersion = APP_VERSION
