const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { supabase } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, async (req, res) => {
  const { search, status, type } = req.query

  let query = supabase
    .from('customers')
    .select('id,first_name,last_name,company,city,country,phone,email,username,status,customer_type,created_at,last_login')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('customer_type', type)
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.get('/:id', adminMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('id,first_name,last_name,company,city,country,phone,email,username,status,customer_type,created_at,last_login')
    .eq('id', req.params.id)
    .single()
  if (error || !data) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(data)
})

router.post('/', adminMiddleware, async (req, res) => {
  const { first_name, last_name, company, city, country, phone, email, username, password, status, customer_type } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' })

  const hash = bcrypt.hashSync(String(password), 10)
  const { data, error } = await supabase.from('customers').insert({
    first_name, last_name, company, city,
    country: country || 'Colombia',
    phone, email, username, password: hash,
    status: status || 'active',
    customer_type: customer_type || 'retail'
  }).select('id').single()

  if (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El usuario o correo ya existe' })
    return res.status(500).json({ error: error.message })
  }
  res.json({ id: data.id, message: 'Cliente creado exitosamente' })
})

router.put('/:id', adminMiddleware, async (req, res) => {
  const { first_name, last_name, company, city, country, phone, email, username, password, status, customer_type } = req.body

  const updates = { first_name, last_name, company, city, country, phone, email, username, status, customer_type }
  if (password) updates.password = bcrypt.hashSync(String(password), 10)

  const { error } = await supabase.from('customers').update(updates).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Cliente actualizado' })
})

router.patch('/:id/status', adminMiddleware, async (req, res) => {
  const { error } = await supabase.from('customers').update({ status: req.body.status }).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Estado actualizado' })
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  await supabase.from('favorites').delete().eq('customer_id', req.params.id)
  await supabase.from('customers').delete().eq('id', req.params.id)
  res.json({ message: 'Cliente eliminado' })
})

module.exports = router
