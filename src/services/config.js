/**
 * Servizio di configurazione ambiente
 * Gestisce le variabili d'ambiente per lo sviluppo e la produzione
 */

export class ConfigService {
  /**
   * Ottiene l'URL base dell'API
   */
  static getApiBaseUrl() {
    return process.env.API_BASE_URL || 'http://localhost:8000'
  }

  /**
   * Ottiene l'URL base del frontend
   */
  static getFrontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:9000/app'
  }

  /**
   * Controlla se siamo in ambiente di sviluppo
   */
  static isDevelopment() {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * Controlla se siamo in ambiente di produzione
   */
  static isProduction() {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * Ottiene tutte le configurazioni ambiente
   */
  static getEnvironmentConfig() {
    return {
      apiBaseUrl: this.getApiBaseUrl(),
      frontendUrl: this.getFrontendUrl(),
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      nodeEnv: process.env.NODE_ENV
    }
  }

  /**
   * Log delle configurazioni per debug (solo in sviluppo)
   */
  static logConfig() {
    if (this.isDevelopment()) {
      console.log('🔧 Environment Configuration:', this.getEnvironmentConfig())
    }
  }
}

export default ConfigService