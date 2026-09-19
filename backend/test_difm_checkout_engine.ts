import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}`);
    if (detail !== undefined) {
      console.error(`     Detail:`, detail);
    }
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING DIFM CHECKOUT ENGINE ACCEPTANCE TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Authenticate customer
    console.log('--- Step 1: Customer Authentication & Setup ---');
    const authRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    });
    const token = authRes.data.data.accessToken;
    const client = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(!!token, 'Customer successfully authenticated');

    // 2. Clear cart and add a difficult-to-install product
    console.log('\n--- Step 2: Add Difficult-to-Install Product to Cart ---');
    await client.delete('/cart/clear');

    // Brembo Front Brake Pads Set (Hard difficulty, requiresDIFM: true, baseServiceFee: 499)
    const addBremboRes = await client.post('/cart/items', {
      productId: 'prod-brembo-brakes',
      shopId: 'shop-1',
      quantity: 1,
    });
    assert(addBremboRes.status === 200, 'Brembo Front Brake Pads added to cart');

    const cartRes = await client.get('/cart');
    const items = cartRes.data.data.items;
    assert(items.length === 1, 'Cart has 1 item');
    assert(items[0].product.requiresDIFM === true, 'Product identified as requiresDIFM = true');
    assert(items[0].product.installationDifficulty === 'HARD', 'Product installation difficulty is HARD');

    // 3. Verify Addresses
    console.log('\n--- Step 3: Fetch Delivery Address & Coordinates ---');
    const addrRes = await client.get('/users/addresses');
    const addresses = addrRes.data.data;
    assert(addresses.length >= 1, 'User has saved delivery addresses');
    const selectedAddress = addresses[0];
    assert(!!selectedAddress.pincode, 'Delivery address has valid pincode', selectedAddress.pincode);

    // 4. Test OPTION A: Mechanic comes to customer's home
    console.log('\n--- Step 4: Test OPTION A (Home Doorstep Installation) ---');
    const quoteOptA = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'HOME_INSTALLATION',
    });
    const dataA = quoteOptA.data.data;
    assert(dataA.difm.required === true, 'Quote marks DIFM required = true');
    assert(dataA.difm.selectedType === 'HOME_INSTALLATION', 'Selected type is HOME_INSTALLATION');
    assert(dataA.pricing.baseInstallationFee > 0, 'Option A has positive base installation fee', dataA.pricing.baseInstallationFee);
    assert(dataA.pricing.homeVisitSurcharge > 0, 'Option A has positive distance-based home-visit surcharge', dataA.pricing.homeVisitSurcharge);
    assert(dataA.difm.distanceKm > 0, 'Option A calculates distance in km', dataA.difm.distanceKm);
    assert(!!dataA.difm.assignedShop, 'Option A assigns nearest partnered workshop hub', dataA.difm.assignedShop.name);

    // Total formula check for Option A:
    // Final Price = Part Subtotal + Base Fee + Home Surcharge + Delivery Fee - Discount
    const expectedOptATotal =
      dataA.pricing.partSubtotal +
      dataA.pricing.baseInstallationFee +
      dataA.pricing.homeVisitSurcharge +
      dataA.pricing.deliveryFee -
      dataA.pricing.discount;
    assert(dataA.pricing.grandTotal === expectedOptATotal, 'Option A grand total matches authoritative formula', {
      expected: expectedOptATotal,
      actual: dataA.pricing.grandTotal,
    });

    // 5. Test OPTION B: Customer visits partnered local shop
    console.log('\n--- Step 5: Test OPTION B (Partnered Workshop Fitment) ---');
    const quoteOptB = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'SHOP_INSTALLATION',
    });
    const dataB = quoteOptB.data.data;
    assert(dataB.difm.selectedType === 'SHOP_INSTALLATION', 'Selected type is SHOP_INSTALLATION');
    assert(dataB.pricing.baseInstallationFee === dataA.pricing.baseInstallationFee, 'Option B base installation fee matches Option A base fee');
    assert(dataB.pricing.homeVisitSurcharge === 0, 'Option B has home-visit surcharge = 0');
    assert(dataB.eligibleShops.length >= 1, 'Option B returns list of eligible partnered shops');

    const expectedOptBTotal =
      dataB.pricing.partSubtotal +
      dataB.pricing.baseInstallationFee +
      0 +
      dataB.pricing.deliveryFee -
      dataB.pricing.discount;
    assert(dataB.pricing.grandTotal === expectedOptBTotal, 'Option B grand total matches authoritative formula', {
      expected: expectedOptBTotal,
      actual: dataB.pricing.grandTotal,
    });

    // Acceptance Test: Option A price differs from B
    assert(dataA.pricing.grandTotal !== dataB.pricing.grandTotal, 'Acceptance Test: Option A price differs from Option B');
    assert(
      dataA.pricing.grandTotal === dataB.pricing.grandTotal + dataA.pricing.homeVisitSurcharge,
      'Option A exceeds Option B by exactly the home-visit surcharge',
      { diff: dataA.pricing.grandTotal - dataB.pricing.grandTotal, surcharge: dataA.pricing.homeVisitSurcharge }
    );

    // 6. Test OPTION C: No installation
    console.log('\n--- Step 6: Test OPTION C (No Installation / DIY Delivery) ---');
    const quoteOptC = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'NO_INSTALLATION',
    });
    const dataC = quoteOptC.data.data;
    assert(dataC.difm.selectedType === 'NO_INSTALLATION', 'Selected type is NO_INSTALLATION');

    // Acceptance Test: Option C adds zero installation fee
    assert(dataC.pricing.baseInstallationFee === 0, 'Option C base installation fee === 0');
    assert(dataC.pricing.homeVisitSurcharge === 0, 'Option C home visit surcharge === 0');
    assert(dataC.pricing.installationFee === 0, 'Acceptance Test: Option C adds zero installation fee');

    const expectedOptCTotal =
      dataC.pricing.partSubtotal +
      0 +
      0 +
      dataC.pricing.deliveryFee -
      dataC.pricing.discount;
    assert(dataC.pricing.grandTotal === expectedOptCTotal, 'Option C grand total matches authoritative formula', {
      expected: expectedOptCTotal,
      actual: dataC.pricing.grandTotal,
    });

    // Acceptance Test: Option B price differs from C
    assert(dataB.pricing.grandTotal !== dataC.pricing.grandTotal, 'Acceptance Test: Option B price differs from Option C');
    assert(
      dataB.pricing.grandTotal === dataC.pricing.grandTotal + dataB.pricing.baseInstallationFee,
      'Option B exceeds Option C by exactly the base installation fee',
      { diff: dataB.pricing.grandTotal - dataC.pricing.grandTotal, baseFee: dataB.pricing.baseInstallationFee }
    );

    // Acceptance Test: Changing options changes total
    assert(
      dataA.pricing.grandTotal !== dataB.pricing.grandTotal &&
        dataB.pricing.grandTotal !== dataC.pricing.grandTotal &&
        dataA.pricing.grandTotal !== dataC.pricing.grandTotal,
      'Acceptance Test: Changing options changes total across all three options'
    );

    // 7. Verify complete 6-item Price Breakdown is present
    console.log('\n--- Step 7: Verify Complete Price Breakdown Display Structure ---');
    assert(dataA.pricing.partSubtotal !== undefined, 'Price breakdown displays Part subtotal');
    assert(dataA.pricing.deliveryFee !== undefined, 'Price breakdown displays Delivery fee');
    assert(dataA.pricing.baseInstallationFee !== undefined, 'Price breakdown displays Installation fee');
    assert(dataA.pricing.homeVisitSurcharge !== undefined, 'Price breakdown displays Home-visit fee');
    assert(dataA.pricing.discount !== undefined, 'Price breakdown displays Discount');
    assert(dataA.pricing.grandTotal !== undefined, 'Price breakdown displays Grand total');

    // 8. Test Coupon Recalculation
    console.log('\n--- Step 8: Test Coupon Code Discount Recalculation ---');
    const quoteCoupon = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'HOME_INSTALLATION',
      couponCode: 'PARTS10',
    });
    const dataCoupon = quoteCoupon.data.data;
    assert(dataCoupon.pricing.discount > 0, 'Coupon PARTS10 applies discount', dataCoupon.pricing.discount);
    assert(
      dataCoupon.pricing.grandTotal === dataA.pricing.grandTotal - dataCoupon.pricing.discount,
      'Grand total with coupon is reduced by exactly discount amount'
    );

    // 9. Acceptance Test: Difficult-install product cannot bypass required DIFM selection
    console.log('\n--- Step 9: Acceptance Test: Difficult Product Cannot Bypass DIFM Selection ---');
    let bypassBlocked = false;
    try {
      await client.post('/orders', {
        addressId: selectedAddress.id,
        paymentMethod: 'CASH_ON_DELIVERY',
        // difmType omitted or invalid!
      });
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('require installation selection')) {
        bypassBlocked = true;
      }
    }
    assert(bypassBlocked, 'Acceptance Test: Order placement without DIFM selection is rejected with HTTP 400');

    let invalidTypeBlocked = false;
    try {
      await client.post('/orders', {
        addressId: selectedAddress.id,
        difmType: 'INVALID_TYPE',
        paymentMethod: 'CASH_ON_DELIVERY',
      });
    } catch (err: any) {
      if (err.response?.status === 400) {
        invalidTypeBlocked = true;
      }
    }
    assert(invalidTypeBlocked, 'Order placement with invalid DIFM type is rejected with HTTP 400');

    // 10. Acceptance Test: Customer cannot modify final price (Anti-tampering)
    console.log('\n--- Step 10: Acceptance Test: Anti-Price Tampering Guard ---');
    // Client attempts to send fake totals (e.g. ₹1 total, ₹0 fees)
    const tamperedPayload = {
      addressId: selectedAddress.id,
      difmType: 'HOME_INSTALLATION',
      paymentMethod: 'CASH_ON_DELIVERY',
      total: 1, // Tampered grand total
      subtotal: 1, // Tampered subtotal
      installationFee: 0, // Tampered installation fee
      homeVisitSurcharge: 0, // Tampered surcharge
    };

    const orderRes = await client.post('/orders', tamperedPayload);
    const createdOrder = orderRes.data.data;
    assert(orderRes.status === 201, 'Order created successfully');
    assert(createdOrder.total !== 1, 'Client tampered total of ₹1 was ignored by backend');
    assert(
      createdOrder.total === dataA.pricing.grandTotal,
      'Acceptance Test: Order total strictly equals backend authoritative quote total',
      { orderTotal: createdOrder.total, quoteTotal: dataA.pricing.grandTotal }
    );
    assert(createdOrder.installationFee === dataA.pricing.baseInstallationFee, 'Installation fee saved strictly from backend calculation');
    assert(createdOrder.homeVisitSurcharge === dataA.pricing.homeVisitSurcharge, 'Home visit surcharge saved strictly from backend distance calculation');
    assert(createdOrder.difmType === 'HOME_INSTALLATION', 'DIFM selection stored in order');
    assert(!!createdOrder.difmRequest, 'Order has linked DIFMRequest record created');
    assert(!!createdOrder.difmRequest.shop, 'DIFMRequest has assigned partnered workshop');

    // Verify cart was cleared after order creation
    const postOrderCart = await client.get('/cart');
    assert(postOrderCart.data.data.items.length === 0, 'Customer cart automatically cleared after order creation');

    // 11. Test Order with Option B (Partnered Shop) and specific shop selection
    console.log('\n--- Step 11: Test Order Creation with Option B (Shop Installation) ---');
    // Re-add Bosch spark plug (moderate difficulty)
    await client.post('/cart/items', {
      productId: 'prod-bosch-spark',
      shopId: 'shop-2',
      quantity: 1,
    });

    const quoteOptB2 = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'SHOP_INSTALLATION',
      shopId: 'shop-2',
    });
    const dataB2 = quoteOptB2.data.data;

    const orderResB = await client.post('/orders', {
      addressId: selectedAddress.id,
      difmType: 'SHOP_INSTALLATION',
      shopId: 'shop-2',
      paymentMethod: 'RAZORPAY',
    });
    const createdOrderB = orderResB.data.data;
    assert(createdOrderB.difmType === 'SHOP_INSTALLATION', 'Order DIFM type is SHOP_INSTALLATION');
    assert(createdOrderB.homeVisitSurcharge === 0, 'Option B order has homeVisitSurcharge = 0');
    assert(createdOrderB.total === dataB2.pricing.grandTotal, 'Option B order total matches quote total');
    assert(createdOrderB.difmRequest?.shopId === 'shop-2', 'Specific selected shop assigned to DIFMRequest');

    // 12. Test Order with Option C (No Installation)
    console.log('\n--- Step 12: Test Order Creation with Option C (No Installation) ---');
    // Re-add oil (easy)
    await client.post('/cart/items', {
      productId: 'prod-motul-oil',
      shopId: 'shop-2',
      quantity: 2,
    });

    const quoteOptC2 = await client.post('/orders/checkout-quote', {
      addressId: selectedAddress.id,
      difmType: 'NO_INSTALLATION',
    });
    const dataC2 = quoteOptC2.data.data;

    const orderResC = await client.post('/orders', {
      addressId: selectedAddress.id,
      difmType: 'NO_INSTALLATION',
      paymentMethod: 'CASH_ON_DELIVERY',
    });
    const createdOrderC = orderResC.data.data;
    assert(createdOrderC.difmType === 'NO_INSTALLATION', 'Order DIFM type is NO_INSTALLATION');
    assert(createdOrderC.installationFee === 0, 'Option C order has installationFee = 0');
    assert(createdOrderC.homeVisitSurcharge === 0, 'Option C order has homeVisitSurcharge = 0');
    assert(createdOrderC.total === dataC2.pricing.grandTotal, 'Option C order total matches quote total');

    console.log('\n======================================================');
    console.log(`📊 DIFM ENGINE RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} failed)`);
    console.log('======================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Fatal error during DIFM test execution:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
