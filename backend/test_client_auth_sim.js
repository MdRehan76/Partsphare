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

// In-memory mock localStorage simulating browser storage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

async function runClientAuthSimulation() {
  console.log('=== PARTNEXA CLIENT & PROXY AUTHENTICATION TEST ===\n');
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

  // 1. Test Vite Proxy (port 5173 -> port 5000)
  console.log('--- 1. Testing Vite API Proxy (/api -> http://localhost:5000) ---');
  const proxyRes = await request(
    {
      hostname: 'localhost',
      port: 5173,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'demo@partsphere.in', password: 'Demo@1234' }
  );

  assert(proxyRes.status === 200, 'Vite Proxy forwards /api/auth/login to backend (HTTP 200)');
  assert(proxyRes.data?.success === true, 'Proxy response returns success: true');
  assert(!!proxyRes.data?.data?.accessToken, 'Proxy response contains accessToken');

  // 2. Simulated Client AuthContext Logic
  console.log('\n--- 2. Simulating Frontend AuthContext & Role Enforcement ---');
  const localStorage = new MockLocalStorage();

  async function clientLogin(credentials, selectedRole) {
    const res = await request(
      {
        hostname: 'localhost',
        port: 5173,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      credentials
    );

    const resData = res.data?.data || res.data;
    const { user: userData, accessToken, refreshToken } = resData;

    if (!userData || !accessToken) {
      throw new Error('Authentication response is missing user or accessToken.');
    }

    // Role verification
    if (selectedRole) {
      const userRole = userData.role;
      const isRoleMatch =
        userRole === selectedRole ||
        (selectedRole === 'ADMIN' && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'));

      if (!isRoleMatch) {
        throw new Error(
          `Access Denied: You selected '${selectedRole}', but this account is registered as '${userRole}'. Please select the ${userRole} role to sign in.`
        );
      }
    }

    // Standardized storage
    localStorage.setItem('partnexa_access_token', accessToken);
    if (refreshToken) localStorage.setItem('partnexa_refresh_token', refreshToken);
    localStorage.setItem('partnexa_user', JSON.stringify(userData));

    return userData;
  }

  // A. Test Wrong-Role Rejection: Select ADMIN, use CUSTOMER credentials
  let wrongRoleRejected = false;
  try {
    await clientLogin({ email: 'demo@partsphere.in', password: 'Demo@1234' }, 'ADMIN');
  } catch (err) {
    wrongRoleRejected = true;
    assert(
      err.message.includes('Access Denied'),
      'Wrong-role login threw Access Denied exception',
      err.message
    );
  }
  assert(wrongRoleRejected, 'Customer login rejected when ADMIN role is selected');
  assert(
    localStorage.getItem('partnexa_access_token') === null,
    'No tokens stored in localStorage upon wrong-role rejection'
  );

  // B. Customer Login with CUSTOMER role
  console.log('\n--- 3. Testing Customer Login with CUSTOMER Role ---');
  const custUser = await clientLogin(
    { email: 'demo@partsphere.in', password: 'Demo@1234' },
    'CUSTOMER'
  );
  assert(custUser.role === 'CUSTOMER', 'Customer successfully authenticated');
  assert(
    localStorage.getItem('partnexa_access_token') !== null,
    'partnexa_access_token is stored in localStorage'
  );
  assert(
    localStorage.getItem('partnexa_refresh_token') !== null,
    'partnexa_refresh_token is stored in localStorage'
  );
  assert(
    JSON.parse(localStorage.getItem('partnexa_user')).role === 'CUSTOMER',
    'partnexa_user stored with CUSTOMER role'
  );

  // C. Test Authoritative /auth/me Session Restore (Tamper Protection)
  console.log('\n--- 4. Testing Authoritative /auth/me (No trusting localStorage alone) ---');
  // Attacker tampers localStorage role to ADMIN
  localStorage.setItem('partnexa_user', JSON.stringify({ ...custUser, role: 'ADMIN' }));

  // App restores session by querying /auth/me with the real token
  const token = localStorage.getItem('partnexa_access_token');
  const meRes = await request({
    hostname: 'localhost',
    port: 5173,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const serverUser = meRes.data?.data;
  assert(
    serverUser.role === 'CUSTOMER',
    'Server /auth/me returns real role (CUSTOMER), defeating local tampering'
  );
  // Restore overwrites tampered local storage
  localStorage.setItem('partnexa_user', JSON.stringify(serverUser));
  assert(
    JSON.parse(localStorage.getItem('partnexa_user')).role === 'CUSTOMER',
    'localStorage corrected to backend authoritative role'
  );

  // D. ProtectedRoute RBAC Check
  console.log('\n--- 5. Testing ProtectedRoute Authorization Logic ---');
  function checkRouteAccess(userRole, allowedRoles) {
    const isAuthorized =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes('ADMIN') && userRole === 'SUPER_ADMIN');
    return isAuthorized;
  }

  assert(
    checkRouteAccess(serverUser.role, ['ADMIN', 'SUPER_ADMIN']) === false,
    'CUSTOMER denied from Admin Route [/admin]'
  );
  assert(
    checkRouteAccess(serverUser.role, ['SHOP_OWNER']) === false,
    'CUSTOMER denied from Shop Route [/shop]'
  );
  assert(
    checkRouteAccess(serverUser.role, ['CUSTOMER']) === true,
    'CUSTOMER allowed on Customer Route [/customer]'
  );

  // E. Mechanical Shop Login
  console.log('\n--- 6. Testing Mechanical Shop Login with SHOP_OWNER Role ---');
  localStorage.clear();
  const shopUser = await clientLogin(
    { email: 'apex.shop@partsphere.in', password: 'Shop@1234' },
    'SHOP_OWNER'
  );
  assert(shopUser.role === 'SHOP_OWNER', 'Shop owner authenticated');
  assert(
    checkRouteAccess(shopUser.role, ['SHOP_OWNER']) === true,
    'SHOP_OWNER allowed on [/shop]'
  );
  assert(
    checkRouteAccess(shopUser.role, ['ADMIN']) === false,
    'SHOP_OWNER denied on [/admin]'
  );

  // F. Delivery Partner Login
  console.log('\n--- 7. Testing Delivery Partner Login with DELIVERY_PARTNER Role ---');
  localStorage.clear();
  const deliveryUser = await clientLogin(
    { email: 'rider.rajesh@partsphere.in', password: 'Rider@1234' },
    'DELIVERY_PARTNER'
  );
  assert(deliveryUser.role === 'DELIVERY_PARTNER', 'Delivery partner authenticated');
  assert(
    checkRouteAccess(deliveryUser.role, ['DELIVERY_PARTNER']) === true,
    'DELIVERY_PARTNER allowed on [/delivery]'
  );
  assert(
    checkRouteAccess(deliveryUser.role, ['ADMIN']) === false,
    'DELIVERY_PARTNER denied on [/admin]'
  );

  // G. Admin Login
  console.log('\n--- 8. Testing Admin Login with ADMIN Role ---');
  localStorage.clear();
  const adminUser = await clientLogin(
    { email: 'admin@partsphere.in', password: 'Admin@1234' },
    'ADMIN'
  );
  assert(adminUser.role === 'ADMIN', 'Admin authenticated');
  assert(
    checkRouteAccess(adminUser.role, ['ADMIN', 'SUPER_ADMIN']) === true,
    'ADMIN allowed on [/admin]'
  );

  // H. Token Refresh via Proxy
  console.log('\n--- 9. Testing Token Refresh Flow via Vite Proxy ---');
  const adminRefresh = localStorage.getItem('partnexa_refresh_token');
  const refreshProxyRes = await request(
    {
      hostname: 'localhost',
      port: 5173,
      path: '/api/auth/refresh',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { refreshToken: adminRefresh }
  );

  assert(refreshProxyRes.status === 200, 'Refresh token endpoint HTTP 200 via Vite proxy');
  assert(
    !!refreshProxyRes.data?.data?.accessToken,
    'New accessToken returned from proxy refresh'
  );
  assert(
    !!refreshProxyRes.data?.data?.refreshToken,
    'New refreshToken returned from proxy refresh'
  );

  // I. Client Logout
  console.log('\n--- 10. Testing Client Logout & Storage Clearing ---');
  const logoutProxyRes = await request(
    {
      hostname: 'localhost',
      port: 5173,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { refreshToken: refreshProxyRes.data?.data?.refreshToken }
  );
  assert(logoutProxyRes.status === 200, 'Logout succeeded via proxy');
  localStorage.clear();
  assert(localStorage.getItem('partnexa_access_token') === null, 'partnexa_access_token cleared');
  assert(localStorage.getItem('partnexa_user') === null, 'partnexa_user cleared');

  console.log(`\n========================================`);
  console.log(`CLIENT SIMULATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runClientAuthSimulation().catch((err) => {
  console.error('Client simulation error:', err);
  process.exit(1);
});
