const BASE_URL = 'http://localhost:5000/api';

async function runEdgeCaseVerification() {
  console.log('===========================================================');
  console.log('🧪 PartNexa Customer Cart — Comprehensive Edge Cases Suite');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function test(desc: string, cond: boolean) {
    if (cond) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // Helper to register fresh customer
  const email = `customer_${Date.now()}@carttest.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditya Roy',
      email,
      mobileNumber: '9888877777',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    }),
  });
  const regData = await regRes.json();
  const token = regData.data?.accessToken;
  test('Customer registered with auth token', Boolean(token));

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // EDGE CASE 1: Empty Cart
  console.log('\n--- EDGE CASE 1: Empty Cart ---');
  const emptyRes = await fetch(`${BASE_URL}/cart`, { headers: authHeaders });
  const emptyData = await emptyRes.json();
  test('Empty cart returns HTTP 200', emptyRes.status === 200);
  test('Empty cart has 0 items', emptyData.data.items.length === 0);
  test('Empty cart subtotal is ₹0', emptyData.data.subtotal === 0);
  test('Empty cart deliveryFee is ₹0', emptyData.data.deliveryFee === 0);
  test('Empty cart total is ₹0', emptyData.data.total === 0);

  // Set up Swift VXi vehicle in garage
  await fetch(`${BASE_URL}/vehicles/garage`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      variantId: 'var-swift-vxi',
      nickname: 'Swift',
      regNumber: 'KA05CD5678',
      isPrimary: true,
    }),
  });

  // EDGE CASE 2: Incompatible Product
  console.log('\n--- EDGE CASE 2: Incompatible Product Rejection & Explanation ---');
  const incompRes = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-motul-oil', quantity: 1 }),
  });
  const incompData = await incompRes.json();
  test('Incompatible product rejected with HTTP 400', incompRes.status === 400);
  test('Explanation includes vehicle name and compatibility advice', 
    Boolean(incompData.message && incompData.message.includes('Incompatible') && incompData.message.includes('Swift'))
  );

  // EDGE CASE 3: Out of Stock Item
  console.log('\n--- EDGE CASE 3: Out-of-Stock Item Rejection ---');
  const oosRes = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-amaron-battery-oos', quantity: 1, ignoreCompatibility: true }),
  });
  const oosData = await oosRes.json();
  test('Out-of-stock product rejected with HTTP 400', oosRes.status === 400);
  test('Message explains item is out of stock', Boolean(oosData.message?.includes('out of stock')));

  // EDGE CASE 4: Insufficient Quantity / Stock Limit Boundary
  console.log('\n--- EDGE CASE 4: Insufficient Quantity & Stock Limits ---');
  // Attempting to add 100 units of spark plugs when available stock is 45
  const exceedRes = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-bosch-spark', quantity: 100 }),
  });
  const exceedData = await exceedRes.json();
  test('Adding quantity beyond stock rejected with HTTP 400', exceedRes.status === 400);
  test('Error states maximum available stock is 45', Boolean(exceedData.message?.includes('45')));

  // EDGE CASE 5: Duplicate Product Addition (Accumulation & Delivery Threshold)
  console.log('\n--- EDGE CASE 5: Duplicate Product Merging & Delivery Tier ---');
  // Add 1 spark plug (sellingPrice: 820)
  const add1 = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-bosch-spark', quantity: 1 }),
  });
  const data1 = await add1.json();
  test('First unit added successfully', add1.status === 200);
  test('Subtotal ₹820 < ₹999 => Delivery fee is ₹49', data1.data.deliveryFee === 49);
  test('Total is ₹869 (820 + 49)', data1.data.total === 869);

  // Add duplicate product (+1 unit)
  const add2 = await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-bosch-spark', quantity: 1 }),
  });
  const data2 = await add2.json();
  test('Duplicate item merged into existing line item', data2.data.items.length === 1);
  test('Accumulated quantity is 2', data2.data.items[0].quantity === 2);
  test('Subtotal ₹1640 >= ₹999 => Delivery fee becomes FREE (₹0)', data2.data.deliveryFee === 0);
  test('Total is authoritatively ₹1640', data2.data.total === 1640);

  // EDGE CASE 6: Quantity Patch Boundary
  console.log('\n--- EDGE CASE 6: Quantity Control Updates & Clamping ---');
  const itemId = data2.data.items[0].id;
  // Reduce to 1
  const decRes = await fetch(`${BASE_URL}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ quantity: 1 }),
  });
  const decData = await decRes.json();
  test('Decreased quantity to 1', decData.data.items[0].quantity === 1);
  test('Delivery fee reverts to ₹49 when subtotal drops below ₹999', decData.data.deliveryFee === 49);

  // Try setting quantity above stock via PATCH
  const patchExceedRes = await fetch(`${BASE_URL}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ quantity: 999 }),
  });
  test('PATCH beyond available stock rejected with HTTP 400', patchExceedRes.status === 400);

  // EDGE CASE 7: Price Change & Stock Revalidation
  console.log('\n--- EDGE CASE 7: Pre-Checkout Revalidation (Price & Stock Change) ---');
  // Change selling price on server to 880
  await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productId: 'prod-bosch-spark',
      shopId: decData.data.items[0].shopId,
      sellingPrice: 880,
    }),
  });

  const revalRes = await fetch(`${BASE_URL}/cart/revalidate`, {
    method: 'POST',
    headers: authHeaders,
  });
  const revalData = await revalRes.json();
  test('POST /cart/revalidate returns HTTP 200', revalRes.status === 200);
  test('Revalidation warning captures price change', Boolean(revalData.data.warnings?.some((w: string) => w.includes('Price'))));
  test('Price snapshot updated to ₹880', revalData.data.cart.items[0].priceSnapshot === 880);

  // Restore price
  await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productId: 'prod-bosch-spark',
      shopId: decData.data.items[0].shopId,
      sellingPrice: 820,
    }),
  });

  // EDGE CASE 8: Deleted / Out-of-Stock Product Removal in Revalidation
  console.log('\n--- EDGE CASE 8: Out-of-Stock Product Auto-Removal During Revalidation ---');
  // Simulate item going out of stock on server
  await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productId: 'prod-bosch-spark',
      shopId: decData.data.items[0].shopId,
      quantity: 0,
      isAvailable: false,
    }),
  });
  const revalOosRes = await fetch(`${BASE_URL}/cart/revalidate`, {
    method: 'POST',
    headers: authHeaders,
  });
  const revalOosData = await revalOosRes.json();
  test('Warning captures out-of-stock condition', Boolean(revalOosData.data.warnings?.some((w: string) => w.includes('out of stock'))));
  test('Out-of-stock item automatically removed from cart', revalOosData.data.cart.items.length === 0);
  test('Revalidation marked as not valid when items removed', revalOosData.data.isValid === false);

  // Restore inventory
  await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productId: 'prod-bosch-spark',
      shopId: decData.data.items[0].shopId,
      quantity: 45,
      sellingPrice: 820,
      isAvailable: true,
    }),
  });

  // EDGE CASE 9: Expired / Missing Session
  console.log('\n--- EDGE CASE 9: Expired / Invalid Session Rejection ---');
  const expRes = await fetch(`${BASE_URL}/cart`, {
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer expired.token.signature' },
  });
  test('Expired session token rejected with HTTP 401', expRes.status === 401);

  // EDGE CASE 10: Refresh & Login Persistence
  console.log('\n--- EDGE CASE 10: Cart Refresh & Multi-Session Persistence ---');
  // Add 2 units of Brembo brakes
  await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: 'prod-brembo-brakes', quantity: 2 }),
  });

  // Customer logs in anew
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password@123' }),
  });
  const loginData = await loginRes.json();
  const freshToken = loginData.data?.accessToken;

  const refreshCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
  });
  const refreshCartData = await refreshCartRes.json();
  test('Cart fetched after re-login', refreshCartRes.status === 200);
  test('Item persisted across sessions', refreshCartData.data.items.length === 1);
  test('Quantity (2) persisted across sessions', refreshCartData.data.items[0].quantity === 2);
  test('Subtotal (₹3198) persisted across sessions', refreshCartData.data.subtotal === 3198);

  console.log('\n===========================================================');
  console.log(`Edge Cases Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================\n');

  if (failed > 0) process.exit(1);
}

runEdgeCaseVerification();
