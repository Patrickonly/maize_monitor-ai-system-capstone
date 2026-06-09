#!/usr/bin/env node
/**
 * Plant-Tracking Migration Runner
 * Runs automatically via  npm run db:migrate
 * Also wired into  npm run dev  via  predev  script.
 *
 * Uses programmatic column-existence checks instead of
 * SQL file parsing — guaranteed to work on MariaDB/MySQL.
 */

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq  = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DB = {
  host    : process.env.DB_HOST     || '173.212.204.250',
  user    : process.env.DB_USER     || 'capstoneproject',
  password: process.env.DB_PASSWORD ?? 'capstoneproject',
  database: process.env.DB_NAME     || 'capstoneproject',
  port    : process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if a column exists in a table */
async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB.database, table, column]
  );
  return rows[0].cnt > 0;
}

/** Returns true if a table exists */
async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB.database, table]
  );
  return rows[0].cnt > 0;
}

/** Returns true if an index exists on a table */
async function indexExists(conn, table, indexName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [DB.database, table, indexName]
  );
  return rows[0].cnt > 0;
}

/** Returns true if a FK constraint exists */
async function constraintExists(conn, table, constraintName) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
    [DB.database, table, constraintName]
  );
  return rows[0].cnt > 0;
}

async function run(conn, label, sql) {
  process.stdout.write(`   ✔ ${label} ... `);
  await conn.query(sql);
  console.log('done');
}

// ── Main Migration ───────────────────────────────────────────────────────────

async function runMigration() {
  let conn = null;

  try {
    console.log('\n🌱 Plant-Tracking Migration starting…\n');
    console.log(`   Host    : ${DB.host}`);
    console.log(`   User    : ${DB.user}`);
    console.log(`   Database: ${DB.database}\n`);

    conn = await mysql.createConnection(DB);

    // ── 1. Create maize_plants table ────────────────────────────────────────
    if (!(await tableExists(conn, 'maize_plants'))) {
      await run(conn, 'Creating table: maize_plants', `
        CREATE TABLE maize_plants (
          id            INT           AUTO_INCREMENT PRIMARY KEY,
          user_id       INT           NOT NULL,
          plant_code    VARCHAR(100)  NOT NULL,
          label         VARCHAR(255),
          location      VARCHAR(500),
          field_name    VARCHAR(255),
          planted_at    DATE,
          notes         TEXT,
          is_active     BOOLEAN       DEFAULT TRUE,
          created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
          updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_plant (user_id, plant_code),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } else {
      console.log('   ⏭ maize_plants table already exists');
    }

    // ── 2. Add plant_id to analysis_results ─────────────────────────────────
    if (!(await columnExists(conn, 'analysis_results', 'plant_id'))) {
      await run(conn, 'Adding column: analysis_results.plant_id',
        `ALTER TABLE analysis_results ADD COLUMN plant_id INT NULL AFTER chat_message_id`
      );
    } else {
      console.log('   ⏭ plant_id column already exists');
    }

    // ── 3. Add scan_sequence_number to analysis_results ─────────────────────
    if (!(await columnExists(conn, 'analysis_results', 'scan_sequence_number'))) {
      await run(conn, 'Adding column: analysis_results.scan_sequence_number',
        `ALTER TABLE analysis_results ADD COLUMN scan_sequence_number INT DEFAULT 1 AFTER plant_id`
      );
    } else {
      console.log('   ⏭ scan_sequence_number column already exists');
    }

    // ── 4. Add model_version to analysis_results ─────────────────────────────
    if (!(await columnExists(conn, 'analysis_results', 'model_version'))) {
      await run(conn, 'Adding column: analysis_results.model_version',
        `ALTER TABLE analysis_results ADD COLUMN model_version VARCHAR(50) NULL AFTER processing_time_ms`
      );
    } else {
      console.log('   ⏭ model_version column already exists');
    }

    // ── 5. Add FK constraint plant_id → maize_plants ─────────────────────────
    if (!(await constraintExists(conn, 'analysis_results', 'fk_ar_plant'))) {
      await run(conn, 'Adding FK: analysis_results.plant_id → maize_plants',
        `ALTER TABLE analysis_results
         ADD CONSTRAINT fk_ar_plant
         FOREIGN KEY (plant_id) REFERENCES maize_plants(id) ON DELETE SET NULL`
      );
    } else {
      console.log('   ⏭ FK fk_ar_plant already exists');
    }

    // ── 6. Create plant_progression_alerts table ─────────────────────────────
    if (!(await tableExists(conn, 'plant_progression_alerts'))) {
      await run(conn, 'Creating table: plant_progression_alerts', `
        CREATE TABLE plant_progression_alerts (
          id                   INT           AUTO_INCREMENT PRIMARY KEY,
          plant_id             INT           NOT NULL,
          previous_analysis_id INT           NULL,
          current_analysis_id  INT           NOT NULL,
          previous_severity    VARCHAR(20)   DEFAULT 'healthy',
          current_severity     VARCHAR(20)   NOT NULL,
          previous_confidence  DECIMAL(5,2)  NULL,
          current_confidence   DECIMAL(5,2)  NOT NULL,
          severity_delta       TINYINT       NOT NULL,
          alert_message        TEXT,
          is_read              BOOLEAN       DEFAULT FALSE,
          created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id)             REFERENCES maize_plants(id)      ON DELETE CASCADE,
          FOREIGN KEY (previous_analysis_id) REFERENCES analysis_results(id)  ON DELETE SET NULL,
          FOREIGN KEY (current_analysis_id)  REFERENCES analysis_results(id)  ON DELETE CASCADE
        )
      `);
    } else {
      console.log('   ⏭ plant_progression_alerts table already exists');
    }

    // ── 7. Index: idx_ar_plant_id ────────────────────────────────────────────
    if (!(await indexExists(conn, 'analysis_results', 'idx_ar_plant_id'))) {
      await run(conn, 'Creating index: idx_ar_plant_id',
        `CREATE INDEX idx_ar_plant_id ON analysis_results(plant_id)`
      );
    } else {
      console.log('   ⏭ idx_ar_plant_id index already exists');
    }

    // ── 8. Index: idx_ar_plant_scan ──────────────────────────────────────────
    if (!(await indexExists(conn, 'analysis_results', 'idx_ar_plant_scan'))) {
      await run(conn, 'Creating index: idx_ar_plant_scan',
        `CREATE INDEX idx_ar_plant_scan ON analysis_results(plant_id, scan_sequence_number)`
      );
    } else {
      console.log('   ⏭ idx_ar_plant_scan index already exists');
    }

    console.log('\n✅ Plant-Tracking Migration complete!\n');
    console.log('   New tables  : maize_plants, plant_progression_alerts');
    console.log('   New columns : analysis_results.plant_id');
    console.log('                 analysis_results.scan_sequence_number');
    console.log('                 analysis_results.model_version\n');

  } catch (error) {
    const code = error.code || '';
    console.error('\n❌ Migration failed!');
    if (code === 'ECONNREFUSED' || error instanceof AggregateError) {
      console.error('\n💡 MySQL is not running. Please start it first:');
      console.error('   XAMPP: Open XAMPP Control Panel → Start MySQL\n');
    } else if (code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Wrong DB credentials. Check .env.local (DB_USER / DB_PASSWORD)\n');
    } else if (code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database not found. Run first: npm run db:init\n');
    } else {
      console.error(`   Code   : ${code}`);
      console.error(`   Error  : ${error.message}\n`);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runMigration();
