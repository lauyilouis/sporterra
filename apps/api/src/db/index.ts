import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from './schema';
import { Pool } from 'pg';

dotenv.config();

// Create the connection
const connectionString = process.env.DATABASE_URL || 'postgresql://sporterra:sporterra123@localhost:5432/sporterra';

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

// Create the database instance
export const db = drizzle(connectionString, { schema });

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connected to PostgreSQL database with Drizzle');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close the connection (useful for graceful shutdown)
export async function closeConnection() {
  await pool.end();
} 