import { ref } from 'vue'

// Store per tenere traccia delle istanze attive
const activeSnackbars = ref([])
let snackbarIdCounter = 0

export function useSnackbar() {
  const calculateTopPosition = (index) => {
    // Header height + (snackbar height + gap) * index
    return 64 + (70 * index) // 70px per snackbar (height + margin)
  }

  const updatePositions = () => {
    activeSnackbars.value.forEach((snackbar, index) => {
      const newTop = calculateTopPosition(index)
      snackbar.container.style.top = `${newTop}px`
    })
  }

  const removeFromStack = (snackbarId) => {
    const index = activeSnackbars.value.findIndex(s => s.id === snackbarId)
    if (index !== -1) {
      const snackbar = activeSnackbars.value[index]

      // Remove from DOM
      setTimeout(() => {
        snackbar.app.unmount()
        if (snackbar.container.parentNode) {
          snackbar.container.parentNode.removeChild(snackbar.container)
        }
      }, 300)

      // Remove from stack
      activeSnackbars.value.splice(index, 1)

      // Update positions of remaining snackbars
      updatePositions()
    }
  }

  const show = async (options) => {
    // Generate unique ID
    const snackbarId = ++snackbarIdCounter

    // Configurazione di default
    const config = {
      type: 'info',
      title: '',
      message: '',
      timeout: 2000,
      autoClose: true,
      showProgress: true,
      ...options
    }

    // Crea un snackbar HTML direttamente per test
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = `${calculateTopPosition(activeSnackbars.value.length)}px`
    container.style.left = '0'
    container.style.right = '0'
    container.style.width = '100%'
    container.style.zIndex = '999999'
    container.style.transition = 'top 0.3s ease'

    // Crea HTML direttamente per test
    container.innerHTML = `
      <div style="
        width: 100%;
        background: ${config.type === 'success' ? '#e8f5e8' : config.type === 'error' ? '#ffeaea' : config.type === 'warning' ? '#fff4e6' : '#e3f2fd'};
        color: ${config.type === 'success' ? '#2e7d32' : config.type === 'error' ? '#c62828' : config.type === 'warning' ? '#ef6c00' : '#1565c0'};
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        border-left: 4px solid ${config.type === 'success' ? '#4caf50' : config.type === 'error' ? '#f44336' : config.type === 'warning' ? '#ff9800' : '#2196f3'};
      ">
        <div style="flex: 1;">
          ${config.title ? `<div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">${config.title}</div>` : ''}
          <div style="font-size: 0.9rem; opacity: 0.9;">${config.message}</div>
        </div>
        <div style="flex-shrink: 0;">
          <span style="font-size: 18px; cursor: pointer; opacity: 0.6;">✕</span>
        </div>
      </div>
    `

    document.body.appendChild(container)

    // Click handler per chiusura
    container.addEventListener('click', () => {
      removeFromStack(snackbarId)
    })

    // Auto close
    let timeoutId = null
    if (config.autoClose) {
      timeoutId = setTimeout(() => {
        removeFromStack(snackbarId)
      }, config.timeout)
    }

    const app = {
      unmount: () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    // Debug
    console.log('🔔 Snackbar created:', snackbarId, 'at position:', calculateTopPosition(activeSnackbars.value.length))

    // Aggiungi allo stack
    activeSnackbars.value.push({
      id: snackbarId,
      app,
      container,
      config
    })

    return app
  }

  // Metodi di convenienza per diversi tipi
  const success = (message, options = {}) => {
    return show({
      type: 'success',
      message,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return show({
      type: 'error',
      message,
      timeout: 3000, // Errori rimangono un po' più a lungo
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return show({
      type: 'warning',
      message,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return show({
      type: 'info',
      message,
      ...options
    })
  }

  return {
    show,
    success,
    error,
    warning,
    info
  }
}