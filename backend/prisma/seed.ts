import {
  PrismaClient,
  UserRole,
  UserStatus,
  VehicleType,
  FuelType,
  ProductCondition,
  ProductStatus,
  StockAvailability,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PartSphere (PartNexa) database seed...');

  // ------------------------------------------------------------
  // 1. DEFAULT USERS FOR ALL 4 ROLES
  // ------------------------------------------------------------
  console.log('👤 Creating default users for all 4 roles...');
  const salt = 12;
  const adminPassword = await bcrypt.hash('Admin@1234', salt);
  const demoPassword = await bcrypt.hash('Demo@1234', salt);
  const shopPassword = await bcrypt.hash('Shop@1234', salt);
  const riderPassword = await bcrypt.hash('Rider@1234', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@partsphere.in' },
    update: {},
    create: {
      email: 'admin@partsphere.in',
      password: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      phone: '+919876500001',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'demo@partsphere.in' },
    update: {},
    create: {
      email: 'demo@partsphere.in',
      password: demoPassword,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876500002',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      cart: { create: {} },
      addresses: {
        create: {
          label: 'Home',
          fullName: 'Aarav Sharma',
          phone: '+919876500002',
          line1: 'Flat 402, Green Palms Heights',
          line2: '18th Main Road, 4th Block, HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560102',
          landmark: 'Near BDA Complex',
          isDefault: true,
        },
      },
    },
  });

  const shopOwner1 = await prisma.user.upsert({
    where: { email: 'apex.shop@partsphere.in' },
    update: {},
    create: {
      email: 'apex.shop@partsphere.in',
      password: shopPassword,
      firstName: 'Ramesh',
      lastName: 'Gowda',
      phone: '+919876500003',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const shopOwner2 = await prisma.user.upsert({
    where: { email: 'speedy.shop@partsphere.in' },
    update: {},
    create: {
      email: 'speedy.shop@partsphere.in',
      password: shopPassword,
      firstName: 'Vikram',
      lastName: 'Mehta',
      phone: '+919876500004',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const shopOwner3 = await prisma.user.upsert({
    where: { email: 'sai.clinic@partsphere.in' },
    update: {},
    create: {
      email: 'sai.clinic@partsphere.in',
      password: shopPassword,
      firstName: 'Sunil',
      lastName: 'Verma',
      phone: '+919876500005',
      role: UserRole.SHOP_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const deliveryUser = await prisma.user.upsert({
    where: { email: 'rider.rajesh@partsphere.in' },
    update: {},
    create: {
      email: 'rider.rajesh@partsphere.in',
      password: riderPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+919876500006',
      role: UserRole.DELIVERY_PARTNER,
      status: UserStatus.ACTIVE,
      deliveryPartner: {
        create: {
          vehicleType: 'Bike',
          vehicleNum: 'KA-01-EQ-9876',
          licenseNumber: 'KA-20210009876',
          isOnline: true,
          rating: 4.9,
          totalDeliveries: 342,
        },
      },
    },
  });

  // ------------------------------------------------------------
  // 2. AT LEAST 3 VERIFIED REGIONAL SHOPS
  // ------------------------------------------------------------
  console.log('🏪 Creating verified physical repair & spare parts shops...');
  const shop1 = await prisma.shop.upsert({
    where: { slug: 'apex-auto-care-bangalore' },
    update: {},
    create: {
      ownerId: shopOwner1.id,
      name: 'Apex Auto Care & Spares',
      slug: 'apex-auto-care-bangalore',
      description: 'Authorized Bosch Car Service Centre & Genuine Spares Distributor. Specializing in Diagnostics & Mechanical Overhaul.',
      phone: '+918025551234',
      email: 'contact@apexautocare.in',
      gstNumber: '29ABCDE1234F1Z5',
      addressLine1: '#42, 80 Feet Road, 5th Block',
      addressLine2: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      latitude: 12.9352,
      longitude: 77.6245,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.8,
      totalRatings: 142,
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { slug: 'speedy-wheels-mumbai' },
    update: {},
    create: {
      ownerId: shopOwner2.id,
      name: 'Speedy Wheels Garage & Spares',
      slug: 'speedy-wheels-mumbai',
      description: 'Premier Multi-brand Two & Four Wheeler Service Hub with extensive spare parts warehouse in Western Suburbs.',
      phone: '+912228309876',
      email: 'mumbai@speedywheels.in',
      gstNumber: '27AABCS5678D1Z2',
      addressLine1: 'Unit 12, Industrial Area, M.V. Road',
      addressLine2: 'Chakala, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400099',
      latitude: 19.1136,
      longitude: 72.8697,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.6,
      totalRatings: 98,
    },
  });

  const shop3 = await prisma.shop.upsert({
    where: { slug: 'sai-car-clinic-delhi' },
    update: {},
    create: {
      ownerId: shopOwner3.id,
      name: 'Sai Car Clinic & Genuine Parts',
      slug: 'sai-car-clinic-delhi',
      description: 'Leading North India automotive components supplier and certified DIFM home-visit service provider.',
      phone: '+911143217890',
      email: 'delhi@saicarclinic.in',
      gstNumber: '07AAACS9988C1Z8',
      addressLine1: 'Shop 8-9, Regal Building Complex',
      addressLine2: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
      isVerified: true,
      isActive: true,
      serviceAvailable: true,
      rating: 4.9,
      totalRatings: 210,
    },
  });

  // ------------------------------------------------------------
  // 3. TOP AUTOMOTIVE BRANDS
  // ------------------------------------------------------------
  console.log('🏷️  Creating automotive brands...');
  const brandsData = [
    { name: 'Bosch', slug: 'bosch', isOem: true, country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
    { name: 'Brembo', slug: 'brembo', isOem: true, country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=100' },
    { name: 'Motul', slug: 'motul', isOem: true, country: 'France', logoUrl: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=100' },
    { name: 'Exide', slug: 'exide', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
    { name: 'Amaron', slug: 'amaron', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
    { name: 'Lumax', slug: 'lumax', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
    { name: 'Uno Minda', slug: 'uno-minda', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
    { name: 'Castrol', slug: 'castrol', isOem: false, country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=100' },
  ];

  const brandsMap = new Map();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandsMap.set(b.name, brand);
  }

  // ------------------------------------------------------------
  // 4. VEHICLES (CARS, BIKES, SCOOTERS)
  // ------------------------------------------------------------
  console.log('🚗 Creating vehicles (Cars, Bikes, Scooters)...');
  
  // Makes
  const maruti = await prisma.vehicleMake.upsert({
    where: { name: 'Maruti Suzuki' },
    update: {},
    create: { name: 'Maruti Suzuki', type: VehicleType.CAR },
  });

  const hyundai = await prisma.vehicleMake.upsert({
    where: { name: 'Hyundai' },
    update: {},
    create: { name: 'Hyundai', type: VehicleType.CAR },
  });

  const tata = await prisma.vehicleMake.upsert({
    where: { name: 'Tata' },
    update: {},
    create: { name: 'Tata', type: VehicleType.CAR },
  });

  const hero = await prisma.vehicleMake.upsert({
    where: { name: 'Hero' },
    update: {},
    create: { name: 'Hero', type: VehicleType.BIKE },
  });

  const bajaj = await prisma.vehicleMake.upsert({
    where: { name: 'Bajaj' },
    update: {},
    create: { name: 'Bajaj', type: VehicleType.BIKE },
  });

  const royalEnfield = await prisma.vehicleMake.upsert({
    where: { name: 'Royal Enfield' },
    update: {},
    create: { name: 'Royal Enfield', type: VehicleType.BIKE },
  });

  const hondaBike = await prisma.vehicleMake.upsert({
    where: { name: 'Honda 2-Wheelers' },
    update: {},
    create: { name: 'Honda 2-Wheelers', type: VehicleType.SCOOTER },
  });

  const tvs = await prisma.vehicleMake.upsert({
    where: { name: 'TVS' },
    update: {},
    create: { name: 'TVS', type: VehicleType.SCOOTER },
  });

  // Models & Variants
  // Swift
  const swiftModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: maruti.id, name: 'Swift' } },
    update: {},
    create: { makeId: maruti.id, name: 'Swift', type: VehicleType.CAR },
  });
  const swiftVXi = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: swiftModel.id, name: 'VXi', year: 2022, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: swiftModel.id, name: 'VXi', year: 2022, fuelType: FuelType.PETROL, engineCC: 1197 },
  });
  const swiftZXi = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: swiftModel.id, name: 'ZXi', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: swiftModel.id, name: 'ZXi', year: 2023, fuelType: FuelType.PETROL, engineCC: 1197 },
  });

  // Creta
  const cretaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hyundai.id, name: 'Creta' } },
    update: {},
    create: { makeId: hyundai.id, name: 'Creta', type: VehicleType.CAR },
  });
  const cretaSX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: cretaModel.id, name: 'SX', year: 2022, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: cretaModel.id, name: 'SX', year: 2022, fuelType: FuelType.PETROL, engineCC: 1497 },
  });

  // Nexon
  const nexonModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: tata.id, name: 'Nexon' } },
    update: {},
    create: { makeId: tata.id, name: 'Nexon', type: VehicleType.CAR },
  });
  const nexonCreative = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: nexonModel.id, name: 'Creative', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: nexonModel.id, name: 'Creative', year: 2023, fuelType: FuelType.PETROL, engineCC: 1199 },
  });

  // Splendor Plus
  const splendorModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hero.id, name: 'Splendor Plus' } },
    update: {},
    create: { makeId: hero.id, name: 'Splendor Plus', type: VehicleType.BIKE },
  });
  const splendorDrum = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: splendorModel.id, name: 'Drum Self-Cast', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: splendorModel.id, name: 'Drum Self-Cast', year: 2023, fuelType: FuelType.PETROL, engineCC: 97 },
  });

  // Pulsar 150
  const pulsarModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: bajaj.id, name: 'Pulsar 150' } },
    update: {},
    create: { makeId: bajaj.id, name: 'Pulsar 150', type: VehicleType.BIKE },
  });
  const pulsarTwin = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: pulsarModel.id, name: 'Twin Disc', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: pulsarModel.id, name: 'Twin Disc', year: 2023, fuelType: FuelType.PETROL, engineCC: 149 },
  });

  // Classic 350
  const classicModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: royalEnfield.id, name: 'Classic 350' } },
    update: {},
    create: { makeId: royalEnfield.id, name: 'Classic 350', type: VehicleType.BIKE },
  });
  const classicRe = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: classicModel.id, name: 'Halcyon', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: classicModel.id, name: 'Halcyon', year: 2023, fuelType: FuelType.PETROL, engineCC: 349 },
  });

  // Activa 6G
  const activaModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: hondaBike.id, name: 'Activa 6G' } },
    update: {},
    create: { makeId: hondaBike.id, name: 'Activa 6G', type: VehicleType.SCOOTER },
  });
  const activaStd = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: activaModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: activaModel.id, name: 'Standard', year: 2023, fuelType: FuelType.PETROL, engineCC: 109 },
  });

  // Jupiter
  const jupiterModel = await prisma.vehicleModel.upsert({
    where: { makeId_name: { makeId: tvs.id, name: 'Jupiter' } },
    update: {},
    create: { makeId: tvs.id, name: 'Jupiter', type: VehicleType.SCOOTER },
  });
  const jupiterZX = await prisma.vehicleVariant.upsert({
    where: { modelId_name_year_fuelType: { modelId: jupiterModel.id, name: 'ZX Disc SmartXonnect', year: 2023, fuelType: FuelType.PETROL } },
    update: {},
    create: { modelId: jupiterModel.id, name: 'ZX Disc SmartXonnect', year: 2023, fuelType: FuelType.PETROL, engineCC: 109 },
  });

  // Customer vehicle in garage
  await prisma.customerVehicle.upsert({
    where: { id: 'demo-customer-garage-car-1' },
    update: {},
    create: {
      id: 'demo-customer-garage-car-1',
      userId: customerUser.id,
      variantId: swiftVXi.id,
      nickname: 'My Daily Swift',
      regNumber: 'KA-01-MJ-4321',
      isPrimary: true,
    },
  });

  // ------------------------------------------------------------
  // 5. CATEGORIES
  // ------------------------------------------------------------
  console.log('📦 Creating product categories...');
  const catEngine = await prisma.category.upsert({
    where: { slug: 'engine-parts' },
    update: {},
    create: { name: 'Engine & Ignition', slug: 'engine-parts', sortOrder: 1 },
  });

  const catBraking = await prisma.category.upsert({
    where: { slug: 'braking-system' },
    update: {},
    create: { name: 'Braking System', slug: 'braking-system', sortOrder: 2 },
  });

  const catElectrical = await prisma.category.upsert({
    where: { slug: 'electrical-lighting' },
    update: {},
    create: { name: 'Electrical & Lighting', slug: 'electrical-lighting', sortOrder: 3 },
  });

  const catBatteries = await prisma.category.upsert({
    where: { slug: 'batteries-power' },
    update: {},
    create: { name: 'Batteries & Power', slug: 'batteries-power', sortOrder: 4 },
  });

  const catFluids = await prisma.category.upsert({
    where: { slug: 'oils-lubricants' },
    update: {},
    create: { name: 'Oils & Lubricants', slug: 'oils-lubricants', sortOrder: 5 },
  });

  // ------------------------------------------------------------
  // 6. COMPATIBLE SPARE PARTS & MULTI-SHOP INVENTORY
  // ------------------------------------------------------------
  console.log('🔧 Creating products, specifications & inventory records...');

  const productsToSeed = [
    {
      name: 'Bosch Super 4 Spark Plug FR78X (Set of 4)',
      slug: 'bosch-super-4-spark-plug-fr78x',
      description: 'Bosch Super 4 with 4 ground electrodes and a silver-plated center electrode for maximum ignition reliability and combustion efficiency.',
      sku: 'BOSCH-SP-FR78X',
      partNumber: '0242232502',
      categoryId: catEngine.id,
      brand: 'Bosch',
      brandId: brandsMap.get('Bosch')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 850.0,
      mrp: 999.0,
      weight: 0.25,
      dimensions: '10x8x3',
      tags: ['spark plug', 'ignition', 'bosch', 'engine'],
      images: [
        { url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Electrode Material', value: 'Silver Plated Yttrium', unit: '' },
        { key: 'Thread Size', value: '14mm x 1.25', unit: 'mm' },
        { key: 'Hex Size', value: '16', unit: 'mm' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, cretaSX.id],
      stocks: [
        { shopId: shop1.id, qty: 45, price: 820.0 },
        { shopId: shop2.id, qty: 28, price: 850.0 },
        { shopId: shop3.id, qty: 60, price: 799.0 },
      ],
    },
    {
      name: 'Brembo Ceramic Front Brake Pad Set',
      slug: 'brembo-ceramic-front-brake-pad-set',
      description: 'Ultra-low dust ceramic friction formulation offering exceptional stopping distance, zero brake squeal, and extended rotor longevity.',
      sku: 'BREMBO-BP-P83024',
      partNumber: 'P83024N',
      categoryId: catBraking.id,
      brand: 'Brembo',
      brandId: brandsMap.get('Brembo')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 2850.0,
      mrp: 3400.0,
      weight: 1.6,
      dimensions: '16x10x8',
      tags: ['brake', 'pads', 'ceramic', 'brembo', 'front brake'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Friction Material', value: 'Ceramic Low-Metallic', unit: '' },
        { key: 'Position', value: 'Front Axle', unit: '' },
        { key: 'Wear Indicator', value: 'Acoustic Included', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, cretaSX.id, nexonCreative.id],
      stocks: [
        { shopId: shop1.id, qty: 15, price: 2799.0 },
        { shopId: shop2.id, qty: 22, price: 2850.0 },
        { shopId: shop3.id, qty: 10, price: 2899.0 },
      ],
    },
    {
      name: 'Motul 7100 4T 10W-40 Fully Synthetic Motor Oil (1L)',
      slug: 'motul-7100-4t-10w40-synthetic-1l',
      description: '100% Synthetic 4-Stroke motorcycle engine lubricant with Ester Technology. Meets JASO MA2 specifications for optimum wet clutch performance.',
      sku: 'MOTUL-7100-10W40-1L',
      partNumber: '104099',
      categoryId: catFluids.id,
      brand: 'Motul',
      brandId: brandsMap.get('Motul')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 799.0,
      mrp: 925.0,
      weight: 0.95,
      dimensions: '22x11x7',
      tags: ['engine oil', 'motul', 'synthetic', 'bike oil', '10w40'],
      images: [
        { url: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Viscosity Grade', value: '10W-40', unit: '' },
        { key: 'Standard', value: 'API SN / JASO MA2', unit: '' },
        { key: 'Base Oil', value: '100% Synthetic Ester', unit: '' },
      ],
      compatibleVariantIds: [splendorDrum.id, pulsarTwin.id, classicRe.id],
      stocks: [
        { shopId: shop1.id, qty: 35, price: 780.0 },
        { shopId: shop2.id, qty: 50, price: 799.0 },
        { shopId: shop3.id, qty: 40, price: 770.0 },
      ],
    },
    {
      name: 'Exide Epiq 12V 45Ah Maintenance-Free Car Battery',
      slug: 'exide-epiq-12v-45ah-car-battery',
      description: 'Heavy-duty automotive battery engineered with Special Tetramesh grid technology for extreme heat tolerance and zero water loss.',
      sku: 'EXIDE-EPIQ-45L',
      partNumber: 'EPIQ45L-BH',
      categoryId: catBatteries.id,
      brand: 'Exide',
      brandId: brandsMap.get('Exide')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 5200.0,
      mrp: 5999.0,
      weight: 12.5,
      dimensions: '23x13x22',
      tags: ['battery', 'exide', 'car battery', '12v', 'epiq'],
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Nominal Voltage', value: '12', unit: 'V' },
        { key: 'Rated Capacity', value: '45', unit: 'Ah' },
        { key: 'Warranty Period', value: '72 Months (36F + 36P)', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, cretaSX.id],
      stocks: [
        { shopId: shop1.id, qty: 8, price: 5100.0 },
        { shopId: shop2.id, qty: 12, price: 5200.0 },
        { shopId: shop3.id, qty: 14, price: 4999.0 },
      ],
    },
    {
      name: 'Amaron Pro Rider 12V 4Ah Motorcycle Battery',
      slug: 'amaron-pro-rider-12v-4ah-battery',
      description: 'Valve Regulated Lead Acid (VRLA) battery with revolutionary Silven-X alloy grids. Zero maintenance and vibration resistant for Indian roads.',
      sku: 'AMARON-PR-BTZ5',
      partNumber: 'AAM-PR-0BTZ5',
      categoryId: catBatteries.id,
      brand: 'Amaron',
      brandId: brandsMap.get('Amaron')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1350.0,
      mrp: 1550.0,
      weight: 1.8,
      dimensions: '11x7x10',
      tags: ['battery', 'amaron', 'bike battery', 'activa', 'scooter'],
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Voltage', value: '12', unit: 'V' },
        { key: 'Capacity', value: '4', unit: 'Ah' },
        { key: 'Battery Type', value: 'VRLA Dry Charged', unit: '' },
      ],
      compatibleVariantIds: [activaStd.id, jupiterZX.id, splendorDrum.id, pulsarTwin.id],
      stocks: [
        { shopId: shop1.id, qty: 25, price: 1320.0 },
        { shopId: shop2.id, qty: 30, price: 1350.0 },
        { shopId: shop3.id, qty: 20, price: 1299.0 },
      ],
    },
    {
      name: 'Lumax High-Beam H4 12V LED Headlight Conversion Kit',
      slug: 'lumax-h4-led-headlight-conversion-kit',
      description: '6500K Cool White crystal beam with 8000 Lumens output. Integrated silent active fan and IP68 waterproof aviation aluminum housing.',
      sku: 'LUMAX-LED-H4-65K',
      partNumber: 'LX-H4-8000L',
      categoryId: catElectrical.id,
      brand: 'Lumax',
      brandId: brandsMap.get('Lumax')?.id,
      condition: ProductCondition.GENUINE_NEW,
      basePrice: 1899.0,
      mrp: 2499.0,
      weight: 0.4,
      dimensions: '15x12x6',
      tags: ['headlight', 'led', 'lumax', 'h4', 'bulb', 'lighting'],
      images: [
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600', isPrimary: true },
      ],
      specs: [
        { key: 'Luminous Flux', value: '8000', unit: 'LM' },
        { key: 'Color Temp', value: '6500K Crystal White', unit: '' },
        { key: 'Operating Life', value: '30,000+ Hours', unit: '' },
      ],
      compatibleVariantIds: [swiftVXi.id, swiftZXi.id, activaStd.id, nexonCreative.id],
      stocks: [
        { shopId: shop1.id, qty: 18, price: 1850.0 },
        { shopId: shop2.id, qty: 14, price: 1899.0 },
        { shopId: shop3.id, qty: 25, price: 1799.0 },
      ],
    },
  ];

  for (const item of productsToSeed) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        sku: item.sku,
        partNumber: item.partNumber,
        categoryId: item.categoryId,
        brandId: item.brandId,
        brand: item.brand,
        condition: item.condition,
        basePrice: item.basePrice,
        mrp: item.mrp,
        weight: item.weight,
        dimensions: item.dimensions,
        tags: item.tags,
        status: ProductStatus.ACTIVE,
        images: {
          create: item.images.map((img, idx) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: idx,
          })),
        },
        specifications: {
          create: item.specs.map((sp, idx) => ({
            key: sp.key,
            value: sp.value,
            unit: sp.unit,
            sortOrder: idx,
          })),
        },
      },
    });

    // Compatibility mappings
    for (const vId of item.compatibleVariantIds) {
      await prisma.productCompatibility.upsert({
        where: { productId_variantId: { productId: product.id, variantId: vId } },
        update: {},
        create: { productId: product.id, variantId: vId, notes: 'OEM standard fitment verified' },
      });
    }

    // Shop Inventory stocks
    for (const stk of item.stocks) {
      await prisma.inventory.upsert({
        where: { productId_shopId: { productId: product.id, shopId: stk.shopId } },
        update: {},
        create: {
          productId: product.id,
          shopId: stk.shopId,
          quantity: stk.qty,
          sellingPrice: stk.price,
          availabilityStatus: StockAvailability.IN_STOCK,
          isAvailable: true,
          lowStockThreshold: 5,
        },
      });
    }
  }

  // ------------------------------------------------------------
  // 7. SUBSCRIPTION PLANS & ENTITLEMENTS
  // ------------------------------------------------------------
  console.log('💳 Creating tiered subscription maintenance plans...');
  const planBasic = await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic-roadside-assist' },
    update: {},
    create: {
      name: 'Basic Roadside Assistance',
      slug: 'basic-roadside-assist',
      description: 'Emergency 24/7 on-demand roadside assistance package for cars and bikes.',
      price: 499.0,
      durationDays: 90,
      features: [
        '2 Free emergency tows (up to 25 km)',
        'Doorstep battery jumpstart support',
        'Flat tyre puncture repair service',
        'Emergency fuel delivery (fuel cost extra)',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 2 },
          { featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 3 },
          { featureCode: 'FLAT_TYRE_ASSIST', featureName: 'Flat Tyre Assist', limitValue: 2 },
        ],
      },
    },
  });

  const planSilver = await prisma.subscriptionPlan.upsert({
    where: { slug: 'silver-preventive-care' },
    update: {},
    create: {
      name: 'Silver Preventive Care',
      slug: 'silver-preventive-care',
      description: 'Comprehensive quarterly maintenance & repair discount membership.',
      price: 1499.0,
      durationDays: 180,
      features: [
        'All Basic plan features included',
        '1 Free 40-point computer diagnostic inspection',
        '15% flat discount on labor at verified partner garages',
        'Doorstep wiper & fluid health checkup',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 5 },
          { featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: 1 },
          { featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount', limitValue: 15 },
        ],
      },
    },
  });

  const planGold = await prisma.subscriptionPlan.upsert({
    where: { slug: 'gold-total-vehicle-protection' },
    update: {},
    create: {
      name: 'Gold Total Vehicle Protection',
      slug: 'gold-total-vehicle-protection',
      description: 'Annual VIP vehicle coverage with free scheduled general services and priority DIFM.',
      price: 2999.0,
      durationDays: 365,
      features: [
        'Unlimited 24/7 breakdown towing nationwide',
        '2 Free Periodic General Services (labor included)',
        '20% exclusive discount on genuine spare parts',
        'Dedicated master technician & priority slot booking',
      ],
      isActive: true,
      entitlements: {
        create: [
          { featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', isUnlimited: true },
          { featureCode: 'FREE_GENERAL_SERVICE', featureName: 'Free General Service', limitValue: 2 },
          { featureCode: 'SPARE_PARTS_DISCOUNT_PCT', featureName: 'Parts Discount', limitValue: 20 },
        ],
      },
    },
  });

  // ------------------------------------------------------------
  // 8. SAMPLE REVIEWS & COUPONS
  // ------------------------------------------------------------
  console.log('🏷️  Creating demo coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% instant discount on your first spare parts order',
      discountType: 'PERCENT',
      discountValue: 10.0,
      minOrderValue: 499.0,
      maxDiscount: 200.0,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FREEDIFM' },
    update: {},
    create: {
      code: 'FREEDIFM',
      description: 'Free home visit installation on orders over ₹1,999',
      discountType: 'FLAT',
      discountValue: 199.0,
      minOrderValue: 1999.0,
      isActive: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  Customer:         demo@partsphere.in / Demo@1234');
  console.log('  Admin:            admin@partsphere.in / Admin@1234');
  console.log('  Shop Owner 1:     apex.shop@partsphere.in / Shop@1234');
  console.log('  Shop Owner 2:     speedy.shop@partsphere.in / Shop@1234');
  console.log('  Shop Owner 3:     sai.clinic@partsphere.in / Shop@1234');
  console.log('  Delivery Partner: rider.rajesh@partsphere.in / Rider@1234');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
