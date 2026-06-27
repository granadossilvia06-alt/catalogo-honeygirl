import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { loginCustomer, loginAdmin } from '../api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const isAdminMode = searchParams.get('admin') === '1'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fn = isAdminMode ? loginAdmin : loginCustomer
      const { data } = await fn({ username, password })
      login(data.token, data)
      toast.success(`Bienvenida, ${data.first_name || data.username}!`)
      navigate(isAdminMode ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #fde8e8 0%, #fff 50%)' }}>
      {/* Left decorative */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #7d1624, #b21f40)' }} />
        <div className="relative text-white">
          <p className="text-xs font-medium tracking-widest uppercase mb-6 opacity-70">Honey Girl</p>
          <h1 className="font-display text-6xl font-light leading-tight mb-6">
            Bienvenida<br />de nuevo
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Accede a tu cuenta para ver precios especiales y gestionar tus favoritos.
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center justify-center mb-8">
            <span className="font-display text-3xl" style={{ color: '#7d1624' }}>Honey Girl</span>
          </Link>

          <h2 className="text-2xl font-semibold text-stone-900 mb-1 text-center">
            {isAdminMode ? 'Panel Administrador' : 'Iniciar sesión'}
          </h2>
          <p className="text-sm text-stone-500 text-center mb-8">
            {isAdminMode ? 'Acceso exclusivo' : 'Ingresa con tu usuario y contraseña'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Usuario</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Tu usuario"
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                {isAdminMode ? 'Contraseña' : 'Contraseña (4 dígitos)'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  maxLength={isAdminMode ? 100 : 4}
                  placeholder={isAdminMode ? 'Contraseña' : '• • • •'}
                  className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] transition-colors bg-white tracking-widest"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: '#7d1624' }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          {!isAdminMode && (
            <p className="text-center text-sm text-stone-500 mt-6">
              ¿No tienes cuenta?{' '}
              <span className="font-medium" style={{ color: '#7d1624' }}>Contacta a Honey Girl</span>
            </p>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
