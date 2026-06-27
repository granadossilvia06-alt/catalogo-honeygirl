const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { supabase } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

const UPLOADS_DIR = path.join(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|webp|gif/i.test(path.extname(file.originalname))) cb(null, true)
    else cb(new Error('Solo imágenes'))
  }
})

router.post('/upload/:productId', adminMiddleware, upload.array('images', 10), async (req, res) => {
  const productId = parseInt(req.params.productId)
  const { count } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  const existingCount = count || 0
  const inserted = []

  for (let idx = 0; idx < req.files.length; idx++) {
    const file = req.files[idx]
    const isPrimary = existingCount === 0 && idx === 0
    const sortOrder = existingCount + idx
    const { data } = await supabase.from('product_images').insert({
      product_id: productId,
      filename: file.filename,
      is_primary: isPrimary,
      sort_order: sortOrder
    }).select('id').single()
    inserted.push({ id: data?.id, filename: file.filename, is_primary: isPrimary, sort_order: sortOrder })
  }

  res.json({ uploaded: inserted })
})

router.get('/:productId', async (req, res) => {
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', req.params.productId)
    .order('sort_order')
  res.json(data || [])
})

router.put('/:productId/primary/:imageId', adminMiddleware, async (req, res) => {
  await supabase.from('product_images').update({ is_primary: false }).eq('product_id', req.params.productId)
  await supabase.from('product_images').update({ is_primary: true }).eq('id', req.params.imageId).eq('product_id', req.params.productId)
  res.json({ message: 'Imagen principal actualizada' })
})

router.put('/:productId/reorder', adminMiddleware, async (req, res) => {
  const { order } = req.body
  await Promise.all(order.map((id, idx) =>
    supabase.from('product_images').update({ sort_order: idx }).eq('id', id)
  ))
  res.json({ message: 'Orden actualizado' })
})

router.delete('/:imageId', adminMiddleware, async (req, res) => {
  const { data: img } = await supabase.from('product_images').select('*').eq('id', req.params.imageId).single()
  if (!img) return res.status(404).json({ error: 'Imagen no encontrada' })

  const filePath = path.join(UPLOADS_DIR, img.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  await supabase.from('product_images').delete().eq('id', req.params.imageId)

  if (img.is_primary) {
    const { data: next } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', img.product_id)
      .order('sort_order')
      .limit(1)
      .single()
    if (next) await supabase.from('product_images').update({ is_primary: true }).eq('id', next.id)
  }

  res.json({ message: 'Imagen eliminada' })
})

module.exports = router
