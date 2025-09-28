import { register } from 'register-service-worker'
import { Notify, Dialog } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to navigator.serviceWorker.register()
  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    console.log('🔧 Service Worker is active')

    // Check version aggressivo per Safari
    const currentVersion = '1.0.40'
    const storedVersion = localStorage.getItem('app_version')

    if (!storedVersion || storedVersion !== currentVersion) {
      console.log(`🔄 Version mismatch: stored=${storedVersion}, current=${currentVersion}`)
      localStorage.setItem('app_version', currentVersion)

      // Force clear tutto per Safari
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        console.log('🍎 Safari detected - forcing aggressive cache clear')
        setTimeout(() => {
          window.forceAppUpdate()
        }, 1000)
      }
    }
  },

  registered(/* registration */) {
    console.log('📋 Service Worker has been registered')
  },

  cached(/* registration */) {
    console.log('💾 Content has been cached for offline use')
  },

  updatefound(registration) {
    console.log('🔍 New content is downloading...')

    // Mostra notifica discreta che sta scaricando
    Notify.create({
      message: '📥 Scaricando aggiornamento...',
      color: 'info',
      position: 'top',
      timeout: 2000,
      icon: 'download'
    })
  },

  updated(registration) {
    console.log('✨ New content is available; please refresh')

    // Forza refresh immediato senza chiedere all'utente
    // Questo risolve il problema del "pregare" per l'aggiornamento
    setTimeout(() => {
      console.log('🔄 Auto-refreshing to load new version...')

      // Notifica rapida prima del reload
      Notify.create({
        message: '🔄 Aggiornamento automatico in corso...',
        color: 'positive',
        position: 'center',
        timeout: 1000,
        icon: 'refresh'
      })

      // Forza reload dopo breve delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }, 1000)
  },

  offline() {
    console.log('📴 No internet connection found. App is running in offline mode')

    Notify.create({
      message: '📴 Modalità offline attiva',
      color: 'warning',
      position: 'bottom',
      timeout: 3000,
      icon: 'wifi_off'
    })
  },

  error(err) {
    console.error('❌ Error during service worker registration:', err)
  }
})

// Aggiungi listener per aggiornamenti manuali forzati
window.addEventListener('beforeunload', () => {
  // Cancella tutti i cache prima del reload
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('workbox') || name.includes('quasar')) {
          console.log(`🗑️ Clearing cache: ${name}`)
          caches.delete(name)
        }
      })
    })
  }
})

// Funzione per forzare aggiornamento manuale
window.forceAppUpdate = async () => {
  try {
    console.log('🔄 Force updating app...')

    // 1. Cancella tutti i cache
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Deleting cache: ${cacheName}`)
          return caches.delete(cacheName)
        })
      )
    }

    // 2. Unregistra il service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => {
          console.log('🗑️ Unregistering service worker')
          return registration.unregister()
        })
      )
    }

    // 3. Hard reload
    console.log('🔄 Hard reloading...')
    window.location.reload(true)

  } catch (error) {
    console.error('❌ Error forcing update:', error)
    window.location.reload()
  }
}

// Aggiungi listener per combinazione di tasti per force refresh
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+R per force update
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault()
    window.forceAppUpdate()
  }
})