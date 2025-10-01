import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'MyCrisisFamily',
    versions: {
      web: { name: '1.0.37', code: 32 },
      android: { name: '1.0.37', code: 32 },
      ios: { name: '0.0.0', code: 0 }  // iOS non supportato
    },
    theme: 'default'
  }),

  getters: {
    getAppInfo: (state) => ({
      name: state.appName,
      version: state.versions.web.name,
      theme: state.theme
    }),

    getCurrentVersion: (state) => {
      // Rileva il platform corrente
      const userAgent = navigator.userAgent.toLowerCase()

      if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
        return state.versions.ios
      }

      if (userAgent.includes('android')) {
        return state.versions.android
      }

      return state.versions.web
    },

    getVersionByPlatform: (state) => (platform) => {
      return state.versions[platform] || state.versions.web
    }
  },

  actions: {
    setAppName(name) {
      this.appName = name
    },
    
    setTheme(theme) {
      this.theme = theme
    }
  },

  persist: true
})