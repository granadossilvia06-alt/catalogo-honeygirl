import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCustomers, deleteCustomer, toggleCustomerStatus } from '../../api'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const queryClient = useQueryClient()

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', search, type],
    queryFn: () => getCustomers({ search, type }).then(r => r.data)
  })

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar al cliente "${name}"?`)) return
    try { await deleteCustomer(id); toast.success('Cliente eliminado'); queryClient.invalidateQueries({ queryKey: ['customers'] }) }
    catch { toast.error('Error') }
  }

  const handleToggle = async (id, status) => {
    const newStatus = status === 'active' ? 'inactive' : 'active'
    try { await toggleCustomerStatus(id, newStatus); queryClient.invalidateQueries({ queryKey: ['customers'] }) }
    catch { toast.error('Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">Clientes</h1>
          <p className="text-sm text-stone-500 mt-1">{customers?.length || 0} clientes registrados</p>
        </div>
        <Link to="/admin/clientes/nuevo" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90" style={{ background: '#7d1624' }}>
          <Plus size={16} /> Nuevo cliente
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white w-64" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white appearance-none">
          <option value="">Todos los tipos</option>
          <option value="retail">Detal</option>
          <option value="wholesale">Mayorista</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-stone-100">
            {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-stone-50 m-2 rounded-xl" />)}
          </div>
        ) : customers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Usuario</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Ciudad</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ background: '#7d1624' }}>
                          {c.first_name?.[0] || c.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-stone-400">{c.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm font-mono text-stone-600">{c.username}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-stone-600">{c.city || '—'}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.customer_type === 'wholesale' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                        {c.customer_type === 'wholesale' ? 'Mayorista' : 'Detal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {c.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleToggle(c.id, c.status)} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          {c.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <Link to={`/admin/clientes/editar/${c.id}`} className="p-2 text-stone-400 hover:text-[#7d1624] hover:bg-[#fde8e8] rounded-lg transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => handleDelete(c.id, `${c.first_name} ${c.last_name}`)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-stone-400 mb-4">No hay clientes</p>
            <Link to="/admin/clientes/nuevo" className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7d1624' }}>
              <Plus size={14} /> Agregar cliente
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
