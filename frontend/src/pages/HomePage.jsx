import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, TrendingUp, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProducts, getBanners } from '../api'

export default function HomePage() {
  const [bannerIdx, setBannerIdx] = useState(0)

  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ featured: true, limit: 8 }).then(r => r.data)
  })

  const { data: newData } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => getProducts({ sort: 'newest', limit: 8 }).then(r => r.data)
  })

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => getBanners().then(r => r.data)
  })

  useEffect(() => {
    if (!banners?.length) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners])

  const featured = featuredData?.products || []
  const newest = newData?.products || []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero / Banner */}
      {banners?.length > 0 ? (
        <section className="relative h-[70vh] overflow-hidden">
          {banners.map((b, i) => (
            <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
              {b.image && (
                <img src={`/uploads/${b.image}`} alt={b.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-6 text-white">
                  {b.title && <h1 className="font-display text-5xl md:text-7xl font-light mb-4">{b.title}</h1>}
                  {b.subtitle && <p className="text-lg md:text-xl opacity-90 mb-8 max-w-md">{b.subtitle}</p>}
                  <Link to="/catalogo" className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors">
                    Ver colección <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fde8e8 0%, #fff 60%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: '#c8636a' }}>Nueva Colección</p>
              <h1 className="font-display text-6xl md:text-8xl font-light leading-tight mb-6" style={{ color: '#7d1624' }}>
                Moda que<br />te hace<br /><em>brillar</em>
              </h1>
              <p className="text-lg text-stone-500 mb-10 leading-relaxed max-w-lg">
                Descubre piezas únicas diseñadas para mujeres que viven con intensidad y elegancia.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalogo" className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full text-sm font-medium transition-all hover:opacity-90 hover:shadow-lg" style={{ background: '#7d1624' }}>
                  Ver catálogo <ArrowRight size={16} />
                </Link>
                <Link to="/catalogo?featured=true" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium border border-stone-200 text-stone-700 hover:border-[#7d1624] hover:text-[#7d1624] transition-all">
                  Destacados <Star size={16} />
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full" style={{ background: '#c8636a', filter: 'blur(80px)' }} />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full" style={{ background: '#7d1624', filter: 'blur(60px)' }} />
          </div>
        </section>
      )}

      {/* Category pills */}
      <section className="border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex gap-2 overflow-x-auto scrollbar-none">
          {[['Todo', '/catalogo'], ['Blusas', '/catalogo?category=Blusas'], ['Vestidos', '/catalogo?category=Vestidos'], ['Pantalones', '/catalogo?category=Pantalones'], ['Faldas', '/catalogo?category=Faldas'], ['Accesorios', '/catalogo?category=Accesorios'], ['Novedades', '/catalogo?new=true']].map(([label, href]) => (
            <Link key={label} to={href} className="shrink-0 px-5 py-2 rounded-full text-sm font-medium border border-stone-200 text-stone-600 hover:border-[#7d1624] hover:text-[#7d1624] transition-all whitespace-nowrap">
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star size={14} style={{ color: '#7d1624' }} />
                <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#7d1624' }}>Selección especial</span>
              </div>
              <h2 className="font-display text-4xl text-stone-900">Productos Destacados</h2>
            </div>
            <Link to="/catalogo?featured=true" className="hidden sm:flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newest.length > 0 && (
        <section className="py-16" style={{ background: '#fdf8f8' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: '#7d1624' }} />
                  <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#7d1624' }}>Recién llegados</span>
                </div>
                <h2 className="font-display text-4xl text-stone-900">Nuevas Llegadas</h2>
              </div>
              <Link to="/catalogo?sort=newest" className="hidden sm:flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {newest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-3xl p-12 text-center text-white" style={{ background: 'linear-gradient(135deg, #7d1624, #b21f40)' }}>
          <TrendingUp size={32} className="mx-auto mb-4 opacity-80" />
          <h2 className="font-display text-4xl mb-3">¿Eres mayorista?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Inicia sesión con tu cuenta para ver precios especiales y catálogo completo.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white px-8 py-3 rounded-full text-sm font-semibold transition-all hover:bg-stone-100" style={{ color: '#7d1624' }}>
            Iniciar sesión <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
