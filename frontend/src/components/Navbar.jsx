import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, User, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const LOGO_CLICKS_NEEDED = 5

export default function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const logoClickCount = useRef(0)
  const logoTimerRef = useRef(null)

  const handleLogoClick = () => {
    if (isAdmin) { navigate('/admin'); return }
    logoClickCount.current += 1
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current)
    if (logoClickCount.current >= LOGO_CLICKS_NEEDED) {
      logoClickCount.current = 0
      navigate('/login?admin=1')
    } else {
      logoTimerRef.current = setTimeout(() => { logoClickCount.current = 0 }, 2000)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 select-none cursor-pointer">
            <img src="/logo.png" alt="Honey Girl" className="h-10 w-auto" onError={(e) => { e.target.style.display='none' }} />
            <span className="font-display text-2xl font-medium tracking-wide" style={{ color: '#7d1624' }}>
              Honey Girl
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-[#7d1624]' : 'text-stone-600 hover:text-stone-900'}`}>
              Inicio
            </Link>
            <Link to="/catalogo" className={`text-sm font-medium transition-colors ${isActive('/catalogo') ? 'text-[#7d1624]' : 'text-stone-600 hover:text-stone-900'}`}>
              Catálogo
            </Link>
            <Link to="/catalogo?featured=true" className={`text-sm font-medium transition-colors text-stone-600 hover:text-stone-900`}>
              Destacados
            </Link>
            <Link to="/catalogo?new=true" className={`text-sm font-medium transition-colors text-stone-600 hover:text-stone-900`}>
              Novedades
            </Link>
          </nav>

          {/* Search + actions */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 bg-stone-50 rounded-full px-4 py-2 border border-stone-200 focus-within:border-[#7d1624] transition-colors">
              <Search size={15} className="text-stone-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="bg-transparent text-sm outline-none w-44 text-stone-700 placeholder-stone-400"
              />
            </form>

            {isLoggedIn && (
              <Link to="/favoritos" className="p-2 text-stone-600 hover:text-[#7d1624] transition-colors">
                <Heart size={20} />
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: '#7d1624' }}>
                    {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-500">Conectado como</p>
                    <p className="text-sm font-medium text-stone-800 truncate">{user?.username}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                      <User size={14} /> Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:border-[#7d1624] hover:text-[#7d1624] transition-all">
                <User size={15} /> Ingresar
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-stone-600">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-stone-50 rounded-full px-4 py-2 border border-stone-200">
            <Search size={15} className="text-stone-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm outline-none flex-1" />
          </form>
          {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/catalogo?featured=true', 'Destacados'], ['/catalogo?new=true', 'Novedades']].map(([path, label]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-stone-700">{label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
