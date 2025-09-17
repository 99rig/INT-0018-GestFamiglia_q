/**
 * OCR Service - Estrazione testo da immagini
 * Supporta multiple provider: ML Kit (nativo), Tesseract.js (web)
 */

import { Capacitor } from '@capacitor/core'

// Tesseract solo per sviluppo web
let createWorker = null
if (!Capacitor.isNativePlatform()) {
  try {
    createWorker = require('tesseract.js').createWorker
  } catch (error) {
    console.log('Tesseract.js not available:', error.message)
  }
}

// ML Kit Text Recognition (nativo)
let MLKitTextRecognition = null
try {
  // Import dinamico per evitare errori su web
  if (Capacitor.isNativePlatform()) {
    MLKitTextRecognition = require('@pantrist/capacitor-plugin-ml-kit-text-recognition').MLKitTextRecognition
  }
} catch (error) {
  console.log('ML Kit Text Recognition not available:', error.message)
}

// Image to Text (community)
let ImageToText = null
try {
  if (Capacitor.isNativePlatform()) {
    ImageToText = require('@capacitor-community/image-to-text').ImageToText
  }
} catch (error) {
  console.log('Image to Text not available:', error.message)
}

class OCRService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform()
    this.platform = Capacitor.getPlatform()
    this.tesseractWorker = null
    
    console.log('🔍 OCR Service initialized:', {
      isNative: this.isNative,
      platform: this.platform,
      mlkitAvailable: !!MLKitTextRecognition,
      imageToTextAvailable: !!ImageToText
    })
  }

  /**
   * Estrae testo da un'immagine usando il miglior provider disponibile
   */
  async extractText(imageUri, options = {}) {
    const { 
      language = 'ita+eng',  // Italiano + Inglese per Tesseract
      provider = 'auto'       // auto, mlkit, tesseract
    } = options

    console.log('🔍 Starting OCR extraction:', { imageUri: imageUri.substring(0, 50) + '...', language, provider })

    let selectedProvider = provider
    
    try {
      // Determina il provider da usare
      if (provider === 'auto') {
        if (this.isNative && MLKitTextRecognition) {
          selectedProvider = 'mlkit'
        } else if (this.isNative && ImageToText) {
          selectedProvider = 'imagetotext'
        } else {
          selectedProvider = 'tesseract'
        }
      }

      console.log(`📱 Using OCR provider: ${selectedProvider}`)

      let result = null

      switch (selectedProvider) {
        case 'mlkit':
          result = await this.extractWithMLKit(imageUri)
          break
        case 'imagetotext':
          result = await this.extractWithImageToText(imageUri)
          break
        case 'tesseract':
          result = await this.extractWithTesseract(imageUri, language)
          break
        default:
          throw new Error(`Unknown OCR provider: ${selectedProvider}`)
      }

      if (result && result.text) {
        console.log('✅ OCR extraction successful:', result.text.substring(0, 100) + '...')
        
        // Post-processamento del testo
        const processedResult = this.postProcessText(result)
        
        return {
          success: true,
          provider: selectedProvider,
          ...processedResult
        }
      } else {
        throw new Error('No text detected in image')
      }

    } catch (error) {
      console.error('❌ OCR extraction failed:', error)
      
      // Fallback a Tesseract se il provider nativo fallisce (solo su web)
      if (provider !== 'tesseract' && selectedProvider !== 'tesseract' && !Capacitor.isNativePlatform() && createWorker) {
        console.log('🔄 Trying Tesseract fallback...')
        try {
          const fallbackResult = await this.extractWithTesseract(imageUri, language)
          return {
            success: true,
            provider: 'tesseract-fallback',
            ...this.postProcessText(fallbackResult)
          }
        } catch (fallbackError) {
          console.error('❌ Tesseract fallback also failed:', fallbackError)
        }
      }
      
      return {
        success: false,
        error: error.message,
        provider: selectedProvider
      }
    }
  }

  /**
   * Estrazione con ML Kit (nativo Android/iOS)
   */
  async extractWithMLKit(imageUri) {
    if (!MLKitTextRecognition) {
      throw new Error('ML Kit Text Recognition not available')
    }

    console.log('🤖 Using ML Kit for OCR...')
    
    const result = await MLKitTextRecognition.detectText({
      imageUri: imageUri
    })

    console.log('🤖 ML Kit result:', result)

    return {
      text: result.text || '',
      blocks: result.blocks || [],
      confidence: result.confidence || 0,
      metadata: {
        provider: 'mlkit',
        language: 'auto-detected'
      }
    }
  }

  /**
   * Estrazione con Image to Text (community plugin)
   */
  async extractWithImageToText(imageUri) {
    if (!ImageToText) {
      throw new Error('Image to Text plugin not available')
    }

    console.log('📷 Using Image to Text for OCR...')
    
    const result = await ImageToText.detectText({
      filename: imageUri
    })

    console.log('📷 Image to Text result:', result)

    return {
      text: result.text || '',
      blocks: [],
      confidence: result.confidence || 0,
      metadata: {
        provider: 'imagetotext',
        language: 'auto-detected'
      }
    }
  }

  /**
   * Estrazione con Tesseract.js (web/fallback)
   */
  async extractWithTesseract(imageUri, language = 'ita+eng') {
    if (!createWorker) {
      throw new Error('Tesseract.js not available on this platform')
    }
    
    console.log('📝 Using Tesseract.js for OCR...')
    
    try {
      // Inizializza worker se non esiste
      if (!this.tesseractWorker) {
        console.log('🔧 Initializing Tesseract worker...')
        this.tesseractWorker = await createWorker()
        await this.tesseractWorker.loadLanguage(language)
        await this.tesseractWorker.initialize(language)
      }

      console.log('🔍 Running Tesseract recognition...')
      const result = await this.tesseractWorker.recognize(imageUri)
      
      console.log('📝 Tesseract result:', {
        text: result.data.text.substring(0, 100) + '...',
        confidence: result.data.confidence
      })

      return {
        text: result.data.text || '',
        blocks: result.data.blocks || [],
        words: result.data.words || [],
        confidence: result.data.confidence || 0,
        metadata: {
          provider: 'tesseract',
          language: language,
          processingTime: result.jobId
        }
      }

    } catch (error) {
      console.error('📝 Tesseract error:', error)
      throw error
    }
  }

  /**
   * Post-processamento del testo estratto
   */
  postProcessText(ocrResult) {
    if (!ocrResult || !ocrResult.text) {
      return ocrResult
    }

    let processedText = ocrResult.text

    // Pulisce il testo
    processedText = processedText
      .replace(/\n{3,}/g, '\n\n')  // Rimuove troppe newline
      .replace(/\s{3,}/g, ' ')     // Rimuove spazi multipli
      .trim()

    // Cerca pattern comuni nelle ricevute italiane
    const patterns = this.extractReceiptPatterns(processedText)

    return {
      ...ocrResult,
      text: processedText,
      patterns: patterns
    }
  }

  /**
   * Estrae pattern comuni dalle ricevute (importi, date, etc.)
   */
  extractReceiptPatterns(text) {
    const patterns = {
      amounts: [],
      dates: [],
      merchants: [],
      totals: []
    }

    // Pattern per importi (€ 12,34 o 12.34€ o 12,34)
    const amountRegexes = [
      /€\s*(\d{1,4}[.,]\d{2})/g,
      /(\d{1,4}[.,]\d{2})\s*€/g,
      /(\d{1,4}[.,]\d{2})\s*EUR/gi,
      /TOTALE[:\s]*(\d{1,4}[.,]\d{2})/gi,
      /TOTAL[:\s]*(\d{1,4}[.,]\d{2})/gi
    ]

    amountRegexes.forEach(regex => {
      let match
      while ((match = regex.exec(text)) !== null) {
        const amount = match[1].replace(',', '.')
        patterns.amounts.push(parseFloat(amount))
      }
    })

    // Pattern per date (DD/MM/YYYY, DD-MM-YYYY, etc.)
    const dateRegexes = [
      /(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/g,
      /(\d{1,2}\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)[a-z]*\s+\d{2,4})/gi
    ]

    dateRegexes.forEach(regex => {
      let match
      while ((match = regex.exec(text)) !== null) {
        patterns.dates.push(match[1])
      }
    })

    // Trova il totale più probabile (solitamente l'importo più alto)
    if (patterns.amounts.length > 0) {
      patterns.totals = patterns.amounts
        .sort((a, b) => b - a)
        .slice(0, 3) // Top 3 amounts
    }

    // Cerca nomi di negozi comuni
    const merchantKeywords = [
      /^(.*(?:SUPERMERCATO|SUPERMARKET|ALIMENTARI|MARKET|COOP|CONAD|ESSELUNGA|CARREFOUR|IPERCOOP)).*$/gim,
      /^(.*(?:FARMACIA|PHARMACY)).*$/gim,
      /^(.*(?:BAR|CAFFÈ|COFFEE|RISTORANTE|RESTAURANT|PIZZERIA)).*$/gim
    ]

    merchantKeywords.forEach(regex => {
      let match
      while ((match = regex.exec(text)) !== null) {
        patterns.merchants.push(match[1].trim())
      }
    })

    console.log('🔍 Extracted patterns:', patterns)
    return patterns
  }

  /**
   * Cleanup del worker Tesseract
   */
  async cleanup() {
    if (this.tesseractWorker) {
      console.log('🧹 Cleaning up Tesseract worker...')
      await this.tesseractWorker.terminate()
      this.tesseractWorker = null
    }
  }

  /**
   * Verifica la disponibilità dei provider OCR
   */
  getAvailableProviders() {
    const providers = []

    if (this.isNative && MLKitTextRecognition) {
      providers.push({
        id: 'mlkit',
        name: 'ML Kit Text Recognition',
        platform: 'native',
        accuracy: 'high',
        speed: 'fast',
        offline: true
      })
    }

    if (this.isNative && ImageToText) {
      providers.push({
        id: 'imagetotext',
        name: 'Image to Text',
        platform: 'native',
        accuracy: 'medium',
        speed: 'fast',
        offline: true
      })
    }

    providers.push({
      id: 'tesseract',
      name: 'Tesseract.js',
      platform: 'web',
      accuracy: 'medium',
      speed: 'slow',
      offline: true
    })

    return providers
  }
}

// Singleton instance
export const ocrService = new OCRService()
export default ocrService