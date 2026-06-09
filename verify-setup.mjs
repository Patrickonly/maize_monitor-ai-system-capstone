#!/usr/bin/env node

/**
 * Smart Maize Insights - Project Initialization Summary
 * This script verifies that all components are properly set up
 */

import fs from 'fs';

const checks = [
  {
    name: 'Frontend Environment',
    files: ['.env.local', 'package.json', 'tsconfig.json'],
  },
  {
    name: 'Backend Structure',
    files: [
      'package.json',
      'tsconfig.json',
      'database/schema.sql',
      'database/connection.ts',
    ],
  },
  {
    name: 'API Endpoints',
    files: [
      'pages/api/auth/signup.ts',
      'pages/api/auth/login.ts',
      'pages/api/auth/verify.ts',
      'pages/api/analysis/create.ts',
      'pages/api/analysis/chat.ts',
      'pages/api/health.ts',
    ],
  },
  {
    name: 'Frontend Services',
    files: [
      'src/services/api.ts',
      'src/contexts/AuthContext.tsx',
      'src/components/LoginModal.tsx',
      'src/components/SignupModal.tsx',
    ],
  },
  {
    name: 'Documentation',
    files: [
      'SETUP_GUIDE.md',
      'QUICK_START.md',
      'BACKEND_SETUP.md',
      '.env.local',
    ],
  },
];

console.log('\\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Smart Maize Insights - Setup Verification                ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\\n');

let allPassed = true;

checks.forEach((check) => {
  console.log(`\\n📋 ${check.name}:`);
  let groupPassed = true;

  check.files.forEach((file) => {
    const exists = fs.existsSync(file);
    const icon = exists ? '✅' : '❌';
    console.log(`   ${icon} ${file}`);
    if (!exists) groupPassed = false;
  });

  if (!groupPassed) allPassed = false;
});

console.log('\\n');
console.log('╔════════════════════════════════════════════════════════════╗');

if (allPassed) {
  console.log('║  ✅ All components are properly set up!                   ║');
} else {
  console.log('║  ⚠️  Some files are missing. Please run setup script.    ║');
}

console.log('╚════════════════════════════════════════════════════════════╝');

console.log('\\n');
console.log('🚀 Next Steps:');
console.log('');
console.log('1. Install dependencies:');
console.log('   $ npm install');
console.log('   $ npm run db:init');
console.log('   $ npm run dev');
console.log('');
console.log('2. Access Application:');
console.log('   http://localhost:5173');
console.log('');
console.log('📚 For more details: See QUICK_START.md or SETUP_GUIDE.md');
console.log('\\n');
