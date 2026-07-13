const { Client } = require('pg');

async function testConnection(url, name) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to ${name}`);
    await client.end();
  } catch (err) {
    console.log(`[ERROR] Failed to connect to ${name}: ${err.message}`);
  }
}

async function run() {
  const urls = [
    { name: 'Literal IPv6', url: 'postgresql://postgres:Jatinrao2006@[2406:da1a:b00:1300:1f77:dd67:6349:3345]:5432/postgres' },
    { name: 'Direct IPv4', url: 'postgresql://postgres:Jatinrao2006@db.rbtjnqbxuzwfgavjzqcc.supabase.co:5432/postgres' }
  ];

  for (const item of urls) {
    await testConnection(item.url, item.name);
  }
}

run();
