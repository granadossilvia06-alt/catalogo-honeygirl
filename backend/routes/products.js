const express = require('express')
const router = express.Router()
const { getDB } = require('../database/schema')
const { adminMiddleware, optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, (req, res) => {
  const db = getDB()
  const { category, gender, color, size, status, featured, search, sort, page = 1, limit = 24 } = req.query

  let conditions = []
  let params = []

  if (category) { conditions.push('p.category = ?'); params.push(category) }
  if (gender) { conditions.push('p.gender = ?'); params.push(gender) }
  if (color) { conditions.push('p.colors LIKE ?'); params.push(`%${color}%`) }
  if (size) { conditions.push('p.sizes LIKE ?'); params.push(`%${size}%`) }
  if (status) { conditions.push('p.status = ?'); params.push(status) }
  if (featured === 'true') { conditions.push('p.featured = 1') }
  if (req.query.new === 'true') { conditions.push('p.new_arrival = 1') }
  if (search) {
    conditions.push('(p.name LIKE ? OR p.code LIKE ? OR p.category LIKE ? OR p.tags LIKE ?)')
    const s = `%${search}%`
    params.push(s, s, s, s)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const sortMap = {
    newest: 'p.created_at DESC',
    oldest: 'p.created_at ASC',
    price_asc: 'p.price_unit ASC',
    price_desc: 'p.price_unit DESC',
    name_asc: 'p.name ASC',
    views: 'p.views DESC',
  }
  const orderBy = sortMap[sort] || 'p.featured DESC, p.created_at DESC'

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum

  const countSql = `SELECT COUNT(DISTINCT p.id) as total FROM products p ${where}`
  const total = db.get(countSql, params)?.total || 0

  const sql = `
    SELECT p.*,
      (SELECT GROUP_CONCAT(pi.filename) FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order) as image_list
    FROM products p ${where}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `

  const products = db.all(sql, [...params, limitNum, offset]).map(p => formatProduct(p, req.user))
  res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) })
})

router.get('/:id', optionalAuth, (req, res) => {
  const db = getDB()
  const product = db.get('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

  const images = db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [product.id])
  db.run('UPDATE products SET views = views + 1 WHERE id = ?', [product.id])

  const related = db.all(`
    SELECT p.*, (SELECT pi.filename FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image
    FROM products p WHERE p.category = ? AND p.id != ? AND p.status = 'available' LIMIT 4
  `, [product.category, product.id])

  res.json({
    ...formatProduct({ ...product, image_list: images.map(i => i.filename).join(',') }, req.user),
    images,
    related: related.map(r => formatProduct(r, req.user))
  })
})

router.post('/', adminMiddleware, (req, res) => {
  const db = getDB()
  const { name, code, category, gender, description, material, price_unit, price_wholesale, stock, status, featured, new_arrival, on_sale, sale_percentage, tags, sizes, colors } = req.body
  try {
    const result = db.run(`
      INSERT INTO products (name,code,category,gender,description,material,price_unit,price_wholesale,stock,status,featured,new_arrival,on_sale,sale_percentage,tags,sizes,colors)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [name, code, category, gender, description, material, price_unit||0, price_wholesale||0, stock||0, status||'available', featured?1:0, new_arrival!==false?1:0, on_sale?1:0, sale_percentage||0, JSON.stringify(tags||[]), JSON.stringify(sizes||[]), JSON.stringify(colors||[])])
    res.json({ id: result.lastInsertRowid, message: 'Producto creado exitosamente' })
  } catch (err) {
    if (err.message.includes('UNIQUE')) res.status(400).json({ error: 'Ya existe un producto con ese código' })
    else res.status(500).json({ error: err.message })
  }
})

router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  const { name, code, category, gender, description, material, price_unit, price_wholesale, stock, status, featured, new_arrival, on_sale, sale_percentage, tags, sizes, colors } = req.body
  db.run(`
    UPDATE products SET name=?,code=?,category=?,gender=?,description=?,material=?,price_unit=?,price_wholesale=?,stock=?,status=?,featured=?,new_arrival=?,on_sale=?,sale_percentage=?,tags=?,sizes=?,colors=?,updated_at=datetime('now')
    WHERE id=?
  `, [name, code, category, gender, description, material, price_unit, price_wholesale, stock, status, featured?1:0, new_arrival?1:0, on_sale?1:0, sale_percentage||0, JSON.stringify(tags||[]), JSON.stringify(sizes||[]), JSON.stringify(colors||[]), req.params.id])
  res.json({ message: 'Producto actualizado' })
})

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  db.run('DELETE FROM product_images WHERE product_id = ?', [req.params.id])
  db.run('DELETE FROM favorites WHERE product_id = ?', [req.params.id])
  db.run('DELETE FROM products WHERE id = ?', [req.params.id])
  res.json({ message: 'Producto eliminado' })
})

function formatProduct(p, user) {
  const isWholesale = user && (user.role === 'admin' || user.type === 'wholesale')
  return {
    ...p,
    tags: safeJSON(p.tags, []),
    sizes: safeJSON(p.sizes, []),
    colors: safeJSON(p.colors, []),
    featured: p.featured === 1 || p.featured === true,
    new_arrival: p.new_arrival === 1 || p.new_arrival === true,
    on_sale: p.on_sale === 1 || p.on_sale === true,
    images: p.image_list ? p.image_list.split(',').filter(Boolean) : [],
    price_wholesale: isWholesale ? p.price_wholesale : undefined,
  }
}

function safeJSON(val, fallback) {
  try { return JSON.parse(val) } catch { return fallback }
}

module.exports = router
