import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 STARTING PHASE 3 — DELIVERY PARTNER PORTAL E2E INTEGRATION SUITE\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // ------------------------------------------------------------------------
    // TEST 1: System Health
    // ------------------------------------------------------------------------
    console.log('--- TEST 1: API & Server Health Check ---');
    const health = await axios.get('http://localhost:5000/health');
    assert(health.status === 200 && health.data.success === true, 'Backend health returns 200 OK');

    // ------------------------------------------------------------------------
    // TEST 2: Seed Rider Login & Duty Status
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Seed Rider Authentication & Duty Toggle ---');
    const seedLogin = await axios.post(`${API_BASE}/delivery/login`, {
      email: 'rider.vikram@partsphare.test',
      password: 'Password@123',
    });
    assert(seedLogin.status === 200, 'Seed delivery partner login returns 200');
    assert(seedLogin.data.data.partner.id === 'partner-1', 'Seed partner resolved as partner-1');
    const seedToken = seedLogin.data.data.token;

    // Toggle duty offline then online
    const dutyOff = await axios.put(
      `${API_BASE}/delivery/duty`,
      { isOnline: false },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(dutyOff.data.data.isOnline === false, 'Partner can toggle status to OFFLINE');

    const dutyOn = await axios.put(
      `${API_BASE}/delivery/duty`,
      { isOnline: true },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(dutyOn.data.data.isOnline === true, 'Partner can toggle status to ONLINE');

    // ------------------------------------------------------------------------
    // TEST 3: New Delivery Partner Registration & Initial State
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: New Partner Registration & Activation Lifecycle ---');
    const testRiderEmail = `rider.test${Date.now()}@partsphare.test`;
    const regRes = await axios.post(`${API_BASE}/delivery/register`, {
      firstName: 'Aakash',
      lastName: 'Chopra',
      email: testRiderEmail,
      password: 'Password@123',
      phone: '+91 99887 76655',
      vehicleType: 'Electric Scooter (Ather 450X)',
      vehicleNum: 'KA-03-HA-4412',
      licenseNumber: 'DL-KA03-2023001199',
    });
    assert(regRes.status === 201, 'New delivery partner registered with 201 Created');
    assert(regRes.data.data.partner.verificationStatus === 'PENDING', 'Initial verificationStatus is PENDING');
    assert(regRes.data.data.partner.isActivated === false, 'Partner is initially not activated');
    const newRiderToken = regRes.data.data.token;
    const newRiderId = regRes.data.data.user.id;
    const newPartnerId = regRes.data.data.partner.id;

    // Verify unactivated partner CANNOT go online
    try {
      await axios.put(
        `${API_BASE}/delivery/duty`,
        { isOnline: true },
        { headers: { Authorization: `Bearer ${newRiderToken}` } }
      );
      assert(false, 'Unactivated partner must NOT be allowed to go online');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Unactivated partner going online is blocked with 400 Bad Request');
    }

    // ------------------------------------------------------------------------
    // TEST 4: KYC Document Upload & Submission
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: KYC Upload & Submission Workflow ---');
    const kycInitial = await axios.get(`${API_BASE}/delivery/kyc`, {
      headers: { Authorization: `Bearer ${newRiderToken}` },
    });
    assert(kycInitial.data.data.status === 'NOT_SUBMITTED', 'Initial KYC status is NOT_SUBMITTED');

    // Upload Driving License
    const dlUpload = await axios.post(
      `${API_BASE}/delivery/kyc/document`,
      {
        documentType: 'DRIVING_LICENSE',
        fileUrl: 'https://storage.partsphare.test/kyc/dl_aakash.jpg',
        panNumber: 'ABCDE9876K',
        aadharNumber: 'XXXX-XXXX-4412',
      },
      { headers: { Authorization: `Bearer ${newRiderToken}` } }
    );
    assert(dlUpload.status === 200, 'Driving License document uploaded successfully');

    // Upload Vehicle RC
    const rcUpload = await axios.post(
      `${API_BASE}/delivery/kyc/document`,
      {
        documentType: 'VEHICLE_RC',
        fileUrl: 'https://storage.partsphare.test/kyc/rc_aakash.jpg',
      },
      { headers: { Authorization: `Bearer ${newRiderToken}` } }
    );
    assert(rcUpload.status === 200, 'Vehicle RC document uploaded successfully');

    // Submit KYC for review
    const submitKyc = await axios.post(
      `${API_BASE}/delivery/kyc/submit`,
      {},
      { headers: { Authorization: `Bearer ${newRiderToken}` } }
    );
    assert(submitKyc.data.data.status === 'PENDING', 'KYC status transitioned to PENDING');

    // ------------------------------------------------------------------------
    // TEST 5: Admin Verification & Activation
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Admin Verification & Partner Activation ---');
    const verifyRes = await axios.post(
      `${API_BASE}/delivery/kyc/verify`,
      {
        userId: newRiderId,
        status: 'APPROVED',
      },
      { headers: { Authorization: `Bearer ${newRiderToken}` } }
    );
    assert(verifyRes.data.data.kyc.status === 'APPROVED', 'KYC verified as APPROVED');
    assert(verifyRes.data.data.partner.isActivated === true, 'Partner activated (isActivated: true)');
    assert(verifyRes.data.data.partner.verificationStatus === 'APPROVED', 'Partner verificationStatus is APPROVED');

    // Now partner can go online!
    const dutyNow = await axios.put(
      `${API_BASE}/delivery/duty`,
      { isOnline: true },
      { headers: { Authorization: `Bearer ${newRiderToken}` } }
    );
    assert(dutyNow.data.data.isOnline === true, 'Activated partner successfully went ONLINE');

    // ------------------------------------------------------------------------
    // TEST 6: Available Jobs Query & Job Acceptance
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Job Discovery & Acceptance ---');
    const availableJobsRes = await axios.get(`${API_BASE}/delivery/jobs/available`, {
      headers: { Authorization: `Bearer ${seedToken}` },
    });
    assert(Array.isArray(availableJobsRes.data.data), 'Available jobs returned as array');
    let unassignedJob = availableJobsRes.data.data.find((j: any) => j.status === 'ASSIGNED' && j.deliveryPartnerId === null);
    if (!unassignedJob) {
      const createdRes = await axios.post(
        `${API_BASE}/delivery/jobs`,
        {
          orderNumber: `PN-2026-${Date.now().toString().slice(-5)}`,
          type: 'CUSTOMER_DELIVERY',
          status: 'ASSIGNED',
          deliveryPartnerId: null,
          pickupLocation: { name: 'Apex Auto Care', address: '88, 100 Feet Rd, Indiranagar', phone: '+91 98450 12345' },
          dropLocation: { name: 'Rahul Roy', address: 'Koramangala 4th Block, Bengaluru', phone: '+91 98451 11223' },
          deliveryFee: 140,
          distanceKm: 4.8,
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          codAmountToCollect: 4850,
          items: [{ title: 'Amaron Battery DIN55', quantity: 1, price: 4850 }],
        },
        { headers: { Authorization: `Bearer ${seedToken}` } }
      );
      unassignedJob = createdRes.data.data;
    }
    assert(Boolean(unassignedJob), 'Found unassigned job ready for claiming');

    const targetJobId = unassignedJob.id;

    // Seed rider (Partner A) claims the job
    const acceptRes = await axios.post(
      `${API_BASE}/delivery/jobs/${targetJobId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(acceptRes.data.data.status === 'ACCEPTED', 'Job claimed with status ACCEPTED');
    assert(acceptRes.data.data.deliveryPartnerId === 'partner-1', 'Job assigned to partner-1');

    // ------------------------------------------------------------------------
    // TEST 7: Strict Isolation Access Control
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: STRICT ACCESS CONTROL (Partner Isolation) ---');
    // Partner B (newRiderToken) attempts to access Partner A's claimed job
    try {
      await axios.get(`${API_BASE}/delivery/jobs/${targetJobId}`, {
        headers: { Authorization: `Bearer ${newRiderToken}` },
      });
      assert(false, 'Partner B should NOT be able to view Partner A\'s job');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Partner B viewing Partner A\'s job blocked with 403 Forbidden');
    }

    // Partner B attempts to mutate Partner A's job status
    try {
      await axios.put(
        `${API_BASE}/delivery/jobs/${targetJobId}/status`,
        { status: 'PICKED_UP' },
        { headers: { Authorization: `Bearer ${newRiderToken}` } }
      );
      assert(false, 'Partner B should NOT be able to update Partner A\'s job');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Partner B updating Partner A\'s job blocked with 403 Forbidden');
    }

    // Partner B attempts to collect COD for Partner A's job
    try {
      await axios.post(
        `${API_BASE}/delivery/jobs/${targetJobId}/cod`,
        { amount: 4850 },
        { headers: { Authorization: `Bearer ${newRiderToken}` } }
      );
      assert(false, 'Partner B should NOT be able to collect COD for Partner A\'s job');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Partner B collecting cash for Partner A blocked with 403 Forbidden');
    }

    // ------------------------------------------------------------------------
    // TEST 8: Pickup & Drop Progression & Real-Time Customer Tracking
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8: Pickup / Drop Workflow & Real-Time Tracking ---');
    // 1. Picked Up
    const pickedUpRes = await axios.put(
      `${API_BASE}/delivery/jobs/${targetJobId}/status`,
      { status: 'PICKED_UP', notes: 'Package safely secured in delivery box.' },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(pickedUpRes.data.data.status === 'PICKED_UP', 'Status transitioned to PICKED_UP');
    assert(Boolean(pickedUpRes.data.data.pickedUpAt), 'pickedUpAt timestamp populated');

    // 2. In Transit
    const transitRes = await axios.put(
      `${API_BASE}/delivery/jobs/${targetJobId}/status`,
      { status: 'IN_TRANSIT' },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(transitRes.data.data.status === 'IN_TRANSIT', 'Status transitioned to IN_TRANSIT');

    // 3. Delivered
    const deliveredRes = await axios.put(
      `${API_BASE}/delivery/jobs/${targetJobId}/status`,
      { status: 'DELIVERED', notes: 'Delivered to customer doorstep.' },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(deliveredRes.data.data.status === 'DELIVERED', 'Status transitioned to DELIVERED');
    assert(Boolean(deliveredRes.data.data.deliveredAt), 'deliveredAt timestamp populated');

    // Check that customer order tracking received the real-time update
    const orderId = deliveredRes.data.data.orderId;
    if (orderId) {
      const orderTrackRes = await axios.get(`${API_BASE}/orders/${orderId}/tracking`, {
        headers: { Authorization: `Bearer ${seedToken}` },
      });
      const tracks = orderTrackRes.data.data || [];
      const hasDeliveredTrack = tracks.some((t: any) => t.status === 'DELIVERED');
      assert(hasDeliveredTrack, 'Customer order tracking received real-time DELIVERED update');
    }

    // ------------------------------------------------------------------------
    // TEST 9: Cash on Delivery (COD) Collection & Shop Commission Release
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 9: COD Collection, Order Payment, & Shop Commission Release ---');
    // Collect COD for target job (assign-102 was COD ₹4,850)
    const codRes = await axios.post(
      `${API_BASE}/delivery/jobs/${targetJobId}/cod`,
      { amount: 4850 },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(codRes.data.data.codStatus === 'COLLECTED', 'COD status marked as COLLECTED');
    assert(codRes.data.data.codAmountCollected === 4850, 'codAmountCollected recorded as ₹4,850');

    // Verify cash-in-hand in dashboard
    const dashRes = await axios.get(`${API_BASE}/delivery/dashboard`, {
      headers: { Authorization: `Bearer ${seedToken}` },
    });
    assert(dashRes.data.data.metrics.pendingCashInHand >= 4850, 'Partner dashboard reflects pending cash in hand');

    // ------------------------------------------------------------------------
    // TEST 10: COD Hub Reconciliation & Cash Settlement
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 10: COD Hub Reconciliation & Deposit ---');
    const prevCash = dashRes.data.data.metrics.pendingCashInHand;
    const reconcileRes = await axios.post(
      `${API_BASE}/delivery/reconcile`,
      {
        amount: prevCash,
        hubLocation: 'Indiranagar Central Logistics Hub',
        depositMethod: 'CASH_AT_HUB',
        notes: 'Handover complete and receipt verified.',
      },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(reconcileRes.data.data.reconciliation.status === 'RECONCILED', 'Hub reconciliation status is RECONCILED');
    assert(reconcileRes.data.data.newCashInHand === 0, 'Partner cash in hand cleared to 0 after deposit');

    // ------------------------------------------------------------------------
    // TEST 11: Doorstep Used-Part Verification & Payout Trigger
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 11: Doorstep Used-Part Verification, Condition Grading, & Payout Trigger ---');
    const usedPartJobId = 'assign-103'; // seeded used part pickup job
    const inspectRes = await axios.post(
      `${API_BASE}/delivery/jobs/${usedPartJobId}/verify-used-part`,
      {
        conditionGrade: 'A',
        inspectionChecklist: {
          structureIntegrity: true,
          mountingTabsIntact: true,
          partNumberMatches: true,
          connectorPinsNormal: true,
          cleanlinessAcceptable: true,
        },
        result: 'APPROVED',
        calculatedValuation: 2080,
        notes: 'Tab clips factory intact, verified with seller.',
      },
      { headers: { Authorization: `Bearer ${seedToken}` } }
    );
    assert(inspectRes.data.data.verificationResult === 'APPROVED', 'Verification result is APPROVED');
    assert(inspectRes.data.data.sellerPayoutTriggered === true, 'Seller payout was triggered');
    assert(inspectRes.data.data.inventoryUpdateEventTriggered === true, 'Shop inventory intake manifest created');

    // Verify used part listing status updated to VALUED / PAYOUT_PENDING
    const usedListingRes = await axios.get(`${API_BASE}/usedparts/used_demo_5`);
    assert(usedListingRes.data.data.status === 'VALUED', 'Used part listing status is VALUED');
    assert(usedListingRes.data.data.verificationStatus === 'VERIFIED', 'Used part verificationStatus is VERIFIED');
    assert(usedListingRes.data.data.conditionGrade === 'A', 'Used part conditionGrade is Grade A');

    // ------------------------------------------------------------------------
    // TEST 12: Regression — Customer Portal & Shop Portal Integrity
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 12: Regression Testing (Customer & Shop Portals) ---');
    // Customer catalog check
    const productsRes = await axios.get(`${API_BASE}/catalog/products?limit=5`);
    const prods = Array.isArray(productsRes.data.data) ? productsRes.data.data : productsRes.data.data?.products || [];
    assert(prods.length > 0, 'Customer Catalog endpoint returns products');

    // Customer subscriptions check
    const plansRes = await axios.get(`${API_BASE}/subscriptions/plans`);
    assert(plansRes.data.data.length >= 3, 'Customer Subscriptions endpoint returns plans');

    // Shop Portal dashboard check
    const shopLogin = await axios.post(`${API_BASE}/shops/login`, {
      email: 'apex.auto@partsphare.test',
      password: 'Password@123',
    });
    assert(shopLogin.status === 200, 'Shop Portal login works seamlessly');
    const shopDash = await axios.get(`${API_BASE}/shops/portal/dashboard`, {
      headers: { Authorization: `Bearer ${shopLogin.data.data.token}` },
    });
    assert(shopDash.data.data.shop.name.includes('Apex Auto Care'), 'Shop Portal dashboard intact');
    assert(shopDash.data.data.deliveries.total >= 0, 'Shop Portal deliveries intact');

    console.log('\n============================================================');
    console.log(`🎉 PHASE 3 SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Test suite failed with exception:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTests();
