const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { getDB } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `banner-${uuidv4()}${path.extname(file.originalname).toLowerCase()}`)
})
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } })

router.get('/', (req, res) => {
  const db = getDB()
  res.json(db.all('SELECT * FROM banners WHERE active=1 ORDER BY sort_order'))
})

router.get('/all', adminMiddleware, (req, res) => {
  const db = getDB()
  res.json(db.all('SELECT * FROM banners ORDER BY sort_order'))
})

router.post('/', adminMiddleware, upload.single('image'), (req, res) => {
  const db = getDB()
  const { title, subtitle, link } = req.body
  const image = req.file ? req.file.filename : null
  const result = db.run('INSERT INTO banners (title,subtitle,image,link) VALUES (?,?,?,?)', [title, subtitle, image, link])
  res.json({ id: result.lastInsertRowid, message: 'Banner creado' })
})

router.put('/:id', adminMiddleware, upload.single('image'), (req, res) => {
  const db = getDB()
  const { title, subtitle, link, active } = req.body
  if (req.file) {
    db.run('UPDATE banners SET title=?,subtitle=?,image=?,link=?,active=? WHERE id=?', [title, subtitle, req.file.filename, link, active, req.params.id])
  } else {
    db.run('UPDATE banners SET title=?,subtitle=?,link=?,active=? WHERE id=?', [title, subtitle, link, active, req.params.id])
  }
  res.json({ message: 'Banner actualizado' })
})

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  db.run('DELETE FROM banners WHERE id=?', [req.params.id])
  res.json({ message: 'Banner eliminado' })
})

module.exports = router
