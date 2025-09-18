import { defineStore } from 'pinia'
import { api } from 'src/services/api'
import { storage, STORAGE_KEYS } from 'src/services/storage'
import CryptoJS from 'crypto-js'

// Chiave segreta per criptare (in produzione usa una chiave più sicura)
const SECRET_KEY = 'mcf-2024-secret-key'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    pinHash: null,
    lastUserEmail: null,
    encryptedCredentials: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userRole: (state) => state.user?.profile?.role || 'familiare',
    isMaster: (state) => state.user?.profile?.role === 'master'
  },

  actions: {
    // Inizializza lo store con dati salvati
    async initialize() {
      // Verifica se il server è cambiato e pulisce i token se necessario
      const currentServer = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const savedServer = await storage.get('last_server_url')

      if (savedServer && savedServer !== currentServer) {
        console.log('🔄 Server changed from', savedServer, 'to', currentServer, '- Clearing tokens')
        // Server cambiato, pulisci i token ma mantieni PIN
        await storage.clearAuth()
        await storage.set('last_server_url', currentServer)
      } else if (!savedServer) {
        // Prima volta, salva il server corrente
        await storage.set('last_server_url', currentServer)
      }

      // Carica dati dal storage sicuro
      const [accessToken, refreshToken, userData, pinData] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
        storage.getUserData(),
        storage.getPinData()
      ])

      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = userData
      this.pinHash = pinData.pinHash
      this.encryptedCredentials = pinData.encryptedCredentials
      this.lastUserEmail = pinData.lastUserEmail

      // Imposta token per API calls e verifica se sono validi
      if (this.accessToken) {
        api.setAuthToken(this.accessToken)

        // Verifica se il token è ancora valido tentando di refresharlo
        if (this.refreshToken) {
          try {
            console.log('🔄 Verifying token validity...')
            await this.refreshAccessToken()
          } catch (error) {
            console.warn('❌ Token refresh failed during initialization:', error)
            // Se il refresh fallisce, pulisci i token
            await this.logout()
          }
        }
      }
    },

    // Metodi helper
    hasPinSetup() {
      return !!this.pinHash && !!this.encryptedCredentials
    },

    getLastUserEmail() {
      return this.lastUserEmail || ''
    },

    // Login classico con email/password
    async login(email, password) {
      try {
        console.log('Login attempt:', email)

        // Chiamata API reale
        const response = await api.login(email, password)

        // Controlla che ci siano i token nella risposta
        if (!response.access || !response.refresh) {
          console.error('Login response missing tokens')
          return false
        }

        // Salva tokens e user nello store
        this.accessToken = response.access
        this.refreshToken = response.refresh
        this.user = response.user || { email }
        this.lastUserEmail = email

        // Imposta token per future API calls
        api.setAuthToken(this.accessToken)

        // Salva nel storage sicuro
        const saveResult = await storage.saveTokens(response.access, response.refresh)
        await Promise.all([
          storage.saveUserData(this.user),
          storage.set(STORAGE_KEYS.LAST_USER_EMAIL, email)
        ])

        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('🔐 Token save result:', saveResult)
        }

        // Salva credenziali criptate per PIN login (opzionale)
        if (this.pinHash) {
          this.encryptedCredentials = this.encryptCredentials(email, password)
          await storage.set(STORAGE_KEYS.ENCRYPTED_CREDENTIALS, this.encryptedCredentials)
        }

        // Carica sempre il profilo completo per avere i dati famiglia
        try {
          const profile = await api.getUserProfile()
          this.user = { ...this.user, ...profile }
          await storage.saveUserData(this.user)
        } catch (error) {
          console.log('Could not load user profile:', error)
        }

        return true
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        return false
      }
    },

    // Setup PIN per l'utente corrente
    async setupPin(pin) {
      if (!this.user || !pin || pin.length !== 4) return false

      // Hash del PIN
      this.pinHash = CryptoJS.SHA256(pin + SECRET_KEY).toString()

      // Memorizza credenziali criptate se abbiamo email
      const email = this.user.email || this.lastUserEmail
      if (email && this.accessToken) {
        // Cripta email e token per accesso veloce
        this.encryptedCredentials = this.encryptCredentials(email, this.refreshToken)
      }

      // Salva nel storage sicuro
      await storage.savePinData(
        this.pinHash,
        this.encryptedCredentials,
        email
      )

      console.log('PIN setup completato')
      return true
    },

    // Login con PIN
    async loginWithPin(pin) {
      try {
        console.log('loginWithPin called with:', pin)

        if (!this.pinHash || !this.encryptedCredentials) {
          console.log('Missing PIN data')
          return false
        }

        // Verifica PIN
        const inputHash = CryptoJS.SHA256(pin + SECRET_KEY).toString()
        if (inputHash !== this.pinHash) {
          console.log('PIN non corretto')
          return false
        }

        // Decripta credenziali
        const credentials = this.decryptCredentials(this.encryptedCredentials)
        if (!credentials) {
          console.log('Failed to decrypt credentials')
          return false
        }

        console.log('PIN verified, checking tokens...')

        // Se abbiamo token salvati e sono validi, usali
        if (this.accessToken && this.refreshToken) {
          console.log('Using existing tokens')
          api.setAuthToken(this.accessToken)
          return true
        }

        // Altrimenti, prova a fare refresh con il token salvato
        if (credentials.password) { // Il password field contiene il refresh token
          try {
            console.log('Refreshing token with stored refresh token...')
            const response = await api.refreshToken(credentials.password)

            // Salva i nuovi token
            this.accessToken = response.access
            this.refreshToken = response.refresh || credentials.password
            this.user = { email: credentials.email }
            this.lastUserEmail = credentials.email

            // Imposta token per API calls
            api.setAuthToken(this.accessToken)

            // Salva nel storage
            const saveResult = await storage.saveTokens(this.accessToken, this.refreshToken)
            await storage.saveUserData(this.user)

            if (import.meta.env.VITE_DEBUG === 'true') {
              console.log('📌 PIN login token save result:', saveResult)
            }

            // Carica profilo utente completo
            try {
              const profile = await api.getUserProfile()
              this.user = { ...this.user, ...profile }
              await storage.saveUserData(this.user)
            } catch (error) {
              console.log('Could not load user profile:', error)
            }

            console.log('PIN login successful with refresh')
            return true
          } catch (error) {
            console.error('PIN login refresh failed:', error)
            // Clear invalid data
            await this.clearPinData()
            return false
          }
        }

        console.log('No valid refresh token available')
        return false
      } catch (error) {
        console.error('PIN login error:', error)
        return false
      }
    },

    // Logout
    async logout() {
      // Prova a fare logout lato server
      try {
        await api.logout()
      } catch (error) {
        console.log('Server logout failed:', error)
      }

      // Pulisci stato locale
      this.user = null
      this.accessToken = null
      this.refreshToken = null

      // Rimuovi token dalle API calls
      api.setAuthToken(null)

      // Pulisci storage
      await storage.clearAuth()
    },

    // Utility: cripta credenziali
    encryptCredentials(email, password) {
      const data = JSON.stringify({ email, password })
      return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
    },

    // Utility: decripta credenziali
    decryptCredentials(encrypted) {
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        return JSON.parse(decrypted)
      } catch {
        return null
      }
    },

    // Pulisce i dati PIN
    async clearPinData() {
      this.pinHash = null
      this.encryptedCredentials = null
      this.lastUserEmail = null

      // Pulisci dal storage
      await storage.clearPinData()

      console.log('PIN data cleared')
    },

    // Refresh token
    async refreshAccessToken() {
      if (!this.refreshToken) return false

      try {
        console.log('Refreshing token...')
        const response = await api.refreshToken(this.refreshToken)

        // Aggiorna token
        this.accessToken = response.access
        if (response.refresh) {
          this.refreshToken = response.refresh
        }

        // Imposta nuovo token per API calls
        api.setAuthToken(this.accessToken)

        // Salva nel storage
        const saveResult = await storage.saveTokens(this.accessToken, this.refreshToken)

        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('🔄 Refresh token save result:', saveResult)
        }

        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        await this.logout()
        return false
      }
    },

    // Aggiorna il profilo utente
    async updateProfile(profileData) {
      try {
        const updatedUser = await api.updateUserProfile(profileData)

        // Aggiorna i dati utente nello store
        this.user = updatedUser

        // Salva nel storage
        await storage.saveUserData(updatedUser)

        console.log('✅ Profile updated successfully')
        return updatedUser
      } catch (error) {
        console.error('❌ Error updating profile:', error)
        throw error
      }
    },

    // Ricarica i dati utente correnti dal server
    async refreshUserData() {
      try {
        console.log('🔄 Refreshing user data...')
        const userData = await api.getCurrentUser()

        // Aggiorna i dati utente nello store
        this.user = userData

        // Salva nel storage
        await storage.saveUserData(userData)

        console.log('✅ User data refreshed successfully')
        return userData
      } catch (error) {
        console.error('❌ Error refreshing user data:', error)
        throw error
      }
    }
  }
})
