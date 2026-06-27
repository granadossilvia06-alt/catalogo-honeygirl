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
            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500 mb-3">¿Quieres ser mayorista?</p>
              <a
                href={`https://wa.me/593960249009?text=${encodeURIComponent('Hola Honey Girl 👋 Soy mayorista y me interesa emprender contigo. ¿Me puedes dar más información sobre cómo trabajar juntas?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contáctanos por WhatsApp
              </a>
            </div>
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
