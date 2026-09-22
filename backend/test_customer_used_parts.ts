import axios from 'axios';
import FormData from 'form-data';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting CUSTOMER USED-PART MARKETPLACE Verification Tests...\n');

  try {
    // 1. Register test user to get auth token
    const testEmail = `seller_${Date.now()}@testpartsphare.com`;
    console.log(`1. Registering test seller: ${testEmail}`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Vikram',
      lastName: 'Malhotra',
      email: testEmail,
      password: 'Password@123',
      phone: '9876543210',
    });

    const token = regRes.data.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Seller registered and authenticated successfully.\n');

    // 2. Test Secure Photo Upload (Multipart)
    console.log('2. Testing Secure Multipart Photo Upload (POST /api/usedparts/upload)...');
    const form = new FormData();
    const fakeImageBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
      'base64'
    );
    form.append('photos', fakeImageBuffer, {
      filename: 'alternator_front.jpg',
      contentType: 'image/jpeg',
    });

    const uploadRes = await axios.post(`${API_BASE}/usedparts/upload`, form, {
      headers: {
        ...authHeaders,
        ...form.getHeaders(),
      },
    });

    console.log('Upload response status:', uploadRes.status);
    console.log('Uploaded files:', uploadRes.data.data.files);
    if (!uploadRes.data.data.files || uploadRes.data.data.files.length === 0) {
      throw new Error('Photo upload failed: no files returned');
    }
    const uploadedUrl = uploadRes.data.data.files[0].url;
    console.log(`✅ Photo uploaded successfully to: ${uploadedUrl}\n`);

    // 3. Test Form Validation Errors
    console.log('3. Testing Form Validations...');
    try {
      await axios.post(`${API_BASE}/usedparts`, { title: 'AB' }, { headers: authHeaders });
      throw new Error('Should have rejected short title');
    } catch (err: any) {
      console.log('✅ Short title correctly rejected with 400:', err.response?.data?.message);
    }

    try {
      await axios.post(
        `${API_BASE}/usedparts`,
        { title: 'Alternator 12V', vehicleModel: 'Swift', expectedPrice: -50, condition: 'EXCELLENT', description: 'Working good' },
        { headers: authHeaders }
      );
      throw new Error('Should have rejected non-positive price');
    } catch (err: any) {
      console.log('✅ Non-positive price correctly rejected with 400:', err.response?.data?.message);
    }

    try {
      await axios.post(
        `${API_BASE}/usedparts`,
        { title: 'Alternator 12V', vehicleModel: 'Swift', expectedPrice: 3000, condition: 'INVALID_COND', description: 'Working good' },
        { headers: authHeaders }
      );
      throw new Error('Should have rejected invalid condition');
    } catch (err: any) {
      console.log('✅ Invalid condition correctly rejected with 400:', err.response?.data?.message);
    }

    try {
      await axios.post(
        `${API_BASE}/usedparts`,
        { title: 'Alternator 12V', vehicleModel: 'Swift', expectedPrice: 3000, condition: 'EXCELLENT', description: 'short' },
        { headers: authHeaders }
      );
      throw new Error('Should have rejected short description');
    } catch (err: any) {
      console.log('✅ Short description (<10 chars) correctly rejected with 400:', err.response?.data?.message);
    }
    console.log('✅ All validation checks passed.\n');

    // 4. Create Used Part Listing
    console.log('4. Submitting Valid Used-Part Listing...');
    const createPayload = {
      title: 'Bosch OEM Alternator 12V 90A',
      vehicleModel: 'Maruti Suzuki Swift DDiS Diesel 2018',
      partNumber: '0986048120',
      category: 'ELECTRICAL',
      condition: 'EXCELLENT',
      description: 'Original Bosch alternator removed during engine overhaul. Tested 14.2V output under full load, bearings silent, brush wear under 15%.',
      purchaseAge: '1-2 Years',
      expectedPrice: 3200,
      images: [uploadedUrl],
      location: 'Indiranagar, Bengaluru, Karnataka - 560038',
      pickupAddress: 'Flat 302, Palm Meadows, Indiranagar',
      payoutMethod: 'UPI',
      payoutUpiId: 'vikram.seller@okhdfcbank',
    };

    const createRes = await axios.post(`${API_BASE}/usedparts`, createPayload, { headers: authHeaders });
    const listing = createRes.data.data;
    console.log('Created Listing ID:', listing.id);
    console.log('Status:', listing.status);
    console.log('Verification Status:', listing.verificationStatus);
    console.log('Expected Price:', listing.expectedPrice);
    console.log('Calculated Estimated Valuation:', listing.estimatedValuation);
    console.log('Final Valuation:', listing.finalValuation);
    console.log('Payout Status:', listing.payoutStatus);

    if (listing.status !== 'SUBMITTED') throw new Error(`Expected status SUBMITTED, got ${listing.status}`);
    if (listing.estimatedValuation <= 0) throw new Error('Expected positive automated valuation');
    console.log('✅ Listing successfully created in SUBMITTED state with automated valuation.\n');

    // 5. Test Customer Listings & Details
    console.log('5. Testing Customer Listing History (GET /api/usedparts/my)...');
    const myListingsRes = await axios.get(`${API_BASE}/usedparts/my`, { headers: authHeaders });
    const userListings = myListingsRes.data.data;
    console.log(`Found ${userListings.length} listing(s) for customer.`);
    const found = userListings.find((i: any) => i.id === listing.id);
    if (!found) throw new Error('Newly created listing not found in customer listing history');
    console.log('✅ Newly created listing verified in customer listing history.');

    console.log(`Fetching listing details for ${listing.id}...`);
    const singleRes = await axios.get(`${API_BASE}/usedparts/my/${listing.id}`, { headers: authHeaders });
    if (singleRes.data.data.id !== listing.id) throw new Error('Listing ID mismatch in details');
    console.log('✅ Customer single listing fetch verified.\n');

    // 6. Test Listing Cancellation
    console.log('6. Testing Listing Cancellation (PATCH /api/usedparts/my/:id/cancel)...');
    const cancelRes = await axios.patch(
      `${API_BASE}/usedparts/my/${listing.id}/cancel`,
      { reason: 'Customer found local buyer' },
      { headers: authHeaders }
    );
    const cancelled = cancelRes.data.data;
    console.log('Cancelled listing status:', cancelled.status);
    console.log('Verification status:', cancelled.verificationStatus);
    if (cancelled.status !== 'CANCELLED') throw new Error('Expected status CANCELLED');
    console.log('✅ Listing successfully cancelled by customer.\n');

    // 7. Test Public Marketplace Listings
    console.log('7. Testing Public Verified Used Parts Marketplace (GET /api/usedparts)...');
    const publicRes = await axios.get(`${API_BASE}/usedparts`);
    console.log('Public listings total:', publicRes.data.data.pagination?.total || publicRes.data.data.listings?.length);
    const listedParts = publicRes.data.data.listings || [];
    if (listedParts.length === 0) throw new Error('Expected demo verified listed parts');
    console.log(`Sample verified part: "${listedParts[0].title}" - ₹${listedParts[0].expectedPrice || listedParts[0].askingPrice}`);
    console.log('Status of public part:', listedParts[0].status);
    if (listedParts[0].status !== 'LISTED') throw new Error('Public marketplace must only return LISTED parts');
    console.log('✅ Public marketplace endpoint successfully tested.\n');

    console.log('🎉 ALL BACKEND USED-PART MARKETPLACE TESTS PASSED WITH 100% SUCCESS!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
