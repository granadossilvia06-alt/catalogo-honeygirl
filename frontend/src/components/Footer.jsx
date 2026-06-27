import { Link } from 'react-router-dom'
import { Camera, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-display text-2xl font-medium" style={{ color: '#7d1624' }}>Honey Girl</span>
            <p className="text-sm text-stone-500 mt-1">Moda que te hace brillar</p>
          </div>
          <nav className="flex gap-6">
            <Link to="/catalogo" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Catálogo</Link>
            <Link to="/catalogo?featured=true" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Destacados</Link>
            <Link to="/catalogo?new=true" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Novedades</Link>
            <Link to="/login" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Iniciar sesión</Link>
          </nav>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-[#7d1624] hover:border-[#7d1624] transition-all">
              <Camera size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-[#7d1624] hover:border-[#7d1624] transition-all">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} Honey Girl. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
