const express = require('express')
const router = express.Router()
const { supabase } = require('../database/schema')
const { adminMiddleware, optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, async (req, res) => {
  const { category, gender, color, size, status, featured, search, sort, page = 1, limit = 24 } = req.query

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum

  let query = supabase
    .from('products')
    .select('*, product_images(filename, is_primary, sort_order)', { count: 'exact' })

  if (category) query = query.eq('category', category)
  if (gender) query = query.eq('gender', gender)
  if (status) query = query.eq('status', status)
  if (featured === 'true') query = query.eq('featured', true)
  if (req.query.new === 'true') query = query.eq('new_arrival', true)
  if (size) query = query.contains('sizes', [size])
  if (color) query = query.contains('colors', [color])
  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const sortMap = {
    newest: { column: 'created_at', ascending: false },
    oldest: { column: 'created_at', ascending: true },
    price_asc: { column: 'price_unit', ascending: true },
    price_desc: { column: 'price_unit', ascending: false },
    name_asc: { column: 'name', ascending: true },
    views: { column: 'views', ascending: false },
  }

  if (sort && sortMap[sort]) {
    query = query.order(sortMap[sort].column, { ascending: sortMap[sort].ascending })
  } else {
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limitNum - 1)

  const { data: products, count, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json({
    products: (products || []).map(p => formatProduct(p, req.user)),
    total: count || 0,
    page: pageNum,
    pages: Math.ceil((count || 0) / limitNum)
  })
})

router.get('/:id', optionalAuth, async (req, res) => {
  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_images(id, filename, is_primary, sort_order)')
    .eq('id', req.params.id)
    .single()

  if (error || !product) return res.status(404).json({ error: 'Producto no encontrado' })

  await supabase.from('products').update({ views: (product.views || 0) + 1 }).eq('id', product.id)

  const { data: related } = await supabase
    .from('products')
    .select('*, product_images(filename, is_primary, sort_order)')
    .eq('category', product.category)
    .eq('status', 'available')
    .neq('id', product.id)
    .limit(4)

  const images = (product.product_images || []).sort((a, b) => a.sort_order - b.sort_order)

  res.json({
    ...formatProduct(product, req.user),
    images,
    related: (related || []).map(r => formatProduct(r, req.user))
  })
})

router.post('/', adminMiddleware, async (req, res) => {
  const { name, code, category, gender, description, material, price_unit, price_wholesale,
    stock, status, featured, new_arrival, on_sale, sale_percentage, tags, sizes, colors } = req.body

  const { data, error } = await supabase.from('products').insert({
    name, code, category, gender, description, material,
    price_unit: price_unit || 0,
    price_wholesale: price_wholesale || 0,
    stock: stock || 0,
    status: status || 'available',
    featured: !!featured,
    new_arrival: new_arrival !== false,
    on_sale: !!on_sale,
    sale_percentage: sale_percentage || 0,
    tags: tags || [],
    sizes: sizes || [],
    colors: colors || []
  }).select('id').single()

  if (error) {
    if (error.message.includes('unique') || error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un producto con ese código' })
    }
    return res.status(500).json({ error: error.message })
  }

  res.json({ id: data.id, message: 'Producto creado exitosamente' })
})

router.put('/:id', adminMiddleware, async (req, res) => {
  const { name, code, category, gender, description, material, price_unit, price_wholesale,
    stock, status, featured, new_arrival, on_sale, sale_percentage, tags, sizes, colors } = req.body

  const { error } = await supabase.from('products').update({
    name, code, category, gender, description, material,
    price_unit, price_wholesale, stock, status,
    featured: !!featured,
    new_arrival: !!new_arrival,
    on_sale: !!on_sale,
    sale_percentage: sale_percentage || 0,
    tags: tags || [],
    sizes: sizes || [],
    colors: colors || [],
    updated_at: new Date().toISOString()
  }).eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Producto actualizado' })
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  await supabase.from('product_images').delete().eq('product_id', req.params.id)
  await supabase.from('favorites').delete().eq('product_id', req.params.id)
  await supabase.from('products').delete().eq('id', req.params.id)
  res.json({ message: 'Producto eliminado' })
})

function formatProduct(p, user) {
  const isWholesale = user && (user.role === 'admin' || user.type === 'wholesale')
  const images = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)
  return {
    ...p,
    product_images: undefined,
    tags: Array.isArray(p.tags) ? p.tags : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    images: images.map(i => i.filename),
    primary_image: images.find(i => i.is_primary)?.filename || images[0]?.filename || null,
    price_wholesale: isWholesale ? p.price_wholesale : undefined,
  }
}

module.exports = router
