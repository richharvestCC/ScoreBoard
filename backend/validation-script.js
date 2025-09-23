#!/usr/bin/env node

/**
 * Validation script to test the fixes implemented for Critical and High Priority PR feedback
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Critical and High Priority PR fixes...\n');

// Test 1: Check that duplicate signal handlers are removed from models/index.js
console.log('✅ Test 1: Checking signal handler duplication fix...');
const modelsIndexPath = path.join(__dirname, 'src', 'models', 'index.js');
const modelsContent = fs.readFileSync(modelsIndexPath, 'utf8');

// Count SIGTERM and SIGINT handlers in models/index.js
const sigtermMatches = (modelsContent.match(/process\.on\(['"]SIGTERM['"],/g) || []).length;
const sigintMatches = (modelsContent.match(/process\.on\(['"]SIGINT['"],/g) || []).length;

if (sigtermMatches === 0 && sigintMatches === 0) {
  console.log('   ✅ SUCCESS: No signal handlers found in models/index.js (correctly moved to server.js)');
} else {
  console.log(`   ❌ FAIL: Found ${sigtermMatches} SIGTERM and ${sigintMatches} SIGINT handlers in models/index.js`);
}

// Test 2: Check server.js has proper signal handling without duplication
console.log('\n✅ Test 2: Checking server.js signal handler consolidation...');
const serverPath = path.join(__dirname, 'src', 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

const serverSigtermMatches = (serverContent.match(/process\.on\(['"]SIGTERM['"],/g) || []).length;
const serverSigintMatches = (serverContent.match(/process\.on\(['"]SIGINT['"],/g) || []).length;

if (serverSigtermMatches === 1 && serverSigintMatches === 1) {
  console.log('   ✅ SUCCESS: Exactly one SIGTERM and one SIGINT handler in server.js');
} else {
  console.log(`   ❌ FAIL: Found ${serverSigtermMatches} SIGTERM and ${serverSigintMatches} SIGINT handlers (expected 1 each)`);
}

// Test 3: Check XSS protection middleware is applied
console.log('\n✅ Test 3: Checking XSS protection middleware integration...');

// Check server.js includes XSS protection
const hasXssImport = serverContent.includes("require('./middleware/xss-protection')");
const hasXssMiddleware = serverContent.includes('xssProtection.securityHeaders') &&
                        serverContent.includes('xssProtection.requestValidation') &&
                        serverContent.includes('xssProtection.rateLimiting');

if (hasXssImport && hasXssMiddleware) {
  console.log('   ✅ SUCCESS: XSS protection middleware properly integrated in server.js');
} else {
  console.log('   ❌ FAIL: XSS protection middleware not properly integrated in server.js');
}

// Test 4: Check routes have XSS protection for user input
console.log('\n✅ Test 4: Checking route-level XSS protection...');

const routesToCheck = [
  'src/routes/competitions.js',
  'src/routes/tournaments.js',
  'src/routes/clubs.js',
  'src/routes/matches.js'
];

let routesPassed = 0;
routesToCheck.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  if (fs.existsSync(fullPath)) {
    const routeContent = fs.readFileSync(fullPath, 'utf8');
    const hasXssImport = routeContent.includes("require('../middleware/xss-protection')");
    const hasSanitizeMiddleware = routeContent.includes('sanitizeCommonFields');
    const hasRateLimitMiddleware = routeContent.includes('textInputRateLimit');

    if (hasXssImport && hasSanitizeMiddleware && hasRateLimitMiddleware) {
      console.log(`   ✅ ${routePath}: XSS protection properly applied`);
      routesPassed++;
    } else {
      console.log(`   ❌ ${routePath}: Missing XSS protection middleware`);
    }
  } else {
    console.log(`   ⚠️  ${routePath}: File not found`);
  }
});

// Test 5: Check XSS protection module exists and exports required functions
console.log('\n✅ Test 5: Checking XSS protection module integrity...');
const xssProtectionPath = path.join(__dirname, 'src', 'middleware', 'xss-protection.js');
if (fs.existsSync(xssProtectionPath)) {
  const xssContent = fs.readFileSync(xssProtectionPath, 'utf8');
  const hasRequiredExports = xssContent.includes('sanitizeCommonFields') &&
                            xssContent.includes('textInputRateLimit') &&
                            xssContent.includes('securityHeaders') &&
                            xssContent.includes('requestValidation') &&
                            xssContent.includes('xssErrorHandler');

  if (hasRequiredExports) {
    console.log('   ✅ SUCCESS: XSS protection module has all required exports');
  } else {
    console.log('   ❌ FAIL: XSS protection module missing required exports');
  }
} else {
  console.log('   ❌ FAIL: XSS protection module not found');
}

// Summary
console.log('\n🎯 VALIDATION SUMMARY:');
console.log('='.repeat(50));
console.log('Critical Priority Issues:');
console.log(`• Signal handler duplication: ${sigtermMatches === 0 && sigintMatches === 0 ? '✅ FIXED' : '❌ NOT FIXED'}`);
console.log('');
console.log('High Priority Issues:');
console.log(`• XSS protection middleware: ${hasXssImport && hasXssMiddleware ? '✅ FIXED' : '❌ NOT FIXED'}`);
console.log(`• Route-level XSS protection: ${routesPassed === routesToCheck.length ? '✅ FIXED' : `❌ ${routesPassed}/${routesToCheck.length} routes fixed`}`);
console.log('');
console.log('Additional Improvements:');
console.log(`• Consolidated signal handling: ${serverSigtermMatches === 1 && serverSigintMatches === 1 ? '✅ IMPLEMENTED' : '❌ NOT IMPLEMENTED'}`);
console.log(`• XSS module integrity: ${fs.existsSync(xssProtectionPath) ? '✅ VERIFIED' : '❌ MISSING'}`);

console.log('\n✅ Validation complete!');