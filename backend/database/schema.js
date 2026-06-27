const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, 'honeygirl.db')

let db = null
let saveTimer = null

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      const data = db.export()
      fs.writeFileSync(DB_PATH, Buffer.from(data))
    } catch (e) {
      console.error('Error guardando DB:', e.message)
    }
  }, 200)
}

async function initDB() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
    console.log('✅ Base de datos cargada desde disco')
  } else {
    db = new SQL.Database()
    console.log('✅ Nueva base de datos creada')
  }

  db.run('PRAGMA foreign_keys = ON')

  // Schema
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      category TEXT,
      gender TEXT,
      description TEXT,
      material TEXT,
      price_unit REAL DEFAULT 0,
      price_wholesale REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'available',
      featured INTEGER DEFAULT 0,
      new_arrival INTEGER DEFAULT 1,
      on_sale INTEGER DEFAULT 0,
      sale_percentage INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      sizes TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      company TEXT,
      city TEXT,
      country TEXT DEFAULT 'Colombia',
      phone TEXT,
      email TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      customer_type TEXT DEFAULT 'retail',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(customer_id, product_id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image TEXT,
      link TEXT,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // Seed admin
  const adminRows = db.exec("SELECT id FROM admins WHERE username = 'admin'")
  if (!adminRows.length || !adminRows[0].values.length) {
    const hash = bcrypt.hashSync('honey2024', 10)
    db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hash])
    scheduleSave()
    console.log('✅ Admin creado: usuario=admin  contraseña=honey2024')
  }

  scheduleSave()
  return db
}

// Synchronous helpers that wrap sql.js

function all(sql, params = []) {
  try {
    const stmt = db.prepare(sql)
    stmt.bind(params)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  } catch (e) {
    console.error('DB all error:', e.message, sql)
    return []
  }
}

function get(sql, params = []) {
  return all(sql, params)[0] || null
}

function run(sql, params = []) {
  try {
    db.run(sql, params)
    const lastId = get('SELECT last_insert_rowid() as id')?.id
    scheduleSave()
    return { lastInsertRowid: lastId }
  } catch (e) {
    const err = new Error(e.message)
    err.message = e.message
    throw err
  }
}

function getDB() {
  return { all, get, run }
}

module.exports = { initDB, getDB }
