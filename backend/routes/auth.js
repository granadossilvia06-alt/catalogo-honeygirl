const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDB } = require('../database/schema')

const JWT_SECRET = process.env.JWT_SECRET || 'honeygirl-secret-2024'

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body
  const db = getDB()
  const admin = db.get('SELECT * FROM admins WHERE username = ?', [username])
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }
  const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, role: 'admin', username: admin.username })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const db = getDB()
  const customer = db.get('SELECT * FROM customers WHERE username = ?', [username])
  if (!customer || !bcrypt.compareSync(password, customer.password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }
  if (customer.status !== 'active') {
    return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' })
  }
  db.run('UPDATE customers SET last_login = datetime("now") WHERE id = ?', [customer.id])
  const token = jwt.sign(
    { id: customer.id, username: customer.username, role: 'customer', type: customer.customer_type },
    JWT_SECRET, { expiresIn: '30d' }
  )
  res.json({
    token, role: 'customer', username: customer.username,
    first_name: customer.first_name, last_name: customer.last_name,
    customer_type: customer.customer_type
  })
})

router.post('/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Sin autorización' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' })
    const db = getDB()
    const admin = db.get('SELECT * FROM admins WHERE id = ?', [decoded.id])
    if (!bcrypt.compareSync(currentPassword, admin.password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }
    const hash = bcrypt.hashSync(newPassword, 10)
    db.run('UPDATE admins SET password = ? WHERE id = ?', [hash, decoded.id])
    res.json({ message: 'Contraseña actualizada' })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

module.exports = router
