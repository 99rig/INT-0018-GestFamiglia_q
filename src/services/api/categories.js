/**
 * Categories API - Gestione categorie e sottocategorie
 */

import { apiClient } from './client.js'

export const categoriesAPI = {
  // Categorie
  async getCategories(pageSize = 20) {
    const response = await apiClient.get('/categories/', {
      params: { page_size: pageSize }
    })
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