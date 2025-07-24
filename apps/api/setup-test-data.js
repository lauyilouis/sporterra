import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'sporterra',
  password: 'sporterra123',
  database: 'sporterra'
});

async function setupTestData() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Insert test data
    const systemTenantResult = await client.query(`
      INSERT INTO tenants (name, subdomain) 
      VALUES ('System Tenant', 'system') 
      ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const systemTenantId = systemTenantResult.rows[0].id;
    console.log('System tenant created/updated:', systemTenantId);

    const testTenantResult = await client.query(`
      INSERT INTO tenants (name, subdomain) 
      VALUES ('Test Tenant', 'test') 
      ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const testTenantId = testTenantResult.rows[0].id;
    console.log('Test tenant created/updated:', testTenantId);

    const userResult = await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, first_name, last_name) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id;
    `, [testTenantId, 'test@example.com', 'hashed_password', 'John', 'Doe']);
    const userId = userResult.rows[0].id;
    console.log('User created/updated:', userId);

    const sectionResult = await client.query(`
      INSERT INTO sections (tenant_id, name, description, "order") 
      VALUES ($1, $2, $3, $4) 
      RETURNING id;
    `, [testTenantId, 'Experience', 'Professional experience and achievements', 1]);
    const sectionId = sectionResult.rows[0].id;
    console.log('Section created:', sectionId);

    const datagridResult = await client.query(`
      INSERT INTO datagrids (tenant_id, section_id, name, description, "order") 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id;
    `, [testTenantId, sectionId, 'Experience', 'Professional experience entries', 1]);
    const datagridId = datagridResult.rows[0].id;
    console.log('Datagrid created:', datagridId);

    await client.query(`
      INSERT INTO datagrid_columns (tenant_id, datagrid_id, "key", label, type, required, "order") 
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [testTenantId, datagridId, 'team', 'Team', 'text', true, 1]);
    console.log('Datagrid column created/updated');

    await client.query(`
      INSERT INTO datagrid_rows (tenant_id, user_id, datagrid_id, data, "order") 
      VALUES ($1, $2, $3, $4, $5);
    `, [testTenantId, userId, datagridId, JSON.stringify({ team: 'Toronto Raptors' }), 1]);
    console.log('Datagrid row created');

    console.log('✅ Test data setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- System Tenant ID: ${systemTenantId}`);
    console.log(`- Test Tenant ID: ${testTenantId}`);
    console.log(`- User ID: ${userId}`);
    console.log(`- Section ID: ${sectionId}`);
    console.log(`- Datagrid ID: ${datagridId}`);
    console.log('- Data: { team: "Toronto Raptors" }');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await client.end();
  }
}

setupTestData(); 