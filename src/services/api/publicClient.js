/**
 * Public API Client - Client axios per richieste non autenticate
 *
 * Questo client è utilizzato per endpoints che NON richiedono autenticazione:
 * - Password reset
 * - Registrazione
 * - Altri endpoint pubblici
 *
 * NON include mai token di autenticazione nelle richieste
 */

import axios from 'axios'

// Crea un'istanza separata di axios per richieste pubbliche
export const publicApiClient = axios.create({
  baseURL: process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api` : 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Funzione per ottenere il CSRF token
function getCsrfToken() {
  // Prova a ottenere il token dal cookie
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]

  if (cookieValue) {
    return cookieValue
  }

  // Fallback: prova a ottenere dal meta tag se presente
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  return metaTag ? metaTag.getAttribute('content') : null
}

// Interceptor per aggiungere CSRF token se disponibile
publicApiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// NON aggiungere interceptors per token di autenticazione
// Questo client deve rimanere pubblico per quanto riguarda l'auth

export default publicApiClient