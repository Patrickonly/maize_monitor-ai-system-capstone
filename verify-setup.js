#!/usr/bin/env node

/**
 * Smart Maize Insights - Backend Setup Verification Checklist
 * 
 * This script verifies everything is set up correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Smart Maize Insights - Backend Setup Verification         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: Environment file
console.log('📋 Checking Configuration Files...\n');

const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);
checks.push({
  name: '.env.local exists',
  passed: envExists,
  fix: 'Create .env.local in the project root with database credentials'
});

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabaseName = envContent.includes('maize_detection_systemai');
  checks.push({
    name: 'Database name is "maize_detection_systemai"',
    passed: hasDatabaseName,
    fix: 'Set DB_NAME=maize_detection_systemai in .env.local'
  });
}

// Check 2: Schema file
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const schemaExists = fs.existsSync(schemaPath);
checks.push({
  name: 'schema.sql exists',
  passed: schemaExists,
  fix: 'Ensure schema.sql exists in database folder'
});

// Check 3: package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkgExists = fs.existsSync(pkgPath);
checks.push({
  name: 'package.json exists',
  passed: pkgExists,
  fix: 'Ensure package.json exists in the project root'
});

// Check 4: Dependencies installed
const nodeModulesPath = path.join(__dirname, '..', 'node_modules', 'mysql2');
const depsInstalled = fs.existsSync(nodeModulesPath);
checks.push({
  name: 'Dependencies installed (mysql2)',
  passed: depsInstalled,
  fix: 'Run: npm install'
});

// Check 5: Init script
const initPath = path.join(__dirname, 'database', 'init.js');
const initExists = fs.existsSync(initPath);
checks.push({
  name: 'init.js exists',
  passed: initExists,
  fix: 'Ensure init.js exists in database folder'
});

// Print results
console.log('📊 Verification Results:\n');

let allPassed = true;
let passCount = 0;

checks.forEach((check, index) => {
  const icon = check.passed ? '✅' : '❌';
  const status = check.passed ? 'PASS' : 'FAIL';
  console.log(`${icon} [${index + 1}/${checks.length}] ${check.name}`);
  
  if (!check.passed) {
    console.log(`   💡 Fix: ${check.fix}`);
    allPassed = false;
  } else {
    passCount++;
  }
});

console.log(`\n📈 Results: ${passCount}/${checks.length} checks passed\n`);

// Print next steps
console.log('╔════════════════════════════════════════════════════════════╗');
if (allPassed) {
  console.log('║  ✅ All checks passed! Ready to initialize database        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('🚀 Next Steps:\n');
  console.log('1️⃣  First, verify MySQL is running:');
  console.log('   $ node database/check-mysql.js\n');
  
  console.log('2️⃣  Then initialize the database:');
  console.log('   $ npm run db:init\n');
  
  console.log('3️⃣  Finally, start the app:');
  console.log('   $ npm run dev\n');
  
  process.exit(0);
} else {
  console.log('║  ⚠️  Some checks failed. Please fix issues above.         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('🔧 Setup Instructions:\n');
  console.log('1️⃣  Ensure project dependencies are installed:');
  console.log('   $ npm install\n');
  
  console.log('2️⃣  Verify .env.local file exists with:');
  console.log('   DB_HOST=localhost');
  console.log('   DB_USER=root');
  console.log('   DB_PASSWORD=');
  console.log('   DB_NAME=maize_detection_systemai\n');
  
  console.log('3️⃣  Check that MySQL is running\n');
  
  process.exit(1);
}
