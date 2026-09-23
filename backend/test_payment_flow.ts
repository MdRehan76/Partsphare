import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:5000/api';
const DEMO_RAZORPAY_SECRET = 'partsphere_rzp_secret_key_demo_32chars';

function generateHmacSignature(razorpayOrderId: string, razorpayPaymentId: string, secret = DEMO_RAZORPAY_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

async function runPaymentFlowTestSuite() {
  console.log('================================================================');
  console.log('🧪 PartNexa Phase 11: Complete Payment Flow Verification Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Authenticate users
  console.log('1. Authenticating test actors...');
  const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'demo@partsphere.in',
    password: 'Demo@1234',
    role: 'CUSTOMER',
  });
  const customerToken = customerLogin.data?.data?.accessToken;
  const customerHeaders = { headers: { Authorization: `Bearer ${customerToken}` } };
  assert(Boolean(customerToken), 'Customer logged in with valid JWT token');

  const deliveryLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'rider.rajesh@partsphere.in',
    password: 'Rider@1234',
    role: 'DELIVERY_PARTNER',
  });
  const deliveryToken = deliveryLogin.data?.data?.accessToken;
  const deliveryHeaders = { headers: { Authorization: `Bearer ${deliveryToken}` } };
  assert(Boolean(deliveryToken), 'Delivery partner logged in with valid JWT token');

  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@partsphere.in',
    password: 'Admin@1234',
    role: 'ADMIN',
  });
  const adminToken = adminLogin.data?.data?.accessToken;
  const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
  assert(Boolean(adminToken), 'Admin logged in with valid JWT token');

  // Ensure customer address
  const addrRes = await axios.get(`${BASE_URL}/users/addresses`, customerHeaders);
  let addressId = addrRes.data?.data?.[0]?.id;
  if (!addressId) {
    const newAddr = await axios.post(
      `${BASE_URL}/users/addresses`,
      {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        line1: 'Flat 402, Green Glen Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        isDefault: true,
      },
      customerHeaders
    );
    addressId = newAddr.data?.data?.id;
  }
  assert(Boolean(addressId), `Customer address verified: ${addressId}`);

  // Resolve a test product with stock
  const catalogRes = await axios.get(`${BASE_URL}/catalog/products`);
  const products = Array.isArray(catalogRes.data?.data)
    ? catalogRes.data.data
    : (catalogRes.data?.data?.products || []);
  const testProduct = products.find((p: any) => p.id === 'prod-bosch-spark') || products[0];
  assert(Boolean(testProduct), `Test catalog product found: "${testProduct?.name}" (₹${testProduct?.sellingPrice || testProduct?.basePrice})`);

  // Ensure stock available via EDI 846 ingest
  await axios.post(
    `${BASE_URL}/inventory/edi/ingest`,
    {
      senderId: 'PARTSNEXA-TEST-FEED',
      documentType: 'EDI_846_INVENTORY_ADVICE',
      controlNumber: `EDI-${Date.now()}`,
      timestamp: new Date().toISOString(),
      lineItems: [
        {
          sku: testProduct.sku || 'BOSCH-SP-FR78X',
          productId: testProduct.id,
          shopId: 'shop-1',
          quantityAvailable: 50,
          batchNumber: 'BATCH-TEST-2026',
          unitCost: 500,
        },
      ],
    },
    adminHeaders
  );

  // Helper to add item to cart
  async function setupCart(qty = 1) {
    await axios.delete(`${BASE_URL}/cart/clear`, customerHeaders);
    await axios.post(
      `${BASE_URL}/cart/items`,
      {
        productId: testProduct.id,
        shopId: 'shop-1',
        quantity: qty,
      },
      customerHeaders
    );
    const cartRes = await axios.get(`${BASE_URL}/cart`, customerHeaders);
    return cartRes.data?.data;
  }

  // --------------------------------------------------------------------------
  // TEST SCENARIO 1: Razorpay Sandbox Success Flow
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Razorpay Sandbox Success Flow ---');
  await setupCart(1);

  // 1a. Create order with RAZORPAY
  const order1Res = await axios.post(
    `${BASE_URL}/orders`,
    {
      addressId,
      difmType: 'NO_INSTALLATION',
      paymentMethod: 'RAZORPAY',
    },
    customerHeaders
  );
  const order1 = order1Res.data?.data;
  assert(order1.status === 'PENDING', 'Order draft created with status PENDING');
  assert(order1.paymentStatus === 'PENDING', 'Order paymentStatus initialized as PENDING');
  assert(order1.paymentMethod === 'RAZORPAY', 'Order paymentMethod is RAZORPAY');

  // 1b. Verify cart is NOT prematurely wiped out while payment is pending
  const cartCheck = await axios.get(`${BASE_URL}/cart`, customerHeaders);
  assert(cartCheck.data?.data?.items?.length > 0, 'Cart items preserved in DB while payment is in-flight');

  // 1c. Create gateway payment order
  const payOrderRes = await axios.post(
    `${BASE_URL}/payments/create-order`,
    { orderId: order1.id },
    customerHeaders
  );
  const payOrderData = payOrderRes.data?.data;
  assert(Boolean(payOrderData.razorpayOrderId), `Gateway order ID generated: ${payOrderData.razorpayOrderId}`);
  assert(payOrderData.isDemoMode === true, 'Explicit isDemoMode flag returned as true');
  assert(payOrderData.amount === Number(order1.total), `Payment amount ₹${payOrderData.amount} matches order.total`);
  assert(payOrderData.amountInPaise === Math.round(Number(order1.total) * 100), `Amount in paise strictly matches (₹${order1.total} -> ${payOrderData.amountInPaise})`);

  // 1d. Authoritative cryptographic signature verification
  const simPaymentId = `pay_rzp_demo_${Date.now()}_test1`;
  const validSignature = generateHmacSignature(payOrderData.razorpayOrderId, simPaymentId);

  const verifyRes = await axios.post(
    `${BASE_URL}/payments/verify`,
    {
      orderId: order1.id,
      razorpayOrderId: payOrderData.razorpayOrderId,
      razorpayPaymentId: simPaymentId,
      razorpaySignature: validSignature,
    },
    customerHeaders
  );
  const verifyData = verifyRes.data?.data;
  assert(verifyRes.data?.success === true, 'Verification endpoint returned success 200');
  assert(verifyData.order.status === 'CONFIRMED', 'Order status transitioned to CONFIRMED');
  assert(verifyData.order.paymentStatus === 'CAPTURED', 'Order paymentStatus transitioned to CAPTURED');
  assert(verifyData.payment.status === 'CAPTURED', 'Payment status transitioned to CAPTURED');
  assert(verifyData.payment.razorpayPaymentId === simPaymentId, 'Payment record references razorpayPaymentId');
  assert(verifyData.payment.cvv === undefined, 'Zero CVV stored in payment record');
  assert(verifyData.payment.cardNumber === undefined, 'Zero raw card number stored in payment record');

  // 1e. Cart cleared authoritatively on backend
  const postCart = await axios.get(`${BASE_URL}/cart`, customerHeaders);
  assert(postCart.data?.data?.items?.length === 0, 'Customer cart cleared authoritatively after payment capture');

  // 1f. Tracking event appended
  const trackingRes = await axios.get(`${BASE_URL}/orders/${order1.id}`, customerHeaders);
  const latestTracking = trackingRes.data?.data?.tracking?.slice(-1)[0];
  assert(
    latestTracking?.message?.includes('captured successfully') || latestTracking?.message?.includes('Razorpay Sandbox'),
    `Order tracking logged payment capture event: "${latestTracking?.message}"`
  );

  // --------------------------------------------------------------------------
  // TEST SCENARIO 2: Razorpay Cancel Flow
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Razorpay Cancel Flow ---');
  await setupCart(1);
  const order2Res = await axios.post(
    `${BASE_URL}/orders`,
    {
      addressId,
      difmType: 'NO_INSTALLATION',
      paymentMethod: 'RAZORPAY',
    },
    customerHeaders
  );
  const order2 = order2Res.data?.data;

  // Customer opens modal and cancels
  const cancelRes = await axios.post(
    `${BASE_URL}/payments/fail`,
    {
      orderId: order2.id,
      errorCode: 'PAYMENT_CANCELLED_BY_USER',
      errorReason: 'Customer closed Razorpay sandbox modal window.',
    },
    customerHeaders
  );
  assert(cancelRes.data?.data?.paymentStatus === 'FAILED', 'Payment marked as FAILED upon customer cancellation');
  assert(cancelRes.data?.data?.canRetry === true, 'canRetry flag is true for customer retry');

  // Verify order is NOT falsely confirmed!
  const order2Check = await axios.get(`${BASE_URL}/orders/${order2.id}`, customerHeaders);
  assert(order2Check.data?.data?.status === 'PENDING', 'Cancelled payment order remains PENDING (never falsely confirmed)');
  assert(order2Check.data?.data?.paymentStatus === 'FAILED', 'Order paymentStatus marked FAILED');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 3: Razorpay Failure (Bank Decline & Tampered Signature)
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Razorpay Failure & Security Verification ---');
  // 3a. Bank decline simulation
  const declineRes = await axios.post(
    `${BASE_URL}/payments/fail`,
    {
      orderId: order2.id,
      errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
      errorDescription: 'Transaction declined by simulated issuing bank.',
    },
    customerHeaders
  );
  assert(declineRes.data?.data?.paymentStatus === 'FAILED', 'Bank decline safely recorded as FAILED');

  // 3b. Cryptographic Tamper Protection: Invalid signature rejected with 400
  await setupCart(1);
  const order3Res = await axios.post(
    `${BASE_URL}/orders`,
    { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'RAZORPAY' },
    customerHeaders
  );
  const order3 = order3Res.data?.data;
  const payOrder3 = await axios.post(
    `${BASE_URL}/payments/create-order`,
    { orderId: order3.id },
    customerHeaders
  );

  let tamperBlocked = false;
  try {
    await axios.post(
      `${BASE_URL}/payments/verify`,
      {
        orderId: order3.id,
        razorpayOrderId: payOrder3.data?.data?.razorpayOrderId,
        razorpayPaymentId: 'pay_fraudulent_tampered_123',
        razorpaySignature: 'fraudulent_invalid_signature_hex_1234567890abcdef1234567890abcdef12345678',
      },
      customerHeaders
    );
  } catch (err: any) {
    if (err.response?.status === 400) {
      tamperBlocked = true;
    }
  }
  assert(tamperBlocked, 'Backend HMAC verification strictly rejected invalid/tampered signature with HTTP 400');

  const order3Check = await axios.get(`${BASE_URL}/orders/${order3.id}`, customerHeaders);
  assert(order3Check.data?.data?.status === 'PENDING', 'Order with tampered signature NOT confirmed (remains PENDING)');
  assert(order3Check.data?.data?.paymentStatus === 'FAILED', 'Order with tampered signature marked paymentStatus: FAILED');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 4: Payment Retry Flow
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Payment Retry Flow ---');
  // Retrying order 3 which previously had a failed payment attempt
  const retryRes = await axios.post(
    `${BASE_URL}/payments/retry/${order3.id}`,
    {},
    customerHeaders
  );
  const retryData = retryRes.data?.data;
  assert(Boolean(retryData?.razorpayOrderId), `New gateway session generated for retry: ${retryData?.razorpayOrderId}`);
  assert(retryData?.amount === Number(order3.total), 'Retry payment amount matches original order total');

  // Now verify with valid signature for this new retry session
  const retryPaymentId = `pay_rzp_retry_${Date.now()}`;
  const retrySig = generateHmacSignature(retryData.razorpayOrderId, retryPaymentId);

  const retryVerify = await axios.post(
    `${BASE_URL}/payments/verify`,
    {
      orderId: order3.id,
      razorpayOrderId: retryData.razorpayOrderId,
      razorpayPaymentId: retryPaymentId,
      razorpaySignature: retrySig,
    },
    customerHeaders
  );
  assert(retryVerify.data?.data?.order?.status === 'CONFIRMED', 'Retried order successfully transitioned to CONFIRMED');
  assert(retryVerify.data?.data?.order?.paymentStatus === 'CAPTURED', 'Retried order paymentStatus transitioned to CAPTURED');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 5: Duplicate Callback / Idempotency Guard
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Duplicate Callback / Idempotency Guard ---');
  // Call verify endpoint AGAIN with the exact same payload that was just captured
  const dupVerifyRes = await axios.post(
    `${BASE_URL}/payments/verify`,
    {
      orderId: order3.id,
      razorpayOrderId: retryData.razorpayOrderId,
      razorpayPaymentId: retryPaymentId,
      razorpaySignature: retrySig,
    },
    customerHeaders
  );
  assert(dupVerifyRes.status === 200, 'Duplicate verification returned HTTP 200 without throwing errors');
  assert(dupVerifyRes.data?.data?.alreadyProcessed === true, 'Duplicate verification flagged alreadyProcessed: true');
  assert(dupVerifyRes.data?.data?.order?.status === 'CONFIRMED', 'Order status remains CONFIRMED');
  assert(dupVerifyRes.data?.data?.payment?.status === 'CAPTURED', 'Payment status remains CAPTURED');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 6: Cash on Delivery (COD) Flow & Collection Recording
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Cash on Delivery (COD) Flow ---');
  await setupCart(1);

  // 6a. Place order with CASH_ON_DELIVERY
  const codOrderRes = await axios.post(
    `${BASE_URL}/orders`,
    {
      addressId,
      difmType: 'NO_INSTALLATION',
      paymentMethod: 'CASH_ON_DELIVERY',
    },
    customerHeaders
  );
  const codOrder = codOrderRes.data?.data;
  assert(codOrder.status === 'CONFIRMED', 'COD Order immediately confirmed upon placement');
  assert(codOrder.paymentMethod === 'CASH_ON_DELIVERY', 'COD Order paymentMethod is CASH_ON_DELIVERY');
  assert(codOrder.paymentStatus === 'PENDING', 'COD Order paymentStatus is PENDING (awaiting doorstep collection)');

  // Cart immediately cleared for COD
  const codCart = await axios.get(`${BASE_URL}/cart`, customerHeaders);
  assert(codCart.data?.data?.items?.length === 0, 'Customer cart cleared immediately upon COD placement');

  // 6b. Delivery partner sees COD amount to collect
  const availableJobsRes = await axios.get(`${BASE_URL}/delivery/jobs/available`, deliveryHeaders);
  const codJob = availableJobsRes.data?.data?.find((j: any) => j.orderId === codOrder.id);
  assert(Boolean(codJob), `Delivery partner sees COD delivery assignment for order ${codOrder.id}`);
  assert(codJob?.paymentMethod === 'CASH_ON_DELIVERY', 'Delivery job displays paymentMethod: CASH_ON_DELIVERY');
  assert(
    Number(codJob?.codAmountToCollect) === Number(codOrder.total),
    `Delivery job explicitly specifies exact COD amount to collect: ₹${codJob?.codAmountToCollect} (matches ₹${codOrder.total})`
  );
  assert(codJob?.codStatus === 'PENDING', 'Delivery job codStatus is PENDING');

  // 6c. Admin sees COD order and status
  const adminOrderRes = await axios.get(`${BASE_URL}/admin/orders/${codOrder.id}`, adminHeaders);
  const adminOrder = adminOrderRes.data?.data;
  assert(adminOrder.paymentMethod === 'CASH_ON_DELIVERY', 'Admin portal displays paymentMethod: CASH_ON_DELIVERY');
  assert(adminOrder.paymentStatus === 'PENDING', 'Admin portal displays paymentStatus: PENDING');

  // 6d. Accept delivery job and record COD cash collection
  await axios.post(`${BASE_URL}/delivery/jobs/${codJob.id}/accept`, {}, deliveryHeaders);
  const codCollectRes = await axios.post(
    `${BASE_URL}/delivery/jobs/${codJob.id}/collect-cod`,
    { amount: Number(codOrder.total) },
    deliveryHeaders
  );
  const collectedJob = codCollectRes.data?.data?.assignment || codCollectRes.data?.data;
  assert(collectedJob?.codStatus === 'COLLECTED', 'Delivery assignment codStatus updated to COLLECTED');
  assert(
    Number(collectedJob?.codAmountCollected) === Number(codOrder.total),
    `COD collected amount recorded: ₹${collectedJob?.codAmountCollected}`
  );

  // Verify order payment flipped to PAID
  const collectedOrderCheck = await axios.get(`${BASE_URL}/orders/${codOrder.id}`, customerHeaders);
  assert(collectedOrderCheck.data?.data?.paymentStatus === 'PAID', 'Order paymentStatus updated to PAID after doorstep COD collection');

  // 6e. Admin manual payment status recording test
  console.log('\n--- Admin Manual Payment Recording Test ---');
  // Create another COD order to test Admin recording
  await setupCart(1);
  const codOrder2Res = await axios.post(
    `${BASE_URL}/orders`,
    { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'CASH_ON_DELIVERY' },
    customerHeaders
  );
  const codOrder2 = codOrder2Res.data?.data;

  const adminUpdateRes = await axios.patch(
    `${BASE_URL}/admin/orders/${codOrder2.id}/payment-status`,
    { paymentStatus: 'PAID', notes: 'Cash payment reconciled by Admin finance desk.' },
    adminHeaders
  );
  assert(adminUpdateRes.data?.data?.paymentStatus === 'PAID', 'Admin successfully recorded payment status as PAID');

  const adminOrder2Check = await axios.get(`${BASE_URL}/orders/${codOrder2.id}`, customerHeaders);
  assert(adminOrder2Check.data?.data?.paymentStatus === 'PAID', 'Order reflects PAID status after Admin update');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 7: Switching Payment Method from Razorpay to COD
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 7: Switching Payment Method to COD ---');
  await setupCart(1);
  const orderSwitchRes = await axios.post(
    `${BASE_URL}/orders`,
    { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'RAZORPAY' },
    customerHeaders
  );
  const orderSwitch = orderSwitchRes.data?.data;
  assert(orderSwitch.status === 'PENDING', 'Initial order created as PENDING with RAZORPAY');

  const switchRes = await axios.patch(
    `${BASE_URL}/payments/switch-method/${orderSwitch.id}`,
    { paymentMethod: 'CASH_ON_DELIVERY' },
    customerHeaders
  );
  const switchedOrder = switchRes.data?.data?.order;
  assert(switchedOrder.paymentMethod === 'CASH_ON_DELIVERY', 'Order paymentMethod switched to CASH_ON_DELIVERY');
  assert(switchedOrder.status === 'CONFIRMED', 'Switched order immediately confirmed');
  assert(switchedOrder.paymentStatus === 'PENDING', 'Switched order paymentStatus is PENDING');

  // Check delivery assignment reflects COD
  const switchedDelivery = await axios.get(`${BASE_URL}/delivery/jobs/available`, deliveryHeaders);
  const switchedJob = switchedDelivery.data?.data?.find((j: any) => j.orderId === orderSwitch.id);
  assert(switchedJob?.paymentMethod === 'CASH_ON_DELIVERY', 'Delivery partner sees switched order as CASH_ON_DELIVERY');
  assert(Number(switchedJob?.codAmountToCollect) === Number(switchedOrder.total), `COD amount to collect matches total: ₹${switchedJob?.codAmountToCollect}`);

  // Summary
  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPaymentFlowTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  if (err.response?.data) {
    console.error('Response data:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
