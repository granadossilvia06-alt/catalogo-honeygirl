import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Eye, Package, Star, CheckCircle, XCircle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../../api'
import { imgUrl } from '../../utils/imageUrl'
import toast from 'react-hot-toast'

const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, category, page],
    queryFn: () => getProducts({ search, category, page, limit: 20 }).then(r => r.data)
  })

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteProduct(id)
      toast.success('Producto eliminado')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const products = data?.products || []
  const total = data?.total || 0
  const pages = data?.pages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">Productos</h1>
          <p className="text-sm text-stone-500 mt-1">{total} productos en total</p>
        </div>
        <Link to="/admin/productos/nuevo" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: '#7d1624' }}>
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar productos..." className="pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white w-64" />
        </div>
        <input value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
          placeholder="Filtrar categoría..." className="px-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-stone-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-12 h-12 bg-stone-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Producto</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Código</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Categoría</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Precio</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Stock</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={imgUrl(p.images[0])} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                              <Package size={16} className="text-stone-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-stone-800 truncate max-w-[140px]">{p.name}</p>
                              {p.featured && <Star size={12} fill="#7d1624" style={{ color: '#7d1624' }} />}
                            </div>
                            <div className="flex gap-1 mt-0.5">
                              {p.new_arrival && <span className="text-xs bg-stone-100 text-stone-500 px-1.5 rounded">Nuevo</span>}
                              {p.on_sale && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 rounded">Oferta</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-mono text-stone-500">{p.code}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-stone-600">{p.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-stone-900">{formatPrice(p.price_unit)}</p>
                        {p.price_wholesale > 0 && <p className="text-xs text-stone-400">Mayor: {formatPrice(p.price_wholesale)}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-sm font-medium ${p.stock < 5 ? 'text-red-600' : 'text-stone-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'available' ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle size={11} /> Disponible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full w-fit">
                            <XCircle size={11} /> Agotado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <a href={`/producto/${p.id}`} target="_blank" rel="noreferrer" className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                            <Eye size={15} />
                          </a>
                          <Link to={`/admin/productos/editar/${p.id}`} className="p-2 text-stone-400 hover:text-[#7d1624] hover:bg-[#fde8e8] rounded-lg transition-colors">
                            <Pencil size={15} />
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-stone-100">
                {Array(pages).fill(0).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'text-white' : 'text-stone-600 border border-stone-200 hover:border-[#7d1624]'}`}
                    style={page === i + 1 ? { background: '#7d1624' } : {}}
                  >{i + 1}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400 mb-4">No hay productos</p>
            <Link to="/admin/productos/nuevo" className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7d1624' }}>
              <Plus size={14} /> Agregar primer producto
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
