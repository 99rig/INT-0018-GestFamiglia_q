/**
 * Storage Service - Gestione sicura dello storage cross-platform
 * Usa Capacitor Preferences su mobile (storage nativo sicuro)
 * Fallback a localStorage su web per development
 */

import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

// Storage keys standardizzate
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  PIN_HASH: 'pin_hash',
  ENCRYPTED_CREDENTIALS: 'encrypted_credentials',
  LAST_USER_EMAIL: 'last_user_email',
  AUTH_STATE: 'auth_state'
}

class StorageService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform()
    this.prefix = import.meta.env.VITE_STORAGE_PREFIX || 'mcf_'
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('📱 Storage initialized:', {
        isNative: this.isNative,
        platform: Capacitor.getPlatform(),
        prefix: this.prefix
      })
    }
  }

  /**
   * Salva un valore nello storage
   */
  async set(key, value) {
    const fullKey = `${this.prefix}${key}`
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    
    try {
      if (this.isNative) {
        // Storage nativo sicuro per mobile
        await Preferences.set({
          key: fullKey,
          value: stringValue
        })
      } else {
        // localStorage per web/development
        localStorage.setItem(fullKey, stringValue)
      }
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log(`💾 Saved to storage: ${key}`)
      }
      return true
    } catch (error) {
      console.error(`❌ Storage set error for ${key}:`, error)
      return false
    }
  }

  /**
   * Recupera un valore dallo storage
   */
  async get(key) {
    const fullKey = `${this.prefix}${key}`
    
    try {
      let value
      
      if (this.isNative) {
        // Storage nativo sicuro per mobile
        const result = await Preferences.get({ key: fullKey })
        value = result.value
      } else {
        // localStorage per web/development
        value = localStorage.getItem(fullKey)
      }
      
      if (!value) return null
      
      // Prova a parsare come JSON, altrimenti ritorna stringa
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } catch (error) {
      console.error(`❌ Storage get error for ${key}:`, error)
      return null
    }
  }

  /**
   * Rimuove un valore dallo storage
   */
  async remove(key) {
    const fullKey = `${this.prefix}${key}`
    
    try {
      if (this.isNative) {
        // Storage nativo sicuro per mobile
        await Preferences.remove({ key: fullKey })
      } else {
        // localStorage per web/development
        localStorage.removeItem(fullKey)
      }
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log(`🗑️ Removed from storage: ${key}`)
      }
      return true
    } catch (error) {
      console.error(`❌ Storage remove error for ${key}:`, error)
      return false
    }
  }

  /**
   * Pulisce tutti i dati con il prefisso corrente
   */
  async clear() {
    try {
      if (this.isNative) {
        // Su mobile, dobbiamo rimuovere le chiavi una per una
        const allKeys = Object.values(STORAGE_KEYS)
        for (const key of allKeys) {
          await this.remove(key)
        }
      } else {
        // Su web, possiamo iterare localStorage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      console.log('🧹 Storage cleared')
      return true
    } catch (error) {
      console.error('❌ Storage clear error:', error)
      return false
    }
  }

  /**
   * Metodi di convenienza per auth
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      // Assicuriamoci che siano stringhe
      const accessStr = typeof accessToken === 'string' ? accessToken : String(accessToken || '')
      const refreshStr = typeof refreshToken === 'string' ? refreshToken : String(refreshToken || '')
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('💾 Saving tokens:', {
          accessLength: accessStr.length,
          refreshLength: refreshStr.length,
          isNative: this.isNative
        })
      }
      
      // Salva entrambi e aspetta il completamento
      const results = await Promise.all([
        this.set(STORAGE_KEYS.ACCESS_TOKEN, accessStr),
        this.set(STORAGE_KEYS.REFRESH_TOKEN, refreshStr)
      ])
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('💾 Save results:', results)
      }
      
      return results.every(r => r === true)
    } catch (error) {
      console.error('❌ Save tokens error:', error)
      return false
    }
  }

  async getAccessToken() {
    return await this.get(STORAGE_KEYS.ACCESS_TOKEN)
  }

  async getRefreshToken() {
    return await this.get(STORAGE_KEYS.REFRESH_TOKEN)
  }

  async saveUserData(userData) {
    await this.set(STORAGE_KEYS.USER_DATA, userData)
  }

  async getUserData() {
    return await this.get(STORAGE_KEYS.USER_DATA)
  }

  async clearAuth() {
    await this.remove(STORAGE_KEYS.ACCESS_TOKEN)
    await this.remove(STORAGE_KEYS.REFRESH_TOKEN)
    await this.remove(STORAGE_KEYS.USER_DATA)
    await this.remove(STORAGE_KEYS.AUTH_STATE)
  }

  /**
   * Metodi per il PIN
   */
  async savePinData(pinHash, encryptedCredentials, email) {
    await this.set(STORAGE_KEYS.PIN_HASH, pinHash)
    await this.set(STORAGE_KEYS.ENCRYPTED_CREDENTIALS, encryptedCredentials)
    await this.set(STORAGE_KEYS.LAST_USER_EMAIL, email)
  }

  async getPinData() {
    return {
      pinHash: await this.get(STORAGE_KEYS.PIN_HASH),
      encryptedCredentials: await this.get(STORAGE_KEYS.ENCRYPTED_CREDENTIALS),
      lastUserEmail: await this.get(STORAGE_KEYS.LAST_USER_EMAIL)
    }
  }

  async clearPinData() {
    await this.remove(STORAGE_KEYS.PIN_HASH)
    await this.remove(STORAGE_KEYS.ENCRYPTED_CREDENTIALS)
    await this.remove(STORAGE_KEYS.LAST_USER_EMAIL)
  }
}

// Singleton instance
export const storage = new StorageService()

export default storage