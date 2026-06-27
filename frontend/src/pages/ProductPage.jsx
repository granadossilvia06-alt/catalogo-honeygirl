import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Share2, ChevronLeft, ZoomIn, Tag, Package, Ruler, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProduct, addFavorite, removeFavorite } from '../api'
import { imgUrl } from '../utils/imageUrl'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const { isLoggedIn, user } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')

  const isWholesale = user?.type === 'wholesale' || user?.role === 'admin'

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id).then(r => r.data)
  })

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-stone-100 animate-pulse" />
          <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="w-20 h-20 rounded-xl bg-stone-100 animate-pulse" />)}</div>
        </div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-6 bg-stone-100 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const images = product.images || []
  const currentImg = images[selectedImg]
  const imgSrc = imgUrl(currentImg?.filename || currentImg)

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

  const toggleFav = async () => {
    if (!isLoggedIn) { toast.error('Inicia sesión para guardar favoritos'); return }
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false); toast.success('Eliminado de favoritos') }
      else { await addFavorite(id); setIsFav(true); toast.success('Agregado a favoritos') }
    } catch {}
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado')
    }
  }

  const getImgSrc = (img) => imgUrl(img?.filename || img)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <Link to="/" className="hover:text-stone-600 transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link to="/catalogo" className="hover:text-stone-600 transition-colors">Catálogo</Link>
          <ChevronRight size={14} />
          <span className="text-stone-700">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-stone-50 aspect-square cursor-zoom-in" onClick={() => setZoom(true)}>
              {imgSrc ? (
                <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-8xl text-stone-200">HG</span>
                </div>
              )}
              <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                <ZoomIn size={16} className="text-stone-600" />
              </button>
              {product.status === 'sold_out' && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-medium">Agotado</span>
                </div>
              )}

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedImg(i => Math.max(0, i - 1)) }} disabled={selectedImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedImg(i => Math.min(images.length - 1, i + 1)) }} disabled={selectedImg === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? 'border-[#7d1624]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={getImgSrc(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              {product.category && <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-2">{product.category} {product.gender && `· ${product.gender}`}</p>}
              <h1 className="font-display text-4xl text-stone-900 leading-tight mb-2">{product.name}</h1>
              <p className="text-sm text-stone-400">Código: #{product.code}</p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs bg-stone-100 text-stone-600">{t}</span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="py-4 border-y border-stone-100">
              <div className="flex items-baseline gap-3">
                {product.on_sale && product.sale_percentage ? (
                  <>
                    <span className="text-3xl font-semibold text-stone-900">
                      {formatPrice(product.price_unit * (1 - product.sale_percentage / 100))}
                    </span>
                    <span className="text-lg text-stone-400 line-through">{formatPrice(product.price_unit)}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: '#c8636a' }}>
                      -{product.sale_percentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-stone-900">{formatPrice(product.price_unit)}</span>
                )}
              </div>
              {isWholesale && product.price_wholesale > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Tag size={14} style={{ color: '#7d1624' }} />
                  <span className="text-sm font-medium" style={{ color: '#7d1624' }}>
                    Precio mayorista: {formatPrice(product.price_wholesale)}
                  </span>
                </div>
              )}
              {!isLoggedIn && (
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-stone-400 mt-2 hover:text-stone-600 transition-colors">
                  <Tag size={12} /> Inicia sesión para ver precio mayorista
                </Link>
              )}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <span key={c} className="px-3 py-1.5 border border-stone-200 rounded-full text-sm text-stone-600">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-stone-700">Talla</p>
                  {selectedSize && <p className="text-xs text-stone-400">Seleccionada: {selectedSize}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${s === selectedSize ? 'text-white border-transparent' : 'border-stone-200 text-stone-700 hover:border-[#7d1624]'}`}
                      style={s === selectedSize ? { background: '#7d1624' } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={toggleFav}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium border-2 transition-all ${isFav ? 'text-white border-transparent' : 'border-stone-200 text-stone-700 hover:border-[#7d1624] hover:text-[#7d1624]'}`}
                style={isFav ? { background: '#7d1624' } : {}}>
                <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                {isFav ? 'En favoritos' : 'Guardar'}
              </button>
              <button onClick={handleShare} className="w-14 h-14 flex items-center justify-center border-2 border-stone-200 rounded-2xl text-stone-600 hover:border-[#7d1624] hover:text-[#7d1624] transition-all">
                <Share2 size={16} />
              </button>
            </div>

            {/* Stock & material */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={14} className="text-stone-500" />
                  <p className="text-xs font-medium text-stone-500">Stock</p>
                </div>
                <p className="text-sm font-semibold text-stone-900">{product.stock} unidades</p>
              </div>
              {product.material && (
                <div className="p-4 rounded-2xl bg-stone-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler size={14} className="text-stone-500" />
                    <p className="text-xs font-medium text-stone-500">Material</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{product.material}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Descripción</p>
                <p className="text-sm text-stone-500 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {product.related?.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-100">
            <h2 className="font-display text-3xl text-stone-900 mb-8">También te puede gustar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {product.related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && imgSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <img src={imgSrc} alt={product.name} className="max-w-full max-h-full object-contain rounded-lg" />
          <button className="absolute top-4 right-4 text-white text-2xl font-light w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">×</button>
        </div>
      )}

      <Footer />
    </div>
  )
}
