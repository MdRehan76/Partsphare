import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const runDiscoveryTests = async () => {
  console.log('====================================================');
  console.log('🔍 RUNNING PARTNEXA PRODUCT DISCOVERY ACCEPTANCE TESTS');
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
    // TEST 1: PRODUCT CATALOG LISTING & PAGINATION
    // ----------------------------------------------------
    console.log('--- TEST 1: Product Catalog Listing & API Pagination ---');
    const listRes = await axios.get(`${API_BASE}/catalog/products?page=1&limit=4`);
    assert(listRes.status === 200, 'GET /catalog/products returns HTTP 200');
    assert(Array.isArray(listRes.data.data), 'Returns products array');
    assert(listRes.data.data.length === 4, 'Respects limit=4 pagination parameter');
    assert(listRes.data.meta?.total > 0, 'Contains pagination meta with total count');
    assert(listRes.data.meta?.page === 1, 'Current page is 1');
    assert(listRes.data.meta?.totalPages >= 2, 'Calculates totalPages correctly');
    assert(listRes.data.meta?.hasNext === true, 'hasNext is true on page 1 of paginated set');

    // Verify all required product card fields are present
    const firstProd = listRes.data.data[0];
    assert(Boolean(firstProd.id && firstProd.name), 'Product has ID and name');
    assert(Boolean(firstProd.brand), 'Product card has Brand');
    assert(Boolean(firstProd.partNumber), 'Product card has Part Number');
    assert(Boolean(firstProd.condition), 'Product card has Condition');
    assert(typeof firstProd.basePrice === 'number', 'Product card has Price');
    assert(typeof firstProd.isAvailable === 'boolean', 'Product card has Availability');
    assert(typeof firstProd.rating === 'number', 'Product card has Rating');
    assert(Boolean(firstProd.warranty), 'Product card has Warranty');

    // Page 2
    const page2Res = await axios.get(`${API_BASE}/catalog/products?page=2&limit=4`);
    assert(page2Res.status === 200, 'Page 2 returns HTTP 200');
    assert(page2Res.data.data.length > 0, 'Page 2 returns subsequent products');
    assert(page2Res.data.data[0].id !== firstProd.id, 'Page 2 products are distinct from Page 1');

    // ----------------------------------------------------
    // TEST 2: SEARCH BY KEYWORD & PART NUMBER
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Product Search ---');
    // Search by product keyword
    const searchSpark = await axios.get(`${API_BASE}/catalog/products?search=Spark`);
    assert(searchSpark.data.data.length > 0, 'Search for "Spark" returns matching products');
    assert(
      searchSpark.data.data.some((p: any) => p.name.includes('Spark Plug')),
      'Result contains Bosch Spark Plug'
    );

    // Search by part number
    const searchPart = await axios.get(`${API_BASE}/catalog/products?search=P54040`);
    assert(searchPart.data.data.length > 0, 'Search by part number "P54040" returns product');
    assert(searchPart.data.data[0].partNumber === 'P54040', 'Matches Brembo brake pads part number');

    // ----------------------------------------------------
    // TEST 3: CATEGORY FILTERING
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Category Filtering ---');
    const categoriesRes = await axios.get(`${API_BASE}/catalog/categories`);
    assert(categoriesRes.status === 200 && categoriesRes.data.data.length > 0, 'Fetched categories tree');
    const brakingCat = categoriesRes.data.data.find((c: any) => c.slug === 'braking-system');
    assert(Boolean(brakingCat), 'Found Braking System category');

    const filteredByCat = await axios.get(`${API_BASE}/catalog/products?categoryId=${brakingCat.id}`);
    assert(filteredByCat.data.data.length > 0, 'Filter by categoryId returns items');
    assert(
      filteredByCat.data.data.every((p: any) => p.category?.id === brakingCat.id),
      'All returned products belong to Braking System'
    );

    // ----------------------------------------------------
    // TEST 4: BRAND FILTERING
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Brand Filtering ---');
    const brandsRes = await axios.get(`${API_BASE}/catalog/brands`);
    assert(brandsRes.status === 200 && brandsRes.data.data.length > 0, 'Fetched brands catalog');
    const boschBrand = brandsRes.data.data.find((b: any) => b.slug === 'bosch');
    assert(Boolean(boschBrand), 'Found Bosch brand');

    const filteredByBrand = await axios.get(`${API_BASE}/catalog/products?brandId=${boschBrand.id}`);
    assert(filteredByBrand.data.data.length > 0, 'Filter by brandId returns items');
    assert(
      filteredByBrand.data.data.every((p: any) => p.brand.toLowerCase() === 'bosch'),
      'All returned products are Bosch brand'
    );

    // ----------------------------------------------------
    // TEST 5: PRICE RANGE FILTERING
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Price Range Filtering ---');
    const priceFiltered = await axios.get(`${API_BASE}/catalog/products?minPrice=500&maxPrice=1000`);
    assert(priceFiltered.data.data.length > 0, 'Price filter 500-1000 returns products');
    assert(
      priceFiltered.data.data.every((p: any) => p.lowestPrice >= 500 && p.lowestPrice <= 1000),
      'All items within 500 to 1000 INR price window'
    );

    // ----------------------------------------------------
    // TEST 6: SORTING
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Product Sorting ---');
    // Sort Price Low to High
    const sortAsc = await axios.get(`${API_BASE}/catalog/products?sortBy=price&sortOrder=asc`);
    const pricesAsc = sortAsc.data.data.map((p: any) => p.basePrice);
    let isSortedAsc = true;
    for (let i = 0; i < pricesAsc.length - 1; i++) {
      if (pricesAsc[i] > pricesAsc[i + 1]) isSortedAsc = false;
    }
    assert(isSortedAsc, 'Sort by price asc orders prices correctly');

    // Sort Price High to Low
    const sortDesc = await axios.get(`${API_BASE}/catalog/products?sortBy=price&sortOrder=desc`);
    const pricesDesc = sortDesc.data.data.map((p: any) => p.basePrice);
    let isSortedDesc = true;
    for (let i = 0; i < pricesDesc.length - 1; i++) {
      if (pricesDesc[i] < pricesDesc[i + 1]) isSortedDesc = false;
    }
    assert(isSortedDesc, 'Sort by price desc orders prices correctly');

    // ----------------------------------------------------
    // TEST 7: VEHICLE COMPATIBILITY RULE & FITMENT FILTERING
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Vehicle Compatibility Rule ---');
    const swiftVariantId = 'var-swift-vxi'; // Maruti Swift VXi

    // 7a: Verify server evaluates isCompatible flag without filtering out incompatible
    const withFitmentRes = await axios.get(`${API_BASE}/catalog/products?vehicleVariantId=${swiftVariantId}`);
    assert(withFitmentRes.status === 200, 'Query with vehicleVariantId returns HTTP 200');
    
    // Spark plug and brake pads fit Swift
    const sparkPlug = withFitmentRes.data.data.find((p: any) => p.slug.includes('spark-plug'));
    const brakePads = withFitmentRes.data.data.find((p: any) => p.slug.includes('brake-pads'));
    // Motul motorcycle oil does NOT fit Maruti Swift (Car)
    const bikeOil = withFitmentRes.data.data.find((p: any) => p.slug.includes('motul-7100'));

    assert(sparkPlug?.isCompatible === true, 'Bosch Spark Plug marked isCompatible: true for Maruti Swift');
    assert(brakePads?.isCompatible === true, 'Brembo Brake Pads marked isCompatible: true for Maruti Swift');
    assert(bikeOil?.isCompatible === false, 'Motul Bike Oil strictly marked isCompatible: false for Maruti Swift');

    // 7b: Query with compatibleOnly=true
    const compatibleOnlyRes = await axios.get(
      `${API_BASE}/catalog/products?vehicleVariantId=${swiftVariantId}&compatibleOnly=true`
    );
    assert(compatibleOnlyRes.data.data.length > 0, 'compatibleOnly=true returns compatible products');
    assert(
      compatibleOnlyRes.data.data.every((p: any) => p.isCompatible === true),
      'Every returned product is confirmed compatible with Maruti Swift'
    );
    assert(
      !compatibleOnlyRes.data.data.some((p: any) => p.slug.includes('motul-7100')),
      'Incompatible motorcycle oil is excluded from compatible-only view'
    );

    // ----------------------------------------------------
    // TEST 8: PRODUCT DETAIL PAGE & VEHICLE COMPATIBILITY
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Product Detail Information & Fitment Check ---');
    const detailRes = await axios.get(
      `${API_BASE}/catalog/products/bosch-super-4-spark-plug-fr78x?variantId=${swiftVariantId}`
    );
    assert(detailRes.status === 200, 'GET /catalog/products/:slug returns HTTP 200');
    const detail = detailRes.data.data;
    assert(detail.slug === 'bosch-super-4-spark-plug-fr78x', 'Returns correct product detail');
    assert(detail.isCompatible === true, 'Product detail confirms compatibility for Swift VXi');
    assert(Array.isArray(detail.images) && detail.images.length > 0, 'Contains product image gallery');
    assert(Array.isArray(detail.specifications) && detail.specifications.length > 0, 'Contains specifications list');
    assert(Array.isArray(detail.compatibleVehicles) && detail.compatibleVehicles.length > 0, 'Contains compatible vehicles');
    assert(Array.isArray(detail.inventories) && detail.inventories.length > 0, 'Contains multi-shop inventory');
    assert(Boolean(detail.inventories[0].shop?.name), 'Includes supplier/shop name');
    assert(Boolean(detail.inventories[0].shop?.city), 'Includes supplier/shop city');
    assert(Boolean(detail.warranty), 'Includes warranty information');
    assert(Array.isArray(detail.reviews), 'Includes customer reviews');

    // ----------------------------------------------------
    // TEST 9: OUT-OF-STOCK PRODUCT HANDLING
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Out-of-Stock Product Handling ---');
    const oosRes = await axios.get(`${API_BASE}/catalog/products/amaron-pro-rider-btz4-motorcycle-battery`);
    assert(oosRes.status === 200, 'Out-of-stock product retrieved successfully');
    assert(oosRes.data.data.isAvailable === false, 'Product correctly marked as isAvailable: false');
    assert(oosRes.data.data.stockQuantity === 0, 'Stock quantity is 0');

    // ----------------------------------------------------
    // TEST 10: INVALID PRODUCT ERROR HANDLING (HTTP 404)
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Invalid Product (HTTP 404) ---');
    try {
      await axios.get(`${API_BASE}/catalog/products/non-existent-product-slug-xyz`);
      assert(false, 'Should throw error for non-existent product');
    } catch (err: any) {
      assert(err.response?.status === 404, 'Non-existent product returns HTTP 404 Not Found');
    }

    console.log('\n====================================================');
    console.log(`🎉 ALL DISCOVERY TESTS PASSED! (${passed} checks passed, 0 failed)`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    if (err.response?.data) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
};

runDiscoveryTests();
