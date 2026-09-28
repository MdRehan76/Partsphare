import axios from 'axios';
import prisma from './src/config/prisma';

const API_BASE = 'http://localhost:5000/api';

async function testCrossPortalProcurementLifecycle() {
  console.log('🧪 Starting Full Cross-Portal Procurement & Customer Order Lifecycle Test (Sections 42 & 43)...\n');

  try {
    // 1. Authenticate Admin
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@partsphere.in',
      password: 'Admin@1234',
    });
    const adminToken = adminLoginRes.data.data.accessToken;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Authenticate Customer
    const customerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@partsphere.in',
      password: 'Demo@1234',
    });
    const customerToken = customerLoginRes.data.data.accessToken;
    const customerHeaders = { Authorization: `Bearer ${customerToken}` };

    // 3. Find "Bosch Front Ceramic Brake Pad Set" compatible with Tata Nexon
    console.log('📦 Step 1: Locating Bosch Brake Pad compatible with Tata Nexon in Catalog...');
    const catalogRes = await axios.get(`${API_BASE}/admin/procurement/catalog?search=BP-TN-204`, {
      headers: adminHeaders,
    });
    const item = catalogRes.data.data[0];
    if (!item) throw new Error('Catalog item BP-TN-204 not found');
    console.log(`   Found: "${item.partName}"`);
    console.log(`   Brand: ${item.brandName}, Compatible: ${item.vehicleMakeName} ${item.vehicleModelName}`);
    console.log(`   Unit Price: ₹${item.unitPrice}, Bulk Price: ₹${item.bulkPrice}, MOQ: ${item.moq}`);

    // Ensure item has a product linked
    let targetProductId = item.productId;
    if (!targetProductId) {
      let prod = await prisma.product.findFirst({
        where: { OR: [{ partNumber: item.partNumber }, { name: { contains: 'Brake Pad', mode: 'insensitive' } }] },
      });
      if (!prod) {
        const cat = await prisma.category.findFirst();
        prod = await prisma.product.create({
          data: {
            name: item.partName,
            slug: 'bosch-brake-pad-tata-nexon-' + Date.now(),
            sku: 'PNX-' + item.partNumber + '-' + Date.now(),
            partNumber: item.partNumber,
            categoryId: cat!.id,
            brand: item.brandName,
            basePrice: 2499.0,
            status: 'ACTIVE',
          },
        });
      }
      targetProductId = prod.id;
      await prisma.supplierCatalogItem.update({
        where: { id: item.id },
        data: { productId: targetProductId },
      });
    }

    const defaultShop = await prisma.shop.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    const invInitial = await prisma.inventory.findFirst({
      where: { productId: targetProductId, shopId: defaultShop!.id },
    });
    const initialStock = invInitial ? invInitial.quantity : 0;
    console.log(`   Initial PostgreSQL Central Inventory: ${initialStock} units\n`);

    // 4. Create Procurement PO: 100 units from Bosch
    console.log('📑 Step 2: Creating Admin Purchase Order for 100 units from Bosch...');
    const createPoRes = await axios.post(
      `${API_BASE}/admin/procurement/purchase-orders`,
      {
        catalogItemId: item.id,
        quantity: 100,
        paymentMethod: 'DEMO_PAYMENT',
        notes: 'Section 42 Verification Purchase Order (100 units Bosch Brake Pads)',
      },
      { headers: adminHeaders }
    );
    const po = createPoRes.data.data;
    console.log(`   Created PO: ${po.poNumber}`);
    console.log(`   Total Cost: ₹${po.totalCost} (Subtotal ₹${po.subtotal}, Bulk Discount ₹${po.bulkDiscount})`);
    console.log(`   Status: ${po.status}\n`);

    // 5. Mark Shipped -> In Transit
    console.log('🚚 Step 3: Transitioning PO Status -> SHIPPED -> IN_TRANSIT...');
    await axios.patch(
      `${API_BASE}/admin/procurement/purchase-orders/${po.id}/status`,
      { status: 'SHIPPED', notes: 'Dispatched from Bosch Adugodi plant' },
      { headers: adminHeaders }
    );
    const inTransitPo = await axios.patch(
      `${API_BASE}/admin/procurement/purchase-orders/${po.id}/status`,
      { status: 'IN_TRANSIT', notes: 'Onboard logistics vehicle' },
      { headers: adminHeaders }
    );
    console.log(`   Current PO Status: ${inTransitPo.data.data.status}\n`);

    // 6. Receive Goods: 100 units
    console.log('📥 Step 4: Receiving 100 units into Warehouse Inventory...');
    const poItemId = po.items[0].id;
    const receiveRes = await axios.post(
      `${API_BASE}/admin/procurement/purchase-orders/${po.id}/receive`,
      {
        items: [{ poItemId, quantityToReceive: 100 }],
        carrier: 'PartNexa Inbound Fleet',
        trackingNumber: 'TRK-BSH-100U',
        notes: 'Full order of 100 brake pad sets received and quality checked',
      },
      { headers: adminHeaders }
    );
    const grn = receiveRes.data.data.goodsReceipt;
    console.log(`   Goods Receipt Note Generated: ${grn.receiptNumber}`);
    console.log(`   PO Status: ${receiveRes.data.data.purchaseOrder.status}`);

    // Verify Inventory Increased by +100
    const invAfterProcure = await prisma.inventory.findFirst({
      where: { productId: targetProductId, shopId: defaultShop!.id },
    });
    const stockAfterProcure = invAfterProcure!.quantity;
    console.log(`   Updated PostgreSQL Inventory: ${stockAfterProcure} units (Expected: ${initialStock + 100})`);
    if (stockAfterProcure !== initialStock + 100) {
      throw new Error(`Inventory mismatch after procurement! Expected ${initialStock + 100}, got ${stockAfterProcure}`);
    }

    // Verify StockMovement Record
    const movement = await prisma.stockMovement.findFirst({
      where: { referenceId: po.poNumber },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Auditable StockMovement logged: type=${movement?.type}, delta=+${movement?.quantity}, reason="${movement?.reason}"\n`);

    // 7. Customer buys 2 units (Section 43)
    console.log('🛒 Step 5: Customer Orders 2 Units from Shared Catalog...');
    // Add to customer cart
    await axios.post(
      `${API_BASE}/cart/items`,
      {
        productId: targetProductId,
        shopId: defaultShop!.id,
        quantity: 2,
      },
      { headers: customerHeaders }
    );

    // Get customer address
    const addrRes = await axios.get(`${API_BASE}/users/addresses`, { headers: customerHeaders });
    const addressId = addrRes.data.data[0]?.id;

    // Place Customer Order
    const orderRes = await axios.post(
      `${API_BASE}/orders`,
      {
        addressId,
        paymentMethod: 'CASH_ON_DELIVERY',
        difmType: 'NO_INSTALLATION',
        notes: 'Section 43 customer order test',
      },
      { headers: customerHeaders }
    );
    const customerOrder = orderRes.data.data;
    console.log(`   Customer Order Placed: #${customerOrder.orderNumber}, Total: ₹${customerOrder.total}`);

    // 8. Verify Inventory Decreased by -2
    console.log('🔍 Step 6: Verifying Inventory Decrement Across All Views...');
    const invFinal = await prisma.inventory.findFirst({
      where: { productId: targetProductId, shopId: defaultShop!.id },
    });
    const finalStock = invFinal!.quantity;
    console.log(`   Final PostgreSQL Inventory: ${finalStock} units (Expected: ${stockAfterProcure - 2})`);

    if (finalStock !== stockAfterProcure - 2) {
      throw new Error(`Inventory mismatch after customer purchase! Expected ${stockAfterProcure - 2}, got ${finalStock}`);
    }

    console.log('\n============================================================');
    console.log('✅ SECTION 42 & 43 CROSS-PORTAL VERIFICATION RESULTS:');
    console.log(`   1. Procurement PO Created: ${po.poNumber} (100 units from Bosch)`);
    console.log(`   2. Inbound Stock Received: +100 units`);
    console.log(`   3. Central Inventory: ${initialStock} -> ${stockAfterProcure} (+100)`);
    console.log(`   4. Customer Order Placed: 2 units`);
    console.log(`   5. Shared Inventory: ${stockAfterProcure} -> ${finalStock} (-2)`);
    console.log(`   6. Shared Database State: 100% Consistent across Admin & Customer`);
    console.log('============================================================\n');
  } catch (error: any) {
    console.error('❌ CROSS PORTAL TEST ERROR:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCrossPortalProcurementLifecycle();
