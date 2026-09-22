import prisma from './src/config/prisma';
import * as shopsService from './src/modules/shops/shops.service';
import * as ordersService from './src/modules/orders/orders.service';
import * as cartService from './src/modules/cart/cart.service';
import * as paymentsService from './src/modules/payments/payments.service';

async function runPhase2Verification() {
  console.log('===============================================================');
  console.log('PHASE 2 — LOCAL MECHANICAL SHOP PORTAL VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: SHOP REGISTRATION
    // -------------------------------------------------------------
    console.log('--- TEST 1: Workshop Registration ---');
    const newRegData = {
      name: 'Torque Motors & Auto Garage',
      ownerFirstName: 'Vikram',
      ownerLastName: 'Mehta',
      email: `vikram.mehta.${Date.now()}@torquemotors.test`,
      phone: '+91 98888 12345',
      password: 'Password@123',
      address: '77, Outer Ring Road, Marathahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560037',
      latitude: 12.9569,
      longitude: 77.7011,
      servicesOffered: ['Brake Fitment & Polish', 'Battery Replacement & Diagnostics', 'Doorstep Mechanic Visit'],
      vehicleCategories: ['CAR', 'BIKE', 'SCOOTER'],
      commissionRate: 13,
      operatingHours: '09:00 AM - 09:00 PM',
    };

    const regResult = await shopsService.registerShop(newRegData);
    assert(!!regResult.token, 'Registration returns JWT auth token');
    assert(regResult.shop.name === newRegData.name, 'Shop name saved correctly');
    assert(regResult.shop.commissionRate === 13, 'Configurable commission rate (13%) saved');
    assert(regResult.shop.verificationStatus === 'VERIFIED', 'Verification status is VERIFIED');
    assert(regResult.shop.vehicleCategories.includes('CAR') && regResult.shop.vehicleCategories.includes('BIKE'), 'Vehicle categories saved');

    // -------------------------------------------------------------
    // TEST 2: SHOP LOGIN
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Workshop Login ---');
    const loginResult = await shopsService.loginShop({
      email: 'apex.auto@partsphare.test',
      password: 'Password@123',
    });
    assert(!!loginResult.token, 'Login succeeds for existing demo shop owner');
    assert(loginResult.shop.id === 'shop-1', 'Correct shop-1 (Apex Auto Care) resolved');
    assert(loginResult.user.role === 'SHOP_OWNER', 'User role is SHOP_OWNER');

    const shopOwnerId = loginResult.user.id;

    // -------------------------------------------------------------
    // TEST 3: SHOP DASHBOARD
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Shop Dashboard Metrics ---');
    const dash = await shopsService.getShopDashboard(shopOwnerId);
    assert(dash.jobStatusCounts.total >= 4, 'Dashboard retrieves active job status counts');
    assert(dash.deliveries.total >= 3, 'Dashboard reports incoming product deliveries');
    assert(dash.usedPartsIntake.total >= 2, 'Dashboard reports used part intake queue');
    assert(dash.earnings.releasedForPayout >= 0, 'Dashboard computes released earnings');
    assert(dash.earnings.commissionRate === 12, 'Dashboard reflects shop-1 12% commission rate');

    // -------------------------------------------------------------
    // TEST 4: CUSTOMER DIFM ORDER -> SHOP ASSIGNMENT FLOW
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Customer Checkout -> Shop Assignment Integration ---');
    // Step 4.1: Customer aarav demo user adds DIFM item
    const customerUser = await prisma.user.findUnique({ where: { email: 'demo@partsphere.in' } });
    assert(!!customerUser, 'Demo customer user exists');

    // Add spark plug to cart
    await cartService.addItemToCart(customerUser!.id, { productId: 'prod-bosch-spark', quantity: 2 });
    const cart = await cartService.getCart(customerUser!.id);
    assert(cart.items.length > 0, 'Customer cart populated with DIFM product');

    // Step 4.2: Customer selects Option B (Partnered Shop) and assigns shop-1
    const orderDraft = await ordersService.createOrderDraft(customerUser!.id, {
      addressId: 'addr-demo-home',
      difmType: 'SHOP_INSTALLATION',
      shopId: 'shop-1',
      paymentMethod: 'RAZORPAY' as any,
    });
    assert(!!orderDraft.id, 'Customer order created successfully with DIFM Option B');
    assert(orderDraft.difmRequest?.shopId === 'shop-1', 'Order assigned to shop-1 (Apex Auto Care)');

    // Step 4.3: Simulate payment clearance via Razorpay Sandbox
    const paymentRecord = await prisma.payment.findFirst({ where: { orderId: orderDraft.id } });
    assert(!!paymentRecord, 'Payment record initialized for order');

    const razorpayPaymentId = 'pay_demo_' + Date.now();
    const rzpOrderId = paymentRecord!.razorpayOrderId || 'order_demo_123';
    const razorpaySignature = paymentsService.generateSandboxSignature(rzpOrderId, razorpayPaymentId);

    const paymentVerification = await paymentsService.verifyRazorpayPayment(customerUser!.id, {
      orderId: orderDraft.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    assert(paymentVerification.success, 'Customer payment captured successfully');

    // -------------------------------------------------------------
    // TEST 5: SHOP ACCEPTS -> SERVICE LIFECYCLE -> COMPLETION
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Shop Service Calendar & Job Lifecycle ---');
    // Find the newly assigned job in shop calendar
    const calendarJobs = await shopsService.getServiceCalendar(shopOwnerId, {});
    const customerJob = calendarJobs.find((j: any) => j.orderId === orderDraft.id);
    assert(!!customerJob, 'Assigned customer job appears in shop service calendar');
    assert(customerJob!.status === 'SCHEDULED', 'Initial job status is SCHEDULED');

    // Shop accepts job
    const acceptRes = await shopsService.updateJobStatus(shopOwnerId, customerJob!.id, 'ACCEPTED');
    assert(acceptRes.job.status === 'ACCEPTED', 'Job transitioned to ACCEPTED');

    // Shop starts service
    const inProgRes = await shopsService.updateJobStatus(shopOwnerId, customerJob!.id, 'IN_PROGRESS');
    assert(inProgRes.job.status === 'IN_PROGRESS', 'Job transitioned to IN_PROGRESS');

    // At this stage: payment is PAID, but service is NOT COMPLETED
    // Verify commission is strictly LOCKED
    const ledgerMid = await shopsService.getCommissionLedger(shopOwnerId);
    const commEntryMid = ledgerMid.items.find((c: any) => c.orderId === orderDraft.id);
    assert(
      commEntryMid?.releaseStatus === 'LOCKED_PENDING_COMPLETION',
      'STRICT RULE CHECK 1: Commission is LOCKED while service is still in progress (even though payment cleared)'
    );

    // Shop completes service
    const completeRes = await shopsService.updateJobStatus(
      shopOwnerId,
      customerJob!.id,
      'COMPLETED',
      'Torqued plugs to 25Nm, verified spark gap.'
    );
    assert(completeRes.job.status === 'COMPLETED', 'Job transitioned to COMPLETED');
    assert(
      completeRes.commissionStatus?.releaseStatus === 'RELEASED',
      'STRICT RULE CHECK 2: Commission immediately flips to RELEASED once BOTH service is complete AND payment cleared!'
    );

    // -------------------------------------------------------------
    // TEST 6: COD CASE — SERVICE COMPLETED BUT PAYMENT PENDING
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: COD Case (Service Complete, Payment Pending) ---');
    // Add product and create COD order
    await cartService.addItemToCart(customerUser!.id, { productId: 'prod-bosch-spark', quantity: 1 });
    const codOrder = await ordersService.createOrderDraft(customerUser!.id, {
      addressId: 'addr-demo-home',
      difmType: 'SHOP_INSTALLATION',
      shopId: 'shop-1',
      paymentMethod: 'CASH_ON_DELIVERY' as any,
    });
    assert(codOrder.paymentStatus === 'PENDING', 'COD order has paymentStatus = PENDING');

    const codCalendar = await shopsService.getServiceCalendar(shopOwnerId, {});
    const codJob = codCalendar.find((j: any) => j.orderId === codOrder.id);
    assert(!!codJob, 'COD job appears in shop calendar');

    // Shop completes COD job before collection
    await shopsService.updateJobStatus(shopOwnerId, codJob!.id, 'COMPLETED', 'Done');

    const ledgerCod = await shopsService.getCommissionLedger(shopOwnerId);
    const codCommEntry = ledgerCod.items.find((c: any) => c.orderId === codOrder.id);
    assert(
      codCommEntry?.releaseStatus === 'LOCKED_PENDING_PAYMENT',
      'STRICT RULE CHECK 3: Completed COD job remains LOCKED_PENDING_PAYMENT until cash collection clears!'
    );

    // -------------------------------------------------------------
    // TEST 7: COMMISSION PAYOUT REQUEST
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Commission Payout Request ---');
    const payoutResult = await shopsService.requestCommissionPayout(shopOwnerId);
    assert(payoutResult.success, 'Commission payout request approved');
    assert(payoutResult.totalPayout > 0, 'Disbursed positive payout amount');
    assert(!!payoutResult.payoutRef, `Generated payout reference: ${payoutResult.payoutRef}`);

    // -------------------------------------------------------------
    // TEST 8: INCOMING DELIVERIES & USED-PART INTAKE
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Deliveries & Used Part Intake ---');
    const deliveries = await shopsService.listIncomingDeliveries(shopOwnerId);
    assert(deliveries.length > 0, 'Incoming deliveries list available');

    const receivedDel = await shopsService.receiveDelivery(shopOwnerId, deliveries[0].id, 'Ramesh Desk');
    assert(receivedDel.status === 'DELIVERED', 'Delivery marked as DELIVERED');

    const newIntake = await shopsService.recordUsedPartIntake(shopOwnerId, {
      partTitle: 'OEM Swift Alternator 12V 70A',
      sellerName: 'Vikram Mehta',
      vehicleModel: 'Maruti Swift Diesel',
      physicalCondition: 'GOOD',
      technicalTestStatus: 'PASSED',
      technicianNotes: 'Voltage output 14.1V verified under load.',
    });
    assert(newIntake.technicalTestStatus === 'PASSED', 'Used part intake registered with bench test result');

    // -------------------------------------------------------------
    // TEST 9: SHOP SUPPORT TICKETS
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Support Tickets ---');
    const ticket = await shopsService.createShopTicket(shopOwnerId, {
      category: 'COMMISSION_PAYOUT',
      subject: 'Inquiry regarding payout reference settlement',
      priority: 'MEDIUM',
      message: 'Kindly provide bank transfer reference for batch.',
    });
    assert(!!ticket.id, 'Support ticket created');
    assert(ticket.status === 'OPEN', 'Ticket initial status is OPEN');

    const updatedTicket = await shopsService.addTicketMessage(
      shopOwnerId,
      ticket.id,
      'Follow-up: Bank statement verified, thank you!'
    );
    assert(updatedTicket.messages.length >= 2, 'Message appended to ticket thread');

    // -------------------------------------------------------------
    // TEST 10: CUSTOMER PORTAL REGRESSION CHECK
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Customer Portal Behavior Preserved ---');
    const verifiedShops = await shopsService.listVerifiedShops();
    assert(verifiedShops.length >= 4, 'Verified shops list intact for customer catalog');

    const customerOrders = await ordersService.listCustomerOrders(customerUser!.id);
    assert(customerOrders.length >= 1, 'Customer portal order history intact');

    console.log('\n===============================================================');
    console.log(`PHASE 2 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Phase 2 verification:', error);
    process.exit(1);
  }
}

runPhase2Verification();
