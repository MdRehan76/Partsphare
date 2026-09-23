const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('=== PARTNEXA UNIFIED AUTHENTICATION TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Customer Login
  console.log('\n--- 1. Testing Customer Login ---');
  const custRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'demo@partsphere.in', password: 'Demo@1234' }
  );

  assert(custRes.status === 200, 'Customer Login HTTP 200', `Status: ${custRes.status}`);
  assert(custRes.data?.success === true, 'Response has success: true');
  assert(!!custRes.data?.data?.accessToken, 'Response contains data.accessToken');
  assert(!!custRes.data?.data?.refreshToken, 'Response contains data.refreshToken');
  assert(custRes.data?.data?.user?.role === 'CUSTOMER', 'Customer role is CUSTOMER', `Role: ${custRes.data?.data?.user?.role}`);

  const customerToken = custRes.data?.data?.accessToken;
  const customerRefresh = custRes.data?.data?.refreshToken;

  // 2. Shop Login
  console.log('\n--- 2. Testing Mechanical Shop Login ---');
  const shopRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'apex.shop@partsphere.in', password: 'Shop@1234' }
  );

  assert(shopRes.status === 200, 'Shop Login HTTP 200', `Status: ${shopRes.status}`);
  assert(shopRes.data?.success === true, 'Response has success: true');
  assert(!!shopRes.data?.data?.accessToken, 'Response contains data.accessToken');
  assert(shopRes.data?.data?.user?.role === 'SHOP_OWNER', 'Shop role is SHOP_OWNER', `Role: ${shopRes.data?.data?.user?.role}`);

  const shopToken = shopRes.data?.data?.accessToken;

  // 3. Delivery Login
  console.log('\n--- 3. Testing Delivery Partner Login ---');
  const deliveryRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'rider.rajesh@partsphere.in', password: 'Rider@1234' }
  );

  assert(deliveryRes.status === 200, 'Delivery Login HTTP 200', `Status: ${deliveryRes.status}`);
  assert(deliveryRes.data?.success === true, 'Response has success: true');
  assert(!!deliveryRes.data?.data?.accessToken, 'Response contains data.accessToken');
  assert(deliveryRes.data?.data?.user?.role === 'DELIVERY_PARTNER', 'Delivery role is DELIVERY_PARTNER', `Role: ${deliveryRes.data?.data?.user?.role}`);

  const deliveryToken = deliveryRes.data?.data?.accessToken;

  // 4. Admin Login
  console.log('\n--- 4. Testing Admin Login ---');
  const adminRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@partsphere.in', password: 'Admin@1234' }
  );

  assert(adminRes.status === 200, 'Admin Login HTTP 200', `Status: ${adminRes.status}`);
  assert(adminRes.data?.success === true, 'Response has success: true');
  assert(!!adminRes.data?.data?.accessToken, 'Response contains data.accessToken');
  assert(adminRes.data?.data?.user?.role === 'ADMIN', 'Admin role is ADMIN', `Role: ${adminRes.data?.data?.user?.role}`);

  const adminToken = adminRes.data?.data?.accessToken;
  const adminRefresh = adminRes.data?.data?.refreshToken;

  // 5. Authoritative /auth/me for each role
  console.log('\n--- 5. Testing /auth/me (Backend Role Authority) ---');
  const meCust = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(meCust.status === 200 && meCust.data?.data?.role === 'CUSTOMER', '/auth/me returns CUSTOMER');

  const meAdmin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(meAdmin.status === 200 && meAdmin.data?.data?.role === 'ADMIN', '/auth/me returns ADMIN');

  // 6. Protected Admin Endpoint with Admin Token
  console.log('\n--- 6. Testing Protected Route RBAC ---');
  const kpiAdmin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/analytics/kpis',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(kpiAdmin.status === 200, 'Admin can access /api/admin/analytics/kpis (200 OK)');

  // 7. Unauthorized Route: Customer accessing Admin Route
  console.log('\n--- 7. Testing Unauthorized Route Access ---');
  const kpiCustomer = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/analytics/kpis',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(kpiCustomer.status === 403, 'Customer rejected from /api/admin/analytics/kpis (403 Forbidden)', `Status: ${kpiCustomer.status}`);

  const kpiShop = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/analytics/kpis',
    method: 'GET',
    headers: { Authorization: `Bearer ${shopToken}` },
  });
  assert(kpiShop.status === 403, 'Shop rejected from /api/admin/analytics/kpis (403 Forbidden)', `Status: ${kpiShop.status}`);

  // 8. Refresh Token Flow
  console.log('\n--- 8. Testing Refresh Token Rotation ---');
  const refreshRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/refresh',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { refreshToken: customerRefresh }
  );
  assert(refreshRes.status === 200, 'Token refresh HTTP 200');
  assert(!!refreshRes.data?.data?.accessToken, 'New accessToken received on refresh');
  assert(!!refreshRes.data?.data?.refreshToken, 'New refreshToken received (rotation)');

  // 9. Logout
  console.log('\n--- 9. Testing Logout ---');
  const logoutRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { refreshToken: adminRefresh }
  );
  assert(logoutRes.status === 200, 'Logout HTTP 200');

  // Summary
  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite runtime error:', err);
  process.exit(1);
});
