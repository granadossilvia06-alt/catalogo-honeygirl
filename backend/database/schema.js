require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { enabled: false }
  }
)

async function initDB() {
  const { error } = await supabase.from('admins').select('id').limit(1)
  if (error) {
    throw new Error(`No se pudo conectar a Supabase: ${error.message}`)
  }
  console.log('✅ Conectado a Supabase')

  const { data: admins } = await supabase.from('admins').select('id').eq('username', 'admin').limit(1)
  if (!admins || admins.length === 0) {
    const hash = bcrypt.hashSync('honey2024', 10)
    await supabase.from('admins').insert({ username: 'admin', password: hash })
    console.log('✅ Admin creado: usuario=admin  contraseña=honey2024')
  }
}

module.exports = { supabase, initDB }
