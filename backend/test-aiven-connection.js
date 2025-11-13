const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Aiven PostgreSQL connection...\n');

  const config = {
    host: process.env.DB_HOST || 'pg-8eb1840-winners.h.aivencloud.com',
    port: parseInt(process.env.DB_PORT, 10) || 14690,
    user: process.env.DB_USERNAME || 'avnadmin',
    password: process.env.DB_PASSWORD || 'your_aiven_password_here',
    database: process.env.DB_DATABASE || 'defaultdb',
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(__dirname, 'ca.pem'), 'utf8'),
    },
    connectionTimeoutMillis: 10000,
  };

  const client = new Client(config);

  try {
    console.log('Connecting to:', config.host);
    await client.connect();
    console.log('✅ Successfully connected to Aiven PostgreSQL!\n');

    // Test query
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);

    // List tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Existing tables:');
    if (tables.rows.length === 0) {
      console.log('  No tables found (database is empty)');
    } else {
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

    await client.end();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

testConnection();
