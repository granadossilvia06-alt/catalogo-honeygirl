const express = require('express')
const cors = require('cors')
const path = require('path')
const { initDB } = require('./database/schema')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Init DB first, then start server
initDB().then(() => {
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/products', require('./routes/products'))
  app.use('/api/customers', require('./routes/customers'))
  app.use('/api/images', require('./routes/images'))
  app.use('/api/favorites', require('./routes/favorites'))
  app.use('/api/stats', require('./routes/stats'))
  app.use('/api/banners', require('./routes/banners'))

  app.listen(PORT, () => {
    console.log(`\n🚀 HoneyGirl Backend en http://localhost:${PORT}`)
    console.log(`📁 Imágenes en http://localhost:${PORT}/uploads/`)
    console.log(`\n💡 Acceso admin: haz clic 5 veces en el logo\n`)
  })
}).catch(err => {
  console.error('Error iniciando base de datos:', err)
  process.exit(1)
})
