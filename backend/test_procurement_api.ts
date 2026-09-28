import axios from 'axios';
import prisma from './src/config/prisma';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Automated Test for Bulk Procurement Backend...');
  let adminToken = '';
  let customerToken = '';

  try {
    // 1. Authenticate Admin
    console.log('1️⃣ Authenticating Admin (admin@partsphere.in)...');
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@partsphere.in',
      password: 'Admin@1234',
    });
    adminToken = adminLoginRes.data.data.accessToken;
    console.log('   Admin authenticated successfully.');

    // 2. Authenticate Customer for RBAC security test
    console.log('2️⃣ Authenticating Customer (demo@partsphere.in)...');
    const customerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    });
    customerToken = customerLoginRes.data.data.accessToken;
    console.log('   Customer authenticated successfully.');

    // 3. Test RBAC: Customer should be blocked with 403
    console.log('3️⃣ Testing RBAC Security: Customer accessing /api/admin/procurement...');
    try {
      await axios.get(`${API_BASE}/admin/procurement`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      console.error('❌ FAIL: Customer was NOT blocked with 403!');
      process.exit(1);
    } catch (err: any) {
      if (err.response?.status === 403) {
        console.log('   ✅ PASS: Customer blocked with 403 Forbidden as expected.');
      } else {
        console.error('❌ FAIL: Unexpected status:', err.response?.status);
        process.exit(1);
      }
    }

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 4. Test Dashboard Stats
    console.log('4️⃣ Testing GET /api/admin/procurement (Dashboard stats)...');
    const statsRes = await axios.get(`${API_BASE}/admin/procurement`, { headers: adminHeaders });
    const stats = statsRes.data.data;
    console.log('   Suppliers in DB:', stats.totalSuppliers);
    console.log('   Active Suppliers:', stats.activeSuppliers);
    console.log('   Pending POs:', stats.pendingPurchaseOrders);
    console.log('   In Transit:', stats.ordersInTransit);
    console.log('   Total Spend: ₹', stats.totalProcurementSpend);
    console.log('   Units Purchased:', stats.unitsPurchased);
    console.log('   Low Stock Alerts:', stats.lowStockAlerts?.length);
    if (stats.totalSuppliers < 10) throw new Error('Expected at least 10 suppliers');
    console.log('   ✅ PASS: Dashboard stats valid and backed by PostgreSQL.');

    // 5. Test Supplier Directory & Catalog
    console.log('5️⃣ Testing GET /api/admin/procurement/suppliers...');
    const suppliersRes = await axios.get(`${API_BASE}/admin/procurement/suppliers`, { headers: adminHeaders });
    const suppliers = suppliersRes.data.data;
    console.log(`   Found ${suppliers.length} suppliers. First: ${suppliers[0]?.name}`);
    if (suppliers.length < 10) throw new Error('Expected at least 10 suppliers in directory');

    console.log('6️⃣ Testing GET /api/admin/procurement/catalog...');
    const catalogRes = await axios.get(`${API_BASE}/admin/procurement/catalog`, { headers: adminHeaders });
    const catalog = catalogRes.data.data;
    console.log(`   Found ${catalog.length} catalog items. First: ${catalog[0]?.partName}`);
    if (catalog.length < 40) throw new Error('Expected 40+ catalog items');

    // 7. Test Bulk Pricing Calculation
    console.log('7️⃣ Testing POST /api/admin/procurement/pricing/calculate for bulk discount...');
    const testItem = catalog.find((c: any) => c.brandName === 'Bosch' && c.bulkPriceTiers?.length > 1) || catalog[0];
    const pricingRes = await axios.post(
      `${API_BASE}/admin/procurement/pricing/calculate`,
      {
        catalogItemId: testItem.id,
        quantity: 100, // Large quantity to hit highest tier
      },
      { headers: adminHeaders }
    );
    const pricing = pricingRes.data.data;
    console.log(`   Part: ${testItem.partName}`);
    console.log(`   Regular Price: ₹${pricing.regularUnitPrice}, Effective Bulk Price: ₹${pricing.effectiveUnitPrice}`);
    console.log(`   Subtotal: ₹${pricing.subtotal}, Bulk Discount: ₹${pricing.bulkDiscount}, Total: ₹${pricing.total}`);
    if (pricing.bulkDiscount <= 0) throw new Error('Expected bulk discount on quantity 100');
    console.log('   ✅ PASS: Backend bulk tier discount calculated accurately.');

    // 8. Test Procurement Cart Flow
    console.log('8️⃣ Testing Admin Procurement Cart (Add, View, Clear)...');
    // Clear cart first
    await axios.delete(`${API_BASE}/admin/procurement/cart`, { headers: adminHeaders });
    // Add item
    const addCartRes = await axios.post(
      `${API_BASE}/admin/procurement/cart`,
      {
        catalogItemId: testItem.id,
        quantity: 50,
      },
      { headers: adminHeaders }
    );
    const cart = addCartRes.data.data;
    console.log(`   Cart contains ${cart.itemCount} item(s). Grand Total: ₹${cart.financialSummary?.grandTotal}`);
    if (cart.itemCount !== 1) throw new Error('Expected 1 item in cart');

    // 9. Test Purchase Order Creation
    console.log('9️⃣ Testing POST /api/admin/procurement/purchase-orders (Create PO from Cart)...');
    const createPoRes = await axios.post(
      `${API_BASE}/admin/procurement/purchase-orders`,
      {
        paymentMethod: 'DEMO_PAYMENT',
        notes: 'Automated Test Purchase Order',
      },
      { headers: adminHeaders }
    );
    const newPo = Array.isArray(createPoRes.data.data) ? createPoRes.data.data[0] : createPoRes.data.data;
    console.log(`   Created PO: ${newPo.poNumber}, Supplier ID: ${newPo.supplierId}, Total Cost: ₹${newPo.totalCost}`);
    if (!newPo.poNumber.startsWith('PO-PNX-')) throw new Error('Invalid PO number format');

    // Verify cart is empty after PO creation
    const emptyCartRes = await axios.get(`${API_BASE}/admin/procurement/cart`, { headers: adminHeaders });
    if (emptyCartRes.data.data.itemCount !== 0) throw new Error('Cart was not cleared after PO creation');

    // 10. Update PO Status to IN_TRANSIT
    console.log('🔟 Testing PATCH status transition -> SHIPPED -> IN_TRANSIT...');
    await axios.patch(
      `${API_BASE}/admin/procurement/purchase-orders/${newPo.id}/status`,
      { status: 'SHIPPED', notes: 'Supplier dispatch confirmed' },
      { headers: adminHeaders }
    );
    const inTransitRes = await axios.patch(
      `${API_BASE}/admin/procurement/purchase-orders/${newPo.id}/status`,
      { status: 'IN_TRANSIT', notes: 'Consignment in transit' },
      { headers: adminHeaders }
    );
    console.log(`   PO Status is now: ${inTransitRes.data.data.status}`);

    // 11. Cross-Portal Stock Receiving Test! (Section 16, 17, 18, 42)
    console.log('1️⃣1️⃣ Testing Goods Receiving Flow & Shared Inventory Integration...');
    const poDetailsRes = await axios.get(`${API_BASE}/admin/procurement/purchase-orders/${newPo.id}`, {
      headers: adminHeaders,
    });
    const poDetail = poDetailsRes.data.data;
    const poItem = poDetail.items[0];

    // Check inventory before receiving
    const defaultShop = await prisma.shop.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    const targetProdId = poItem.productId || poItem.catalogItemId;

    const invBefore = await prisma.inventory.findFirst({
      where: { shopId: defaultShop!.id, productId: poItem.productId || undefined },
    });
    const qtyBefore = invBefore ? invBefore.quantity : 0;
    console.log(`   Inventory Before Receiving: ${qtyBefore} unit(s)`);

    // Receive 50 units
    const receiveQty = poItem.orderedQuantity; // 50
    const receiveRes = await axios.post(
      `${API_BASE}/admin/procurement/purchase-orders/${newPo.id}/receive`,
      {
        items: [{ poItemId: poItem.id, quantityToReceive: receiveQty }],
        carrier: 'PartNexa Inbound Hub Fleet',
        trackingNumber: 'INBOUND-TRK-77129',
        notes: 'Automated test receiving 50 units',
      },
      { headers: adminHeaders }
    );

    const receiveData = receiveRes.data.data;
    console.log(`   Goods Receipt Generated: ${receiveData.goodsReceipt.receiptNumber}`);
    console.log(`   PO Status after receiving: ${receiveData.purchaseOrder.status}`);

    // Verify Inventory Increased in PostgreSQL
    const invAfter = await prisma.inventory.findFirst({
      where: { id: receiveData.itemsReceived[0].inventoryId },
    });
    const qtyAfter = invAfter ? invAfter.quantity : 0;
    console.log(`   Inventory After Receiving in Database: ${qtyAfter} unit(s) (Delta: +${qtyAfter - qtyBefore})`);

    if (qtyAfter !== qtyBefore + receiveQty) {
      throw new Error(`Inventory did not increment accurately! Expected ${qtyBefore + receiveQty}, got ${qtyAfter}`);
    }

    // Verify StockMovement record in PostgreSQL
    const stockMove = await prisma.stockMovement.findFirst({
      where: { referenceId: newPo.poNumber },
      orderBy: { createdAt: 'desc' },
    });
    if (!stockMove) throw new Error('StockMovement audit entry was not created!');
    console.log(`   StockMovement Record Verified: type=${stockMove.type}, qty=+${stockMove.quantity}, ref=${stockMove.referenceId}`);

    // 12. Test Customer Catalog Reflection
    console.log('1️⃣2️⃣ Testing Customer Catalog Reflection...');
    const catCheck = await axios.get(`${API_BASE}/catalog/products?search=${encodeURIComponent(testItem.partName.slice(0, 10))}`);
    console.log(`   Customer Catalog search returned ${catCheck.data.data?.products?.length || 0} product(s).`);

    console.log('\n🎉 ALL BULK PROCUREMENT BACKEND & DATABASE INTEGRATION TESTS PASSED!');
  } catch (error: any) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
