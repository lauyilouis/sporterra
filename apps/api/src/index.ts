import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { testConnection } from './db/index.js'
import { userSectionRoutes } from './routes/user-sections.js'

const fastify = Fastify({
  logger: true
})

// Register plugins
await fastify.register(cors, {
  origin: true
})
await fastify.register(helmet)

// Health check route
fastify.get('/health', async (request, reply) => {
  try {
    // Test database connection with Drizzle
    const isConnected = await testConnection()
    
    return { 
      status: isConnected ? 'ok' : 'error', 
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected'
    }
  } catch (error) {
    return { 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Register route plugins
await fastify.register(userSectionRoutes)

// API routes
fastify.get('/api/hello', async (request, reply) => {
  return { message: 'Hello from Sporterra API!' }
})

// Start server
try {
  await fastify.listen({ port: 3001, host: '0.0.0.0' })
  console.log('🚀 API server running on http://localhost:3001')
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
} 