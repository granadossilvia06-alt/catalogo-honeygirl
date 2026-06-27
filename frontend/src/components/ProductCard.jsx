import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Tag, Star, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { addFavorite, removeFavorite } from '../api'
import { imgUrl } from '../utils/imageUrl'
import toast from 'react-hot-toast'

export default function ProductCard({ product, onFavoriteChange }) {
  const { isLoggedIn, user } = useAuthStore()
  const [isFav, setIsFav] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isWholesale = user?.type === 'wholesale' || user?.role === 'admin'

  const primaryImage = product.images?.[0] || product.primary_image
  const imgSrc = imgUrl(primaryImage)

  const toggleFav = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { toast.error('Inicia sesión para guardar favoritos'); return }
    try {
      if (isFav) {
        await removeFavorite(product.id)
        setIsFav(false)
        toast.success('Eliminado de favoritos')
      } else {
        await addFavorite(product.id)
        setIsFav(true)
        toast.success('Agregado a favoritos')
      }
      onFavoriteChange?.()
    } catch {}
  }

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

  return (
    <Link to={`/producto/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-stone-50 aspect-[3/4] mb-3">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fde8e8] to-[#fdf2f4]">
            <span className="font-display text-5xl text-[#c8636a] opacity-40">HG</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="flex items-center gap-1 bg-[#7d1624] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              <Star size={10} fill="white" /> Destacado
            </span>
          )}
          {product.new_arrival && (
            <span className="bg-stone-900 text-white text-xs px-2 py-0.5 rounded-full font-medium">Nuevo</span>
          )}
          {product.on_sale && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              <Zap size={10} /> -{product.sale_percentage}%
            </span>
          )}
          {product.status === 'sold_out' && (
            <span className="bg-stone-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">Agotado</span>
          )}
        </div>

        {/* Favorite btn */}
        <button
          onClick={toggleFav}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${isFav ? 'bg-[#7d1624] text-white' : 'bg-white/80 text-stone-500 hover:bg-white hover:text-[#7d1624]'}`}
        >
          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-medium text-stone-700">Ver producto</p>
          </div>
        </div>
      </div>

      <div className="px-1">
        <p className="text-xs text-stone-400 mb-0.5">{product.category}</p>
        <h3 className="font-medium text-stone-900 text-sm leading-tight mb-1 group-hover:text-[#7d1624] transition-colors line-clamp-2">{product.name}</h3>
        {product.code && <p className="text-xs text-stone-400 mb-2">#{product.code}</p>}

        {product.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.sizes.slice(0, 4).map(s => (
              <span key={s} className="text-xs border border-stone-200 rounded px-1.5 py-0.5 text-stone-500">{s}</span>
            ))}
            {product.sizes.length > 4 && <span className="text-xs text-stone-400">+{product.sizes.length - 4}</span>}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          {product.on_sale && product.sale_percentage ? (
            <>
              <span className="font-semibold text-stone-900">{formatPrice(product.price_unit * (1 - product.sale_percentage / 100))}</span>
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.price_unit)}</span>
            </>
          ) : (
            <span className="font-semibold text-stone-900">{formatPrice(product.price_unit)}</span>
          )}
        </div>

        {isWholesale && product.price_wholesale > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Tag size={10} className="text-[#7d1624]" />
            <span className="text-xs text-[#7d1624] font-medium">Mayor: {formatPrice(product.price_wholesale)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
