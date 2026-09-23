import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  passed: number;
  failed: number;
}

const stats: TestResult = { passed: 0, failed: 0 };

const logPass = (msg: string) => {
  console.log(`  ✓ ${msg}`);
  stats.passed++;
};

const logFail = (msg: string, err: any) => {
  console.error(`  ✗ ${msg}:`, err?.message || err);
  stats.failed++;
};

const check = (condition: boolean, msg: string) => {
  if (condition) {
    logPass(msg);
  } else {
    logFail(msg, new Error('Assertion failed'));
  }
};

const REQUIRED_4W_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Toyota',
  'Kia',
  'Mahindra',
  'Volkswagen',
  'Skoda',
  'Renault',
  'Nissan',
  'MG Motor',
  'Jeep',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Isuzu',
  'Citroen',
];

async function runVehicleSelectorTests() {
  console.log('===============================================================');
  console.log('🚗 PHASE 12: PARTNEXA VEHICLE-SELECTION SUITE');
  console.log('===============================================================\n');

  // Login as demo customer
  let customerToken = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@partsphere.in', password: 'Demo@1234', role: 'CUSTOMER' }),
    });
    const loginData = await loginRes.json();
    customerToken = loginData.data?.accessToken || loginData.data?.tokens?.accessToken || loginData.data?.token || '';
    check(Boolean(customerToken), 'Demo customer authenticated successfully');
  } catch (err) {
    logFail('Login customer failed', err);
  }

  // -----------------------------------------------------------------
  // 1. FOUR-WHEELER MANUFACTURERS (AT LEAST 15-20)
  // -----------------------------------------------------------------
  console.log('\n--- 1. Four-Wheeler Manufacturers Master Data ---');
  let fourWheelerMakes: any[] = [];
  try {
    const res = await fetch(`${BASE_URL}/vehicles/makes?type=4_WHEELER`);
    const data = await res.json();
    fourWheelerMakes = data.data || [];

    check(data.success === true, 'GET /vehicles/makes?type=4_WHEELER returns success 200');
    check(fourWheelerMakes.length >= 20, `4-Wheeler makes count >= 20 (Found: ${fourWheelerMakes.length})`);

    const makeNames = fourWheelerMakes.map((m: any) => m.name);
    for (const reqBrand of REQUIRED_4W_BRANDS) {
      check(makeNames.includes(reqBrand), `Required 4W manufacturer present: "${reqBrand}"`);
    }

    // Verify model count integrity
    const allHaveCount = fourWheelerMakes.every((m: any) => typeof m._count?.models === 'number' && m._count.models > 0);
    check(allHaveCount, 'Every 4-Wheeler make contains a non-zero model count badge');
  } catch (err) {
    logFail('4-Wheeler makes verification failed', err);
  }

  // -----------------------------------------------------------------
  // 2. TWO-WHEELER MANUFACTURERS
  // -----------------------------------------------------------------
  console.log('\n--- 2. Two-Wheeler Manufacturers Master Data ---');
  let twoWheelerMakes: any[] = [];
  try {
    const res = await fetch(`${BASE_URL}/vehicles/makes?type=2_WHEELER`);
    const data = await res.json();
    twoWheelerMakes = data.data || [];

    check(data.success === true, 'GET /vehicles/makes?type=2_WHEELER returns success 200');
    check(twoWheelerMakes.length >= 8, `2-Wheeler makes count >= 8 (Found: ${twoWheelerMakes.length})`);

    const twoWNames = twoWheelerMakes.map((m: any) => m.name);
    const expected2W = ['Hero', 'Bajaj', 'Royal Enfield', 'Yamaha', 'KTM', 'Honda Motorcycles', 'TVS', 'Suzuki'];
    for (const b of expected2W) {
      check(twoWNames.includes(b), `Expected 2W manufacturer present: "${b}"`);
    }
  } catch (err) {
    logFail('2-Wheeler makes verification failed', err);
  }

  // -----------------------------------------------------------------
  // 3. MODEL CASCADE & REALISTIC MODELS
  // -----------------------------------------------------------------
  console.log('\n--- 3. Model Cascade for Key Manufacturers ---');
  try {
    // Maruti Suzuki models
    const marutiMake = fourWheelerMakes.find((m) => m.name === 'Maruti Suzuki');
    assert(marutiMake, 'Maruti Suzuki make must exist');
    const marutiRes = await fetch(`${BASE_URL}/vehicles/makes/${marutiMake.id}/models`);
    const marutiData = await marutiRes.json();
    const marutiModels = (marutiData.data || []).map((m: any) => m.name);

    check(marutiModels.includes('Swift'), 'Maruti includes Swift');
    check(marutiModels.includes('Baleno'), 'Maruti includes Baleno');
    check(marutiModels.includes('Brezza'), 'Maruti includes Brezza');
    check(marutiModels.includes('Dzire'), 'Maruti includes Dzire');
    check(marutiModels.includes('Fronx'), 'Maruti includes Fronx');
    check(marutiModels.includes('Grand Vitara'), 'Maruti includes Grand Vitara');
    check(marutiModels.includes('Ertiga'), 'Maruti includes Ertiga');

    // Hyundai models
    const hyundaiMake = fourWheelerMakes.find((m) => m.name === 'Hyundai');
    assert(hyundaiMake, 'Hyundai make must exist');
    const hyundaiRes = await fetch(`${BASE_URL}/vehicles/makes/${hyundaiMake.id}/models`);
    const hyundaiData = await hyundaiRes.json();
    const hyundaiModels = (hyundaiData.data || []).map((m: any) => m.name);

    check(hyundaiModels.includes('i20'), 'Hyundai includes i20');
    check(hyundaiModels.includes('Creta'), 'Hyundai includes Creta');
    check(hyundaiModels.includes('Venue'), 'Hyundai includes Venue');
    check(hyundaiModels.includes('Verna'), 'Hyundai includes Verna');
    check(hyundaiModels.includes('Exter'), 'Hyundai includes Exter');
    check(hyundaiModels.includes('Tucson'), 'Hyundai includes Tucson');

    // Tata models
    const tataMake = fourWheelerMakes.find((m) => m.name === 'Tata');
    assert(tataMake, 'Tata make must exist');
    const tataRes = await fetch(`${BASE_URL}/vehicles/makes/${tataMake.id}/models`);
    const tataData = await tataRes.json();
    const tataModels = (tataData.data || []).map((m: any) => m.name);

    check(tataModels.includes('Nexon'), 'Tata includes Nexon');
    check(tataModels.includes('Punch'), 'Tata includes Punch');
    check(tataModels.includes('Altroz'), 'Tata includes Altroz');
    check(tataModels.includes('Tiago'), 'Tata includes Tiago');
    check(tataModels.includes('Harrier'), 'Tata includes Harrier');
    check(tataModels.includes('Safari'), 'Tata includes Safari');

    // BMW models
    const bmwMake = fourWheelerMakes.find((m) => m.name === 'BMW');
    assert(bmwMake, 'BMW make must exist');
    const bmwRes = await fetch(`${BASE_URL}/vehicles/makes/${bmwMake.id}/models`);
    const bmwData = await bmwRes.json();
    const bmwModels = (bmwData.data || []).map((m: any) => m.name);
    check(bmwModels.includes('3 Series'), 'BMW includes 3 Series');
    check(bmwModels.includes('X1'), 'BMW includes X1');
    check(bmwModels.includes('X5'), 'BMW includes X5');

    // Mercedes-Benz models
    const mercMake = fourWheelerMakes.find((m) => m.name === 'Mercedes-Benz');
    assert(mercMake, 'Mercedes-Benz make must exist');
    const mercRes = await fetch(`${BASE_URL}/vehicles/makes/${mercMake.id}/models`);
    const mercData = await mercRes.json();
    const mercModels = (mercData.data || []).map((m: any) => m.name);
    check(mercModels.includes('C-Class'), 'Mercedes includes C-Class');
    check(mercModels.includes('GLC'), 'Mercedes includes GLC');

    // Isuzu models
    const isuzuMake = fourWheelerMakes.find((m) => m.name === 'Isuzu');
    assert(isuzuMake, 'Isuzu make must exist');
    const isuzuRes = await fetch(`${BASE_URL}/vehicles/makes/${isuzuMake.id}/models`);
    const isuzuData = await isuzuRes.json();
    const isuzuModels = (isuzuData.data || []).map((m: any) => m.name);
    check(isuzuModels.includes('D-Max V-Cross'), 'Isuzu includes D-Max V-Cross');

    // Citroen models
    const citroenMake = fourWheelerMakes.find((m) => m.name === 'Citroen');
    assert(citroenMake, 'Citroen make must exist');
    const citroenRes = await fetch(`${BASE_URL}/vehicles/makes/${citroenMake.id}/models`);
    const citroenData = await citroenRes.json();
    const citroenModels = (citroenData.data || []).map((m: any) => m.name);
    check(citroenModels.includes('C3'), 'Citroen includes C3');
    check(citroenModels.includes('Basalt'), 'Citroen includes Basalt');
  } catch (err) {
    logFail('Model cascade test failed', err);
  }

  // -----------------------------------------------------------------
  // 4. VARIANT CASCADE & SPECS
  // -----------------------------------------------------------------
  console.log('\n--- 4. Variant Cascade & Detailed Specs ---');
  try {
    const swiftRes = await fetch(`${BASE_URL}/vehicles/models/model-swift/variants`);
    const swiftData = await swiftRes.json();
    const swiftVariants = swiftData.data || [];

    check(swiftVariants.length >= 3, `Swift has >= 3 variants (Found: ${swiftVariants.length})`);
    const zxiPlus = swiftVariants.find((v: any) => v.name.includes('ZXi Plus'));
    check(Boolean(zxiPlus), 'Swift ZXi Plus AMT variant exists');
    check(zxiPlus?.year === 2024, 'Swift ZXi Plus AMT has valid year 2024');
    check(zxiPlus?.fuelType === 'PETROL', 'Swift ZXi Plus AMT is PETROL');
    check(zxiPlus?.engineCC === 1197, 'Swift ZXi Plus AMT has 1197 cc');
    check(zxiPlus?.transmission === 'AUTOMATIC', 'Swift ZXi Plus AMT is AUTOMATIC');

    // Check EV variant (Nexon EV)
    const nexonRes = await fetch(`${BASE_URL}/vehicles/models/model-nexon/variants`);
    const nexonData = await nexonRes.json();
    const nexonVariants = nexonData.data || [];
    const nexonEV = nexonVariants.find((v: any) => v.fuelType === 'ELECTRIC');
    check(Boolean(nexonEV), 'Nexon has genuine ELECTRIC variant');
    check(nexonEV?.transmission === 'AUTOMATIC', 'Nexon EV transmission is AUTOMATIC');

    // Check Diesel variant (Fortuner)
    const fortunerRes = await fetch(`${BASE_URL}/vehicles/models/model-fortuner/variants`);
    const fortunerData = await fortunerRes.json();
    const fortunerVariants = fortunerData.data || [];
    const fortunerDiesel = fortunerVariants.find((v: any) => v.fuelType === 'DIESEL');
    check(Boolean(fortunerDiesel), 'Fortuner has genuine DIESEL variant');
    check(fortunerDiesel?.engineCC === 2755, 'Fortuner Diesel engine is 2755 cc');
  } catch (err) {
    logFail('Variant cascade test failed', err);
  }

  // -----------------------------------------------------------------
  // 5. FITMENT COMPATIBILITY & NO INVALID COMPATIBILITY
  // -----------------------------------------------------------------
  console.log('\n--- 5. Fitment Compatibility Integrity ---');
  try {
    const catalogRes = await fetch(`${BASE_URL}/catalog/products?vehicleVariantId=var-swift-vxi&compatibleOnly=true`);
    const catalogData = await catalogRes.json();
    const products = Array.isArray(catalogData.data) ? catalogData.data : (catalogData.data?.products || []);
    check(products.length > 0, `Compatible products returned for Swift VXi (Count: ${products.length})`);

    // Verify compatible products include automotive parts, not motorcycle chains
    const productTitles = products.map((p: any) => p.name);
    const hasOilOrBrake = productTitles.some((t: string) => t.toLowerCase().includes('oil') || t.toLowerCase().includes('brake') || t.toLowerCase().includes('spark'));
    check(hasOilOrBrake, 'Compatible parts for Swift include appropriate automotive maintenance parts');

    // Attempting to add a verified compatible product with active variant enforcement
    // Bosch Spark Plug is verified compatible with var-swift-vxi
    const addRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: 'prod-bosch-spark',
        quantity: 1,
        vehicleVariantId: 'var-swift-vxi',
        ignoreCompatibility: false,
      }),
    });
    const addData = await addRes.json();
    check(addData.success === true, 'Adding verified compatible part to cart succeeds');

    // Attempting to add an incompatible combination without bypass
    // Motul 7100 Motorcycle Oil is NOT compatible with Swift VXi
    const invalidRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: 'prod-motul-oil',
        quantity: 1,
        vehicleVariantId: 'var-swift-vxi',
        ignoreCompatibility: false,
      }),
    });
    const invalidData = await invalidRes.json();
    check(
      invalidData.success === false || invalidRes.status === 400,
      'Incompatible vehicle variant is safely rejected when ignoreCompatibility is false'
    );
  } catch (err) {
    logFail('Fitment compatibility test failed', err);
  }

  // -----------------------------------------------------------------
  // 6. CUSTOMER GARAGE LIFECYCLE
  // -----------------------------------------------------------------
  console.log('\n--- 6. Customer Garage Operations ---');
  try {
    // Add Swift ZXi Plus to garage
    const addVehRes = await fetch(`${BASE_URL}/vehicles/garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        variantId: 'var-swift-zxi-plus',
        nickname: 'My Test Swift 2024',
        regNumber: 'MH02CB1234',
        isPrimary: true,
      }),
    });
    const addVehData = await addVehRes.json();
    check(addVehData.success === true, 'POST /vehicles/garage added vehicle successfully');
    const createdVehicleId = addVehData.data?.id;

    // Verify in garage list
    const garageRes = await fetch(`${BASE_URL}/vehicles/garage`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const garageData = await garageRes.json();
    const garageList = garageData.data || [];
    const foundVehicle = garageList.find((v: any) => v.id === createdVehicleId);
    check(Boolean(foundVehicle), 'Newly added vehicle is present in customer garage list');
    check(foundVehicle?.nickname === 'My Test Swift 2024', 'Vehicle nickname persisted accurately');
    check(foundVehicle?.regNumber === 'MH02CB1234', 'Vehicle registration number persisted accurately');
    check(foundVehicle?.variant?.name === 'ZXi Plus AMT', 'Vehicle variant populated accurately');
    check(foundVehicle?.variant?.model?.name === 'Swift', 'Vehicle model populated accurately');
    check(foundVehicle?.variant?.model?.make?.name === 'Maruti Suzuki', 'Vehicle make populated accurately');

    // Clean up
    if (createdVehicleId) {
      const delRes = await fetch(`${BASE_URL}/vehicles/garage/${createdVehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const delData = await delRes.json();
      check(delData.success === true, 'DELETE /vehicles/garage/:id removed vehicle cleanly');
    }
  } catch (err) {
    logFail('Garage operations test failed', err);
  }

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`🏁 VEHICLE SELECTOR TEST RESULTS: ${stats.passed} Passed, ${stats.failed} Failed`);
  console.log('===============================================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runVehicleSelectorTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
