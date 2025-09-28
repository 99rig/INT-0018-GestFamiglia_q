/**
 * Composable per la gestione della crittografia utente
 * Frontend companion per il sistema di encryption backend
 * Usa Web Crypto API per derivazione chiavi e crittografia client-side
 */

import { ref, computed } from 'vue'

// Stato globale per la chiave famiglia in memoria (per questa sessione)
const familyKey = ref(null)
const isKeyLoaded = ref(false)

export const useCrypto = () => {

  /**
   * Deriva una chiave di crittografia dalla password famiglia
   * Deve matchare l'algoritmo del backend (PBKDF2 + SHA256)
   */
  const deriveFamilyKey = async (familyPassword) => {
    try {
      // Salt fisso che matcha il backend
      const salt = new TextEncoder().encode('mcf-family-salt-2024-v1')

      // Importa la password come key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(familyPassword),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      // Deriva la chiave usando gli stessi parametri del backend
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000, // Deve matchare il backend
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // Extractable per poterla usare
        ['encrypt', 'decrypt']
      )

      return key
    } catch (error) {
      console.error('Error deriving family key:', error)
      throw new Error('Failed to derive encryption key')
    }
  }

  /**
   * Carica e salva la chiave famiglia in memoria per la sessione
   */
  const loadFamilyKey = async (familyPassword) => {
    try {
      const key = await deriveFamilyKey(familyPassword)
      familyKey.value = key
      isKeyLoaded.value = true

      // Salva in sessionStorage per persistenza durante la sessione
      // NOTA: Questo è sicuro solo per HTTPS e sessioni temporanee
      const exportedKey = await crypto.subtle.exportKey('raw', key)
      const keyArray = Array.from(new Uint8Array(exportedKey))
      sessionStorage.setItem('mcf-family-key', JSON.stringify(keyArray))

      console.log('✅ Family key loaded and cached')
      return true
    } catch (error) {
      console.error('❌ Error loading family key:', error)
      return false
    }
  }

  /**
   * Recupera la chiave famiglia dalla cache di sessione
   */
  const restoreFamilyKey = async () => {
    try {
      const cachedKey = sessionStorage.getItem('mcf-family-key')
      if (!cachedKey) return false

      const keyArray = JSON.parse(cachedKey)
      const keyBuffer = new Uint8Array(keyArray).buffer

      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      )

      familyKey.value = key
      isKeyLoaded.value = true

      console.log('✅ Family key restored from cache')
      return true
    } catch (error) {
      console.error('❌ Error restoring family key:', error)
      return false
    }
  }

  /**
   * Pulisce la chiave famiglia dalla memoria e cache
   */
  const clearFamilyKey = () => {
    familyKey.value = null
    isKeyLoaded.value = false
    sessionStorage.removeItem('mcf-family-key')
    console.log('🧹 Family key cleared')
  }

  /**
   * Critta dati usando la chiave famiglia
   */
  const encryptData = async (data, key = null) => {
    try {
      const cryptoKey = key || familyKey.value
      if (!cryptoKey) {
        throw new Error('No encryption key available')
      }

      // Serializza i dati
      const dataString = JSON.stringify(data)
      const dataBuffer = new TextEncoder().encode(dataString)

      // Genera IV random
      const iv = crypto.getRandomValues(new Uint8Array(12))

      // Critta i dati
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        dataBuffer
      )

      // Combina IV + encrypted data per il storage
      const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength)
      combinedBuffer.set(iv)
      combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length)

      // Converte in base64 per il trasporto
      return btoa(String.fromCharCode(...combinedBuffer))

    } catch (error) {
      console.error('Error encrypting data:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrittografa dati usando la chiave famiglia
   */
  const decryptData = async (encryptedData, key = null) => {
    try {
      const cryptoKey = key || familyKey.value
      if (!cryptoKey) {
        throw new Error('No decryption key available')
      }

      // Decodifica da base64
      const combinedBuffer = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )

      // Separa IV e dati crittografati
      const iv = combinedBuffer.slice(0, 12)
      const encryptedBuffer = combinedBuffer.slice(12)

      // Decrittografa
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encryptedBuffer
      )

      // Converte back to string e deserializza
      const dataString = new TextDecoder().decode(decryptedBuffer)
      return JSON.parse(dataString)

    } catch (error) {
      console.error('Error decrypting data:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Verifica se possiamo crittografare/decrittografare
   */
  const canEncrypt = computed(() => {
    return isKeyLoaded.value && familyKey.value !== null
  })

  /**
   * Utility per preparare dati utente per la crittografia
   */
  const prepareUserDataForEncryption = (userData) => {
    const sensitiveFields = ['email', 'first_name', 'last_name', 'phone_number', 'birth_date', 'bio']
    const sensitiveData = {}
    const publicData = { ...userData }

    // Sposta i campi sensibili nel contenitore crittografato
    sensitiveFields.forEach(field => {
      if (userData[field] !== undefined) {
        sensitiveData[field] = userData[field]
        delete publicData[field]
      }
    })

    return {
      sensitiveData,
      publicData
    }
  }

  /**
   * Auto-inizializzazione: prova a recuperare la chiave dalla cache al caricamento
   */
  const autoInit = async () => {
    await restoreFamilyKey()
  }

  // Auto-init quando il composable viene usato
  autoInit()

  return {
    // Stato
    isKeyLoaded: computed(() => isKeyLoaded.value),
    canEncrypt,

    // Gestione chiavi
    loadFamilyKey,
    restoreFamilyKey,
    clearFamilyKey,
    deriveFamilyKey,

    // Crittografia
    encryptData,
    decryptData,

    // Utility
    prepareUserDataForEncryption
  }
}

export default useCrypto