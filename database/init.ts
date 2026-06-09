import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase(): Promise<void> {
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
    const statements = schema.split(';').filter((stmt: string) => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        try {
          await connection.execute(statement);
        } catch (err: any) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            throw err;
          }
        }
      }
    }

    await connection.end();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Database: maize_detection_systemai');
    console.log('👤 User: root');
    console.log('✨ Ready to start!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
