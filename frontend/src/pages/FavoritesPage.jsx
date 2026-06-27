import { Link, useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getFavorites } from '../api'
import { useAuthStore } from '../store/authStore'

export default function FavoritesPage() {
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites().then(r => r.data),
    enabled: isLoggedIn,
  })

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <Heart size={48} className="text-stone-200 mb-4" />
        <h2 className="font-display text-3xl text-stone-900 mb-2">Tus favoritos</h2>
        <p className="text-stone-500 mb-8">Inicia sesión para guardar y ver tus productos favoritos.</p>
        <Link to="/login" className="px-8 py-3 rounded-full text-sm font-medium text-white" style={{ background: '#7d1624' }}>
          Iniciar sesión
        </Link>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl text-stone-900">Mis Favoritos</h1>
            <p className="text-sm text-stone-500 mt-1">{favorites?.length || 0} productos guardados</p>
          </div>
          <Link to="/catalogo" className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
            Ver catálogo <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {[1,2,3,4].map(i => (
              <div key={i}>
                <div className="aspect-[3/4] bg-stone-100 rounded-2xl animate-pulse mb-3" />
                <div className="h-3 bg-stone-100 rounded animate-pulse mb-2" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        ) : favorites?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {favorites.map(p => (
              <ProductCard
                key={p.id}
                product={{ ...p, images: p.primary_image ? [p.primary_image] : [] }}
                onFavoriteChange={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="font-display text-3xl text-stone-300 mb-2">Aún no tienes favoritos</p>
            <p className="text-stone-400 text-sm mb-8">Explora el catálogo y guarda los productos que más te gusten.</p>
            <Link to="/catalogo" className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-white" style={{ background: '#7d1624' }}>
              Explorar catálogo <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
