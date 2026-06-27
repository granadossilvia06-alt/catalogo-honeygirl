import { useState, useRef } from 'react'
import { Plus, Trash2, Image, Loader } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllBanners, createBanner, deleteBanner } from '../../api'
import toast from 'react-hot-toast'

export default function AdminBanners() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()
  const queryClient = useQueryClient()

  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners-all'],
    queryFn: () => getAllBanners().then(r => r.data)
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('subtitle', subtitle)
      form.append('link', link)
      if (file) form.append('image', file)
      await createBanner(form)
      toast.success('Banner creado')
      setTitle(''); setSubtitle(''); setLink(''); setFile(null)
      queryClient.invalidateQueries({ queryKey: ['banners-all'] })
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este banner?')) return
    try { await deleteBanner(id); toast.success('Banner eliminado'); queryClient.invalidateQueries({ queryKey: ['banners-all'] }) }
    catch { toast.error('Error') }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl text-stone-900">Banners</h1>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-800 mb-5">Agregar banner</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del banner (ej: Nueva Colección)" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white" />
          <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtítulo" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white" />
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="Enlace (ej: /catalogo)" className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white" />
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current.click()} className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-[#7d1624] hover:text-[#7d1624] transition-colors flex items-center justify-center gap-2">
              <Image size={15} /> {file ? file.name : 'Seleccionar imagen (recomendado: 1920×600px)'}
            </button>
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: '#7d1624' }}>
            {saving ? <Loader size={15} className="animate-spin" /> : <Plus size={15} />}
            Crear banner
          </button>
        </form>
      </div>

      {/* Banner list */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Banners activos</h2>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />)}
          </div>
        ) : banners?.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 p-4">
                {b.image ? (
                  <img src={`/uploads/${b.image}`} alt="" className="w-24 h-14 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-24 h-14 bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
                    <Image size={20} className="text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800">{b.title || '(Sin título)'}</p>
                  <p className="text-xs text-stone-400 truncate">{b.subtitle}</p>
                </div>
                <button onClick={() => handleDelete(b.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Image size={32} className="mx-auto text-stone-200 mb-2" />
            <p className="text-stone-400 text-sm">No hay banners creados</p>
          </div>
        )}
      </div>
    </div>
  )
}
