const express = require('express')
const router = express.Router()
const { supabase } = require('../database/schema')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, async (req, res) => {
  const [
    { count: totalProducts },
    { count: availableProducts },
    { count: soldOutProducts },
    { count: totalCustomers },
    { count: activeCustomers },
    { count: featuredProducts },
    { count: newArrivals },
    { count: onSale },
    { data: topViewed },
    { data: categories },
    { data: recentCustomers }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'sold_out'),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('featured', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('new_arrival', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('on_sale', true),
    supabase.from('products').select('id,name,code,views,category,product_images(filename,is_primary)').order('views', { ascending: false }).limit(5),
    supabase.from('products').select('category').neq('category', null),
    supabase.from('customers').select('id,first_name,last_name,email,customer_type,created_at').order('created_at', { ascending: false }).limit(5)
  ])

  // Count by category
  const catMap = {}
  ;(categories || []).forEach(p => {
    if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1
  })
  const categoryCounts = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Format top viewed
  const topViewedFormatted = (topViewed || []).map(p => {
    const images = p.product_images || []
    return {
      id: p.id, name: p.name, code: p.code, views: p.views, category: p.category,
      primary_image: images.find(i => i.is_primary)?.filename || images[0]?.filename || null
    }
  })

  res.json({
    totalProducts: totalProducts || 0,
    availableProducts: availableProducts || 0,
    soldOutProducts: soldOutProducts || 0,
    totalCustomers: totalCustomers || 0,
    activeCustomers: activeCustomers || 0,
    featuredProducts: featuredProducts || 0,
    newArrivals: newArrivals || 0,
    onSale: onSale || 0,
    topViewed: topViewedFormatted,
    categories: categoryCounts,
    recentCustomers: recentCustomers || []
  })
})

module.exports = router
