/**
 * Phase 9: Authoritative PartNexa Inventory Synchronization Verification Suite
 * 
 * Verifies:
 * 1. Supplier EDI 846 Ingest sets stock to 10.
 * 2. Customer sees 10 available.
 * 3. Shop sees 10 available.
 * 4. Admin sees 10 available.
 * 5. Customer places order for 2 units.
 * 6. Database stock decrements from 10 to exactly 8 (no double-deduction).
 * 7. Customer refresh shows 8 available.
 * 8. Admin shows 8 available.
 * 9. Shop shows 8 available.
 * 10. Over-ordering prevention (Attempting to order 9 units rejected with 400).
 * 11. Stale stock & race condition prevention (2 concurrent checkouts of 5 units each -> 1 passes, 1 fails, leaves 3).
 * 12. Used-part verification increments refurbished inventory.
 * 13. EDI inventory audit event log verification.
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function login(email: string, password: string) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 200 || !res.data?.data?.accessToken) {
    throw new Error(`Failed to log in as ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.accessToken;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runInventorySyncSuite() {
  console.log('===================================================================');
  console.log('🚀 STARTING PARTNEXA AUTHORITATIVE INVENTORY SYNCHRONIZATION TEST');
  console.log('===================================================================\n');

  // 1. Authenticate Roles
  console.log('1. Authenticating platform personas (Customer, Shop, Admin)...');
  const customerToken = await login('demo@partsphere.in', 'Demo@1234');
  const shopToken = await login('apex.shop@partsphere.in', 'Shop@1234');
  const adminToken = await login('admin@partsphere.in', 'Admin@1234');
  console.log('   ✓ Customer, Workshop, and Admin authenticated.\n');

  const custHeaders = { Authorization: `Bearer ${customerToken}` };
  const shopHeaders = { Authorization: `Bearer ${shopToken}` };
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 2. Target Product & Shop Setup
  const targetSku = 'BOSCH-SP-FR78X';
  const targetProductId = 'prod-bosch-spark';
  const targetShopId = 'shop-1';

  // 3. STEP A: Supplier EDI 846 Ingest (Set stock to exactly 10)
  console.log('2. Ingesting Supplier EDI 846 Inventory Advice message (Setting stock to 10)...');
  const ediPayload = {
    senderId: 'BOSCH-AUTOMOTIVE-EDI-FEED-01',
    documentType: 'EDI_846_INVENTORY_ADVICE',
    controlNumber: `EDI-846-${Date.now()}`,
    timestamp: new Date().toISOString(),
    lineItems: [
      {
        sku: targetSku,
        productId: targetProductId,
        shopId: targetShopId,
        quantityAvailable: 10,
        batchNumber: 'BATCH-2026-X8',
        unitCost: 650,
      },
    ],
  };

  const ediRes = await request('/inventory/edi/ingest', {
    method: 'POST',
    body: JSON.stringify(ediPayload),
  });
  assert(ediRes.status === 200, 'EDI 846 inventory ingest succeeded with HTTP 200');
  assert(ediRes.data.data.processedCount === 1, 'EDI 846 processed exactly 1 line item');

  // 4. STEP B: Verify Customer sees 10 available
  console.log('\n3. Verifying initial stock visibility across Customer, Shop, and Admin...');
  const custProdRes = await request(`/catalog/products/${targetProductId}`);
  assert(custProdRes.status === 200, 'Customer product fetch succeeded');
  const custProd = custProdRes.data.data;
  const shopInvForCust = custProd.inventories.find((i: any) => i.shopId === targetShopId);
  console.log(`   Customer sees total stock: ${custProd.stockQuantity}, Shop-1 stock: ${shopInvForCust?.quantity}`);
  assert(shopInvForCust?.quantity === 10, 'Customer catalog sees exactly 10 units available in Shop-1');
  assert(custProd.isAvailable === true, 'Product is marked available for purchase');

  // 5. STEP C: Verify Admin sees 10 available
  const adminInvRes = await request('/admin/inventory', { headers: adminHeaders });
  assert(adminInvRes.status === 200, 'Admin inventory fetch succeeded');
  const adminInvItem = (adminInvRes.data.data || []).find(
    (i: any) => i.productId === targetProductId && i.shopId === targetShopId
  );
  assert(!!adminInvItem, 'Admin found inventory record for target product & shop');
  console.log(`   Admin sees inventory quantity: ${adminInvItem.quantity}`);
  assert(adminInvItem.quantity === 10, 'Admin portal sees exactly 10 units in stock');

  // 6. STEP D: Verify Shop sees 10 available
  const shopInvRes = await request('/shops/portal/inventory', { headers: shopHeaders });
  assert(shopInvRes.status === 200, 'Shop portal inventory fetch succeeded');
  const shopInvItem = (shopInvRes.data.data || []).find(
    (i: any) => i.productId === targetProductId
  );
  assert(!!shopInvItem, 'Shop found inventory record in its workshop inventory');
  console.log(`   Shop sees workshop quantity: ${shopInvItem.quantity}`);
  assert(shopInvItem.quantity === 10, 'Shop portal sees exactly 10 units in stock');

  // 7. STEP E: Customer Orders 2 units
  console.log('\n4. Executing customer order for 2 units...');
  // Clear cart
  await request('/cart/clear', { method: 'DELETE', headers: custHeaders });

  // Add 2 units
  const addCartRes = await request('/cart/items', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      productId: targetProductId,
      shopId: targetShopId,
      quantity: 2,
      ignoreCompatibility: true,
    }),
  });
  assert(addCartRes.status === 200, 'Added 2 units to cart successfully');

  // Resolve customer address
  const addrRes = await request('/users/addresses', { headers: custHeaders });
  const defaultAddress = addrRes.data.data[0];

  // Checkout
  const orderRes = await request('/orders', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      addressId: defaultAddress.id,
      difmType: 'SHOP_INSTALLATION',
      shopId: targetShopId,
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: 'Testing inventory stock synchronization 10 -> 8.',
    }),
  });
  assert(orderRes.status === 201, 'Order created successfully with HTTP 201');
  const createdOrder = orderRes.data.data;
  console.log(`   Order placed: ${createdOrder.orderNumber} (ID: ${createdOrder.id})`);

  // 8. STEP F: Verify Database stock is now exactly 8
  console.log('\n5. Verifying synchronized database stock after order (Expected: 8)...');
  const custProdAfterRes = await request(`/catalog/products/${targetProductId}`);
  const custProdAfter = custProdAfterRes.data.data;
  const shopInvAfter = custProdAfter.inventories.find((i: any) => i.shopId === targetShopId);
  console.log(`   Customer refresh sees: ${shopInvAfter?.quantity} units`);
  assert(shopInvAfter?.quantity === 8, 'Customer sees stock decremented from 10 to exactly 8');

  // 9. STEP G: Verify Admin sees 8 available
  const adminInvAfterRes = await request('/admin/inventory', { headers: adminHeaders });
  const adminInvAfterItem = (adminInvAfterRes.data.data || []).find(
    (i: any) => i.productId === targetProductId && i.shopId === targetShopId
  );
  console.log(`   Admin sees: ${adminInvAfterItem.quantity} units`);
  assert(adminInvAfterItem.quantity === 8, 'Admin portal sees stock decremented to exactly 8');

  // 10. STEP H: Verify Shop sees 8 available
  const shopInvAfterRes = await request('/shops/portal/inventory', { headers: shopHeaders });
  const shopInvAfterItem = (shopInvAfterRes.data.data || []).find(
    (i: any) => i.productId === targetProductId
  );
  console.log(`   Shop sees: ${shopInvAfterItem.quantity} units`);
  assert(shopInvAfterItem.quantity === 8, 'Shop portal sees stock decremented to exactly 8');

  // 11. STEP I: Prevent Over-ordering (Attempt to order 9 units when 8 available)
  console.log('\n6. Testing over-ordering prevention (Attempting to order 9 units when only 8 available)...');
  await request('/cart/clear', { method: 'DELETE', headers: custHeaders });

  const overOrderRes = await request('/cart/items', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      productId: targetProductId,
      shopId: targetShopId,
      quantity: 9,
      ignoreCompatibility: true,
    }),
  });
  assert(overOrderRes.status === 400, 'Attempt to add 9 units was blocked with HTTP 400 Bad Request');
  assert(
    overOrderRes.data?.message?.includes('Maximum available stock is 8'),
    `Error message correctly indicated available stock: "${overOrderRes.data?.message}"`
  );

  // 12. STEP J: Prevent Negative Inventory
  console.log('\n7. Testing negative inventory prevention...');
  const negAdjustRes = await request('/inventory/adjust', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      inventoryId: adminInvAfterItem.id,
      quantity: -5,
      reason: 'Illegal negative test',
    }),
  });
  // Should clamp to 0 or reject, never allow negative quantity
  assert(
    negAdjustRes.status === 200 && negAdjustRes.data.data.quantity >= 0,
    'Negative inventory adjustment safely clamped to 0'
  );

  // Restore stock back to 8 for subsequent tests
  await request('/inventory/adjust', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      inventoryId: adminInvAfterItem.id,
      quantity: 8,
      reason: 'Restore to 8 for concurrency test',
    }),
  });

  // 13. STEP K: Concurrent Checkout Race Condition Test
  console.log('\n8. Testing concurrent checkout requests (2 simultaneous orders of 5 units each, total 10 vs 8 in stock)...');
  // Customer adds 5 units to cart
  await request('/cart/clear', { method: 'DELETE', headers: custHeaders });
  await request('/cart/items', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      productId: targetProductId,
      shopId: targetShopId,
      quantity: 5,
      ignoreCompatibility: true,
    }),
  });

  // Execute two concurrent checkout requests using Promise.all
  const checkoutPayload = {
    addressId: defaultAddress.id,
    difmType: 'NO_INSTALLATION',
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: 'Concurrent race condition test order.',
  };

  const [req1, req2] = await Promise.all([
    request('/orders', { method: 'POST', headers: custHeaders, body: JSON.stringify(checkoutPayload) }),
    request('/orders', { method: 'POST', headers: custHeaders, body: JSON.stringify(checkoutPayload) }),
  ]);

  const statuses = [req1.status, req2.status];
  console.log(`   Concurrent checkout results: Request 1 = HTTP ${req1.status} (${JSON.stringify(req1.data)}), Request 2 = HTTP ${req2.status} (${JSON.stringify(req2.data)})`);

  // Exactly one must succeed (201) and one must fail (400 or cart empty / insufficient stock)
  assert(statuses.includes(201), 'At least one checkout request succeeded (HTTP 201)');
  assert(statuses.includes(400) || statuses.includes(404), 'The conflicting concurrent request was rejected (HTTP 400)');

  // Verify database stock is remaining (8 - 5 = 3), NEVER negative
  const invFinalRes = await request(`/catalog/products/${targetProductId}`);
  const finalShopInv = invFinalRes.data.data.inventories.find((i: any) => i.shopId === targetShopId);
  console.log(`   Database stock after concurrent execution: ${finalShopInv?.quantity} units`);
  assert(finalShopInv?.quantity === 3, 'Remaining database stock is exactly 3 units (never negative)');

  // 14. STEP L: Used Part Verification Updates Inventory
  console.log('\n9. Testing used-part verification inventory intake...');
  // Create a customer used part listing
  const usedPartRes = await request('/usedparts', {
    method: 'POST',
    headers: custHeaders,
    body: JSON.stringify({
      title: 'Bosch Spark Plug Set (Tested Refurbished)',
      vehicleModel: 'Maruti Swift 2022',
      condition: 'EXCELLENT',
      expectedPrice: 450,
      description: 'Used for 3000km, perfect electrodes, fully functional.',
      location: 'Bengaluru',
    }),
  });
  assert(usedPartRes.status === 201, 'Used part listing created successfully');
  const usedPart = usedPartRes.data.data;

  // Initial stock before verification
  const stockBeforeIntake = finalShopInv.quantity;

  // Admin verifies used part
  const verifyRes = await request(`/admin/used-parts/${usedPart.id}/verify`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      status: 'VERIFIED',
      notes: 'Tested on spark bench tester. Verified excellent impedance and condition.',
    }),
  });
  console.log(`   Admin verify response status: ${verifyRes.status}, data: ${JSON.stringify(verifyRes.data)}`);
  assert(verifyRes.status === 200, 'Used part verified by admin');

  // Verify inventory incremented by +1
  const invAfterUsedPart = await request(`/catalog/products/${targetProductId}`);
  const shopInvAfterIntake = invAfterUsedPart.data.data.inventories.find((i: any) => i.shopId === targetShopId);
  console.log(`   Stock after used part verification intake: ${stockBeforeIntake} -> ${shopInvAfterIntake?.quantity}`);
  assert(
    shopInvAfterIntake?.quantity === stockBeforeIntake + 1,
    `Used part verification incremented stock by +1 (${stockBeforeIntake} -> ${shopInvAfterIntake?.quantity})`
  );

  // 15. STEP M: Inventory Event Stream Audit Trail
  console.log('\n10. Inspecting internal EDI & inventory event audit trail...');
  const eventsRes = await request('/inventory/events?limit=10');
  assert(eventsRes.status === 200, 'Fetched inventory events audit log successfully');
  const events = eventsRes.data.data || [];
  console.log(`    Total recent inventory events recorded: ${events.length}`);
  assert(events.length > 0, 'Event log contains recorded events');

  const eventTypes = events.map((e: any) => e.eventType);
  console.log(`    Recorded event types: ${Array.from(new Set(eventTypes)).join(', ')}`);
  assert(eventTypes.includes('SUPPLIER_EDI_846_SYNC'), 'Contains SUPPLIER_EDI_846_SYNC event');
  assert(eventTypes.includes('ORDER_STOCK_RESERVED'), 'Contains ORDER_STOCK_RESERVED event');
  assert(eventTypes.includes('USED_PART_VERIFIED_INTAKE'), 'Contains USED_PART_VERIFIED_INTAKE event');

  console.log('\n===================================================================');
  console.log('🎉 ALL INVENTORY SYNCHRONIZATION TESTS PASSED SUCCESSFULLY (100%)!');
  console.log('===================================================================\n');
}

runInventorySyncSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err.message);
  process.exit(1);
});
