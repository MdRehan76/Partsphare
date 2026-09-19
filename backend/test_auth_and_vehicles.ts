import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING PARTNEXA AUTH & VEHICLE ACCEPTANCE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  };

  try {
    // ----------------------------------------------------
    // TEST 1: REJECT INVALID REGISTRATION INPUTS
    // ----------------------------------------------------
    console.log('--- TEST 1: Input Validation & Rejection ---');

    // 1a: Missing name
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email: 'test@invalid.com',
        password: 'Password@123',
      });
      console.log('Got response instead of error:', res.status, res.data);
      assert(false, 'Should reject missing name');
    } catch (err: any) {
      assert([400, 422].includes(err.response?.status), 'Rejects registration with missing name (HTTP 400/422)');
    }

    // 1b: Invalid email
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password@123',
      });
      assert(false, 'Should reject invalid email');
    } catch (err: any) {
      assert([400, 422].includes(err.response?.status), 'Rejects invalid email format (HTTP 400/422)');
    }

    // 1c: Short password
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
      });
      assert(false, 'Should reject short password');
    } catch (err: any) {
      assert([400, 422].includes(err.response?.status), 'Rejects password shorter than 8 chars (HTTP 400/422)');
    }

    // 1d: Mismatched confirmPassword
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
        confirmPassword: 'DifferentPassword@123',
      });
      assert(false, 'Should reject mismatched passwords');
    } catch (err: any) {
      assert([400, 422].includes(err.response?.status), 'Rejects mismatched confirmPassword (HTTP 400/422)');
    }

    // ----------------------------------------------------
    // TEST 2: SUCCESSFUL REGISTRATION
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Successful Registration ---');
    const timestamp = Date.now();
    const testUser = {
      name: 'Rohan Singhania',
      email: `rohan.${timestamp}@partnexa.in`,
      mobileNumber: '9876543210',
      password: 'StrongP@ssword123',
      confirmPassword: 'StrongP@ssword123',
    };

    const regRes = await axios.post(`${API_BASE}/auth/register`, testUser);
    assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
    assert(Boolean(regRes.data?.data?.accessToken), 'Returns valid accessToken');
    assert(Boolean(regRes.data?.data?.refreshToken), 'Returns valid refreshToken');
    assert(regRes.data?.data?.user?.firstName === 'Rohan', 'Parsed firstName correctly');
    assert(regRes.data?.data?.user?.lastName === 'Singhania', 'Parsed lastName correctly');

    let accessToken = regRes.data.data.accessToken;
    let refreshToken = regRes.data.data.refreshToken;
    const userId = regRes.data.data.user.id;

    // ----------------------------------------------------
    // TEST 3: AUTHENTICATED SESSION CHECK (/auth/me)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Session Authentication & User Profile ---');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert(meRes.status === 200, 'GET /auth/me returns HTTP 200');
    assert(meRes.data.data.email === testUser.email, 'User email matches registered email');
    assert(meRes.data.data.role === 'CUSTOMER', 'Role assigned as CUSTOMER');

    // ----------------------------------------------------
    // TEST 4: TOKEN REFRESH & PERSISTENCE
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Token Rotation & Session Persistence ---');
    const refreshRes = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    assert(refreshRes.status === 200, 'POST /auth/refresh returns HTTP 200');
    assert(Boolean(refreshRes.data.data.accessToken), 'Rotated new accessToken provided');
    assert(Boolean(refreshRes.data.data.refreshToken), 'Rotated new refreshToken provided');

    // Update tokens with new rotated ones
    accessToken = refreshRes.data.data.accessToken;
    refreshToken = refreshRes.data.data.refreshToken;

    // ----------------------------------------------------
    // TEST 5: VEHICLE CATALOG BROWSING
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Master Vehicle Catalog (Makes, Models, Variants) ---');
    // 5a: 4 Wheeler makes
    const carMakesRes = await axios.get(`${API_BASE}/vehicles/makes?type=4_WHEELER`);
    assert(carMakesRes.status === 200 && carMakesRes.data.data.length > 0, 'Fetched 4-Wheeler car makes');
    const carMake = carMakesRes.data.data[0];

    const carModelsRes = await axios.get(`${API_BASE}/vehicles/makes/${carMake.id}/models`);
    assert(carModelsRes.status === 200 && carModelsRes.data.data.length > 0, `Fetched models for ${carMake.name}`);
    const carModel = carModelsRes.data.data[0];

    const carVariantsRes = await axios.get(`${API_BASE}/vehicles/models/${carModel.id}/variants`);
    assert(carVariantsRes.status === 200 && carVariantsRes.data.data.length > 0, `Fetched variants for ${carModel.name}`);
    const carVariant = carVariantsRes.data.data[0];

    // 5b: 2 Wheeler makes
    const bikeMakesRes = await axios.get(`${API_BASE}/vehicles/makes?type=2_WHEELER`);
    assert(bikeMakesRes.status === 200 && bikeMakesRes.data.data.length > 0, 'Fetched 2-Wheeler makes');
    const bikeMake = bikeMakesRes.data.data[0];

    const bikeModelsRes = await axios.get(`${API_BASE}/vehicles/makes/${bikeMake.id}/models`);
    assert(bikeModelsRes.status === 200 && bikeModelsRes.data.data.length > 0, `Fetched models for ${bikeMake.name}`);
    const bikeModel = bikeModelsRes.data.data[0];

    const bikeVariantsRes = await axios.get(`${API_BASE}/vehicles/models/${bikeModel.id}/variants`);
    assert(bikeVariantsRes.status === 200 && bikeVariantsRes.data.data.length > 0, `Fetched variants for ${bikeModel.name}`);
    const bikeVariant = bikeVariantsRes.data.data[0];

    // ----------------------------------------------------
    // TEST 6: POST-REGISTRATION VEHICLE ONBOARDING (ADD PRIMARY)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Add First Vehicle (Primary Onboarding) ---');
    const addCarRes = await axios.post(
      `${API_BASE}/vehicles/garage`,
      {
        variantId: carVariant.id,
        nickname: `Primary ${carMake.name} ${carModel.name}`,
        regNumber: 'KA01AB1234',
        isPrimary: true,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    assert(addCarRes.status === 201, 'POST /vehicles/garage created vehicle (HTTP 201)');
    const carVehicle = addCarRes.data.data;
    assert(carVehicle.isPrimary === true, 'First onboarded vehicle is set as Primary');
    assert(carVehicle.regNumber === 'KA01AB1234', 'Registration number saved correctly');

    // ----------------------------------------------------
    // TEST 7: ADD MULTIPLE VEHICLES
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Add Second Vehicle (2-Wheeler) ---');
    const addBikeRes = await axios.post(
      `${API_BASE}/vehicles/garage`,
      {
        variantId: bikeVariant.id,
        nickname: `Secondary ${bikeMake.name} ${bikeModel.name}`,
        regNumber: 'KA05CD5678',
        isPrimary: false,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    assert(addBikeRes.status === 201, 'Second vehicle added successfully');
    const bikeVehicle = addBikeRes.data.data;
    assert(bikeVehicle.isPrimary === false, 'Second vehicle is not primary');

    // Verify Garage List
    const garageRes = await axios.get(`${API_BASE}/vehicles/garage`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert(garageRes.data.data.length === 2, 'Customer garage now stores multiple (2) vehicles');

    // ----------------------------------------------------
    // TEST 8: SET PRIMARY VEHICLE
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Change Primary Vehicle ---');
    const setPrimaryRes = await axios.patch(
      `${API_BASE}/vehicles/garage/${bikeVehicle.id}/primary`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    assert(setPrimaryRes.status === 200, 'PATCH /garage/:id/primary returns HTTP 200');
    assert(setPrimaryRes.data.data.isPrimary === true, 'Bike vehicle is now Primary');

    // Confirm in Garage List that only 1 vehicle is primary
    const garageAfterPrimary = await axios.get(`${API_BASE}/vehicles/garage`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const primaryCount = garageAfterPrimary.data.data.filter((v: any) => v.isPrimary).length;
    assert(primaryCount === 1, 'Exactly one vehicle is marked as primary');
    assert(garageAfterPrimary.data.data[0].id === bikeVehicle.id, 'Primary vehicle is at the top of the garage');

    // ----------------------------------------------------
    // TEST 9: EDIT VEHICLE DETAILS
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Edit Vehicle Details ---');
    const editRes = await axios.put(
      `${API_BASE}/vehicles/garage/${carVehicle.id}`,
      {
        nickname: 'Updated Swift VXi Tour',
        regNumber: 'KA01AB9999',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    assert(editRes.status === 200, 'PUT /garage/:id returns HTTP 200');
    assert(editRes.data.data.nickname === 'Updated Swift VXi Tour', 'Nickname updated successfully');
    assert(editRes.data.data.regNumber === 'KA01AB9999', 'Registration number updated successfully');

    // ----------------------------------------------------
    // TEST 10: DELETE VEHICLE
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Delete Vehicle ---');
    const deleteRes = await axios.delete(`${API_BASE}/vehicles/garage/${carVehicle.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert(deleteRes.status === 200, 'DELETE /garage/:id returns HTTP 200');

    const garageAfterDelete = await axios.get(`${API_BASE}/vehicles/garage`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert(garageAfterDelete.data.data.length === 1, 'Only 1 vehicle remains after deletion');
    assert(garageAfterDelete.data.data[0].id === bikeVehicle.id, 'Remaining vehicle is the 2-Wheeler');

    // ----------------------------------------------------
    // TEST 11: LOGOUT & TOKEN INVALIDATION
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Logout & Revocation ---');
    const logoutRes = await axios.post(`${API_BASE}/auth/logout`, { refreshToken });
    assert(logoutRes.status === 200, 'POST /auth/logout successfully logs out');

    // Try refreshing with revoked refresh token
    try {
      await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
      assert(false, 'Revoked refresh token should be rejected');
    } catch (err: any) {
      assert(err.response?.status === 401, 'Revoked refresh token returns HTTP 401 Unauthorized');
    }

    // ----------------------------------------------------
    // TEST 12: LOGIN & DATA PERSISTENCE
    // ----------------------------------------------------
    console.log('\n--- TEST 12: Re-login & Verify Persistent Vehicle Data ---');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    assert(loginRes.status === 200, 'Re-login with credentials succeeded (HTTP 200)');
    const newAccessToken = loginRes.data.data.accessToken;

    const persistentGarageRes = await axios.get(`${API_BASE}/vehicles/garage`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert(persistentGarageRes.data.data.length === 1, 'Vehicle data persists across logout & login');
    assert(persistentGarageRes.data.data[0].id === bikeVehicle.id, 'Persisted vehicle matches user primary vehicle');

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED! (${passed} checks passed, 0 failed)`);
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
};

runTests();
