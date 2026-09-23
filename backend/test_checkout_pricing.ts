import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function main() {
  console.log('================================================================');
  console.log('🧪 PartNexa Phase 10: Authoritative Checkout Pricing Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Authenticate as Customer
  console.log('1. Authenticating Customer...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'demo@partsphere.in',
    password: 'Demo@1234',
    role: 'CUSTOMER',
  });
  const token = loginRes.data?.data?.accessToken;
  assert(Boolean(token), 'Customer logged in with JWT token');

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // Ensure default address exists
  const addrRes = await axios.get(`${BASE_URL}/users/addresses`, authHeaders);
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
      authHeaders
    );
    addressId = newAddr.data?.data?.id;
  }
  assert(Boolean(addressId), `Customer address resolved: ${addressId}`);

  // Fetch catalog products
  const productsRes = await axios.get(`${BASE_URL}/catalog/products`);
  const products = Array.isArray(productsRes.data?.data)
    ? productsRes.data.data
    : (productsRes.data?.data?.products || []);
  assert(products.length >= 2, `Retrieved ${products.length} catalog products`);

  // Find in-stock products (normal: spark plugs / oil; difficult: brake pads / steering)
  const normalProduct = products.find((p: any) => p.id === 'prod-bosch-spark') || products.find((p: any) => !p.id.includes('oos') && !p.requiresDIFM && p.basePrice > 0) || products[0];
  const difficultProduct = products.find((p: any) => p.id === 'prod-maruti-brake-pads') || products.find((p: any) => !p.id.includes('oos') && (p.requiresDIFM === true || p.installationDifficulty === 'HARD')) || products[1];

  console.log(`  Normal Product: "${normalProduct.name}" (ID: ${normalProduct.id}, Price: ₹${normalProduct.basePrice || normalProduct.sellingPrice})`);
  console.log(`  Difficult Product: "${difficultProduct.name}" (ID: ${difficultProduct.id}, Price: ₹${difficultProduct.basePrice || difficultProduct.sellingPrice})`);

  // ==========================================================================
  // Test 1: Normal Product in Cart -> Grand Total > 0 (NEVER ₹0)
  // ==========================================================================
  console.log('\n2. Testing Normal Product Checkout Quote:');
  await axios.delete(`${BASE_URL}/cart/clear`, authHeaders);
  await axios.post(
    `${BASE_URL}/cart/items`,
    { productId: normalProduct.id, quantity: 1, ignoreCompatibility: true },
    authHeaders
  );

  let quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'NO_INSTALLATION' },
    authHeaders
  );
  let pricing = quoteRes.data?.data?.pricing;

  assert(Boolean(pricing), 'Pricing object returned from checkout quote');
  assert(typeof pricing.partSubtotal === 'number' && pricing.partSubtotal > 0, `partSubtotal > 0 (₹${pricing.partSubtotal})`);
  assert(typeof pricing.deliveryFee === 'number', `deliveryFee present (₹${pricing.deliveryFee})`);
  assert(pricing.installationFee === 0, `DIFM Option C: installationFee is ₹0`);
  assert(pricing.homeVisitSurcharge === 0, `DIFM Option C: homeVisitSurcharge is ₹0`);
  assert(pricing.discount === 0, `No coupon: discount is ₹0`);
  assert(typeof pricing.grandTotal === 'number' && pricing.grandTotal > 0, `grandTotal > 0 (₹${pricing.grandTotal})`);

  // Formula Check: Final Price = Product Subtotal + Delivery Fee + Installation Fee + Home Visit Surcharge - Discount
  const expectedTotal = pricing.partSubtotal + pricing.deliveryFee + pricing.installationFee + pricing.homeVisitSurcharge - pricing.discount;
  assert(pricing.grandTotal === expectedTotal, `Authoritative formula verified: ₹${pricing.grandTotal} === ₹${expectedTotal}`);

  // ==========================================================================
  // Test 2: DIFM Option A changes total (adds installationFee + homeVisitSurcharge)
  // ==========================================================================
  console.log('\n3. Testing DIFM Option A (Home Installation):');
  quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'HOME_INSTALLATION' },
    authHeaders
  );
  const pricingOptionA = quoteRes.data?.data?.pricing;

  assert(pricingOptionA.installationFee > 0, `DIFM Option A: installationFee > 0 (₹${pricingOptionA.installationFee})`);
  assert(pricingOptionA.homeVisitSurcharge > 0, `DIFM Option A: homeVisitSurcharge > 0 (₹${pricingOptionA.homeVisitSurcharge})`);
  assert(pricingOptionA.grandTotal > pricing.grandTotal, `Option A increases total: ₹${pricingOptionA.grandTotal} > ₹${pricing.grandTotal}`);
  
  const expectedTotalA = pricingOptionA.partSubtotal + pricingOptionA.deliveryFee + pricingOptionA.installationFee + pricingOptionA.homeVisitSurcharge - pricingOptionA.discount;
  assert(pricingOptionA.grandTotal === expectedTotalA, `Option A authoritative formula verified: ₹${pricingOptionA.grandTotal} === ₹${expectedTotalA}`);

  // ==========================================================================
  // Test 3: DIFM Option B changes total (adds installationFee, homeVisitSurcharge = 0)
  // ==========================================================================
  console.log('\n4. Testing DIFM Option B (Shop Installation):');
  quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'SHOP_INSTALLATION' },
    authHeaders
  );
  const pricingOptionB = quoteRes.data?.data?.pricing;

  assert(pricingOptionB.installationFee > 0, `DIFM Option B: installationFee > 0 (₹${pricingOptionB.installationFee})`);
  assert(pricingOptionB.homeVisitSurcharge === 0, `DIFM Option B: homeVisitSurcharge is ₹0`);
  assert(pricingOptionB.grandTotal !== pricingOptionA.grandTotal, `Option B total differs from Option A (₹${pricingOptionB.grandTotal} !== ₹${pricingOptionA.grandTotal})`);
  assert(pricingOptionB.grandTotal > pricing.grandTotal, `Option B total is higher than Option C DIY (₹${pricingOptionB.grandTotal} > ₹${pricing.grandTotal})`);

  const expectedTotalB = pricingOptionB.partSubtotal + pricingOptionB.deliveryFee + pricingOptionB.installationFee + pricingOptionB.homeVisitSurcharge - pricingOptionB.discount;
  assert(pricingOptionB.grandTotal === expectedTotalB, `Option B authoritative formula verified: ₹${pricingOptionB.grandTotal} === ₹${expectedTotalB}`);

  // ==========================================================================
  // Test 4: Quantity changes subtotal proportionally
  // ==========================================================================
  console.log('\n5. Testing Quantity Scaling:');
  const cartRes = await axios.get(`${BASE_URL}/cart`, authHeaders);
  const cartItemId = cartRes.data?.data?.items?.[0]?.id;

  await axios.patch(`${BASE_URL}/cart/items/${cartItemId}`, { quantity: 2 }, authHeaders);
  quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'NO_INSTALLATION' },
    authHeaders
  );
  const pricingQty2 = quoteRes.data?.data?.pricing;

  assert(pricingQty2.partSubtotal === pricing.partSubtotal * 2, `Subtotal scaled 2x: ₹${pricingQty2.partSubtotal} === 2 * ₹${pricing.partSubtotal}`);
  assert(pricingQty2.grandTotal > pricing.grandTotal, `Grand total increased with quantity: ₹${pricingQty2.grandTotal} > ₹${pricing.grandTotal}`);

  // Reset quantity back to 1
  await axios.patch(`${BASE_URL}/cart/items/${cartItemId}`, { quantity: 1 }, authHeaders);

  // ==========================================================================
  // Test 5: Coupon Discount changes total (Never makes grand total <= 0)
  // ==========================================================================
  console.log('\n6. Testing Coupon Discount:');
  quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'NO_INSTALLATION', couponCode: 'PARTS10' },
    authHeaders
  );
  const pricingDiscount = quoteRes.data?.data?.pricing;

  assert(pricingDiscount.discount > 0, `Discount applied: ₹${pricingDiscount.discount}`);
  assert(pricingDiscount.grandTotal < pricing.grandTotal, `Discount reduced grand total: ₹${pricingDiscount.grandTotal} < ₹${pricing.grandTotal}`);
  assert(pricingDiscount.grandTotal > 0, `Grand total remains strictly > 0: ₹${pricingDiscount.grandTotal}`);

  // ==========================================================================
  // Test 6: Difficult-Install Product DIFM Handling
  // ==========================================================================
  console.log('\n7. Testing Difficult-Install Product:');
  await axios.delete(`${BASE_URL}/cart/clear`, authHeaders);
  await axios.post(
    `${BASE_URL}/cart/items`,
    { productId: difficultProduct.id, quantity: 1, ignoreCompatibility: true },
    authHeaders
  );

  quoteRes = await axios.post(
    `${BASE_URL}/orders/checkout-quote`,
    { addressId, difmType: 'HOME_INSTALLATION', shopId: 'shop-1' },
    authHeaders
  );
  const difficultPricingA = quoteRes.data?.data?.pricing;
  const difficultSummary = quoteRes.data?.data?.cartSummary;

  assert(difficultSummary.hasDifficultParts === true, 'Cart identified as containing difficult-install part');
  assert(difficultPricingA.installationFee >= 299, `Difficult item installation fee is ₹${difficultPricingA.installationFee} (>= ₹299)`);
  assert(difficultPricingA.grandTotal > 0, `Difficult product grand total > 0 (₹${difficultPricingA.grandTotal})`);

  // ==========================================================================
  // Test 7: Order Creation Recalculates Total Authoritatively on Backend
  // ==========================================================================
  console.log('\n8. Testing Order Creation Authoritative Recalculation:');
  const createOrderPayload = {
    addressId,
    difmType: 'HOME_INSTALLATION',
    shopId: 'shop-1',
    paymentMethod: 'CASH_ON_DELIVERY',
    // Client attempts to manipulate total to ₹0 and fees to ₹0
    subtotal: 0,
    total: 0,
    deliveryFee: 0,
    installationFee: 0,
    homeVisitSurcharge: 0,
    grandTotal: 0,
  };

  const orderRes = await axios.post(`${BASE_URL}/orders`, createOrderPayload, authHeaders);
  const createdOrder = orderRes.data?.data;

  assert(Boolean(createdOrder?.id), `Order created: ${createdOrder?.id} (${createdOrder?.orderNumber})`);
  assert(Number(createdOrder.total) > 0, `Backend ignored manipulated total ₹0! Authoritative total is ₹${createdOrder.total}`);
  assert(Number(createdOrder.total) === difficultPricingA.grandTotal, `Order total matches backend quote: ₹${createdOrder.total} === ₹${difficultPricingA.grandTotal}`);
  assert(Number(createdOrder.subtotal) === difficultPricingA.partSubtotal, `Order subtotal matches: ₹${createdOrder.subtotal} === ₹${difficultPricingA.partSubtotal}`);
  assert(Number(createdOrder.installationFee) === difficultPricingA.installationFee, `Order installationFee matches: ₹${createdOrder.installationFee} === ₹${difficultPricingA.installationFee}`);
  assert(Number(createdOrder.homeVisitSurcharge) === difficultPricingA.homeVisitSurcharge, `Order homeVisitSurcharge matches: ₹${createdOrder.homeVisitSurcharge} === ₹${difficultPricingA.homeVisitSurcharge}`);

  // Verify standardized pricing object on returned order
  assert(Boolean(createdOrder.pricing), 'Order includes standardized pricing object');
  assert(createdOrder.pricing?.grandTotal === difficultPricingA.grandTotal, `order.pricing.grandTotal matches quote: ₹${createdOrder.pricing?.grandTotal}`);

  // ==========================================================================
  // Test 8: Payment Amount Exactly Matches Backend Grand Total
  // ==========================================================================
  console.log('\n9. Testing Payment Creation Authoritative Amount:');
  const paymentOrderRes = await axios.post(
    `${BASE_URL}/payments/create-order`,
    { orderId: createdOrder.id },
    authHeaders
  );
  const paymentSession = paymentOrderRes.data?.data;

  assert(Boolean(paymentSession?.razorpayOrderId), `Gateway order created: ${paymentSession?.razorpayOrderId}`);
  assert(paymentSession.amount === difficultPricingA.grandTotal, `Payment amount ₹${paymentSession.amount} === grandTotal ₹${difficultPricingA.grandTotal}`);
  assert(paymentSession.amountInPaise === difficultPricingA.grandTotal * 100, `Amount in paise matches: ${paymentSession.amountInPaise}`);
  assert(paymentSession.orderSummary?.grandTotal === difficultPricingA.grandTotal, `paymentSession.orderSummary.grandTotal matches: ₹${paymentSession.orderSummary?.grandTotal}`);

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('\n================================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n❌ Unhandled error in test suite:', err.response?.data || err.message);
  process.exit(1);
});
