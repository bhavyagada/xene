const router = require('./routes')

const { syncDB } = require('../sequelize')

// Migrate and seed the database
if (process.env.DB_REBUILD == 'true') {
  syncDB()
}

// Export the server middleware
export default {
  path: '/api',
  handler: router
}
