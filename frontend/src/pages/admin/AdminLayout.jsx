import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Users, Image, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/ajustes', icon: Settings, label: 'Ajustes' },
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-stone-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Logo */}
        <div className="p-6 border-b border-stone-100">
          <span className="font-display text-2xl font-medium" style={{ color: '#7d1624' }}>Honey Girl</span>
          <p className="text-xs text-stone-400 mt-0.5">Panel Administrador</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
              }
              style={({ isActive }) => isActive ? { background: '#7d1624' } : {}}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: '#7d1624' }}>
              {(user?.username || 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">{user?.username}</p>
              <p className="text-xs text-stone-400">Administrador</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-100 px-4 sm:px-6 h-14 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-stone-500">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <nav className="flex items-center gap-1.5 text-sm text-stone-400">
            <span>Admin</span>
            <ChevronRight size={14} />
          </nav>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
