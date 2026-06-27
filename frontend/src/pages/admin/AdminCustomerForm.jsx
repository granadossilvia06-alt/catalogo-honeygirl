import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Save, Loader } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCustomer, createCustomer, updateCustomer } from '../../api'
import toast from 'react-hot-toast'

const empty = { first_name: '', last_name: '', company: '', city: '', country: 'Colombia', phone: '', email: '', username: '', password: '', status: 'active', customer_type: 'retail' }

export default function AdminCustomerForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id).then(r => r.data),
    enabled: isEdit
  })

  useEffect(() => { if (data) setForm({ ...data, password: '' }) }, [data])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.username) { toast.error('El usuario es requerido'); return }
    if (!isEdit && !form.password) { toast.error('La contraseña es requerida'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await updateCustomer(id, form)
        toast.success('Cliente actualizado')
      } else {
        await createCustomer(form)
        toast.success('Cliente creado')
        navigate('/admin/clientes')
      }
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const input = "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white transition-colors"
  const sel = "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white appearance-none"
  const F = ({ label, children, required }) => (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/clientes" className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <h1 className="font-display text-3xl text-stone-900">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-60" style={{ background: '#7d1624' }}>
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Nombre" required><input className={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="María" /></F>
          <F label="Apellidos"><input className={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="García" /></F>
          <F label="Empresa"><input className={input} value={form.company} onChange={e => set('company', e.target.value)} /></F>
          <F label="Teléfono"><input className={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+57 300..." /></F>
          <F label="Ciudad"><input className={input} value={form.city} onChange={e => set('city', e.target.value)} /></F>
          <F label="País"><input className={input} value={form.country} onChange={e => set('country', e.target.value)} /></F>
          <F label="Correo electrónico"><input type="email" className={input} value={form.email} onChange={e => set('email', e.target.value)} /></F>
          <F label="Usuario" required><input className={input} value={form.username} onChange={e => set('username', e.target.value)} /></F>
          <F label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña (4 dígitos)'} required={!isEdit}>
            <input type="password" maxLength={isEdit ? 100 : 4} className={input} value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? '••••' : '1234'} />
          </F>
          <F label="Tipo de cliente">
            <select className={sel} value={form.customer_type} onChange={e => set('customer_type', e.target.value)}>
              <option value="retail">Detal</option>
              <option value="wholesale">Mayorista</option>
            </select>
          </F>
          <F label="Estado">
            <select className={sel} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </F>
        </div>
      </div>
    </div>
  )
}
