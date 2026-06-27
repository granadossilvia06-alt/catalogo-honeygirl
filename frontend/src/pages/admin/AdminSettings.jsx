import { useState } from 'react'
import { Save, Download, Shield, Loader } from 'lucide-react'
import { changeAdminPassword } from '../../api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function AdminSettings() {
  const { user } = useAuthStore()
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!current || !newPass) { toast.error('Completa todos los campos'); return }
    setSaving(true)
    try {
      await changeAdminPassword({ currentPassword: current, newPassword: newPass })
      toast.success('Contraseña actualizada correctamente')
      setCurrent(''); setNewPass('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally { setSaving(false) }
  }

  const handleBackup = () => {
    window.open('/api/health', '_blank')
    toast.success('Descarga de backup: ve a la carpeta backend/database/ y copia el archivo honeygirl.db')
  }

  const input = "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white"

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-3xl text-stone-900">Ajustes</h1>

      {/* Admin info */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-800 mb-4">Cuenta administrador</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ background: '#7d1624' }}>
            {(user?.username || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-stone-800">{user?.username}</p>
            <p className="text-sm text-stone-400">Administrador principal</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} style={{ color: '#7d1624' }} />
          <h2 className="font-semibold text-stone-800">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Contraseña actual</label>
            <input type="password" className={input} value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
            <input type="password" className={input} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: '#7d1624' }}>
            {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            Actualizar contraseña
          </button>
        </form>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-800 mb-2">Copia de seguridad</h2>
        <p className="text-sm text-stone-500 mb-4">
          Tu base de datos está en: <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">backend/database/honeygirl.db</code><br />
          Copia ese archivo para tener un respaldo completo de todos tus productos, clientes e imágenes.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Pasos para hacer copia de seguridad:</p>
          <ol className="list-decimal ml-4 space-y-1 text-amber-700">
            <li>Ve a la carpeta: <code>Catalogo-HoneyGirl/backend/database/</code></li>
            <li>Copia el archivo <strong>honeygirl.db</strong></li>
            <li>Pégalo en un lugar seguro (USB, Google Drive, etc.)</li>
          </ol>
        </div>
        <p className="text-xs text-stone-400 mt-3">Las imágenes se guardan en Supabase Storage y la base de datos en Supabase — ambas están seguras en la nube.</p>
      </div>

      {/* Access hint */}
      <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5">
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">Acceso al admin</p>
        <p className="text-sm text-stone-600">Recuerda: puedes acceder al panel de administrador haciendo <strong>clic 5 veces en el logo</strong> de la página principal.</p>
      </div>
    </div>
  )
}
