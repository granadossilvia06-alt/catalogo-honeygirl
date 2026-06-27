import { useQuery } from '@tanstack/react-query'
import { Package, Users, Star, Zap, TrendingUp, Eye } from 'lucide-react'
import { getStats } from '../../api'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => getStats().then(r => r.data)
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-stone-100" />)}
      </div>
    </div>
  )

  const cards = [
    { icon: Package, label: 'Total productos', value: stats?.totalProducts, sub: `${stats?.availableProducts} disponibles`, color: '#7d1624' },
    { icon: Users, label: 'Clientes', value: stats?.totalCustomers, sub: `${stats?.activeCustomers} activos`, color: '#c8636a' },
    { icon: Star, label: 'Destacados', value: stats?.featuredProducts, sub: 'Productos destacados', color: '#d97706' },
    { icon: Zap, label: 'En oferta', value: stats?.onSale, sub: 'Con descuento activo', color: '#059669' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Resumen general de Honey Girl</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '15' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-stone-900 mb-0.5">{value ?? '—'}</p>
            <p className="text-sm font-medium text-stone-700">{label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top viewed */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Más vistos</h2>
            <TrendingUp size={16} className="text-stone-400" />
          </div>
          <div className="space-y-3">
            {stats?.topViewed?.map((p, i) => (
              <Link to={`/admin/productos/editar/${p.id}`} key={p.id} className="flex items-center gap-3 hover:bg-stone-50 rounded-xl p-2 transition-colors">
                <span className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center bg-stone-100 text-stone-500 shrink-0">{i + 1}</span>
                {p.primary_image ? (
                  <img src={`/uploads/${p.primary_image}`} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-stone-100 shrink-0 flex items-center justify-center">
                    <Package size={14} className="text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                  <p className="text-xs text-stone-400">{p.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
                  <Eye size={12} /> {p.views}
                </div>
              </Link>
            ))}
            {!stats?.topViewed?.length && <p className="text-sm text-stone-400 text-center py-4">Sin datos aún</p>}
          </div>
        </div>

        {/* Recent customers */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Clientes recientes</h2>
            <Link to="/admin/clientes" className="text-xs text-[#7d1624] hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentCustomers?.map(c => (
              <Link to={`/admin/clientes/editar/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-stone-50 rounded-xl p-2 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ background: '#7d1624' }}>
                  {c.first_name?.[0] || c.email?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-stone-400 truncate">{c.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${c.customer_type === 'wholesale' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                  {c.customer_type === 'wholesale' ? 'Mayor.' : 'Detal'}
                </span>
              </Link>
            ))}
            {!stats?.recentCustomers?.length && <p className="text-sm text-stone-400 text-center py-4">Sin clientes aún</p>}
          </div>
        </div>
      </div>

      {/* Categories */}
      {stats?.categories?.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Productos por categoría</h2>
          <div className="space-y-3">
            {stats.categories.map(c => (
              <div key={c.category} className="flex items-center gap-3">
                <p className="text-sm text-stone-700 w-28 shrink-0">{c.category || 'Sin categoría'}</p>
                <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / stats.totalProducts) * 100}%`, background: '#7d1624' }} />
                </div>
                <span className="text-xs text-stone-400 w-6 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
