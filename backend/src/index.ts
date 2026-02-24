// src/index.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import inventoryRoutes from './routes/inventoryRoutes'
import salesRoutes from './routes/salesRoutes'
import claimsRoutes from './routes/claimsRoutes'
import pharmacyRoutes from './routes/pharmacyRoutes'
import { prisma } from './utils/prisma'
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import staffRoutes from "./routes/staffRoutes"
import reportRoutes from "./routes/reportRoutes"
import userRoutes from './routes/users';

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/staff", staffRoutes)
app.use("/api/reports", reportRoutes)
app.use('/api/users', userRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PharmaLink API Documentation',
  customfavIcon: 'https://your-icon-url.com/favicon.ico'
}));

// 📌 ROOT ROUTE - Add this to fix "Cannot GET /"
app.get('/', (req, res) => {
  res.json({
    message: '🚀 PharmaLink API is running',
    version: '1.0.0',
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats',
        lowStock: 'GET /api/dashboard/low-stock'
      },
      inventory: {
        list: 'GET /api/inventory',
        add: 'POST /api/inventory',
        update: 'PUT /api/inventory/:id',
        delete: 'DELETE /api/inventory/:id',
        adjustStock: 'PATCH /api/inventory/:id/stock'
      },
      sales: {
        list: 'GET /api/sales',
        create: 'POST /api/sales',
        today: 'GET /api/sales/today'
      },
      claims: {
        list: 'GET /api/claims',
        create: 'POST /api/claims',
        updateStatus: 'PATCH /api/claims/:id/status',
        pendingCount: 'GET /api/claims/pending/count'
      },
      pharmacies: {
        list: 'GET /api/pharmacies',
        create: 'POST /api/pharmacies',
        assignStaff: 'POST /api/pharmacies/:pharmacyId/staff',
        getStaff: 'GET /api/pharmacies/:pharmacyId/staff'
      },
      health: 'GET /health'
    }
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/claims', claimsRoutes)
app.use('/api/pharmacies', pharmacyRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    prisma: 'ready'
  })
})

app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    tip: 'Visit / to see all available endpoints'
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PharmaLink backend running on http://localhost:${PORT}`)
  console.log(`📚 API documentation available at http://localhost:${PORT}/`)
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`)
  console.log(`📖 Docs redirect: http://localhost:${PORT}/docs`)
  console.log(`💾 Database: Connected`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...')
  await prisma.$disconnect()
  console.log('💾 Database disconnected')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...')
  await prisma.$disconnect()
  console.log('💾 Database disconnected')
  process.exit(0)
})