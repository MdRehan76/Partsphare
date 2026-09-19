import inMemoryDb, { initialProducts } from './src/config/inMemoryDb';

const BASE_URL = 'http://localhost:5000/api';

async function runCartTests() {
  console.log('🚀 Starting Customer Cart System Comprehensive Acceptance Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Register a test user
    const testEmail = `cart.test.${Date.now()}@example.com`;
    console.log(`1. Testing Customer Registration & Authentication...`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Verma',
        email: testEmail,
        mobileNumber: '9811223344',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'User registered successfully');
    const token = regData.data?.accessToken || regData.data?.tokens?.accessToken;
    assert(Boolean(token), 'Received JWT access token');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Test Empty Cart
    console.log('\n2. Testing Empty Cart State & Totals...');
    const emptyCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: authHeaders,
    });
    const emptyCartData = await emptyCartRes.json();
    assert(emptyCartRes.status === 200, 'GET /cart returns 200');
    assert(emptyCartData.data?.items?.length === 0, 'Cart items list is initially empty');
    assert(emptyCartData.data?.subtotal === 0, 'Initial subtotal is 0');
    assert(emptyCartData.data?.deliveryFee === 0, 'Initial deliveryFee is 0');
    assert(emptyCartData.data?.total === 0, 'Initial total is 0');

    // 3. Add a primary vehicle (Maruti Swift VXi -> var-swift-vxi)
    console.log('\n3. Setting Up User Primary Vehicle (Maruti Swift VXi)...');
    const vehRes = await fetch(`${BASE_URL}/vehicles/garage`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        variantId: 'var-swift-vxi',
        nickname: 'My Swift',
        regNumber: 'KA01AB1234',
        isPrimary: true,
      }),
    });
    const vehData = await vehRes.json();
    assert(vehRes.status === 201, 'Vehicle added to garage as primary');

    // 4. Test Incompatible Product Rejection
    console.log('\n4. Testing Incompatible Product Rejection & Explanation...');
    // Motul 7100 oil is only compatible with bikes: var-pulsar-twin, var-pulsar-single, var-classic-halcyon, var-classic-dark, var-splendor-drum
    const incompRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-motul-oil',
        quantity: 1,
      }),
    });
    const incompData = await incompRes.json();
    assert(incompRes.status === 400, 'Adding incompatible product rejected with HTTP 400');
    assert(
      incompData.message && incompData.message.toLowerCase().includes('incompatible'),
      `Explanation returned: "${incompData.message}"`
    );

    // 5. Test Out of Stock Item Rejection
    console.log('\n5. Testing Out-of-Stock Product Rejection...');
    const oosRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-amaron-battery-oos',
        quantity: 1,
        ignoreCompatibility: true,
      }),
    });
    const oosData = await oosRes.json();
    assert(oosRes.status === 400, 'Adding out-of-stock product rejected with HTTP 400');
    assert(
      oosData.message && oosData.message.toLowerCase().includes('out of stock'),
      `Out of stock message: "${oosData.message}"`
    );

    // 6. Test Add Compatible Product & Authoritative Totals (Subtotal < 999 => Delivery Fee = 49)
    console.log('\n6. Testing Adding Compatible Product (Subtotal < ₹999 => Delivery Fee = ₹49)...');
    // Bosch Spark Plug: compatible with Swift VXi, selling price = 820, mrp = 999
    const addRes1 = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-bosch-spark',
        quantity: 1,
      }),
    });
    const addData1 = await addRes1.json();
    assert(addRes1.status === 200, 'Compatible product added successfully');
    const cart1 = addData1.data;
    assert(cart1.items.length === 1, 'Cart has 1 item');
    assert(cart1.subtotal === 820, `Subtotal is authoritatively ₹820 (got ${cart1.subtotal})`);
    assert(cart1.deliveryFee === 49, `Delivery fee is ₹49 for subtotal < 999 (got ${cart1.deliveryFee})`);
    assert(cart1.total === 869, `Total is ₹869 (820 + 49) (got ${cart1.total})`);
    assert(cart1.discount === 179, `Discount is ₹179 (MRP 999 - 820) (got ${cart1.discount})`);

    // 7. Test Duplicate Product Addition (Accumulates quantity, Subtotal >= 999 => Free Delivery)
    console.log('\n7. Testing Duplicate Product Addition & Free Delivery (Subtotal >= ₹999)...');
    const addRes2 = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-bosch-spark',
        quantity: 1,
      }),
    });
    const addData2 = await addRes2.json();
    assert(addRes2.status === 200, 'Duplicate item added, merged successfully');
    const cart2 = addData2.data;
    assert(cart2.items.length === 1, 'Still 1 distinct item line in cart');
    assert(cart2.items[0].quantity === 2, 'Quantity accumulated to 2');
    assert(cart2.subtotal === 1640, `Subtotal is ₹1640 (820 * 2) (got ${cart2.subtotal})`);
    assert(cart2.deliveryFee === 0, `Delivery fee is FREE (₹0) when subtotal >= 999 (got ${cart2.deliveryFee})`);
    assert(cart2.total === 1640, `Total is ₹1640 (got ${cart2.total})`);

    // 8. Test Stock Boundary Rejection (Requested quantity exceeds available stock)
    console.log('\n8. Testing Stock Boundary Enforcement...');
    // In Brembo brake pads, inv-2-1 stock is 18. Let's try adding 99 units.
    const exceedRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-brembo-brakes',
        quantity: 99,
      }),
    });
    const exceedData = await exceedRes.json();
    assert(exceedRes.status === 400, 'Adding quantity beyond stock rejected with HTTP 400');
    assert(
      exceedData.message && exceedData.message.toLowerCase().includes('stock'),
      `Stock limit error message: "${exceedData.message}"`
    );

    // 9. Test Increasing and Decreasing Quantity (PATCH /cart/items/:id)
    console.log('\n9. Testing Increasing & Decreasing Quantity...');
    const itemId = cart2.items[0].id;

    // Increase to 3
    const patchRes1 = await fetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 3 }),
    });
    const patchData1 = await patchRes1.json();
    assert(patchRes1.status === 200, 'Quantity increased to 3');
    assert(patchData1.data?.items[0]?.quantity === 3, 'Item quantity is now 3');
    assert(patchData1.data?.subtotal === 2460, 'Subtotal updated to ₹2460');

    // Decrease to 1
    const patchRes2 = await fetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 1 }),
    });
    const patchData2 = await patchRes2.json();
    assert(patchRes2.status === 200, 'Quantity decreased to 1');
    assert(patchData2.data?.items[0]?.quantity === 1, 'Item quantity is now 1');
    assert(patchData2.data?.deliveryFee === 49, 'Delivery fee reverted to ₹49 since subtotal < 999');

    // Exceed stock via PATCH
    const patchExceed = await fetch(`${BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantity: 9999 }),
    });
    assert(patchExceed.status === 400, 'PATCH exceeding stock rejected with HTTP 400');

    // 10. Test Removing Product (DELETE /cart/items/:id)
    console.log('\n10. Testing Removing Product...');
    // First add Brembo brakes
    const addBrembo = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: 'prod-brembo-brakes', quantity: 1 }),
    });
    const bremboData = await addBrembo.json();
    assert(bremboData.data?.items?.length === 2, 'Two items in cart');

    const bremboItemId = bremboData.data.items.find(
      (it: any) => it.productId === 'prod-brembo-brakes'
    ).id;

    const delRes = await fetch(`${BASE_URL}/cart/items/${bremboItemId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const delData = await delRes.json();
    assert(delRes.status === 200, 'DELETE /cart/items/:id returns 200');
    assert(delData.data?.items?.length === 1, 'Cart now has 1 item after deletion');
    assert(
      !delData.data?.items?.some((it: any) => it.id === bremboItemId),
      'Deleted item no longer present in cart'
    );

    // 11. Test Pre-Checkout Revalidation (Stock change & Price change)
    console.log('\n11. Testing Pre-Checkout Inventory Revalidation...');
    const currentItem = delData.data.items[0];

    // Simulate price change on the server via API: 820 -> 900
    await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: currentItem.productId,
        shopId: currentItem.shopId,
        sellingPrice: 900,
      }),
    });

    const revalRes = await fetch(`${BASE_URL}/cart/revalidate`, {
      method: 'POST',
      headers: authHeaders,
    });
    const revalData = await revalRes.json();
    assert(revalRes.status === 200, 'POST /cart/revalidate returns 200');
    assert(revalData.data?.warnings?.length > 0, 'Revalidation returned price change warning');
    assert(revalData.data?.cart?.items[0]?.priceSnapshot === 900, 'Cart item priceSnapshot updated to new inventory price');

    // Simulate item becoming out of stock on server
    await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: currentItem.productId,
        shopId: currentItem.shopId,
        quantity: 0,
        isAvailable: false,
      }),
    });

    const revalOosRes = await fetch(`${BASE_URL}/cart/revalidate`, {
      method: 'POST',
      headers: authHeaders,
    });
    const revalOosData = await revalOosRes.json();
    assert(revalOosRes.status === 200, 'Revalidation handles out-of-stock gracefully');
    assert(
      revalOosData.data?.warnings?.some((w: string) => w.includes('out of stock')),
      'Warning indicates out-of-stock removal'
    );
    assert(revalOosData.data?.cart?.items?.length === 0, 'Out of stock item automatically removed from cart');

    // Restore inventory on server
    await fetch(`${BASE_URL}/cart/simulate-inventory-update`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: currentItem.productId,
        shopId: currentItem.shopId,
        quantity: 45,
        sellingPrice: 820,
        isAvailable: true,
      }),
    });

    // 12. Test Expired / Invalid Session
    console.log('\n12. Testing Expired / Unauthorized Session...');
    const unauthRes = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_or_expired_jwt_token',
      },
    });
    assert(unauthRes.status === 401, 'Invalid/expired token rejected with HTTP 401');

    // 13. Test Cart Persistence (Re-login as user and verify cart)
    console.log('\n13. Testing Customer Cart Persistence across Sessions...');
    // Ensure fresh state and add 2 units
    await fetch(`${BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: 'prod-bosch-spark', quantity: 2 }),
    });

    // Login anew
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password@123' }),
    });
    const loginData = await loginRes.json();
    const newSessionToken = loginData.data?.accessToken || loginData.data?.tokens?.accessToken;

    const persistedCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newSessionToken}`,
      },
    });
    const persistedData = await persistedCartRes.json();
    assert(persistedCartRes.status === 200, 'Cart loaded on new session');
    assert(persistedData.data?.items?.length === 1, 'Cart items persisted in database');
    assert(persistedData.data?.items[0]?.quantity === 2, 'Item quantity (2) persisted');
    assert(persistedData.data?.subtotal === 1640, 'Subtotal persisted');

    // Summary
    console.log('\n========================================');
    console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runCartTests();
