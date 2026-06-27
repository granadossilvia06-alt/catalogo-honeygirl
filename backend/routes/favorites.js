const express = require('express')
const router = express.Router()
const { getDB } = require('../database/schema')
const { authMiddleware } = require('../middleware/auth')

router.get('/', authMiddleware, (req, res) => {
  const db = getDB()
  const favs = db.all(`
    SELECT p.id, p.name, p.code, p.price_unit, p.status, p.category,
      (SELECT pi.filename FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image
    FROM favorites f JOIN products p ON f.product_id = p.id
    WHERE f.customer_id = ? ORDER BY f.created_at DESC
  `, [req.user.id])
  res.json(favs)
})

router.post('/:productId', authMiddleware, (req, res) => {
  const db = getDB()
  try {
    db.run('INSERT INTO favorites (customer_id, product_id) VALUES (?, ?)', [req.user.id, req.params.productId])
    res.json({ message: 'Agregado a favoritos' })
  } catch {
    res.status(400).json({ error: 'Ya está en favoritos' })
  }
})

router.delete('/:productId', authMiddleware, (req, res) => {
  const db = getDB()
  db.run('DELETE FROM favorites WHERE customer_id = ? AND product_id = ?', [req.user.id, req.params.productId])
  res.json({ message: 'Eliminado de favoritos' })
})

router.get('/check/:productId', authMiddleware, (req, res) => {
  const db = getDB()
  const fav = db.get('SELECT id FROM favorites WHERE customer_id = ? AND product_id = ?', [req.user.id, req.params.productId])
  res.json({ isFavorite: !!fav })
})

module.exports = router
