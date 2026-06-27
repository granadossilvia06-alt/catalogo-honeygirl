const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { getDB } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, (req, res) => {
  const db = getDB()
  const { search, status, type } = req.query
  let conditions = []
  let params = []
  if (search) {
    conditions.push('(first_name LIKE ? OR last_name LIKE ? OR username LIKE ? OR email LIKE ? OR company LIKE ?)')
    const s = `%${search}%`
    params.push(s, s, s, s, s)
  }
  if (status) { conditions.push('status = ?'); params.push(status) }
  if (type) { conditions.push('customer_type = ?'); params.push(type) }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  res.json(db.all(`SELECT id,first_name,last_name,company,city,country,phone,email,username,status,customer_type,created_at,last_login FROM customers ${where} ORDER BY created_at DESC`, params))
})

router.get('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  const c = db.get('SELECT id,first_name,last_name,company,city,country,phone,email,username,status,customer_type,created_at,last_login FROM customers WHERE id=?', [req.params.id])
  if (!c) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(c)
})

router.post('/', adminMiddleware, (req, res) => {
  const db = getDB()
  const { first_name, last_name, company, city, country, phone, email, username, password, status, customer_type } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' })
  try {
    const hash = bcrypt.hashSync(String(password), 10)
    const result = db.run(
      'INSERT INTO customers (first_name,last_name,company,city,country,phone,email,username,password,status,customer_type) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [first_name, last_name, company, city, country||'Colombia', phone, email, username, hash, status||'active', customer_type||'retail']
    )
    res.json({ id: result.lastInsertRowid, message: 'Cliente creado exitosamente' })
  } catch (err) {
    if (err.message.includes('UNIQUE')) res.status(400).json({ error: 'El usuario o correo ya existe' })
    else res.status(500).json({ error: err.message })
  }
})

router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  const { first_name, last_name, company, city, country, phone, email, username, password, status, customer_type } = req.body
  if (password) {
    const hash = bcrypt.hashSync(String(password), 10)
    db.run('UPDATE customers SET password=? WHERE id=?', [hash, req.params.id])
  }
  db.run('UPDATE customers SET first_name=?,last_name=?,company=?,city=?,country=?,phone=?,email=?,username=?,status=?,customer_type=? WHERE id=?',
    [first_name, last_name, company, city, country, phone, email, username, status, customer_type, req.params.id])
  res.json({ message: 'Cliente actualizado' })
})

router.patch('/:id/status', adminMiddleware, (req, res) => {
  const db = getDB()
  db.run('UPDATE customers SET status=? WHERE id=?', [req.body.status, req.params.id])
  res.json({ message: 'Estado actualizado' })
})

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB()
  db.run('DELETE FROM favorites WHERE customer_id=?', [req.params.id])
  db.run('DELETE FROM customers WHERE id=?', [req.params.id])
  res.json({ message: 'Cliente eliminado' })
})

module.exports = router
