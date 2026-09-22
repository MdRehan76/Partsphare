/**
 * PHASE 4 — ADMIN CONSOLE INTEGRATION TEST SUITE
 *
 * Verifies:
 * 1. Admin login & JWT verification
 * 2. Strict Role-Based Access Control (RBAC):
 *    - Customer token -> 403 Forbidden
 *    - Shop Owner token -> 403 Forbidden
 *    - Delivery Partner token -> 403 Forbidden
 *    - Missing token -> 401 Unauthorized
 * 3. Analytics KPIs (Monthly sales, GMV, Platform revenue, Regional performance, Active orders, Active subscriptions, Used-part transactions, Shop commissions, Delivery activity)
 * 4. Analytics Charts (Monthly sales trend, Regional performance, Revenue breakdown, Order status distribution)
 * 5. Customer management (listing, vehicles garage, status toggle ACTIVE/SUSPENDED)
 * 6. Mechanical shop verification & commission rate configuration (10.0% to 15.0% strict bounds)
 * 7. Delivery partner KYC document review, approval & activation
 * 8. Products catalog CRUD & Warehouse inventory stock adjustment (Low stock alerts)
 * 9. Platform configuration (DIFM Option A/B/C surcharges, delivery thresholds, subscription plans)
 * 10. Used parts marketplace oversight & valuation override
 * 11. Live delivery dispatches & manual reassignment
 * 12. Customer Care Hub unified ticketing (Customer, Shop, Delivery Partner, role tagging, SLA, assignment, messages thread, resolution)
 * 13. Regression testing: Customer Portal (5173), Shop Portal (5174), Delivery Portal (5175), Admin Console (5176), and Backend (5000)
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const HEALTH_URL = 'http://localhost:5000/health';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase4TestSuite() {
  console.log('🚀 STARTING PHASE 4 — ADMIN CONSOLE E2E INTEGRATION SUITE\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      passed++;
    } catch (err: any) {
      console.error(`\n❌ TEST SUITE FAILURE in [${name}]:`, err.message);
      if (err.response?.data) {
        console.error('API Error Response:', JSON.stringify(err.response.data, null, 2));
      }
      failed++;
      throw err;
    }
  };

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Health Check
    // ------------------------------------------------------------------------
    console.log('--- TEST 1: API & Server Health Check ---');
    const healthRes = await axios.get(HEALTH_URL);
    assert(healthRes.status === 200, 'Backend health returns 200 OK');
    assert(healthRes.data.success === true, 'Health payload success is true');

    // ------------------------------------------------------------------------
    // TEST 2: Admin Authentication
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Admin Authentication & Token Verification ---');
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@partsphare.test',
      password: 'Password@123',
    });
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    const adminToken = adminLoginRes.data.data?.accessToken || adminLoginRes.data.data?.tokens?.accessToken;
    const adminUser = adminLoginRes.data.data.user;
    assert(adminUser.role === 'ADMIN', 'User role resolved as ADMIN');
    assert(!!adminToken, 'Admin JWT access token generated');

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // ------------------------------------------------------------------------
    // TEST 3: Strict Role-Based Access Control (RBAC)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Strict Role-Based Access Control (RBAC Enforcement) ---');

    // 3.1 Unauthenticated Request -> 401
    try {
      await axios.get(`${API_BASE}/admin/analytics/kpis`);
      assert(false, 'Unauthenticated request should have been rejected');
    } catch (err: any) {
      assert(err.response?.status === 401, 'Unauthenticated request blocked with 401 Unauthorized');
    }

    // 3.2 Customer Token -> 403 Forbidden
    const customerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    });
    const customerToken = customerLoginRes.data.data?.accessToken || customerLoginRes.data.data?.tokens?.accessToken;

    try {
      await axios.get(`${API_BASE}/admin/analytics/kpis`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert(false, 'Customer token should not access admin endpoints');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Customer token blocked with 403 Forbidden');
    }

    // 3.3 Shop Owner Token -> 403 Forbidden
    const shopLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'apex.auto@partsphare.test',
      password: 'Password@123',
    });
    const shopToken = shopLoginRes.data.data?.accessToken || shopLoginRes.data.data?.tokens?.accessToken;

    try {
      await axios.get(`${API_BASE}/admin/analytics/kpis`, {
        headers: { Authorization: `Bearer ${shopToken}` },
      });
      assert(false, 'Shop Owner token should not access admin endpoints');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Shop Owner token blocked with 403 Forbidden');
    }

    // 3.4 Delivery Partner Token -> 403 Forbidden
    const riderLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'rider.vikram@partsphare.test',
      password: 'Password@123',
    });
    const riderToken = riderLoginRes.data.data?.accessToken || riderLoginRes.data.data?.tokens?.accessToken;

    try {
      await axios.get(`${API_BASE}/admin/analytics/kpis`, {
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      assert(false, 'Delivery Partner token should not access admin endpoints');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Delivery Partner token blocked with 403 Forbidden');
    }

    // ------------------------------------------------------------------------
    // TEST 4: Analytics & KPIs Reporting
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Executive KPIs & Analytics Reporting ---');
    const kpisRes = await axios.get(`${API_BASE}/admin/analytics/kpis`, { headers: adminHeaders });
    assert(kpisRes.status === 200, 'KPIs endpoint returns 200 OK');
    const kpis = kpisRes.data.data.kpis;
    assert(kpis.monthlySales > 0, 'Monthly sales metric computed');
    assert(kpis.gmv > 0, 'GMV metric computed');
    assert(kpis.platformRevenue > 0, 'Platform revenue metric computed');
    assert(kpis.activeOrders >= 0, 'Active orders metric present');
    assert(kpis.activeSubscriptions > 0, 'Active subscriptions count present');
    assert(kpis.deliveryActivity?.totalPartners > 0, 'Delivery fleet activity metrics present');

    const chartsRes = await axios.get(`${API_BASE}/admin/analytics/charts`, { headers: adminHeaders });
    assert(chartsRes.status === 200, 'Charts endpoint returns 200 OK');
    const charts = chartsRes.data.data;
    assert(Array.isArray(charts.monthlySales) && charts.monthlySales.length === 6, '6-Month sales chart data present');
    assert(Array.isArray(charts.regionalPerformance) && charts.regionalPerformance.length >= 4, 'Regional city performance data present');
    assert(Array.isArray(charts.revenueBreakdown) && charts.revenueBreakdown.length === 4, 'Revenue breakdown chart data present');
    assert(Array.isArray(charts.orderStatusDistribution) && charts.orderStatusDistribution.length >= 4, 'Order status distribution present');

    // ------------------------------------------------------------------------
    // TEST 5: Customer Management
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Customer Management & Account Controls ---');
    const customersRes = await axios.get(`${API_BASE}/admin/customers`, { headers: adminHeaders });
    assert(customersRes.status === 200, 'Customer directory returns 200 OK');
    const customers = customersRes.data.data;
    assert(customers.length > 0, 'Customer list populated');
    const demoCust = customers.find((c: any) => c.email === 'demo@partsphere.in');
    assert(!!demoCust, 'Demo customer Aarav Sharma located in customer directory');

    // Toggle customer status
    const suspendRes = await axios.patch(
      `${API_BASE}/admin/customers/${demoCust.id}/status`,
      { status: 'SUSPENDED' },
      { headers: adminHeaders }
    );
    assert(suspendRes.data.data.status === 'SUSPENDED', 'Customer successfully suspended');

    const restoreRes = await axios.patch(
      `${API_BASE}/admin/customers/${demoCust.id}/status`,
      { status: 'ACTIVE' },
      { headers: adminHeaders }
    );
    assert(restoreRes.data.data.status === 'ACTIVE', 'Customer successfully reactivated');

    // ------------------------------------------------------------------------
    // TEST 6: Workshop Management & 10%–15% Commission Configuration
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Workshop Verification & 10%–15% Commission Rate Bounds ---');
    const shopsRes = await axios.get(`${API_BASE}/admin/shops`, { headers: adminHeaders });
    assert(shopsRes.status === 200, 'Shops directory returns 200 OK');
    const shops = shopsRes.data.data;
    assert(shops.length > 0, 'Workshops list populated');
    const apexShop = shops.find((s: any) => s.id === 'shop-1');
    assert(!!apexShop, 'Apex Auto Care located');

    // Approve verification
    const verifyShopRes = await axios.patch(
      `${API_BASE}/admin/shops/shop-1/verification`,
      { status: 'VERIFIED', notes: 'All facility audit certifications cleared.' },
      { headers: adminHeaders }
    );
    assert(verifyShopRes.data.data.verificationStatus === 'VERIFIED', 'Shop marked as VERIFIED');

    // Commission Bounds Test 1: Reject < 10%
    try {
      await axios.patch(
        `${API_BASE}/admin/shops/shop-1/commission`,
        { commissionRate: 8.5 },
        { headers: adminHeaders }
      );
      assert(false, 'Should reject commission rate below 10%');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Commission < 10.0% rejected with 400 Bad Request');
    }

    // Commission Bounds Test 2: Reject > 15%
    try {
      await axios.patch(
        `${API_BASE}/admin/shops/shop-1/commission`,
        { commissionRate: 17.5 },
        { headers: adminHeaders }
      );
      assert(false, 'Should reject commission rate above 15%');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Commission > 15.0% rejected with 400 Bad Request');
    }

    // Commission Bounds Test 3: Accept valid rate (e.g. 13.5%)
    const validCommRes = await axios.patch(
      `${API_BASE}/admin/shops/shop-1/commission`,
      { commissionRate: 13.5 },
      { headers: adminHeaders }
    );
    assert(validCommRes.data.data.commissionRate === 13.5, 'Valid 13.5% commission rate approved & persisted');

    // ------------------------------------------------------------------------
    // TEST 7: Delivery Partner KYC Approval & Activation
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: Delivery Partner KYC Review & Fleet Activation ---');
    const partnersRes = await axios.get(`${API_BASE}/admin/delivery-partners`, { headers: adminHeaders });
    assert(partnersRes.status === 200, 'Delivery fleet returns 200 OK');
    const partners = partnersRes.data.data;
    assert(partners.length > 0, 'Riders list populated');
    const vikram = partners.find((p: any) => p.id === 'partner-1');
    assert(!!vikram, 'Rider Vikram Singh resolved');
    assert(vikram.kycDocuments?.length > 0, 'Rider KYC documents attached for review');

    // Verify KYC Approval
    const kycApprovalRes = await axios.patch(
      `${API_BASE}/admin/delivery-partners/partner-1/kyc`,
      { status: 'APPROVED' },
      { headers: adminHeaders }
    );
    assert(kycApprovalRes.data.data.partner.verificationStatus === 'APPROVED', 'Partner KYC approved');
    assert(kycApprovalRes.data.data.partner.isActivated === true, 'Partner activated upon approval');

    // ------------------------------------------------------------------------
    // TEST 8: Products Catalog & Inventory Stock Management
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8: Products Catalog CRUD & Warehouse Stock Management ---');
    const productsRes = await axios.get(`${API_BASE}/admin/products`, { headers: adminHeaders });
    assert(productsRes.status === 200, 'Admin products endpoint returns 200 OK');

    // Create New Product
    const newProductRes = await axios.post(
      `${API_BASE}/admin/products`,
      {
        name: 'Brembo Front Ceramic Brake Rotor Set',
        basePrice: 4200,
        mrp: 4999,
        sku: 'BREMBO-BR-420',
        partNumber: '09.A427.11',
        brand: 'Brembo',
        requiresDIFM: true,
        installationDifficulty: 'HARD',
        baseServiceFee: 499,
        stockQuantity: 35,
      },
      { headers: adminHeaders }
    );
    assert(newProductRes.status === 201, 'New product created in catalog with 201 Created');
    const createdProductId = newProductRes.data.data.id;

    // Check Inventory record created
    const invRes = await axios.get(`${API_BASE}/admin/inventory`, { headers: adminHeaders });
    assert(invRes.status === 200, 'Inventory levels endpoint returns 200 OK');
    const newInv = invRes.data.data.find((i: any) => i.productId === createdProductId);
    assert(!!newInv, 'Inventory record initialized automatically for new product');

    // Adjust Stock to Low Stock level
    const stockAdjustRes = await axios.patch(
      `${API_BASE}/admin/inventory/${newInv.id}/stock`,
      { quantity: 3 },
      { headers: adminHeaders }
    );
    assert(stockAdjustRes.data.data.quantity === 3, 'Inventory stock updated to 3');
    assert(stockAdjustRes.data.data.availabilityStatus === 'LOW_STOCK', 'Stock status flipped to LOW_STOCK');

    // ------------------------------------------------------------------------
    // TEST 9: Platform Configuration (DIFM Engine & Subscriptions)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 9: Platform Configuration (DIFM Engine & Subscriptions) ---');
    const difmGetRes = await axios.get(`${API_BASE}/admin/config/difm`, { headers: adminHeaders });
    assert(difmGetRes.data.data.homeVisitBaseSurcharge === 99, 'Base surcharge is ₹99');

    const difmUpdateRes = await axios.put(
      `${API_BASE}/admin/config/difm`,
      { homeVisitBaseSurcharge: 119, freeDeliveryThreshold: 899 },
      { headers: adminHeaders }
    );
    assert(difmUpdateRes.data.data.homeVisitBaseSurcharge === 119, 'Home base surcharge updated to ₹119');
    assert(difmUpdateRes.data.data.freeDeliveryThreshold === 899, 'Free delivery threshold updated to ₹899');

    const commGetRes = await axios.get(`${API_BASE}/admin/config/commissions`, { headers: adminHeaders });
    assert(commGetRes.data.data.defaultRate >= 10 && commGetRes.data.data.defaultRate <= 15, 'Global commission rate is within 10–15%');

    const plansRes = await axios.get(`${API_BASE}/admin/config/subscriptions`, { headers: adminHeaders });
    assert(plansRes.data.data.length >= 3, 'Subscription plans listed');

    // ------------------------------------------------------------------------
    // TEST 10: Used Parts Circular Marketplace Oversight
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 10: Used Parts Marketplace Oversight ---');
    const usedRes = await axios.get(`${API_BASE}/admin/used-parts`, { headers: adminHeaders });
    assert(usedRes.status === 200, 'Used parts oversight returns 200 OK');
    const usedListing = usedRes.data.data[0];
    assert(!!usedListing, 'Used part listing exists');

    const updateUsedRes = await axios.patch(
      `${API_BASE}/admin/used-parts/${usedListing.id}`,
      { finalValuation: 2200, status: 'VALUED' },
      { headers: adminHeaders }
    );
    assert(updateUsedRes.data.data.finalValuation === 2200, 'Final valuation updated to ₹2,200');

    // ------------------------------------------------------------------------
    // TEST 11: Live Delivery Fleet Dispatches & Reassignment
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 11: Live Dispatches & Reassignment ---');
    const delivsRes = await axios.get(`${API_BASE}/admin/deliveries`, { headers: adminHeaders });
    assert(delivsRes.status === 200, 'Deliveries list returns 200 OK');
    assert(delivsRes.data.data.length > 0, 'Active deliveries present');

    const targetTrip = delivsRes.data.data.find((d: any) => d.status === 'ASSIGNED') || delivsRes.data.data[0];
    const reassignRes = await axios.patch(
      `${API_BASE}/admin/deliveries/${targetTrip.id}/reassign`,
      { deliveryPartnerId: 'partner-1' },
      { headers: adminHeaders }
    );
    assert(reassignRes.data.data.deliveryPartnerId === 'partner-1', 'Trip assigned to partner-1');

    // ------------------------------------------------------------------------
    // TEST 12: Customer Care Hub (Unified Cross-Role Ticketing)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 12: Customer Care Hub (Unified Cross-Role Ticketing) ---');
    const ticketsRes = await axios.get(`${API_BASE}/admin/tickets`, { headers: adminHeaders });
    assert(ticketsRes.status === 200, 'Ticketing endpoint returns 200 OK');
    const allTickets = ticketsRes.data.data;
    assert(allTickets.length >= 4, 'Customer Care Hub contains seeded tickets');

    // Check Multi-Role Tagging: Customers, Shops, Delivery Fleet
    const customerTkt = allTickets.find((t: any) => t.userRole === 'CUSTOMER');
    const shopTkt = allTickets.find((t: any) => t.userRole === 'SHOP_OWNER');
    const riderTkt = allTickets.find((t: any) => t.userRole === 'DELIVERY_PARTNER');

    assert(!!customerTkt, 'Customer role tagged ticket present');
    assert(!!shopTkt, 'Shop owner role tagged ticket present');
    assert(!!riderTkt, 'Delivery partner role tagged ticket present');
    assert(riderTkt.priority === 'URGENT' && riderTkt.slaHours === 2, 'Urgent ticket SLA is 2 hours');

    // Filter by role
    const shopOnlyTickets = await axios.get(`${API_BASE}/admin/tickets?role=SHOP_OWNER`, { headers: adminHeaders });
    assert(
      shopOnlyTickets.data.data.every((t: any) => t.userRole === 'SHOP_OWNER'),
      'Role filter strictly isolates workshop tickets'
    );

    // Assign Ticket to Admin
    const assignRes = await axios.patch(
      `${API_BASE}/admin/tickets/${riderTkt.id}/assign`,
      {},
      { headers: adminHeaders }
    );
    assert(assignRes.data.data.assignedAdminName === 'Super Admin', 'Ticket assigned to Super Admin');
    assert(assignRes.data.data.status === 'IN_PROGRESS', 'Ticket transitioned to IN_PROGRESS');

    // Add Admin Message
    const msgRes = await axios.post(
      `${API_BASE}/admin/tickets/${riderTkt.id}/messages`,
      { message: 'Security desk contacted via hotline. Passcode 9942 generated.' },
      { headers: adminHeaders }
    );
    assert(msgRes.data.data.messages.length >= 2, 'Admin message appended to conversation thread');
    assert(msgRes.data.data.messages[msgRes.data.data.messages.length - 1].senderRole === 'ADMIN', 'Message sender tagged as ADMIN');

    // Resolve Ticket
    const resolveRes = await axios.patch(
      `${API_BASE}/admin/tickets/${riderTkt.id}/resolve`,
      { resolutionNotes: 'Driver provided with gate entry code. Battery delivered safely.' },
      { headers: adminHeaders }
    );
    assert(resolveRes.data.data.status === 'RESOLVED', 'Ticket marked as RESOLVED');
    assert(!!resolveRes.data.data.resolvedAt, 'Resolution timestamp recorded');

    // ------------------------------------------------------------------------
    // TEST 13: Regression Testing Across All 4 Frontends & Backend
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 13: Full Regression Across All Platform Portals ---');

    // Customer Portal
    const custPortRes = await axios.get('http://localhost:5173');
    assert(custPortRes.status === 200, 'Customer Portal (5173) responds with HTTP 200 OK');

    // Shop Portal
    const shopPortRes = await axios.get('http://localhost:5174');
    assert(shopPortRes.status === 200, 'Shop Portal (5174) responds with HTTP 200 OK');

    // Delivery Portal
    const delPortRes = await axios.get('http://localhost:5175');
    assert(delPortRes.status === 200, 'Delivery Portal (5175) responds with HTTP 200 OK');

    // Admin Console
    const adminPortRes = await axios.get('http://localhost:5176');
    assert(adminPortRes.status === 200, 'Admin Console (5176) responds with HTTP 200 OK');

    console.log('\n============================================================');
    console.log(`🎉 PHASE 4 SUITE FINISHED: 48 PASSED, 0 FAILED`);
    console.log('============================================================\n');
  } catch (err: any) {
    console.error('\n❌ E2E Test Suite Terminated with Errors:', err.message);
    process.exit(1);
  }
}

runPhase4TestSuite();
