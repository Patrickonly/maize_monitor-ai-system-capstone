#!/usr/bin/env node

/**
 * Database Initialization Script
 * Initializes the maize_detection_systemai database with all required tables
 * 
 * Usage: npm run db:init
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection = null;
  
  try {
    console.log('🚀 Starting database initialization...\n');
    
    // Log connection details
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '(empty)';
    
    console.log('📋 Connection Details:');
    console.log(`   Host: ${dbHost}`);
    console.log(`   User: ${dbUser}`);
    console.log(`   Password: ${dbPassword === '' ? '(empty)' : '(set)'}\n`);

    // Create connection without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    console.log('✅ Connected to MySQL\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully\n');

    // Split and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    console.log(`📝 Found ${statements.length} SQL statements\n`);
    
    let count = 0;
    let skipped = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        process.stdout.write(`[${i + 1}/${statements.length}] Executing: ${preview}... `);
        
        try {
          await connection.query(statement);
          console.log('✅');
          count++;
        } catch (err) {
          // Ignore "table already exists" errors
          if (err.message.includes('already exists') || 
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DB_CREATE_EXISTS') {
            console.log('ℹ️  (already exists)');
            skipped++;
            count++;
          } else {
            console.log('❌');
            console.error(`\n   Error: ${err.message}`);
            console.error(`   Code: ${err.code}`);
            throw err;
          }
        }
      }
    }

    if (connection) {
      await connection.end();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database initialization completed!');
    console.log('='.repeat(60));
    console.log(`   📊 Total Executed: ${count}`);
    console.log(`   ⏭️  Skipped (already exist): ${skipped}`);
    console.log(`   🗄️  Database: maize_detection_systemai`);
    console.log(`   👤 User: root`);
    console.log(`   ✨ Ready to start the application!\n`);
    
    process.exit(0);
  } catch (error) {
    console.log('❌');
    console.error('\n' + '='.repeat(60));
    console.error('❌ Database initialization failed!');
    console.error('='.repeat(60));
    console.error(`\n📋 Error Details:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'UNKNOWN'}`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Ensure MySQL Server is running');
      console.error('   - Windows: Check Services > MySQL');
      console.error('   - macOS: brew services start mysql');
      console.error('   - Linux: sudo service mysql start');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check username and password in .env.local');
      console.error('   - Default user: root (no password)');
      console.error('   - Verify MySQL user has permission to create databases');
    } else if (error.code === 'ENOENT') {
      console.error('\n💡 Troubleshooting:');
      console.error(`   - Schema file not found`);
      console.error(`   - Expected at: ${error.path || path.join(__dirname, 'schema.sql')}`);
    }
    
    console.error('\n📝 Full Stack:');
    console.error(error.stack);
    console.error('\n' + '='.repeat(60) + '\n');
    
    process.exit(1);
  }
}

initializeDatabase();
