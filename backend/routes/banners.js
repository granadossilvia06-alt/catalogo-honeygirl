const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { supabase } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

async function uploadToStorage(buffer, originalname, mimetype) {
  const ext = path.extname(originalname).toLowerCase()
  const filename = `banner-${uuidv4()}${ext}`
  const { error } = await supabase.storage.from('images').upload(filename, buffer, { contentType: mimetype })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('images').getPublicUrl(filename)
  return data.publicUrl
}

router.get('/', async (req, res) => {
  const { data } = await supabase.from('banners').select('*').eq('active', true).order('sort_order')
  res.json(data || [])
})

router.get('/all', adminMiddleware, async (req, res) => {
  const { data } = await supabase.from('banners').select('*').order('sort_order')
  res.json(data || [])
})

router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  const { title, subtitle, link } = req.body
  let image = null
  if (req.file) {
    image = await uploadToStorage(req.file.buffer, req.file.originalname, req.file.mimetype)
  }
  const { data, error } = await supabase.from('banners').insert({ title, subtitle, image, link }).select('id').single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ id: data.id, message: 'Banner creado' })
})

router.put('/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  const { title, subtitle, link, active } = req.body
  const updates = { title, subtitle, link, active: active === 'true' || active === true }
  if (req.file) {
    updates.image = await uploadToStorage(req.file.buffer, req.file.originalname, req.file.mimetype)
  }
  const { error } = await supabase.from('banners').update(updates).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Banner actualizado' })
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  await supabase.from('banners').delete().eq('id', req.params.id)
  res.json({ message: 'Banner eliminado' })
})

module.exports = router
