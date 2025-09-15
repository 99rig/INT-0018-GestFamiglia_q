import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'Mumble App',
    version: '1.0.0',
    theme: 'default'
  }),

  getters: {
    getAppInfo: (state) => ({
      name: state.appName,
      version: state.version,
      theme: state.theme
    })
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