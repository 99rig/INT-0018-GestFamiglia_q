/**
 * Users API - Gestione famiglie e inviti
 */

import { apiClient } from './client.js'
import { publicApiClient } from './publicClient.js'

export const usersAPI = {
  // ===== FAMIGLIE =====
  async getFamilies() {
    const response = await apiClient.get('/families/')
    return response.data
  },

  async getFamily(id) {
    const response = await apiClient.get(`/families/${id}/`)
    return response.data
  },

  async createFamily(familyData) {
    const response = await apiClient.post('/families/', familyData)
    return response.data
  },

  async updateFamily(id, familyData) {
    const response = await apiClient.put(`/families/${id}/`, familyData)
    return response.data
  },

  async deleteFamily(id) {
    await apiClient.delete(`/families/${id}/`)
  },

  async joinFamily(joinData) {
    const response = await apiClient.post('/families/join/', joinData)
    return response.data
  },

  async leaveFamily() {
    const response = await apiClient.post('/families/leave/')
    return response.data
  },

  // ===== INVITI FAMIGLIA =====
  async createFamilyInvitation(invitationData) {
    const response = await apiClient.post('/family-invitations/', invitationData)
    return response.data
  },

  async getFamilyInvitations() {
    const response = await apiClient.get('/family-invitations/')
    return response.data
  },

  async getReceivedInvitations() {
    const response = await apiClient.get('/family-invitations/received/')
    return response.data
  },

  async acceptInvitation(invitationId) {
    const response = await apiClient.post(`/family-invitations/${invitationId}/accept/`)
    return response.data
  },

  // ===== ACCOUNT =====
  async changePassword(passwordData) {
    const response = await apiClient.post('/users/change_password/', passwordData)
    return response.data
  },

  // ===== PASSWORD RESET =====
  // Usa publicApiClient per evitare invio di token di autenticazione
  async requestPasswordReset(email) {
    const response = await publicApiClient.post('/auth/password-reset/', { email })
    return response.data
  },

  async confirmPasswordReset(resetData) {
    const response = await publicApiClient.post('/auth/password-reset-confirm/', resetData)
    return response.data
  }
}

export default usersAPI