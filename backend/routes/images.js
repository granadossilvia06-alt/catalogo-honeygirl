const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { getDB } = require('../database/schema')
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

router.post('/upload/:productId', adminMiddleware, upload.array('images', 10), (req, res) => {
  const db = getDB()
  const productId = req.params.productId
  const existingCount = db.get('SELECT COUNT(*) as c FROM product_images WHERE product_id = ?', [productId])?.c || 0
  const inserted = []
  req.files.forEach((file, idx) => {
    const isPrimary = existingCount === 0 && idx === 0 ? 1 : 0
    const sortOrder = existingCount + idx
    const result = db.run('INSERT INTO product_images (product_id,filename,is_primary,sort_order) VALUES (?,?,?,?)', [productId, file.filename, isPrimary, sortOrder])
    inserted.push({ id: result.lastInsertRowid, filename: file.filename, is_primary: isPrimary, sort_order: sortOrder })
  })
  res.json({ uploaded: inserted })
})

router.get('/:productId', (req, res) => {
  const db = getDB()
  res.json(db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [req.params.productId]))
})

router.put('/:productId/primary/:imageId', adminMiddleware, (req, res) => {
  const db = getDB()
  db.run('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [req.params.productId])
  db.run('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?', [req.params.imageId, req.params.productId])
  res.json({ message: 'Imagen principal actualizada' })
})

router.put('/:productId/reorder', adminMiddleware, (req, res) => {
  const db = getDB()
  const { order } = req.body
  order.forEach((id, idx) => db.run('UPDATE product_images SET sort_order = ? WHERE id = ?', [idx, id]))
  res.json({ message: 'Orden actualizado' })
})

router.delete('/:imageId', adminMiddleware, (req, res) => {
  const db = getDB()
  const img = db.get('SELECT * FROM product_images WHERE id = ?', [req.params.imageId])
  if (!img) return res.status(404).json({ error: 'Imagen no encontrada' })
  const filePath = path.join(UPLOADS_DIR, img.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  db.run('DELETE FROM product_images WHERE id = ?', [req.params.imageId])
  if (img.is_primary) {
    const next = db.get('SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order LIMIT 1', [img.product_id])
    if (next) db.run('UPDATE product_images SET is_primary = 1 WHERE id = ?', [next.id])
  }
  res.json({ message: 'Imagen eliminada' })
})

module.exports = router
