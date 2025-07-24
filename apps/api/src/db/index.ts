import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

// Create the connection
const connectionString = process.env.DATABASE_URL || 'postgresql://sporterra:sporterra123@localhost:5432/sporterra';

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the database instance
export const db = drizzle(client, { schema });

// Test the connection
export async function testConnection() {
  try {
    await client`SELECT NOW()`;
    console.log('✅ Connected to PostgreSQL database with Drizzle');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close the connection (useful for graceful shutdown)
export async function closeConnection() {
  await client.end();
} 