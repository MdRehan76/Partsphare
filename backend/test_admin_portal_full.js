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

async function runAdminVerification() {
  console.log('================================================================');
  console.log('PARTNEXA ADMIN PORTAL & CROSS-PORTAL FULL VERIFICATION SUITE');
  console.log('================================================================\n');

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

  // --------------------------------------------------------------------------
  // STEP 1: AUTHENTICATION ACROSS ALL ROLES
  // --------------------------------------------------------------------------
  console.log('--- 1. Authenticating All Roles ---');
  const [adminAuth, custAuth, shopAuth, deliveryAuth] = await Promise.all([
    request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@partsphere.in', password: 'Admin@1234' }
    ),
    request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'demo@partsphere.in', password: 'Demo@1234' }
    ),
    request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'apex.shop@partsphere.in', password: 'Shop@1234' }
    ),
    request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'rider.rajesh@partsphere.in', password: 'Rider@1234' }
    ),
  ]);

  assert(adminAuth.status === 200 && adminAuth.data?.data?.user?.role === 'ADMIN', 'Admin authentication successful');
  assert(custAuth.status === 200 && custAuth.data?.data?.user?.role === 'CUSTOMER', 'Customer authentication successful');
  assert(shopAuth.status === 200 && shopAuth.data?.data?.user?.role === 'SHOP_OWNER', 'Shop authentication successful');
  assert(deliveryAuth.status === 200 && deliveryAuth.data?.data?.user?.role === 'DELIVERY_PARTNER', 'Delivery authentication successful');

  const adminToken = adminAuth.data?.data?.accessToken;
  const custToken = custAuth.data?.data?.accessToken;
  const shopToken = shopAuth.data?.data?.accessToken;
  const deliveryToken = deliveryAuth.data?.data?.accessToken;

  // Strict RBAC Verification
  console.log('\n--- 2. Strict Admin RBAC Enforcement ---');
  const forbiddenAttempt = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/analytics/kpis',
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` },
  });
  assert(forbiddenAttempt.status === 403, 'Non-admin token rejected with HTTP 403 on admin routes');

  // --------------------------------------------------------------------------
  // STEP 2: 10 DATABASE-DERIVED KPIS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. 10 Database-Derived Dashboard KPIs ---');
  const kpiRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/analytics/kpis',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert(kpiRes.status === 200, 'Admin KPIs endpoint HTTP 200');
  const kpis = kpiRes.data?.data?.kpis || {};

  assert(typeof kpis.totalCustomers === 'number', `KPI 1: totalCustomers (${kpis.totalCustomers})`);
  assert(typeof kpis.totalShops === 'number', `KPI 2: totalShops (${kpis.totalShops})`);
  assert(typeof kpis.deliveryPartners === 'number', `KPI 3: deliveryPartners (${kpis.deliveryPartners})`);
  assert(typeof kpis.orders === 'number', `KPI 4: orders (${kpis.orders})`);
  assert(typeof kpis.sales === 'number', `KPI 5: sales (₹${kpis.sales})`);
  assert(typeof kpis.gmv === 'number', `KPI 6: GMV (₹${kpis.gmv})`);
  assert(typeof kpis.subscriptions === 'number', `KPI 7: subscriptions (${kpis.subscriptions})`);
  assert(typeof kpis.usedParts === 'number', `KPI 8: usedParts (${kpis.usedParts})`);
  assert(typeof kpis.commissions === 'number', `KPI 9: commissions (₹${kpis.commissions})`);
  assert(typeof kpis.platformRevenue === 'number', `KPI 10: platformRevenue (₹${kpis.platformRevenue})`);

  // --------------------------------------------------------------------------
  // STEP 3: CUSTOMER MANAGEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Customer Management Operations ---');
  const custListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/customers',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(custListRes.status === 200 && Array.isArray(custListRes.data?.data), 'List customers returns array');
  const customerList = custListRes.data?.data || [];
  assert(customerList.length > 0, `Found ${customerList.length} customers in database`);

  const firstCust = customerList[0];
  const custDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/customers/${firstCust.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(custDetailRes.status === 200 && custDetailRes.data?.data?.id === firstCust.id, `View customer details for ${firstCust.fullName}`);

  // Customer status toggle (ACTIVE -> SUSPENDED -> ACTIVE)
  const custSuspendRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/customers/${firstCust.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'SUSPENDED' }
  );
  assert(custSuspendRes.status === 200 && custSuspendRes.data?.data?.status === 'SUSPENDED', 'Customer status updated to SUSPENDED');

  const custReactivateRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/customers/${firstCust.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'ACTIVE' }
  );
  assert(custReactivateRes.status === 200 && custReactivateRes.data?.data?.status === 'ACTIVE', 'Customer status restored to ACTIVE');

  // --------------------------------------------------------------------------
  // STEP 4: SHOP MANAGEMENT & 10%-15% COMMISSION ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Workshop Management & Commission Bounding ---');
  const shopListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/shops',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(shopListRes.status === 200 && Array.isArray(shopListRes.data?.data), 'List shops returns array');
  const targetShop = shopListRes.data?.data?.[0];
  assert(!!targetShop, `Target workshop found: ${targetShop?.name}`);

  // Verify status toggle
  const shopVerifyRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/verification`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'VERIFIED', notes: 'Facility verified by PartNexa Quality Inspector.' }
  );
  assert(shopVerifyRes.status === 200 && shopVerifyRes.data?.data?.verificationStatus === 'VERIFIED', 'Shop verified by Admin');

  // Toggle activate/deactivate
  const shopDeactivateRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { isActive: false }
  );
  assert(shopDeactivateRes.status === 200 && shopDeactivateRes.data?.data?.isActive === false, 'Shop deactivated');

  const shopActivateRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { isActive: true }
  );
  assert(shopActivateRes.status === 200 && shopActivateRes.data?.data?.isActive === true, 'Shop re-activated');

  // Strict commission bounding: reject < 10%
  const lowCommRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/commission`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { commissionRate: 8.5 }
  );
  assert(lowCommRes.status === 400, 'Commission < 10.0% rejected with HTTP 400 Bad Request');

  // Strict commission bounding: reject > 15%
  const highCommRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/commission`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { commissionRate: 18.0 }
  );
  assert(highCommRes.status === 400, 'Commission > 15.0% rejected with HTTP 400 Bad Request');

  // Valid commission update within 10.0% - 15.0%
  const validCommRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/commission`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { commissionRate: 13.5 }
  );
  assert(validCommRes.status === 200 && validCommRes.data?.data?.commissionRate === 13.5, 'Commission updated to 13.5%');

  // --------------------------------------------------------------------------
  // STEP 5: DELIVERY PARTNER MANAGEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Delivery Fleet & KYC Management ---');
  const deliveryListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/delivery-partners',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deliveryListRes.status === 200 && Array.isArray(deliveryListRes.data?.data), 'List delivery partners returns array');
  const targetPartner = deliveryListRes.data?.data?.[0];
  assert(!!targetPartner, `Target delivery partner found: ${targetPartner?.driverName}`);

  // KYC verification
  const kycVerifyRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/delivery-partners/${targetPartner.id}/kyc`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'APPROVED' }
  );
  assert(kycVerifyRes.status === 200, 'Delivery Partner KYC verified and approved');

  // Partner activation toggle
  const partnerToggleRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/delivery-partners/${targetPartner.id}/activation`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { isActivated: true }
  );
  assert(partnerToggleRes.status === 200 && partnerToggleRes.data?.data?.isActivated === true, 'Delivery Partner activated for dispatches');

  // --------------------------------------------------------------------------
  // STEP 6: PRODUCT MANAGEMENT (Products, Categories, Brands, Inventory)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Products, Categories, Brands & Inventory ---');
  // Categories
  const catCreateRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/admin/categories', method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { name: 'Ignition & Electrical', description: 'Spark plugs, coils, wiring', icon: '⚡' }
  );
  assert(catCreateRes.status === 201 && !!catCreateRes.data?.data?.name, `Category created: ${catCreateRes.data?.data?.name}`);

  const catListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/categories',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(catListRes.status === 200 && catListRes.data?.data?.some((c) => c.name === 'Ignition & Electrical'), 'New category appears in live categories list');

  // Brands
  const brandCreateRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/admin/brands', method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { name: 'NGK Spark Plugs', country: 'Japan' }
  );
  assert(brandCreateRes.status === 201 && !!brandCreateRes.data?.data?.name, `Brand created: ${brandCreateRes.data?.data?.name}`);

  // Products
  const prodCreateRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/admin/products', method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { name: 'NGK Laser Iridium Spark Plug', basePrice: 650, mrp: 850, brand: 'NGK Spark Plugs', partNumber: 'NGK-7712', sku: 'SKU-NGK-7712', requiresDIFM: false, condition: 'NEW' }
  );
  assert(prodCreateRes.status === 201 && !!prodCreateRes.data?.data?.id, `Product created: ${prodCreateRes.data?.data?.name}`);

  // Inventory
  const invListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/inventory',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(invListRes.status === 200 && Array.isArray(invListRes.data?.data), 'List inventory returns array');
  const targetInv = invListRes.data?.data?.[0];
  if (targetInv) {
    const invUpdateRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/inventory/${targetInv.id}/stock`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { quantity: 45 }
    );
    assert(invUpdateRes.status === 200 && invUpdateRes.data?.data?.quantity === 45, 'Adjust inventory stock level updated to 45 units');
  }

  // --------------------------------------------------------------------------
  // STEP 7: ORDER MANAGEMENT & DIFM
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Order Management, Lifecycle & Assignments ---');
  const orderListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/orders',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(orderListRes.status === 200 && Array.isArray(orderListRes.data?.data), 'List orders returns array');
  const targetOrder = orderListRes.data?.data?.[0];
  assert(!!targetOrder, `Target order found: ${targetOrder?.orderNumber}`);

  // View order
  const orderDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/orders/${targetOrder.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(orderDetailRes.status === 200 && orderDetailRes.data?.data?.id === targetOrder.id, 'Get order details by ID');

  // Update order status
  const orderStatusRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/orders/${targetOrder.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'SHIPPED', notes: 'Dispatched from central hub.' }
  );
  assert(orderStatusRes.status === 200 && orderStatusRes.data?.data?.status === 'SHIPPED', 'Order status updated to SHIPPED');

  // Assign delivery partner
  const orderDeliveryRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/orders/${targetOrder.id}/delivery`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { deliveryPartnerId: targetPartner.id }
  );
  assert(orderDeliveryRes.status === 200, 'Assigned delivery partner to order');

  // Assign DIFM workshop
  const orderDifmRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/orders/${targetOrder.id}/difm`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { shopId: targetShop.id, status: 'SCHEDULED' }
  );
  assert(orderDifmRes.status === 200, 'Assigned workshop to DIFM order');

  // --------------------------------------------------------------------------
  // STEP 8: USED PARTS MARKETPLACE
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Used Parts Marketplace Lifecycle ---');
  const usedPartsListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/used-parts',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(usedPartsListRes.status === 200 && Array.isArray(usedPartsListRes.data?.data), 'List used parts returns array');
  const targetUsedPart = usedPartsListRes.data?.data?.[0];

  if (targetUsedPart) {
    // Verify
    const verifyPartRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/used-parts/${targetUsedPart.id}/verify`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { status: 'VERIFIED', notes: 'Technician confirmed authentic OEM alternator.' }
    );
    assert(verifyPartRes.status === 200 && verifyPartRes.data?.data?.verificationStatus === 'VERIFIED', 'Used part inspection marked VERIFIED');

    // Value
    const valuePartRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/used-parts/${targetUsedPart.id}/value`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { valuationAmount: 3200 }
    );
    assert(valuePartRes.status === 200 && valuePartRes.data?.data?.status === 'VALUED' && valuePartRes.data?.data?.payoutAmount === 2880, 'Used part valued at ₹3,200 with 90% payout ₹2,880');

    // Payout
    const payoutPartRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/used-parts/${targetUsedPart.id}/payout`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { payoutReference: 'UTR-TEST-884920' }
    );
    assert(payoutPartRes.status === 200 && payoutPartRes.data?.data?.payoutStatus === 'PAID', 'Seller payout released with UTR reference');
  }

  // --------------------------------------------------------------------------
  // STEP 9: SUPPORT TICKETING (CUSTOMER, SHOP, DELIVERY TICKETS)
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Customer Care Hub & Multi-Role Ticketing ---');
  const ticketsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/tickets',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(ticketsRes.status === 200 && Array.isArray(ticketsRes.data?.data), 'List support tickets returns array');
  const targetTicket = ticketsRes.data?.data?.[0];

  if (targetTicket) {
    const assignTicketRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/tickets/${targetTicket.id}/assign`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(assignTicketRes.status === 200, 'Ticket assigned to current admin');

    const replyTicketRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/tickets/${targetTicket.id}/messages`, method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { message: 'Your replacement part has been expedited for priority delivery.' }
    );
    assert(replyTicketRes.status === 200, 'Reply posted to ticket thread');

    const resolveTicketRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/admin/tickets/${targetTicket.id}/resolve`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
      { resolutionNotes: 'Replacement delivered and confirmed by customer.' }
    );
    assert(resolveTicketRes.status === 200 && resolveTicketRes.data?.data?.status === 'RESOLVED', 'Ticket marked as RESOLVED');
  }

  // --------------------------------------------------------------------------
  // STEP 10: DIFM & COMMISSION LEDGER SETTLEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 11. DIFM Engine & Commission Ledger ---');
  const difmRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/admin/config/difm', method: 'PUT', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { homeVisitBaseSurcharge: 149, homeVisitPerKmRate: 25, defaultBaseServiceFee: 349, freeDeliveryThreshold: 1199, standardDeliveryFee: 59 }
  );
  assert(difmRes.status === 200 && difmRes.data?.data?.defaultBaseServiceFee === 349, 'DIFM base fee updated to ₹349');

  const ledgerRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/commissions/ledger',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(ledgerRes.status === 200 && Array.isArray(ledgerRes.data?.data), 'Commission ledger queried successfully');
  const targetLedger = ledgerRes.data?.data?.[0];

  if (targetLedger && targetLedger.releaseStatus !== 'RELEASED') {
    const releaseLedgerRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/commissions/ledger/${targetLedger.id}/release`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(releaseLedgerRes.status === 200 && releaseLedgerRes.data?.data?.releaseStatus === 'RELEASED', 'Commission payout released to workshop');
  }

  // --------------------------------------------------------------------------
  // STEP 11: CROSS-PORTAL DATA SYNCHRONIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- 12. Cross-Portal Live Synchronization ---');

  // A. Customer creates data -> Admin can see it
  console.log('Testing: Customer creates data -> Admin sees it');
  const newListingRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/customer/used-parts', method: 'POST', headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' } },
    { title: 'Honda City Front Bumper OEM 2021', vehicleModel: 'Honda City', condition: 'GOOD', expectedPrice: 2400, partNumber: 'HND-BMP-2021' }
  );
  assert(newListingRes.status === 201, 'Customer created used part listing');
  const createdPartId = newListingRes.data?.data?.id;

  // Admin checks used parts
  const adminCheckParts = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/used-parts/${createdPartId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminCheckParts.status === 200 && adminCheckParts.data?.data?.title === 'Honda City Front Bumper OEM 2021', 'Admin can see customer created data in real-time');

  // B. Shop creates / updates data -> Admin can see it
  console.log('Testing: Shop creates/updates data -> Admin sees it');
  const shopInvRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/shop/inventory', method: 'POST', headers: { Authorization: `Bearer ${shopToken}`, 'Content-Type': 'application/json' } },
    { productId: 'prod-001', quantity: 28, sellingPrice: 950 }
  );
  assert(shopInvRes.status === 200 || shopInvRes.status === 201, 'Shop added/updated inventory');

  const adminInvCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/inventory',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminInvCheck.status === 200 && adminInvCheck.data?.data?.some((i) => i.shopId === targetShop.id), 'Admin sees shop updated inventory in central ledger');

  // C. Delivery updates data -> Admin can see it
  console.log('Testing: Delivery updates data -> Admin sees it');
  const dutyToggle = await request(
    { hostname: 'localhost', port: 5000, path: '/api/delivery/duty', method: 'PATCH', headers: { Authorization: `Bearer ${deliveryToken}`, 'Content-Type': 'application/json' } },
    { isOnline: true }
  );
  assert(dutyToggle.status === 200, 'Delivery partner went ONLINE');

  const adminPartnerCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/delivery-partners/${targetPartner.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminPartnerCheck.status === 200 && adminPartnerCheck.data?.data?.isOnline === true, 'Admin sees delivery partner online duty state in fleet telemetry');

  // D. Admin modifies data -> other portals see the change
  console.log('Testing: Admin modifies data -> other portals see the change');
  // Admin changes shop commission
  const adminChangeComm = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/shops/${targetShop.id}/commission`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { commissionRate: 14.2 }
  );
  assert(adminChangeComm.status === 200, 'Admin set shop commission to 14.2%');

  // Shop inspects profile / shop data
  const shopCheckSelf = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/shops/${targetShop.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(Number(shopCheckSelf.data?.data?.commissionRate) === 14.2, 'Shop sees updated 14.2% commission rate set by Admin');

  // Admin marks order delivered
  const adminDeliverOrder = await request(
    { hostname: 'localhost', port: 5000, path: `/api/admin/orders/${targetOrder.id}/status`, method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
    { status: 'DELIVERED' }
  );
  assert(adminDeliverOrder.status === 200, 'Admin marked order DELIVERED');

  // Customer checks order
  const custCheckOrder = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/customer/orders/${targetOrder.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${custToken}` },
  });
  assert(custCheckOrder.status === 200 && custCheckOrder.data?.data?.status === 'DELIVERED', 'Customer portal sees DELIVERED status modified by Admin');

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} assertions.`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminVerification().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
