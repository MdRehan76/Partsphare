import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:5000/api';
const DEMO_SECRET = 'partsphere_rzp_secret_key_demo_32chars';

function computeSandboxSignature(orderId: string, paymentId: string): string {
  return crypto.createHmac('sha256', DEMO_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function runCustomerSubscriptionTests() {
  console.log('🚀 ========================================================');
  console.log('   PARTSPHERE CUSTOMER MAINTENANCE SUBSCRIPTIONS TEST      ');
  console.log('   Plans, Razorpay Demo, COD, Entitlements, Renew, Cancel  ');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. Plan Catalog & Discovery
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Subscription Plans Catalog ---');
    const plansRes = await axios.get(`${API_URL}/subscriptions/plans`);
    const plans = plansRes.data?.data || [];
    assert(plans.length >= 3, `Catalog returns ${plans.length} subscription plans`);

    const basicPlan = plans.find((p: any) => p.slug === 'basic-care');
    const stdPlan = plans.find((p: any) => p.slug === 'standard-care');
    const premPlan = plans.find((p: any) => p.slug === 'premium-care');

    assert(!!basicPlan && !!stdPlan && !!premPlan, 'All 3 demo plans (Basic, Standard, Premium Care) present');
    assert(Number(basicPlan.monthlyPrice) === 299, `Basic Care monthly price is ₹299 (got ${basicPlan.monthlyPrice})`);
    assert(Number(basicPlan.yearlyPrice) === 2499, `Basic Care yearly price is ₹2499 (got ${basicPlan.yearlyPrice})`);
    assert(basicPlan.savingsPercent > 0, `Basic Care yearly discount calculated: ${basicPlan.savingsPercent}% savings`);

    assert(Array.isArray(stdPlan.includedServices) && stdPlan.includedServices.length > 0, 'Standard Care has includedServices');
    assert(Array.isArray(stdPlan.discountBenefits) && stdPlan.discountBenefits.length > 0, 'Standard Care has discountBenefits');
    assert(Array.isArray(stdPlan.serviceLimits) && stdPlan.serviceLimits.length > 0, 'Standard Care has serviceLimits');
    assert(typeof stdPlan.eligibility === 'string' && stdPlan.eligibility.length > 0, 'Standard Care has vehicle eligibility rules');

    // Test Plan Detail by ID and Slug
    console.log('\n--- 2. Testing Plan Detail Lookup ---');
    const detailBySlug = await axios.get(`${API_URL}/subscriptions/plans/standard-care?frequency=YEARLY`);
    assert(detailBySlug.data?.data?.slug === 'standard-care', 'Plan retrieved by slug: standard-care');
    assert(Number(detailBySlug.data?.data?.yearlyPrice) === 5999, 'Yearly price confirmed at ₹5,999');

    const detailById = await axios.get(`${API_URL}/subscriptions/plans/${basicPlan.id}`);
    assert(detailById.data?.data?.id === basicPlan.id, 'Plan retrieved by ID');

    // ----------------------------------------------------
    // 3. User Registration & Vehicle Setup
    // ----------------------------------------------------
    console.log('\n--- 3. User Setup & Vehicle Onboarding ---');
    const email = `sub_tester_${Date.now()}@partsphere.in`;
    const password = 'Password@123';

    const regRes = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'Rahul',
      lastName: 'Sharma',
      email,
      phone: '9876543210',
      password,
      role: 'CUSTOMER',
    });
    const token = regRes.data?.data?.accessToken || regRes.data?.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    assert(!!token, `User registered & authenticated: ${email}`);

    // Fetch makes to create a vehicle in garage
    const makesRes = await axios.get(`${API_URL}/vehicles/makes`);
    const makes = makesRes.data?.data || [];
    const carMake = makes.find((m: any) => m.type === 'CAR') || makes[0];
    const modelsRes = await axios.get(`${API_URL}/vehicles/makes/${carMake.id}/models`);
    const model = modelsRes.data?.data?.[0];
    const variantsRes = await axios.get(`${API_URL}/vehicles/models/${model.id}/variants`);
    const variant = variantsRes.data?.data?.[0];

    const vehRes = await axios.post(
      `${API_URL}/vehicles/garage`,
      {
        variantId: variant.id,
        regNumber: 'KA03MJ4567',
        nickname: "Rahul's City Cruiser",
        isPrimary: true,
      },
      { headers: authHeaders }
    );
    const vehicleId = vehRes.data?.data?.id;
    assert(!!vehicleId, 'Primary vehicle onboarded into garage');

    // ----------------------------------------------------
    // 4. Razorpay Sandbox Subscription Purchase
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Razorpay Sandbox Subscription Flow ---');
    const subOrderRes = await axios.post(
      `${API_URL}/subscriptions/subscribe`,
      {
        planId: stdPlan.id,
        billingCycle: 'MONTHLY',
        vehicleId,
        vehicleReg: 'KA03MJ4567',
        paymentMethod: 'RAZORPAY',
        autoRenew: true,
      },
      { headers: authHeaders }
    );

    assert(subOrderRes.data?.success === true, 'Subscription order created');
    assert(subOrderRes.data?.data?.requiresOnlinePayment === true, 'Razorpay requires online payment session');
    const paymentSession = subOrderRes.data?.data?.paymentSession;
    assert(!!paymentSession?.subscriptionId, `Received subscriptionId: ${paymentSession?.subscriptionId}`);
    assert(!!paymentSession?.razorpayOrderId, `Received razorpayOrderId: ${paymentSession?.razorpayOrderId}`);

    const rzpSubscriptionId = paymentSession.subscriptionId;
    const rzpOrderId = paymentSession.razorpayOrderId;
    const rzpPaymentId = `pay_demo_${Date.now()}`;

    // Test Security: Tampered Signature Rejection
    console.log('\n--- 5. Testing HMAC Tamper Protection ---');
    try {
      await axios.post(
        `${API_URL}/subscriptions/verify-payment`,
        {
          subscriptionId: rzpSubscriptionId,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          razorpaySignature: 'fake_tampered_signature_12345',
        },
        { headers: authHeaders }
      );
      assert(false, 'Tampered HMAC signature should be rejected');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Tampered HMAC signature correctly rejected with 400 Bad Request');
    }

    // Verify Payment with Genuine HMAC Signature
    console.log('\n--- 6. Verifying Genuine Payment & Subscription Activation ---');
    const validSignature = computeSandboxSignature(rzpOrderId, rzpPaymentId);
    const verifyRes = await axios.post(
      `${API_URL}/subscriptions/verify-payment`,
      {
        subscriptionId: rzpSubscriptionId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSignature,
      },
      { headers: authHeaders }
    );

    assert(verifyRes.data?.success === true, 'Payment verified successfully');
    const activeSub = verifyRes.data?.data?.subscription || verifyRes.data?.data;
    assert(activeSub.status === 'ACTIVE', `Subscription status is ACTIVE (got ${activeSub.status})`);
    assert(!!activeSub.startDate && !!activeSub.endDate && !!activeSub.renewalDate, 'Dates initialized (start, end, renewal)');
    assert(activeSub.autoRenew === true, 'Auto-renewal is enabled');
    assert(Array.isArray(activeSub.entitlements) && activeSub.entitlements.length > 0, 'Entitlements populated on subscription');

    // ----------------------------------------------------
    // 7. Entitlements Quota Tracking & Limit Enforcement
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Entitlements Consumption & Quota Tracking ---');
    const scanEnt = activeSub.entitlements.find((e: any) => e.featureCode === 'DIAGNOSTIC_SCAN');
    assert(!!scanEnt, 'DIAGNOSTIC_SCAN entitlement found in plan');
    assert((scanEnt.quotaLimit || scanEnt.limitValue) === 2, `Initial diagnostic scan limit is 2 (got ${scanEnt.quotaLimit})`);
    assert(scanEnt.usedCount === 0, 'Initial used count is 0');
    assert(scanEnt.remainingCount === 2, 'Initial remaining count is 2');

    // Consume 1st scan service
    const use1Res = await axios.post(
      `${API_URL}/subscriptions/${activeSub.id}/entitlements/use`,
      {
        featureCode: 'DIAGNOSTIC_SCAN',
        notes: 'Pre-monsoon 40-point vehicle diagnostic check',
      },
      { headers: authHeaders }
    );
    assert(use1Res.data?.success === true, 'First entitlement usage recorded');
    assert(use1Res.data?.data?.usedCount === 1, 'Used count is 1');
    assert(use1Res.data?.data?.remainingQuota === 1, 'Remaining quota is 1');

    // Consume 2nd scan service (exhausting quota)
    const use2Res = await axios.post(
      `${API_URL}/subscriptions/${activeSub.id}/entitlements/use`,
      {
        featureCode: 'DIAGNOSTIC_SCAN',
        notes: 'Check engine light OBD scan',
      },
      { headers: authHeaders }
    );
    assert(use2Res.data?.data?.remainingQuota === 0, 'Remaining quota is 0 (quota exhausted)');

    // Attempt 3rd scan service (should be blocked)
    try {
      await axios.post(
        `${API_URL}/subscriptions/${activeSub.id}/entitlements/use`,
        {
          featureCode: 'DIAGNOSTIC_SCAN',
          notes: 'Excessive scan attempt beyond limit',
        },
        { headers: authHeaders }
      );
      assert(false, 'Should reject entitlement request when quota exhausted');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Quota limit exhaustion correctly blocked with 400');
    }

    // ----------------------------------------------------
    // 8. Auto-Renewal Toggle
    // ----------------------------------------------------
    console.log('\n--- 8. Testing Auto-Renewal Setting Toggle ---');
    const toggleOffRes = await axios.patch(
      `${API_URL}/subscriptions/${activeSub.id}/auto-renew`,
      { autoRenew: false },
      { headers: authHeaders }
    );
    assert(toggleOffRes.data?.data?.autoRenew === false, 'Auto-renew turned OFF');

    const toggleOnRes = await axios.patch(
      `${API_URL}/subscriptions/${activeSub.id}/auto-renew`,
      { autoRenew: true },
      { headers: authHeaders }
    );
    assert(toggleOnRes.data?.data?.autoRenew === true, 'Auto-renew turned back ON');

    // ----------------------------------------------------
    // 9. Automated Renewal Simulation
    // ----------------------------------------------------
    console.log('\n--- 9. Testing Automated Renewal Simulation ---');
    const oldEndDate = new Date(activeSub.endDate).getTime();
    const renewRes = await axios.post(
      `${API_URL}/subscriptions/${activeSub.id}/renew`,
      {},
      { headers: authHeaders }
    );
    assert(renewRes.data?.success === true, 'Renewal simulated successfully');
    const renewedSub = renewRes.data?.data?.subscription || renewRes.data?.data;
    const newEndDate = new Date(renewedSub.endDate).getTime();
    assert(newEndDate > oldEndDate, `End date extended (was ${activeSub.endDate}, now ${renewedSub.endDate})`);

    const renewedScan = renewedSub.entitlements.find((e: any) => e.featureCode === 'DIAGNOSTIC_SCAN');
    assert(renewedScan.usedCount === 0, 'Used count reset to 0 after renewal');
    assert(renewedScan.remainingCount === 2, 'Full entitlement quota restored after renewal');

    // ----------------------------------------------------
    // 10. Cancellation Flow
    // ----------------------------------------------------
    console.log('\n--- 10. Testing Subscription Cancellation Flow ---');
    const cancelRes = await axios.post(
      `${API_URL}/subscriptions/${activeSub.id}/cancel`,
      { reason: 'Selling vehicle' },
      { headers: authHeaders }
    );
    assert(cancelRes.data?.success === true, 'Subscription cancellation requested');
    const cancelledSub = cancelRes.data?.data?.subscription || cancelRes.data?.data;
    assert(cancelledSub.status === 'CANCELLED', `Status is CANCELLED (got ${cancelledSub.status})`);
    assert(cancelledSub.autoRenew === false, 'Auto-renew disabled upon cancellation');
    assert(!!cancelledSub.endDate, 'Benefits retained through end date');

    // Entitlements should still be usable until endDate even if cancelled
    const postCancelUse = await axios.post(
      `${API_URL}/subscriptions/${activeSub.id}/entitlements/use`,
      {
        featureCode: 'FREE_TOWING',
        notes: 'Tow during notice period',
      },
      { headers: authHeaders }
    );
    assert(postCancelUse.data?.success === true, 'Entitlements remain accessible during prepaid period after cancellation');

    // ----------------------------------------------------
    // 11. Cash on Delivery (COD) Subscription Flow
    // ----------------------------------------------------
    console.log('\n--- 11. Testing Cash on Delivery (Pay on First Visit) ---');
    const codSubRes = await axios.post(
      `${API_URL}/subscriptions/subscribe`,
      {
        planId: premPlan.id,
        billingCycle: 'YEARLY',
        vehicleId,
        vehicleReg: 'KA03MJ4567',
        paymentMethod: 'CASH_ON_DELIVERY',
        autoRenew: true,
      },
      { headers: authHeaders }
    );

    assert(codSubRes.data?.success === true, 'COD subscription request succeeded');
    assert(codSubRes.data?.data?.requiresOnlinePayment === false, 'COD does not require online payment gateway session');
    const codSub = codSubRes.data?.data?.subscription || codSubRes.data?.data;
    assert(codSub.status === 'ACTIVE', 'COD subscription activated immediately with pay-on-first-visit terms');
    assert(codSub.billingCycle === 'YEARLY', 'COD subscription is YEARLY');

    // Verify linked payment record is PENDING
    assert(Array.isArray(codSub.payments) && codSub.payments.length > 0, 'COD payment record created');
    assert(codSub.payments[0].method === 'CASH_ON_DELIVERY', 'Payment method is CASH_ON_DELIVERY');
    assert(codSub.payments[0].status === 'PENDING', 'Payment status is PENDING for technician collection');

    // ----------------------------------------------------
    // 12. Expiration Simulation
    // ----------------------------------------------------
    console.log('\n--- 12. Testing Expiration Simulation ---');
    const expireRes = await axios.post(
      `${API_URL}/subscriptions/${codSub.id}/expire`,
      {},
      { headers: authHeaders }
    );
    const expiredSub = expireRes.data?.data?.subscription || expireRes.data?.data;
    assert(expiredSub.status === 'EXPIRED', 'Subscription status transitioned to EXPIRED');

    // Expired subscription should reject entitlement usage
    try {
      await axios.post(
        `${API_URL}/subscriptions/${codSub.id}/entitlements/use`,
        {
          featureCode: 'FREE_TOWING',
          notes: 'Expired usage attempt',
        },
        { headers: authHeaders }
      );
      assert(false, 'Expired subscription should not allow entitlement usage');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Expired subscription correctly rejects entitlement consumption');
    }

    // ----------------------------------------------------
    // 13. Customer Dashboard Retrieval APIs
    // ----------------------------------------------------
    console.log('\n--- 13. Testing Customer Subscriptions Dashboard Endpoints ---');
    const mySubsRes = await axios.get(`${API_URL}/subscriptions/my`, { headers: authHeaders });
    const userSubs = mySubsRes.data?.data || [];
    assert(userSubs.length >= 2, `Customer dashboard lists all ${userSubs.length} subscriptions`);

    const myActiveRes = await axios.get(`${API_URL}/subscriptions/my/active`, { headers: authHeaders });
    // Note: The first sub is CANCELLED (but still within period) or codSub is EXPIRED.
    // getActiveSubscription returns any ACTIVE or CANCELLED subscription within valid period.
    assert(!!myActiveRes.data?.data, 'Active subscription endpoint returns covered membership');

    console.log('\n===========================================================');
    console.log(`   SUBSCRIPTION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal error during subscription testing:', err.response?.data || err.message);
    process.exit(1);
  }
}

runCustomerSubscriptionTests();
