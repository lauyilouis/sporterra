import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index.js';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 