import axios from 'axios';
import crypto from 'crypto';

const API_BASE = 'http://localhost:5000/api';
const DEMO_SECRET = 'partsphere_rzp_secret_key_demo_32chars';

function computeSandboxSignature(orderId: string, paymentId: string): string {
  return crypto.createHmac('sha256', DEMO_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function runEndToEndVerification() {
  console.log('================================================================================');
  console.log('🏁 PARTNEXA MASTER END-TO-END AUDIT & PRODUCTION INTEGRATION TEST');
  console.log('   Customer + Workshop + Delivery + Admin + PostgreSQL Shared Authority');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      if (detail !== undefined) console.error('     Detail:', detail);
      failed++;
    }
  }

  try {
    // --------------------------------------------------------------------------
    // STEP 1: AUTHENTICATION ACROSS ALL 4 ROLES
    // --------------------------------------------------------------------------
    console.log('--- STEP 1: Authenticate All 4 Portals ---');
    const custEmail = `customer_${Date.now()}@testpartsphare.com`;
    const custPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: custEmail,
      phone: custPhone,
      password: 'Password@123',
    });
    const customerToken = regRes.data.data.accessToken;
    const custHeaders = { Authorization: `Bearer ${customerToken}` };
    assert(!!customerToken, 'Customer registered and received access token');

    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@partsphere.in',
      password: 'Admin@1234',
    });
    const adminToken = adminLoginRes.data.data.accessToken;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    assert(!!adminToken, 'Admin authenticated successfully');

    const shopLoginRes = await axios.post(`${API_BASE}/shops/login`, {
      email: 'apex.shop@partsphere.in',
      password: 'Shop@1234',
    });
    const shopToken = shopLoginRes.data.token || shopLoginRes.data.data?.accessToken;
    const shopHeaders = { Authorization: `Bearer ${shopToken}` };
    assert(!!shopToken, 'Workshop (Apex Auto) authenticated successfully');

    const deliveryLoginRes = await axios.post(`${API_BASE}/delivery/login`, {
      email: 'rider.rajesh@partsphere.in',
      password: 'Rider@1234',
    });
    const deliveryToken = deliveryLoginRes.data.token || deliveryLoginRes.data.data?.accessToken;
    const deliveryHeaders = { Authorization: `Bearer ${deliveryToken}` };
    assert(!!deliveryToken, 'Delivery Partner (Rajesh) authenticated successfully');

    // --------------------------------------------------------------------------
    // STEP 2: CUSTOMER GARAGE & ADDRESS SETUP
    // --------------------------------------------------------------------------
    console.log('\n--- STEP 2: Customer Garage & Address Setup ---');
    const makesRes = await axios.get(`${API_BASE}/vehicles/makes?type=CAR`);
    const maruti = makesRes.data.data.find((m: any) => m.name.toLowerCase().includes('maruti'));
    const modelsRes = await axios.get(`${API_BASE}/vehicles/makes/${maruti.id}/models`);
    const swift = modelsRes.data.data.find((m: any) => m.name.toLowerCase().includes('swift'));
    const variantsRes = await axios.get(`${API_BASE}/vehicles/models/${swift.id}/variants`);
    const swiftVariant = variantsRes.data.data.find((v: any) => v.name === 'VXi') || variantsRes.data.data[0];

    const garageRes = await axios.post(
      `${API_BASE}/vehicles/garage`,
      {
        variantId: swiftVariant.id,
        nickname: 'Aarav Swift',
        regNumber: 'KA03HA1234',
        isPrimary: true,
      },
      { headers: custHeaders }
    );
    assert(garageRes.status === 201, 'Primary vehicle added to garage');

    const addrRes = await axios.post(
      `${API_BASE}/users/addresses`,
      {
        fullName: 'Aarav Sharma',
        phone: custPhone,
        line1: '12th Main, HAL 2nd Stage, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
      },
      { headers: custHeaders }
    );
    const addressId = addrRes.data.data.id;
    assert(!!addressId, 'Customer delivery address created in PostgreSQL');

    // --------------------------------------------------------------------------
    // STEP 3: ORDER 1 — NO INSTALLATION (DIY) + CASH ON DELIVERY
    // --------------------------------------------------------------------------
    console.log('\n--- STEP 3: Order 1 (NO_INSTALLATION + COD) Propagation ---');
    const prodsRes = await axios.get(`${API_BASE}/catalog/products?limit=5`);
    const product1 = prodsRes.data.data[0];

    await axios.delete(`${API_BASE}/cart/clear`, { headers: custHeaders }).catch(() => {});
    await axios.post(
      `${API_BASE}/cart/items`,
      { productId: product1.id, quantity: 1 },
      { headers: custHeaders }
    );

    const order1Res = await axios.post(
      `${API_BASE}/orders`,
      {
        addressId,
        difmType: 'NO_INSTALLATION',
        paymentMethod: 'CASH_ON_DELIVERY',
      },
      { headers: custHeaders }
    );
    const order1 = order1Res.data.data;
    assert(order1.status === 'CONFIRMED', 'Order 1 is CONFIRMED immediately via COD');
    assert(order1.paymentStatus === 'PENDING', 'Order 1 paymentStatus is PENDING (COD)');

    // Verify Delivery Assignment
    const delivJobsRes1 = await axios.get(`${API_BASE}/delivery/jobs/available`, { headers: deliveryHeaders });
    const delivJobs1 = delivJobsRes1.data.data || [];
    const matchedDelivJob1 = delivJobs1.find((j: any) => j.orderId === order1.id || j.id === order1.id);
    const myJobsRes1 = await axios.get(`${API_BASE}/delivery/jobs/my`, { headers: deliveryHeaders });
    const myJobs1 = myJobsRes1.data.data || [];
    const matchedMyJob1 = myJobs1.find((j: any) => j.orderId === order1.id || j.id === order1.id);
    assert(
      !!matchedDelivJob1 || !!matchedMyJob1,
      'Order 1 delivery assignment visible in Delivery Partner portal'
    );

    // Verify Workshop DOES NOT receive a job for NO_INSTALLATION
    const shopCalRes1 = await axios.get(`${API_BASE}/shops/portal/calendar`, { headers: shopHeaders });
    const shopJobs1 = shopCalRes1.data.data || [];
    const spuriousJob = shopJobs1.find((j: any) => j.orderId === order1.id);
    assert(!spuriousJob, 'NO workshop job created when customer selects NO_INSTALLATION');

    // Verify Admin sees Order 1
    const adminOrdersRes1 = await axios.get(`${API_BASE}/admin/orders`, { headers: adminHeaders });
    const adminOrders1 = adminOrdersRes1.data.data.orders || adminOrdersRes1.data.data || [];
    const matchedAdminOrder1 = adminOrders1.find((o: any) => o.id === order1.id);
    assert(!!matchedAdminOrder1, 'Admin console immediately sees Order 1 in database');

    // --------------------------------------------------------------------------
    // STEP 4: ORDER 2 — SHOP INSTALLATION (DIFM) + ONLINE PRE-PAYMENT
    // --------------------------------------------------------------------------
    console.log('\n--- STEP 4: Order 2 (SHOP_INSTALLATION + Online Payment) Propagation ---');
    const shopsRes = await axios.get(`${API_BASE}/shops`);
    const partnerShop = shopsRes.data.data.find((s: any) => s.name.includes('Apex')) || shopsRes.data.data[0];

    await axios.post(
      `${API_BASE}/cart/items`,
      { productId: product1.id, quantity: 1, shopId: partnerShop.id },
      { headers: custHeaders }
    );

    const order2Res = await axios.post(
      `${API_BASE}/orders`,
      {
        addressId,
        difmType: 'SHOP_INSTALLATION',
        shopId: partnerShop.id,
        paymentMethod: 'ONLINE_PREPAID',
        serviceDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        serviceSlot: '11:00 AM - 01:00 PM',
      },
      { headers: custHeaders }
    );
    const order2 = order2Res.data.data;
    assert(order2.status === 'PENDING', 'Order 2 initially PENDING before payment capture');

    // Simulate Razorpay Payment Gateway Success
    const rzpOrderRes = await axios.post(
      `${API_BASE}/payments/create-order`,
      { orderId: order2.id },
      { headers: custHeaders }
    );
    const rzpOrderId = rzpOrderRes.data.data.razorpayOrderId;
    const rzpPaymentId = `pay_demo_${Date.now()}`;
    const signature = computeSandboxSignature(rzpOrderId, rzpPaymentId);

    const verifyRes = await axios.post(
      `${API_BASE}/payments/verify`,
      {
        orderId: order2.id,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: signature,
      },
      { headers: custHeaders }
    );
    assert(verifyRes.data.success === true, 'Payment verified via HMAC signature');

    // Fetch updated order 2
    const updatedOrder2Res = await axios.get(`${API_BASE}/orders/${order2.id}`, { headers: custHeaders });
    const order2Confirmed = updatedOrder2Res.data.data;
    assert(order2Confirmed.status === 'CONFIRMED', 'Order 2 transitioned to CONFIRMED');
    assert(order2Confirmed.paymentStatus === 'CAPTURED', 'Order 2 paymentStatus is CAPTURED');

    // Verify Workshop Dashboard & Service Calendar
    const shopCalRes2 = await axios.get(`${API_BASE}/shops/portal/calendar`, { headers: shopHeaders });
    const shopJobs2 = shopCalRes2.data.data || [];
    const matchedShopJob = shopJobs2.find((j: any) => j.orderId === order2.id);
    assert(!!matchedShopJob, 'Workshop Service Calendar has ShopJob with matching canonical orderId');
    if (matchedShopJob) {
      assert(matchedShopJob.jobType === 'DIFM_SHOP_VISIT', 'Job correctly categorized as DIFM_SHOP_VISIT');
      assert(matchedShopJob.status === 'SCHEDULED', 'Job is in SCHEDULED status');
    }

    // Verify Workshop Commission Ledger entry created
    const ledgerRes = await axios.get(`${API_BASE}/shops/portal/commission`, { headers: shopHeaders });
    const ledgerEntries = ledgerRes.data.data?.items || ledgerRes.data.data?.ledger || [];
    const matchedLedger = ledgerEntries.find((l: any) => l.orderId === order2.id);
    assert(!!matchedLedger, 'Commission ledger record created in PostgreSQL for workshop');

    // Verify Delivery Partner sees Order 2
    const myJobsRes2 = await axios.get(`${API_BASE}/delivery/jobs/my`, { headers: deliveryHeaders });
    const availJobsRes2 = await axios.get(`${API_BASE}/delivery/jobs/available`, { headers: deliveryHeaders });
    const allDeliveryJobs = [...(myJobsRes2.data.data || []), ...(availJobsRes2.data.data || [])];
    const matchedDelivJob2 = allDeliveryJobs.find((j: any) => j.orderId === order2.id || j.id === order2.id);
    assert(!!matchedDelivJob2, 'Delivery Partner sees Order 2 logistics assignment');

    // Verify Admin sees Order 2
    const adminOrdersRes2 = await axios.get(`${API_BASE}/admin/orders/${order2.id}`, { headers: adminHeaders });
    assert(adminOrdersRes2.status === 200, 'Admin console inspects Order 2 in live PostgreSQL database');
    assert(adminOrdersRes2.data.data.paymentStatus === 'CAPTURED', 'Admin sees paymentStatus CAPTURED');

    // --------------------------------------------------------------------------
    // STEP 5: CUSTOMER SUBSCRIPTION LIFECYCLE
    // --------------------------------------------------------------------------
    console.log('\n--- STEP 5: Customer Subscription Lifecycle ---');
    const plansRes = await axios.get(`${API_BASE}/subscriptions/plans`);
    const plans = plansRes.data.data;
    assert(plans.length >= 3, 'Subscription plans catalog contains all 3 tiers');
    const silverPlan = plans.find((p: any) => p.slug.includes('silver')) || plans[1];

    const subRes = await axios.post(
      `${API_BASE}/subscriptions/subscribe`,
      {
        planId: silverPlan.id,
        billingCycle: 'QUARTERLY',
        vehicleId: garageRes.data.data.id,
      },
      { headers: custHeaders }
    );
    const subscriptionData = subRes.data.data;
    const subscriptionId = subscriptionData.subscription?.id || subscriptionData.id;
    const razorpayOrderId = subscriptionData.paymentSession?.razorpayOrderId;
    const razorpayPaymentId = `sub_pay_${Date.now()}`;
    const razorpaySignature = crypto
      .createHmac('sha256', 'partsphere_rzp_secret_key_demo_32chars')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    assert(!!subscriptionId, 'Customer subscribed to Silver Preventive Care');

    const verifySubRes = await axios.post(
      `${API_BASE}/subscriptions/verify-payment`,
      {
        subscriptionId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      { headers: custHeaders }
    );
    assert(verifySubRes.data.success === true, 'Subscription payment recorded');

    // Verify Active Subscription in Customer Portal
    const mySubRes = await axios.get(`${API_BASE}/subscriptions/my`, { headers: custHeaders });
    const mySubs = mySubRes.data.data || [];
    assert(mySubs.length > 0, 'Customer has active subscriptions listed');
    assert(mySubs[0].status === 'ACTIVE', 'Subscription status is ACTIVE in PostgreSQL');

    // --------------------------------------------------------------------------
    // STEP 6: DELIVERY PARTNER KYC SUBMISSION & ADMIN APPROVAL
    // --------------------------------------------------------------------------
    console.log('\n--- STEP 6: Delivery Partner KYC Submission & Admin Approval ---');
    // Register a new delivery partner to test KYC submission & approval cleanly
    const riderEmail = `newrider_${Date.now()}@partsphere.in`;
    const riderPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const riderRegRes = await axios.post(`${API_BASE}/delivery/register`, {
      firstName: 'Sunil',
      lastName: 'Kumar',
      email: riderEmail,
      phone: riderPhone,
      password: 'Password@123',
      vehicleType: 'MOTORCYCLE',
      city: 'Bangalore',
    });
    const riderToken = riderRegRes.data.token || riderRegRes.data.data?.accessToken;
    const riderHeaders = { Authorization: `Bearer ${riderToken}` };
    assert(!!riderToken, 'New delivery partner registered');

    // Submit KYC Document
    await axios.post(
      `${API_BASE}/delivery/kyc/document`,
      {
        documentType: 'DRIVING_LICENSE',
        documentNumber: 'KA-04-2022-0012345',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      },
      { headers: riderHeaders }
    );

    const submitKycRes = await axios.post(`${API_BASE}/delivery/kyc/submit`, {}, { headers: riderHeaders });
    assert(submitKycRes.data.success === true, 'Rider submitted KYC documents');

    // Admin verifies KYC
    const riderProfileRes = await axios.get(`${API_BASE}/delivery/profile`, { headers: riderHeaders });
    const riderUserId = riderProfileRes.data.data.userId || riderProfileRes.data.data.id;

    const adminApproveRes = await axios.post(
      `${API_BASE}/delivery/kyc/verify`,
      {
        userId: riderUserId,
        status: 'APPROVED',
        notes: 'Documents verified by PartNexa Executive Operations',
      },
      { headers: adminHeaders }
    );
    assert(adminApproveRes.data.success === true, 'Admin approved Rider KYC');

    // Verify Rider status is now APPROVED
    const updatedRiderRes = await axios.get(`${API_BASE}/delivery/profile`, { headers: riderHeaders });
    assert(
      updatedRiderRes.data.data.verificationStatus === 'APPROVED' || updatedRiderRes.data.data.kyc?.status === 'APPROVED',
      'Rider status transitioned to APPROVED in PostgreSQL'
    );

    // --------------------------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------------------------
    console.log('\n================================================================================');
    console.log(`🎉 COMPREHENSIVE INTEGRATION SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================================\n');

  } catch (err: any) {
    console.error('\n❌ INTEGRATION TEST FAILED WITH EXCEPTION:', err.message);
    if (err.response?.data) {
      console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

runEndToEndVerification().then(() => process.exit(0));
