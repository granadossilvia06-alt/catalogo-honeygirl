const express = require('express')
const router = express.Router()
const { getDB } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, (req, res) => {
  const db = getDB()
  const totalProducts = db.get('SELECT COUNT(*) as c FROM products')?.c || 0
  const availableProducts = db.get("SELECT COUNT(*) as c FROM products WHERE status='available'")?.c || 0
  const soldOutProducts = db.get("SELECT COUNT(*) as c FROM products WHERE status='sold_out'")?.c || 0
  const totalCustomers = db.get('SELECT COUNT(*) as c FROM customers')?.c || 0
  const activeCustomers = db.get("SELECT COUNT(*) as c FROM customers WHERE status='active'")?.c || 0
  const featuredProducts = db.get('SELECT COUNT(*) as c FROM products WHERE featured=1')?.c || 0
  const newArrivals = db.get('SELECT COUNT(*) as c FROM products WHERE new_arrival=1')?.c || 0
  const onSale = db.get('SELECT COUNT(*) as c FROM products WHERE on_sale=1')?.c || 0
  const topViewed = db.all(`
    SELECT p.id, p.name, p.code, p.views, p.category,
      (SELECT pi.filename FROM product_images pi WHERE pi.product_id=p.id AND pi.is_primary=1 LIMIT 1) as primary_image
    FROM products p ORDER BY views DESC LIMIT 5
  `)
  const categories = db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC')
  const recentCustomers = db.all('SELECT id,first_name,last_name,email,customer_type,created_at FROM customers ORDER BY created_at DESC LIMIT 5')

  res.json({ totalProducts, availableProducts, soldOutProducts, totalCustomers, activeCustomers, featuredProducts, newArrivals, onSale, topViewed, categories, recentCustomers })
})

module.exports = router
