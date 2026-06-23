#!/usr/bin/env node

/**
 * Refresh Token Endpoint Test
 * 
 * Tests the /api/auth/token/refresh endpoint
 * 
 * Usage:
 *   npm test -- test-refresh-token.js
 *   OR
 *   node test-refresh-token.js
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

console.log('🔄 Testing Google OAuth Refresh Token Endpoint\n');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('━'.repeat(60));

/**
 * Test 1: Login with Demo Account & Get Tokens
 */
async function testDemoLogin() {
  console.log('\n✅ Test 1: Demo Login (Get Initial Tokens)');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '192.168.1.100'
      },
      body: JSON.stringify({
        email: 'demo1@gmail.com',
        providerId: 'demo_google_001',
        name: 'Demo Account One'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      // Extract refresh token from Set-Cookie header
      const cookies = response.headers.get('set-cookie') || '';
      const refreshTokenMatch = cookies.match(/refresh-token=([^;]+)/);
      const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;
      
      console.log(`✓ Demo login successful`);
      return refreshToken;
    } else {
      console.log(`✗ Demo login failed`);
      return null;
    }
  } catch (err) {
    console.error(`✗ Error:`, err.message);
    return null;
  }
}

/**
 * Test 2: Refresh Token Endpoint
 */
async function testRefreshToken(refreshToken) {
  console.log('\n✅ Test 2: Refresh Token Endpoint');
  console.log('─'.repeat(60));

  if (!refreshToken) {
    console.log(`✗ No refresh token available. Skipping test.`);
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh-token=${refreshToken}`
      }
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log(`✓ Token refresh successful`);
      console.log(`  - New Access Token: ${data.accessToken ? '✓' : '✗'}`);
      console.log(`  - Token Type: ${data.tokenType || 'Bearer'}`);
      console.log(`  - Expires In: ${data.expiresIn || '15 minutes'}`);
      return true;
    } else {
      console.log(`✗ Token refresh failed`);
      console.log(`  - Error: ${data.error}`);
      return false;
    }
  } catch (err) {
    console.error(`✗ Error:`, err.message);
    return false;
  }
}

/**
 * Test 3: Invalid Token Test
 */
async function testInvalidToken() {
  console.log('\n✅ Test 3: Invalid Token Handling');
  console.log('─'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh-token=invalid_token_12345`
      }
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.status === 401 || response.status === 403) {
      console.log(`✓ Invalid token correctly rejected`);
      return true;
    } else {
      console.log(`✗ Expected 401/403, got ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error(`✗ Error:`, err.message);
    return false;
  }
}

/**
 * Test 4: Missing Token Test
 */
async function testMissingToken() {
  console.log('\n✅ Test 4: Missing Token Handling');
  console.log('─'.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.status === 401 || response.status === 400) {
      console.log(`✓ Missing token correctly rejected`);
      return true;
    } else {
      console.log(`✗ Expected 401/400, got ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error(`✗ Error:`, err.message);
    return false;
  }
}

/**
 * Test 5: Token Rotation Verification
 */
async function testTokenRotation(firstToken) {
  console.log('\n✅ Test 5: Token Rotation (Old Token Should Fail)');
  console.log('─'.repeat(60));

  // First refresh
  try {
    const response1 = await fetch(`${BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh-token=${firstToken}`
      }
    });

    const data1 = await response1.json();
    console.log(`First Refresh Status: ${response1.status}`);

    if (!response1.ok) {
      console.log(`✗ First refresh failed`);
      return false;
    }

    console.log(`✓ First refresh succeeded`);

    // Try to use old token again
    const response2 = await fetch(`${BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh-token=${firstToken}`
      }
    });

    const data2 = await response2.json();
    console.log(`Second Refresh Status (Old Token): ${response2.status}`);

    if (response2.status === 401 || response2.status === 403) {
      console.log(`✓ Old token correctly invalidated (token rotation working)`);
      return true;
    } else {
      console.log(`✗ Old token should be invalidated after first refresh`);
      return false;
    }
  } catch (err) {
    console.error(`✗ Error:`, err.message);
    return false;
  }
}

/**
 * Run All Tests
 */
async function runAllTests() {
  const results = {
    demoLogin: false,
    refreshToken: false,
    invalidToken: false,
    missingToken: false,
    tokenRotation: false
  };

  // Test 1: Demo Login
  const refreshToken = await testDemoLogin();
  results.demoLogin = !!refreshToken;

  // Test 2: Refresh Token
  if (refreshToken) {
    results.refreshToken = await testRefreshToken(refreshToken);
  }

  // Test 3: Invalid Token
  results.invalidToken = await testInvalidToken();

  // Test 4: Missing Token
  results.missingToken = await testMissingToken();

  // Test 5: Token Rotation
  if (refreshToken) {
    results.tokenRotation = await testTokenRotation(refreshToken);
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('━'.repeat(60));
  
  const testNames = [
    '✅ Demo Login',
    '✅ Refresh Token',
    '✅ Invalid Token Handling',
    '✅ Missing Token Handling',
    '✅ Token Rotation'
  ];

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;

  console.log(`\n${passed}/${total} tests passed\n`);

  Object.entries(results).forEach(([key, passed], idx) => {
    const status = passed ? '✓' : '✗';
    console.log(`  ${status} ${testNames[idx]}`);
  });

  console.log('\n' + '━'.repeat(60));

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Refresh token endpoint is working correctly.');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Check the output above.`);
  }

  console.log('━'.repeat(60) + '\n');

  return passed === total;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
