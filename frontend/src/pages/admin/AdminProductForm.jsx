import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Upload, X, GripVertical, Star, Save, Loader } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, uploadImages, getProductImages, deleteImage, setPrimaryImage } from '../../api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Blusas', 'Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Chaquetas', 'Accesorios', 'Conjuntos', 'Ropa Interior', 'Otros']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16', 'Única']
const COLORS_LIST = ['Negro', 'Blanco', 'Beige', 'Crema', 'Rojo', 'Rosa', 'Fucsia', 'Azul', 'Azul Marino', 'Verde', 'Amarillo', 'Morado', 'Naranja', 'Gris', 'Café', 'Dorado', 'Plateado']

const empty = {
  name: '', code: '', category: '', gender: '', description: '', material: '',
  price_unit: '', price_wholesale: '', stock: '', status: 'available',
  featured: false, new_arrival: true, on_sale: false, sale_percentage: 0,
  tags: [], sizes: [], colors: []
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef()

  const [form, setForm] = useState(empty)
  const [images, setImages] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [productId, setProductId] = useState(id || null)

  const { data: product } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => getProduct(id).then(r => r.data),
    enabled: isEdit
  })

  const { data: imgData, refetch: refetchImages } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => getProductImages(productId).then(r => r.data),
    enabled: !!productId
  })

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        code: product.code || '',
        category: product.category || '',
        gender: product.gender || '',
        description: product.description || '',
        material: product.material || '',
        price_unit: product.price_unit || '',
        price_wholesale: product.price_wholesale || '',
        stock: product.stock || '',
        status: product.status || 'available',
        featured: !!product.featured,
        new_arrival: !!product.new_arrival,
        on_sale: !!product.on_sale,
        sale_percentage: product.sale_percentage || 0,
        tags: product.tags || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
      })
    }
  }, [product])

  useEffect(() => {
    if (imgData) setImages(imgData)
  }, [imgData])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (k, val) => setForm(f => ({
    ...f,
    [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val]
  }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) { setForm(f => ({ ...f, tags: [...f.tags, t] })); setTagInput('') }
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Nombre y código son requeridos'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, form)
        toast.success('Producto actualizado')
        queryClient.invalidateQueries({ queryKey: ['admin-products'] })
        queryClient.invalidateQueries({ queryKey: ['product', id] })
      } else {
        const { data } = await createProduct(form)
        setProductId(data.id)
        toast.success('Producto creado. Ahora puedes subir imágenes.')
        queryClient.invalidateQueries({ queryKey: ['admin-products'] })
        navigate(`/admin/productos/editar/${data.id}`, { replace: true })
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (files) => {
    if (!productId) { toast.error('Guarda el producto primero'); return }
    setUploading(true)
    try {
      await uploadImages(productId, Array.from(files))
      toast.success(`${files.length} imagen(es) subida(s)`)
      refetchImages()
    } catch {
      toast.error('Error al subir imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImg = async (imgId) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await deleteImage(imgId)
      toast.success('Imagen eliminada')
      refetchImages()
    } catch { toast.error('Error al eliminar') }
  }

  const handleSetPrimary = async (imgId) => {
    try {
      await setPrimaryImage(productId, imgId)
      toast.success('Imagen principal actualizada')
      refetchImages()
    } catch { toast.error('Error') }
  }

  const F = ({ label, children, required }) => (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const input = "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white transition-colors"
  const select = "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#7d1624] bg-white transition-colors appearance-none"

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/productos" className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-stone-900">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
            {isEdit && <p className="text-sm text-stone-400 mt-0.5">#{form.code}</p>}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ background: '#7d1624' }}>
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800">Información general</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Nombre" required><input className={input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Blusa Floral Premium" /></F>
              <F label="Código interno" required><input className={input} value={form.code} onChange={e => set('code', e.target.value)} placeholder="Ej: BLU-001" /></F>
              <F label="Categoría">
                <select className={select} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </F>
              <F label="Género">
                <select className={select} value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {['Mujer', 'Hombre', 'Unisex', 'Niña', 'Niño'].map(g => <option key={g}>{g}</option>)}
                </select>
              </F>
              <F label="Material"><input className={input} value={form.material} onChange={e => set('material', e.target.value)} placeholder="Ej: 95% Algodón, 5% Elastano" /></F>
              <F label="Stock"><input type="number" min="0" className={input} value={form.stock} onChange={e => set('stock', e.target.value)} /></F>
            </div>
            <F label="Descripción">
              <textarea rows={3} className={input + ' resize-none'} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del producto..." />
            </F>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800">Precios</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Precio unitario" required>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input type="number" min="0" className={input + ' pl-7'} value={form.price_unit} onChange={e => set('price_unit', e.target.value)} placeholder="0" />
                </div>
              </F>
              <F label="Precio mayorista">
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input type="number" min="0" className={input + ' pl-7'} value={form.price_wholesale} onChange={e => set('price_wholesale', e.target.value)} placeholder="0" />
                </div>
              </F>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => set('on_sale', !form.on_sale)} className={`w-10 h-5 rounded-full transition-colors ${form.on_sale ? 'bg-[#7d1624]' : 'bg-stone-200'} relative`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.on_sale ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm text-stone-700">En oferta</span>
              </label>
              {form.on_sale && (
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="100" className="w-20 px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#7d1624]" value={form.sale_percentage} onChange={e => set('sale_percentage', e.target.value)} />
                  <span className="text-sm text-stone-500">% descuento</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800">Tallas</h2>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button key={s} type="button" onClick={() => toggleArr('sizes', s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.sizes.includes(s) ? 'text-white border-transparent' : 'border-stone-200 text-stone-600 hover:border-[#7d1624]'}`}
                  style={form.sizes.includes(s) ? { background: '#7d1624' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800">Colores</h2>
            <div className="flex flex-wrap gap-2">
              {COLORS_LIST.map(c => (
                <button key={c} type="button" onClick={() => toggleArr('colors', c)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.colors.includes(c) ? 'text-white border-transparent' : 'border-stone-200 text-stone-600 hover:border-[#7d1624]'}`}
                  style={form.colors.includes(c) ? { background: '#7d1624' } : {}}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800">Etiquetas</h2>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Agregar etiqueta..." className={input + ' flex-1'} />
              <button type="button" onClick={addTag} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7d1624' }}>+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white" style={{ background: '#7d1624' }}>
                  {t} <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X size={11} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado y visibilidad */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800">Estado</h2>
            <F label="Disponibilidad">
              <select className={select} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="available">Disponible</option>
                <option value="sold_out">Agotado</option>
              </select>
            </F>
            <div className="space-y-3">
              {[['featured', 'Producto destacado', '⭐'], ['new_arrival', 'Nuevo ingreso', '🆕']].map(([key, label, icon]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-sm text-stone-700">{icon} {label}</span>
                  <div onClick={() => set(key, !form[key])} className={`w-10 h-5 rounded-full transition-colors ${form[key] ? 'bg-[#7d1624]' : 'bg-stone-200'} relative cursor-pointer`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800">Fotografías</h2>

            {!productId && (
              <p className="text-xs text-stone-400 bg-stone-50 rounded-xl p-3">
                Guarda el producto primero para poder subir imágenes.
              </p>
            )}

            {productId && (
              <>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
                <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-[#7d1624] hover:text-[#7d1624] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? 'Subiendo...' : 'Subir fotografías'}
                </button>

                <div className="space-y-2">
                  {images.map(img => (
                    <div key={img.id} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 group">
                      <GripVertical size={14} className="text-stone-300" />
                      <img src={`/uploads/${img.filename}`} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        {img.is_primary ? (
                          <span className="text-xs text-[#7d1624] font-medium flex items-center gap-1"><Star size={10} fill="currentColor" /> Principal</span>
                        ) : (
                          <button type="button" onClick={() => handleSetPrimary(img.id)} className="text-xs text-stone-400 hover:text-[#7d1624] transition-colors">
                            Hacer principal
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={() => handleDeleteImg(img.id)} className="p-1 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
