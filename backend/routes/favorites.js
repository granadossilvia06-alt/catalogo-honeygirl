const express = require('express')
const router = express.Router()
const { supabase } = require('../database/schema')
const { authMiddleware } = require('../middleware/auth')

router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id, products(id, name, code, price_unit, status, category, product_images(filename, is_primary, sort_order))')
    .eq('customer_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const favs = (data || []).map(f => {
    const p = f.products
    if (!p) return null
    const images = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      price_unit: p.price_unit,
      status: p.status,
      category: p.category,
      primary_image: images.find(i => i.is_primary)?.filename || images[0]?.filename || null
    }
  }).filter(Boolean)

  res.json(favs)
})

router.post('/:productId', authMiddleware, async (req, res) => {
  const { error } = await supabase.from('favorites').insert({
    customer_id: req.user.id,
    product_id: parseInt(req.params.productId)
  })
  if (error) return res.status(400).json({ error: 'Ya está en favoritos' })
  res.json({ message: 'Agregado a favoritos' })
})

router.delete('/:productId', authMiddleware, async (req, res) => {
  await supabase.from('favorites')
    .delete()
    .eq('customer_id', req.user.id)
    .eq('product_id', req.params.productId)
  res.json({ message: 'Eliminado de favoritos' })
})

router.get('/check/:productId', authMiddleware, async (req, res) => {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('customer_id', req.user.id)
    .eq('product_id', req.params.productId)
    .limit(1)
  res.json({ isFavorite: !!(data && data.length > 0) })
})

module.exports = router
