import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

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
  return { status: 'ok', timestamp: new Date().toISOString() }
})

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