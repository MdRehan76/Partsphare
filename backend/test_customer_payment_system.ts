import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:5000/api';
const DEMO_SECRET = 'partsphere_rzp_secret_key_demo_32chars';

function computeSandboxSignature(orderId: string, paymentId: string): string {
  return crypto.createHmac('sha256', DEMO_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

async function runPaymentSystemTests() {
  console.log('🚀 ========================================================');
  console.log('   PARTSPHERE CUSTOMER PAYMENT SYSTEM TEST SUITE           ');
  console.log('   Razorpay Sandbox, COD, HMAC Anti-Tamper & Edge Cases    ');
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
    // 0. Setup Customer Authentication & Session
    const email = `paytest_${Date.now()}@partsphere.in`;
    const password = 'Password@123';
    console.log(`\n[SETUP] Registering test customer: ${email}`);

    const regRes = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'Vikram',
      lastName: 'Mehta',
      email,
      phone: '9845012345',
      password,
      role: 'CUSTOMER',
    });
    const token = regRes.data?.data?.accessToken || regRes.data?.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Get an address
    const addrRes = await axios.post(
      `${API_URL}/users/addresses`,
      {
        fullName: 'Vikram Mehta',
        phone: '9845012345',
        line1: 'Flat 302, Palm Meadows, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        isDefault: true,
      },
      { headers: authHeaders }
    );
    const addressId = addrRes.data.data.id;

    // Get catalog products
    const prodRes = await axios.get(`${API_URL}/catalog/products?limit=10`);
    const products = prodRes.data?.data?.products || prodRes.data?.data || [];
    assert(products.length > 0, 'Catalog products retrieved for payment testing');
    const testProduct = products.find((p: any) => {
      const qty = p.inventories?.reduce((acc: number, inv: any) => acc + (inv.quantity || 0), 0) || 0;
      return qty > 5;
    }) || products[1] || products[0];

    // =========================================================================
    // TEST 1: Cash on Delivery (COD) Order Flow
    // =========================================================================
    console.log('\n--- TEST 1: Cash on Delivery (COD) Order Flow ---');
    // Clear cart and add item
    await axios.delete(`${API_URL}/cart`, { headers: authHeaders }).catch(() => {});
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const codOrderRes = await axios.post(
      `${API_URL}/orders`,
      {
        addressId,
        difmType: 'NO_INSTALLATION',
        paymentMethod: 'CASH_ON_DELIVERY',
      },
      { headers: authHeaders }
    );

    const codOrder = codOrderRes.data?.data;
    assert(codOrder !== undefined, 'COD order created successfully');
    assert(codOrder.status === 'CONFIRMED', 'COD order status is CONFIRMED immediately');
    assert(codOrder.paymentStatus === 'PENDING', 'COD payment status is PENDING (scheduled for collection)');
    assert(codOrder.paymentMethod === 'CASH_ON_DELIVERY', 'COD payment method stored correctly');

    // =========================================================================
    // TEST 2: Successful Razorpay Sandbox Payment with HMAC Signature
    // =========================================================================
    console.log('\n--- TEST 2: Successful Razorpay Sandbox Payment (HMAC Verification) ---');
    // Add item for online payment
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const onlineOrderRes = await axios.post(
      `${API_URL}/orders`,
      {
        addressId,
        difmType: 'HOME_INSTALLATION',
        paymentMethod: 'RAZORPAY',
      },
      { headers: authHeaders }
    );

    const onlineOrder = onlineOrderRes.data?.data;
    assert(onlineOrder.status === 'PENDING', 'Online order starts in PENDING status before payment');
    assert(onlineOrder.paymentStatus === 'PENDING', 'Payment status starts in PENDING');

    // Create payment gateway order
    const createPayRes = await axios.post(
      `${API_URL}/payments/create-order`,
      { orderId: onlineOrder.id },
      { headers: authHeaders }
    );

    const paySession = createPayRes.data?.data;
    assert(paySession.razorpayOrderId !== undefined, 'Backend generated safe Razorpay Order ID');
    assert(paySession.amountInPaise === Math.round(Number(onlineOrder.total) * 100), 'Amount in paise matches order total');
    assert(paySession.keyId !== undefined, 'Returned sandbox key ID');

    // Generate valid HMAC signature
    const testPaymentId = `pay_rzp_test_${Date.now()}_abc123`;
    const validSignature = computeSandboxSignature(paySession.razorpayOrderId, testPaymentId);

    // Verify payment with backend
    const verifyRes = await axios.post(
      `${API_URL}/payments/verify`,
      {
        orderId: onlineOrder.id,
        razorpayOrderId: paySession.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      },
      { headers: authHeaders }
    );

    const verified = verifyRes.data?.data;
    assert(verified.success === true, 'Backend verified HMAC signature successfully');
    assert(verified.order.status === 'CONFIRMED', 'Order status transitioned to CONFIRMED');
    assert(verified.order.paymentStatus === 'CAPTURED', 'Order paymentStatus transitioned to CAPTURED');
    assert(verified.payment.razorpayPaymentId === testPaymentId, 'Stored safe gateway payment ID');
    assert(verified.payment.status === 'CAPTURED', 'Payment record status marked CAPTURED');

    // =========================================================================
    // TEST 3: Duplicate Payment Callback (Idempotency Protection)
    // =========================================================================
    console.log('\n--- TEST 3: Duplicate Payment Callback (Idempotency) ---');
    const duplicateVerifyRes = await axios.post(
      `${API_URL}/payments/verify`,
      {
        orderId: onlineOrder.id,
        razorpayOrderId: paySession.razorpayOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: validSignature,
      },
      { headers: authHeaders }
    );

    assert(duplicateVerifyRes.data?.data?.alreadyProcessed === true, 'Idempotency guard detected already processed payment');
    assert(duplicateVerifyRes.data?.data?.payment?.status === 'CAPTURED', 'Status remained CAPTURED without corrupting');

    // =========================================================================
    // TEST 4: Invalid Payment State & Tampered Signature Rejection
    // =========================================================================
    console.log('\n--- TEST 4: Anti-Tamper: Reject Invalid HMAC Signature ---');
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const tamperedOrderRes = await axios.post(
      `${API_URL}/orders`,
      {
        addressId,
        difmType: 'NO_INSTALLATION',
        paymentMethod: 'RAZORPAY',
      },
      { headers: authHeaders }
    );
    const tamperedOrder = tamperedOrderRes.data?.data;

    const tamperedPaySession = (
      await axios.post(
        `${API_URL}/payments/create-order`,
        { orderId: tamperedOrder.id },
        { headers: authHeaders }
      )
    ).data?.data;

    try {
      await axios.post(
        `${API_URL}/payments/verify`,
        {
          orderId: tamperedOrder.id,
          razorpayOrderId: tamperedPaySession.razorpayOrderId,
          razorpayPaymentId: 'pay_fraudulent_123',
          razorpaySignature: 'tampered_fake_signature_hex_digest_999999',
        },
        { headers: authHeaders }
      );
      assert(false, 'Should have rejected fake/tampered signature!');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Rejected tampered signature with HTTP 400 Bad Request');
      assert(
        err.response?.data?.message?.includes('signature'),
        'Error message correctly states signature mismatch / validation failure'
      );
    }

    // Verify order was NOT confirmed
    const orderCheck = (await axios.get(`${API_URL}/orders/${tamperedOrder.id}`, { headers: authHeaders })).data?.data;
    assert(orderCheck.paymentStatus === 'FAILED' && orderCheck.status !== 'CONFIRMED', 'Order was not confirmed (paymentStatus marked FAILED) after signature tampering');

    // =========================================================================
    // TEST 5: Cancelled Payment Flow
    // =========================================================================
    console.log('\n--- TEST 5: Cancelled Payment Flow ---');
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const cancelOrder = (
      await axios.post(
        `${API_URL}/orders`,
        { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'RAZORPAY' },
        { headers: authHeaders }
      )
    ).data?.data;

    await axios.post(
      `${API_URL}/payments/fail`,
      {
        orderId: cancelOrder.id,
        errorCode: 'PAYMENT_CANCELLED_BY_USER',
        errorReason: 'Customer closed modal window before entering details',
      },
      { headers: authHeaders }
    );

    const cancelledCheck = (await axios.get(`${API_URL}/orders/${cancelOrder.id}`, { headers: authHeaders })).data?.data;
    assert(cancelledCheck.paymentStatus === 'FAILED', 'Order paymentStatus updated to FAILED upon cancellation');
    assert(cancelledCheck.status === 'PENDING', 'Order status remains PENDING for retry');

    // =========================================================================
    // TEST 6: Failed Payment Flow (Bank Gateway Decline Simulation)
    // =========================================================================
    console.log('\n--- TEST 6: Failed Payment Flow (Simulated Bank Decline) ---');
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const declineOrder = (
      await axios.post(
        `${API_URL}/orders`,
        { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'RAZORPAY' },
        { headers: authHeaders }
      )
    ).data?.data;

    await axios.post(
      `${API_URL}/payments/fail`,
      {
        orderId: declineOrder.id,
        errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
        errorReason: 'Transaction was declined by issuing bank (Sandbox Test Mode)',
      },
      { headers: authHeaders }
    );

    const declineCheck = (await axios.get(`${API_URL}/payments/status/${declineOrder.id}`, { headers: authHeaders })).data?.data;
    assert(declineCheck.paymentStatus === 'FAILED', 'Payment status is FAILED');
    assert(declineCheck.failureReason?.includes('declined'), 'Stored failure reason accurately');

    // =========================================================================
    // TEST 7: Retry Payment Flow
    // =========================================================================
    console.log('\n--- TEST 7: Retry Payment Flow ---');
    const retryRes = await axios.post(
      `${API_URL}/payments/retry/${declineOrder.id}`,
      {},
      { headers: authHeaders }
    );
    const retrySession = retryRes.data?.data;
    assert(retrySession.razorpayOrderId !== undefined, 'Generated new gateway order ID for retry session');
    assert(retrySession.amount === Number(declineOrder.total), 'Retry session preserves original order total');

    // Now complete this retry session with valid signature
    const retriedPayId = `pay_retried_success_${Date.now()}`;
    const retrySig = computeSandboxSignature(retrySession.razorpayOrderId, retriedPayId);

    const retryVerify = await axios.post(
      `${API_URL}/payments/verify`,
      {
        orderId: declineOrder.id,
        razorpayOrderId: retrySession.razorpayOrderId,
        razorpayPaymentId: retriedPayId,
        razorpaySignature: retrySig,
      },
      { headers: authHeaders }
    );
    assert(retryVerify.data?.data?.success === true, 'Retried payment verified successfully');
    assert(retryVerify.data?.data?.order?.status === 'CONFIRMED', 'Order is now CONFIRMED after retry');

    // =========================================================================
    // TEST 8: Switch Payment Method to Cash on Delivery (COD)
    // =========================================================================
    console.log('\n--- TEST 8: Switch Payment Method to COD ---');
    await axios.post(
      `${API_URL}/cart/items`,
      { productId: testProduct.id, quantity: 1 },
      { headers: authHeaders }
    );

    const switchOrder = (
      await axios.post(
        `${API_URL}/orders`,
        { addressId, difmType: 'NO_INSTALLATION', paymentMethod: 'RAZORPAY' },
        { headers: authHeaders }
      )
    ).data?.data;

    // Switch payment method to COD
    const switchRes = await axios.patch(
      `${API_URL}/payments/switch-method/${switchOrder.id}`,
      { paymentMethod: 'CASH_ON_DELIVERY' },
      { headers: authHeaders }
    );

    const switchedOrder = switchRes.data?.data?.order;
    assert(switchedOrder.paymentMethod === 'CASH_ON_DELIVERY', 'Payment method successfully switched to CASH_ON_DELIVERY');
    assert(switchedOrder.status === 'CONFIRMED', 'Switched order status is CONFIRMED');
    assert(switchedOrder.paymentStatus === 'PENDING', 'Payment status is PENDING (COD collection)');

    // =========================================================================
    // TEST 9: Payment Status Polling / Refresh During Payment
    // =========================================================================
    console.log('\n--- TEST 9: Payment Status Polling (Page Refresh Simulation) ---');
    const statusPoll = (await axios.get(`${API_URL}/payments/status/${onlineOrder.id}`, { headers: authHeaders })).data?.data;
    assert(statusPoll.orderId === onlineOrder.id, 'Status check matches order ID');
    assert(statusPoll.paymentStatus === 'CAPTURED', 'Polled status accurately returns CAPTURED');
    assert(statusPoll.razorpayPaymentId === testPaymentId, 'Polled status returns transaction reference');

    // =========================================================================
    // TEST 10: Safe Metadata Verification (Zero Raw Credentials)
    // =========================================================================
    console.log('\n--- TEST 10: Zero Credential Storage Security Audit ---');
    const paymentRecord = statusPoll;
    assert(paymentRecord.cardNumber === undefined, 'No credit/debit card number stored');
    assert(paymentRecord.cvv === undefined, 'No CVV stored');
    assert(paymentRecord.expiryDate === undefined, 'No expiry date stored');
    assert(paymentRecord.pin === undefined, 'No PIN stored');
    assert(paymentRecord.password === undefined, 'No password stored');
    assert(typeof paymentRecord.amount === 'number', 'Safe numeric amount stored');
    assert(typeof (paymentRecord.paymentStatus || paymentRecord.status) === 'string', 'Safe status string stored');
    assert(typeof paymentRecord.razorpayPaymentId === 'string', 'Safe gateway transaction ID stored');

    console.log('\n===========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Fatal test runner error:', error.response?.data || error.message);
    process.exit(1);
  }
}

runPaymentSystemTests();
