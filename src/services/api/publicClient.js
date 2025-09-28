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

// NON aggiungere interceptors per token o autenticazione
// Questo client deve rimanere completamente pubblico

export default publicApiClient