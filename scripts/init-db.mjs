import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Create connection without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        try {
          await connection.execute(statement);
         } catch (err) {
          // Ignore errors if table already exists
          if (!err.message.includes('already exists')) {
            console.error('Error executing statement:', err);
          }
        }
      }
    }

    await connection.end();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Database: maize_detection_systemai');
    console.log('👤 User: root (empty password)');
    console.log('✨ Ready to start the application!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
