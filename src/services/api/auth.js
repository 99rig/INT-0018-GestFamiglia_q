/**
 * Auth API - Gestione autenticazione e profilo utente
 */

import { apiClient } from './client.js'

export const authAPI = {
  // Autenticazione
  async login(email, password) {
    const response = await apiClient.post('/auth/login/', {
      email,
      password
    })
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken
    })
    return response.data
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register/', userData)
    return response.data
  },

  async logout() {
    await apiClient.post('/auth/logout/')
  },

  // Profilo utente
  async getUserProfile() {
    const response = await apiClient.get('/auth/profile/')
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/profile/')
    return response.data
  },

  async updateUserProfile(profileData) {
    const response = await apiClient.patch('/auth/profile/', profileData)
    return response.data
  }
}

export default authAPI