#!/usr/bin/env node

/**
 * MySQL Connection Diagnostic Script
 * Checks if MySQL is accessible and running
 * 
 * Usage: node database/check-mysql.js
 */

const mysql = require('mysql2/promise');

async function checkMySQLConnection() {
  console.log('🔍 Checking MySQL Connection...\n');
  
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  
  console.log('📋 Configuration:');
  console.log(`   Host: ${dbHost}`);
  console.log(`   Port: 3306 (default)`);
  console.log(`   User: ${dbUser}`);
  console.log(`   Password: ${dbPassword ? '(set)' : '(empty)'}\n`);
  
  try {
    console.log('⏳ Attempting connection...');
    
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });
    
    console.log('✅ Successfully connected to MySQL!\n');
    
    // Get MySQL version
    try {
      const [result] = await connection.execute('SELECT VERSION() as version');
      console.log(`📊 MySQL Version: ${result[0].version}`);
    } catch (e) {
      console.log('⚠️  Could not get MySQL version');
    }
    
    // List existing databases
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      const dbNames = databases.map(db => db.Database);
      console.log(`\n📚 Available Databases (${dbNames.length}):`);
      dbNames.forEach(db => {
        const marker = db === 'maize_detection_systemai' ? '✨' : '  ';
        console.log(`   ${marker} ${db}`);
      });
    } catch (e) {
      console.log('⚠️  Could not list databases');
    }
    
    await connection.end();
    
    console.log('\n✅ MySQL is accessible and ready!\n');
    console.log('Next: Run: npm run db:init\n');
    process.exit(0);
    
  } catch (error) {
    console.log('❌\n');
    console.error('❌ MySQL Connection Failed!\n');
    console.error(`📋 Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);
    
    // Provide helpful troubleshooting based on error code
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') {
      console.error('💡 Troubleshooting:');
      console.error('   MySQL Server is not running!\n');
      console.error('   To start MySQL:');
      console.error('   ');
      console.error('   Windows:');
      console.error('   - Open Services (services.msc)');
      console.error('   - Find "MySQL" service');
      console.error('   - Right-click > Start\n');
      console.error('   macOS:');
      console.error('   - brew services start mysql\n');
      console.error('   Linux:');
      console.error('   - sudo service mysql start');
      console.error('   - or: sudo systemctl start mysql\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Troubleshooting:');
      console.error('   Access Denied - Check credentials!\n');
      console.error('   Verify .env.local contains:');
      console.error('   DB_HOST=localhost');
      console.error('   DB_USER=root');
      console.error('   DB_PASSWORD=(leave empty or set password)\n');
    } else if (error.code === 'ER_UNKNOWN_DATABASE') {
      console.error('💡 Note:');
      console.error('   The maize_detection_systemai database does not exist yet.');
      console.error('   This is normal - it will be created by npm run db:init\n');
    } else if (error.code === 'GETADDRINFO_NOTFOUND' || error.code === 'ENOTFOUND') {
      console.error('💡 Troubleshooting:');
      console.error('   Cannot reach MySQL host: ' + dbHost + '\n');
      console.error('   - Check if host is correct in .env.local');
      console.error('   - Use localhost for local MySQL\n');
    }
    
    console.error('---');
    console.error('To continue without fixing MySQL now:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Run: npm run db:init\n');
    
    process.exit(1);
  }
}

checkMySQLConnection();
