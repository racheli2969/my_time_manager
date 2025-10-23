#!/usr/bin/env node

/**
 * Authentication Test Runner
 * 
 * Simple test script to validate authentication functionality.
 * Run with: node test-auth.js
 */

const { testAuthenticationEndpoints } = require('./auth-test-runner.js');

console.log('='.repeat(50));
console.log('🔐 AUTHENTICATION SYSTEM TEST');
console.log('='.repeat(50));

console.log('\n📋 Test Overview:');
console.log('   • User Registration');
console.log('   • User Login');
console.log('   • Token Refresh');
console.log('   • Google Authentication Endpoint');
console.log('   • Error Handling');

console.log('\n⚠️  Prerequisites:');
console.log('   • Server running on http://localhost:3001');
console.log('   • Database properly initialized');
console.log('   • Environment variables configured');

console.log('\n' + '='.repeat(50));

// Run the tests
testAuthenticationEndpoints();