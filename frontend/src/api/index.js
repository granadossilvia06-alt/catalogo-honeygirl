import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

// AUTH
export const loginCustomer = (data) => api.post('/auth/login', data)
export const loginAdmin = (data) => api.post('/auth/admin/login', data)
export const changeAdminPassword = (data) => api.post('/auth/admin/change-password', data)

// PRODUCTS
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// IMAGES
export const uploadImages = (productId, files) => {
  const form = new FormData()
  files.forEach(f => form.append('images', f))
  return api.post(`/images/upload/${productId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getProductImages = (productId) => api.get(`/images/${productId}`)
export const setPrimaryImage = (productId, imageId) => api.put(`/images/${productId}/primary/${imageId}`)
export const reorderImages = (productId, order) => api.put(`/images/${productId}/reorder`, { order })
export const deleteImage = (imageId) => api.delete(`/images/${imageId}`)

// CUSTOMERS
export const getCustomers = (params) => api.get('/customers', { params })
export const getCustomer = (id) => api.get(`/customers/${id}`)
export const createCustomer = (data) => api.post('/customers', data)
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data)
export const toggleCustomerStatus = (id, status) => api.patch(`/customers/${id}/status`, { status })
export const deleteCustomer = (id) => api.delete(`/customers/${id}`)

// FAVORITES
export const getFavorites = () => api.get('/favorites')
export const addFavorite = (productId) => api.post(`/favorites/${productId}`)
export const removeFavorite = (productId) => api.delete(`/favorites/${productId}`)
export const checkFavorite = (productId) => api.get(`/favorites/check/${productId}`)

// STATS
export const getStats = () => api.get('/stats')

// BANNERS
export const getBanners = () => api.get('/banners')
export const getAllBanners = () => api.get('/banners/all')
export const createBanner = (data) => api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateBanner = (id, data) => api.put(`/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteBanner = (id) => api.delete(`/banners/${id}`)

export default api
