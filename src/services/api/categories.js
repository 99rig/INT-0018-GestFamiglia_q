/**
 * Categories API - Gestione categorie e sottocategorie
 */

import { apiClient } from './client.js'

export const categoriesAPI = {
  // Categorie
  async getCategories() {
    const response = await apiClient.get('/categories/')
    return response.data
  },

  async createCategory(categoryData) {
    const response = await apiClient.post('/categories/', categoryData)
    return response.data
  },

  async updateCategory(id, categoryData) {
    const response = await apiClient.put(`/categories/${id}/`, categoryData)
    return response.data
  },

  async deleteCategory(id) {
    await apiClient.delete(`/categories/${id}/`)
  }
}

export default categoriesAPI