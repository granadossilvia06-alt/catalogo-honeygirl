import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api'

const CATEGORIES = ['Blusas', 'Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Chaquetas', 'Accesorios', 'Conjuntos', 'Ropa Interior', 'Otros']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16']
const COLORS = ['Negro', 'Blanco', 'Beige', 'Rojo', 'Rosa', 'Azul', 'Verde', 'Amarillo', 'Morado', 'Naranja', 'Gris', 'Café']
const SORTS = [
  { value: '', label: 'Relevancia' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc', label: 'A — Z' },
  { value: 'views', label: 'Más vistos' },
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [grid, setGrid] = useState('4')
  const [page, setPage] = useState(1)

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    sort: searchParams.get('sort') || '',
    featured: searchParams.get('featured') || '',
    status: searchParams.get('status') || '',
  }

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: () => getProducts({ ...filters, page, limit: 24 }).then(r => r.data),
  })

  useEffect(() => { setPage(1) }, [searchParams.toString()])

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    setSearchParams(p)
  }

  const clearAll = () => setSearchParams({})

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'sort')

  const products = data?.products || []
  const total = data?.total || 0
  const pages = data?.pages || 1

  const gridCols = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl text-stone-900">Catálogo</h1>
            <p className="text-sm text-stone-500 mt-1">{total} productos</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-stone-200 rounded-full bg-white text-stone-700 focus:outline-none focus:border-[#7d1624] cursor-pointer"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>

            {/* Grid toggle */}
            <div className="hidden sm:flex items-center gap-1 border border-stone-200 rounded-full p-1">
              <button onClick={() => setGrid('3')} className={`p-1.5 rounded-full transition-colors ${grid === '3' ? 'bg-stone-100' : 'hover:bg-stone-50'}`}><Grid3X3 size={14} /></button>
              <button onClick={() => setGrid('4')} className={`p-1.5 rounded-full transition-colors ${grid === '4' ? 'bg-stone-100' : 'hover:bg-stone-50'}`}><LayoutList size={14} /></button>
            </div>

            <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-full text-sm text-stone-700 hover:border-[#7d1624] hover:text-[#7d1624] transition-all">
              <SlidersHorizontal size={14} /> Filtros
              {activeFilters.length > 0 && <span className="w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ background: '#7d1624' }}>{activeFilters.length}</span>}
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map(([key, val]) => (
              <button key={key} onClick={() => setFilter(key, '')} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: '#7d1624' }}>
                {val} <X size={12} />
              </button>
            ))}
            <button onClick={clearAll} className="px-3 py-1.5 rounded-full text-xs text-stone-500 border border-stone-200 hover:border-stone-400 transition-colors">
              Limpiar todo
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar filters */}
          {filtersOpen && (
            <aside className="w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                <FilterGroup title="Categoría" options={CATEGORIES} active={filters.category} onChange={v => setFilter('category', v)} />
                <FilterGroup title="Talla" options={SIZES} active={filters.size} onChange={v => setFilter('size', v)} pills />
                <FilterGroup title="Color" options={COLORS} active={filters.color} onChange={v => setFilter('color', v)} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Disponibilidad</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filters.status === 'available'} onChange={e => setFilter('status', e.target.checked ? 'available' : '')} className="accent-[#7d1624]" />
                    <span className="text-sm text-stone-700">Solo disponibles</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid ${gridCols[grid]} gap-x-4 gap-y-10`}>
                {Array(12).fill(0).map((_, i) => (
                  <div key={i}>
                    <div className="rounded-2xl bg-stone-100 aspect-[3/4] mb-3 animate-pulse" />
                    <div className="h-3 bg-stone-100 rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid ${gridCols[grid]} gap-x-4 gap-y-10`}>
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array(pages).fill(0).map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'text-white' : 'border border-stone-200 text-stone-600 hover:border-[#7d1624]'}`}
                        style={page === i + 1 ? { background: '#7d1624' } : {}}
                      >{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <p className="font-display text-3xl text-stone-300 mb-2">Sin resultados</p>
                <p className="text-stone-400 text-sm mb-6">Intenta con otros filtros</p>
                <button onClick={clearAll} className="px-6 py-2 rounded-full text-sm font-medium text-white" style={{ background: '#7d1624' }}>
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function FilterGroup({ title, options, active, onChange, pills }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">{title}</p>
      {pills ? (
        <div className="flex flex-wrap gap-1.5">
          {options.map(o => (
            <button key={o} onClick={() => onChange(active === o ? '' : o)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active === o ? 'text-white border-transparent' : 'border-stone-200 text-stone-600 hover:border-[#7d1624]'}`}
              style={active === o ? { background: '#7d1624' } : {}}
            >{o}</button>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {options.map(o => (
            <button key={o} onClick={() => onChange(active === o ? '' : o)}
              className={`block w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${active === o ? 'font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
              style={active === o ? { color: '#7d1624', background: '#fde8e8' } : {}}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  )
}
