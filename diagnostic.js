#!/usr/bin/env node

/**
 * Google OAuth Diagnostic Script
 * 
 * This script helps diagnose issues with Google OAuth integration.
 * Run from the project root directory:
 * 
 *   node diagnostic.js
 * 
 * It will check:
 * 1. Backend server is running and responding
 * 2. Database is accessible
 * 3. Environment variables are configured
 * 4. Google OAuth client is properly set up
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Google OAuth Diagnostic Script\n');
console.log('=' .repeat(50) + '\n');

let issues = [];
let successes = [];

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
try {
  const envPath = path.join(__dirname, 'server', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGoogleClientId = envContent.includes('GOOGLE_CLIENT_ID=');
    const hasGoogleClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=');
    const hasCorsOrigin = envContent.includes('CORS_ORIGIN=');
    
    if (hasGoogleClientId && hasGoogleClientSecret && hasCorsOrigin) {
      successes.push('✅ server/.env configured with all required OAuth variables');
    } else {
      issues.push('❌ server/.env missing required variables:' + 
        `${!hasGoogleClientId ? '\n   - GOOGLE_CLIENT_ID' : ''}` +
        `${!hasGoogleClientSecret ? '\n   - GOOGLE_CLIENT_SECRET' : ''}` +
        `${!hasCorsOrigin ? '\n   - CORS_ORIGIN' : ''}`);
    }
  } else {
    issues.push('❌ server/.env file not found');
  }
  
  const clientEnvPath = path.join(__dirname, 'client', '.env.json');
  if (fs.existsSync(clientEnvPath)) {
    try {
      const clientEnv = JSON.parse(fs.readFileSync(clientEnvPath, 'utf8'));
      if (clientEnv.VITE_GOOGLE_CLIENT_ID && clientEnv.VITE_API_BASE_URL) {
        successes.push('✅ client/.env.json configured with OAuth variables');
      } else {
        issues.push('❌ client/.env.json missing VITE_GOOGLE_CLIENT_ID or VITE_API_BASE_URL');
      }
    } catch (e) {
      issues.push(`❌ client/.env.json is not valid JSON: ${e.message}`);
    }
  } else {
    issues.push('❌ client/.env.json file not found');
  }
} catch (error) {
  issues.push(`❌ Error checking environment: ${error.message}`);
}

// Check 2: Backend Server
console.log('\n2️⃣  Checking Backend Server...');
try {
  const response = await fetch('http://localhost:3001/api/health');
  if (response.ok) {
    successes.push('✅ Backend server is running and responding');
  } else {
    issues.push(`❌ Backend server returned status ${response.status}`);
  }
} catch (error) {
  issues.push(`❌ Cannot connect to backend server at localhost:3001:\n   ${error.message}`);
}

// Check 3: Database
console.log('\n3️⃣  Checking Database...');
try {
  const dbPath = path.join(__dirname, 'server', 'data', 'database.sqlite');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    successes.push(`✅ Database file exists (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    issues.push('⚠️  Database file not found - it will be created on first server run');
  }
} catch (error) {
  issues.push(`❌ Error checking database: ${error.message}`);
}

// Check 4: Google OAuth Library
console.log('\n4️⃣  Checking Google OAuth Libraries...');
try {
  const serverPackagePath = path.join(__dirname, 'server', 'package.json');
  const clientPackagePath = path.join(__dirname, 'client', 'package.json');
  
  if (fs.existsSync(serverPackagePath)) {
    const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
    if (serverPackage.dependencies?.['google-auth-library']) {
      successes.push('✅ Backend has google-auth-library installed');
    } else {
      issues.push('❌ Backend missing google-auth-library dependency');
    }
  }
  
  if (fs.existsSync(clientPackagePath)) {
    const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
    if (clientPackage.dependencies?.['@react-oauth/google']) {
      successes.push('✅ Frontend has @react-oauth/google installed');
    } else {
      issues.push('❌ Frontend missing @react-oauth/google dependency');
    }
  }
} catch (error) {
  issues.push(`❌ Error checking dependencies: ${error.message}`);
}

// Print Results
console.log('\n' + '=' .repeat(50));
console.log('\n📊 DIAGNOSTIC RESULTS\n');

if (successes.length > 0) {
  console.log('✅ SUCCESSES:');
  successes.forEach(s => console.log('   ' + s));
  console.log();
}

if (issues.length > 0) {
  console.log('⚠️  ISSUES FOUND:');
  issues.forEach(i => console.log('   ' + i));
  console.log();
}

// Recommendations
console.log('=' .repeat(50));
console.log('\n💡 NEXT STEPS:\n');

if (issues.length === 0) {
  console.log('✅ All checks passed! Your setup looks good.');
  console.log('\nTo test Google OAuth:');
  console.log('1. Make sure backend is running: npm run dev:server');
  console.log('2. Make sure frontend is running: npm run dev:client');
  console.log('3. Click the Google Sign-In button');
  console.log('4. Check browser console and network tab for details\n');
} else {
  console.log('🔧 Fix the issues above and run this script again.\n');
  
  if (issues.some(i => i.includes('server/.env'))) {
    console.log('   → Check docs/ENV_VARIABLES_COMPLETE_GUIDE.md for setup instructions');
  }
  
  if (issues.some(i => i.includes('Backend'))) {
    console.log('   → Make sure backend server is running: npm run dev:server');
  }
  
  if (issues.some(i => i.includes('dependency'))) {
    console.log('   → Install dependencies: npm install (in both /client and /server)');
  }
}

console.log('=' .repeat(50) + '\n');
