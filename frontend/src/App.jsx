import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import LoginPage from './pages/LoginPage'
import FavoritesPage from './pages/FavoritesPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCustomerForm from './pages/admin/AdminCustomerForm'
import AdminBanners from './pages/admin/AdminBanners'
import AdminSettings from './pages/admin/AdminSettings'

function ProtectedAdmin({ children }) {
  const { isAdmin } = useAuthStore()
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogo" element={<CatalogPage />} />
      <Route path="/producto/:id" element={<ProductPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/favoritos" element={<FavoritesPage />} />

      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="productos/nuevo" element={<AdminProductForm />} />
        <Route path="productos/editar/:id" element={<AdminProductForm />} />
        <Route path="clientes" element={<AdminCustomers />} />
        <Route path="clientes/nuevo" element={<AdminCustomerForm />} />
        <Route path="clientes/editar/:id" element={<AdminCustomerForm />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="ajustes" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
