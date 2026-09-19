/**
 * PartSphere — Database Seed Script
 * Seeds: vehicle makes/models/variants, categories, admin user, sample products
 *
 * Run: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ============================================================
// SEED DATA
// ============================================================

const vehicleData = [
  // CARS
  {
    name: 'Maruti Suzuki', type: 'CAR',
    models: [
      { name: 'Swift', variants: [
        { name: 'LXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'VXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'ZXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'LXi', year: 2022, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'VXi', year: 2022, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'LDi', year: 2022, fuelType: 'DIESEL', engineCC: 1248 },
      ]},
      { name: 'Alto K10', variants: [
        { name: 'Std', year: 2023, fuelType: 'PETROL', engineCC: 998 },
        { name: 'VXi', year: 2023, fuelType: 'PETROL', engineCC: 998 },
        { name: 'VXi (O)', year: 2022, fuelType: 'PETROL', engineCC: 998 },
      ]},
      { name: 'Baleno', variants: [
        { name: 'Sigma', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Delta', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Zeta', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Alpha', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
      ]},
      { name: 'Dzire', variants: [
        { name: 'LXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'VXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'ZXi', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
      ]},
      { name: 'WagonR', variants: [
        { name: 'LXi (1.0)', year: 2023, fuelType: 'PETROL', engineCC: 998 },
        { name: 'VXi (1.2)', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'ZXi (1.2)', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
      ]},
    ],
  },
  {
    name: 'Hyundai', type: 'CAR',
    models: [
      { name: 'i20', variants: [
        { name: 'Magna', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Sportz', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Asta', year: 2023, fuelType: 'PETROL', engineCC: 1197 },
        { name: 'Sportz (Turbo)', year: 2023, fuelType: 'PETROL', engineCC: 998 },
      ]},
      { name: 'Creta', variants: [
        { name: 'E', year: 2023, fuelType: 'PETROL', engineCC: 1497 },
        { name: 'S', year: 2023, fuelType: 'PETROL', engineCC: 1497 },
        { name: 'SX', year: 2023, fuelType: 'DIESEL', engineCC: 1493 },
        { name: 'SX(O)', year: 2023, fuelType: 'DIESEL', engineCC: 1493 },
      ]},
      { name: 'Verna', variants: [
        { name: 'EX', year: 2023, fuelType: 'PETROL', engineCC: 1497 },
        { name: 'S', year: 2023, fuelType: 'PETROL', engineCC: 1497 },
        { name: 'SX', year: 2023, fuelType: 'PETROL', engineCC: 1482 },
      ]},
    ],
  },
  {
    name: 'Tata Motors', type: 'CAR',
    models: [
      { name: 'Nexon', variants: [
        { name: 'XE', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'XM', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'XZ', year: 2023, fuelType: 'DIESEL', engineCC: 1497 },
        { name: 'XZ+ EV', year: 2023, fuelType: 'ELECTRIC', engineCC: null },
      ]},
      { name: 'Punch', variants: [
        { name: 'Pure', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'Adventure', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'Accomplished', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
      ]},
      { name: 'Altroz', variants: [
        { name: 'XE', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'XM', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'XZ', year: 2023, fuelType: 'DIESEL', engineCC: 1497 },
      ]},
    ],
  },
  {
    name: 'Honda', type: 'CAR',
    models: [
      { name: 'City', variants: [
        { name: 'V', year: 2023, fuelType: 'PETROL', engineCC: 1498 },
        { name: 'VX', year: 2023, fuelType: 'PETROL', engineCC: 1498 },
        { name: 'ZX', year: 2023, fuelType: 'PETROL', engineCC: 1498 },
        { name: 'e:HEV', year: 2023, fuelType: 'HYBRID', engineCC: 1498 },
      ]},
      { name: 'Amaze', variants: [
        { name: 'S', year: 2023, fuelType: 'PETROL', engineCC: 1199 },
        { name: 'V', year: 2023, fuelType: 'DIESEL', engineCC: 1498 },
      ]},
    ],
  },
  // BIKES
  {
    name: 'Hero MotoCorp', type: 'BIKE',
    models: [
      { name: 'Splendor Plus', variants: [
        { name: 'Kick', year: 2023, fuelType: 'PETROL', engineCC: 97 },
        { name: 'Self', year: 2023, fuelType: 'PETROL', engineCC: 97 },
        { name: 'XTEC', year: 2023, fuelType: 'PETROL', engineCC: 97 },
      ]},
      { name: 'HF Deluxe', variants: [
        { name: 'Kick', year: 2023, fuelType: 'PETROL', engineCC: 97 },
        { name: 'Self', year: 2023, fuelType: 'PETROL', engineCC: 97 },
      ]},
      { name: 'Passion Pro', variants: [
        { name: 'Drum', year: 2023, fuelType: 'PETROL', engineCC: 113 },
        { name: 'Alloy', year: 2023, fuelType: 'PETROL', engineCC: 113 },
      ]},
    ],
  },
  {
    name: 'Bajaj Auto', type: 'BIKE',
    models: [
      { name: 'Pulsar 150', variants: [
        { name: 'Single Disc', year: 2023, fuelType: 'PETROL', engineCC: 149 },
        { name: 'Twin Disc', year: 2023, fuelType: 'PETROL', engineCC: 149 },
      ]},
      { name: 'Pulsar NS200', variants: [
        { name: 'Standard', year: 2023, fuelType: 'PETROL', engineCC: 199 },
      ]},
      { name: 'CT 110X', variants: [
        { name: 'Drum', year: 2023, fuelType: 'PETROL', engineCC: 115 },
        { name: 'Disc', year: 2023, fuelType: 'PETROL', engineCC: 115 },
      ]},
    ],
  },
  {
    name: 'Royal Enfield', type: 'BIKE',
    models: [
      { name: 'Classic 350', variants: [
        { name: 'Redditch', year: 2023, fuelType: 'PETROL', engineCC: 349 },
        { name: 'Signals', year: 2023, fuelType: 'PETROL', engineCC: 349 },
        { name: 'Chrome', year: 2023, fuelType: 'PETROL', engineCC: 349 },
      ]},
      { name: 'Meteor 350', variants: [
        { name: 'Fireball', year: 2023, fuelType: 'PETROL', engineCC: 349 },
        { name: 'Stellar', year: 2023, fuelType: 'PETROL', engineCC: 349 },
        { name: 'Supernova', year: 2023, fuelType: 'PETROL', engineCC: 349 },
      ]},
    ],
  },
  // SCOOTERS
  {
    name: 'Honda Motorcycle & Scooter', type: 'SCOOTER',
    models: [
      { name: 'Activa 6G', variants: [
        { name: 'Standard', year: 2023, fuelType: 'PETROL', engineCC: 109 },
        { name: 'DLX', year: 2023, fuelType: 'PETROL', engineCC: 109 },
      ]},
      { name: 'Dio', variants: [
        { name: 'DLX', year: 2023, fuelType: 'PETROL', engineCC: 109 },
        { name: 'Sports', year: 2023, fuelType: 'PETROL', engineCC: 109 },
      ]},
    ],
  },
  {
    name: 'TVS', type: 'SCOOTER',
    models: [
      { name: 'Jupiter', variants: [
        { name: 'Classic', year: 2023, fuelType: 'PETROL', engineCC: 109 },
        { name: 'ZX', year: 2023, fuelType: 'PETROL', engineCC: 109 },
      ]},
      { name: 'NTorq 125', variants: [
        { name: 'Race Edition', year: 2023, fuelType: 'PETROL', engineCC: 124 },
        { name: 'Super Squad', year: 2023, fuelType: 'PETROL', engineCC: 124 },
      ]},
      { name: 'iQube Electric', variants: [
        { name: 'S', year: 2023, fuelType: 'ELECTRIC', engineCC: null },
        { name: 'ST', year: 2023, fuelType: 'ELECTRIC', engineCC: null },
      ]},
    ],
  },
];

const categoryData = [
  {
    name: 'Engine Components', slug: 'engine-components', sortOrder: 1,
    children: [
      { name: 'Pistons & Rings', slug: 'pistons-rings', sortOrder: 1 },
      { name: 'Crankshaft', slug: 'crankshaft', sortOrder: 2 },
      { name: 'Valves & Camshaft', slug: 'valves-camshaft', sortOrder: 3 },
      { name: 'Engine Gaskets', slug: 'engine-gaskets', sortOrder: 4 },
      { name: 'Oil Filters', slug: 'oil-filters', sortOrder: 5 },
      { name: 'Air Filters', slug: 'air-filters', sortOrder: 6 },
    ],
  },
  {
    name: 'Brakes & Suspension', slug: 'brakes-suspension', sortOrder: 2,
    children: [
      { name: 'Brake Pads', slug: 'brake-pads', sortOrder: 1 },
      { name: 'Brake Discs', slug: 'brake-discs', sortOrder: 2 },
      { name: 'Shock Absorbers', slug: 'shock-absorbers', sortOrder: 3 },
      { name: 'Brake Cables', slug: 'brake-cables', sortOrder: 4 },
    ],
  },
  {
    name: 'Electrical & Lighting', slug: 'electrical-lighting', sortOrder: 3,
    children: [
      { name: 'Headlights', slug: 'headlights', sortOrder: 1 },
      { name: 'Tail Lights', slug: 'tail-lights', sortOrder: 2 },
      { name: 'Indicators', slug: 'indicators', sortOrder: 3 },
      { name: 'Sensors', slug: 'sensors', sortOrder: 4 },
      { name: 'Wiring Harness', slug: 'wiring-harness', sortOrder: 5 },
      { name: 'Spark Plugs', slug: 'spark-plugs', sortOrder: 6 },
    ],
  },
  {
    name: 'Battery', slug: 'battery', sortOrder: 4,
    children: [
      { name: 'Car Batteries', slug: 'car-batteries', sortOrder: 1 },
      { name: 'Bike Batteries', slug: 'bike-batteries', sortOrder: 2 },
      { name: 'EV Batteries', slug: 'ev-batteries', sortOrder: 3 },
    ],
  },
  {
    name: 'Tyres & Wheels', slug: 'tyres-wheels', sortOrder: 5,
    children: [
      { name: 'Car Tyres', slug: 'car-tyres', sortOrder: 1 },
      { name: 'Bike Tyres', slug: 'bike-tyres', sortOrder: 2 },
      { name: 'Alloy Wheels', slug: 'alloy-wheels', sortOrder: 3 },
      { name: 'Tubes', slug: 'tubes', sortOrder: 4 },
    ],
  },
  {
    name: 'Car Accessories', slug: 'car-accessories', sortOrder: 6,
    children: [
      { name: 'Seat Covers', slug: 'seat-covers', sortOrder: 1 },
      { name: 'Dashboard Accessories', slug: 'dashboard-accessories', sortOrder: 2 },
      { name: 'Car Perfumes', slug: 'car-perfumes', sortOrder: 3 },
      { name: 'Steering Covers', slug: 'steering-covers', sortOrder: 4 },
    ],
  },
  {
    name: 'Music Systems', slug: 'music-systems', sortOrder: 7,
    children: [
      { name: 'Head Units', slug: 'head-units', sortOrder: 1 },
      { name: 'Speakers', slug: 'speakers', sortOrder: 2 },
      { name: 'Subwoofers', slug: 'subwoofers', sortOrder: 3 },
      { name: 'Amplifiers', slug: 'amplifiers', sortOrder: 4 },
    ],
  },
  {
    name: 'Body Parts', slug: 'body-parts', sortOrder: 8,
    children: [
      { name: 'Bumpers', slug: 'bumpers', sortOrder: 1 },
      { name: 'Mirrors', slug: 'mirrors', sortOrder: 2 },
      { name: 'Windshields', slug: 'windshields', sortOrder: 3 },
      { name: 'Door Handles', slug: 'door-handles', sortOrder: 4 },
    ],
  },
  {
    name: 'Transmission', slug: 'transmission', sortOrder: 9,
    children: [
      { name: 'Clutch Plates', slug: 'clutch-plates', sortOrder: 1 },
      { name: 'Gear Box', slug: 'gear-box', sortOrder: 2 },
      { name: 'CV Joints', slug: 'cv-joints', sortOrder: 3 },
      { name: 'Drive Shaft', slug: 'drive-shaft', sortOrder: 4 },
    ],
  },
  {
    name: 'Cooling System', slug: 'cooling-system', sortOrder: 10,
    children: [
      { name: 'Radiators', slug: 'radiators', sortOrder: 1 },
      { name: 'Coolant', slug: 'coolant', sortOrder: 2 },
      { name: 'Thermostat', slug: 'thermostat', sortOrder: 3 },
      { name: 'Water Pump', slug: 'water-pump', sortOrder: 4 },
    ],
  },
];

// Sample products (will be linked to first few categories)
const sampleProducts = [
  {
    name: 'Bosch AF-1000 Air Filter — Maruti Swift Compatible',
    slug: 'bosch-af1000-air-filter-maruti-swift',
    sku: 'PS-BOSCH-AF1000',
    description: 'High-performance OEM-grade air filter for Maruti Swift 1.2L Petrol (2018-2023). Prevents dust, debris, and contaminants from entering the engine. Extended service life of 15,000 km.',
    brand: 'Bosch',
    partNumber: 'AF-1000-MS',
    condition: 'GENUINE_NEW',
    basePrice: 850,
    mrp: 1100,
    weight: 0.35,
    tags: ['air filter', 'swift', 'bosch', 'engine', 'maruti'],
  },
  {
    name: 'Amaron GO 55B24L Car Battery — 45Ah',
    slug: 'amaron-go-55b24l-car-battery-45ah',
    sku: 'PS-AMARON-55B24L',
    description: 'Amaron GO series maintenance-free battery. 45Ah capacity, 360 CCA. Compatible with Maruti Swift, Alto, Baleno, Dzire, WagonR. 36 months warranty.',
    brand: 'Amaron',
    partNumber: '55B24L',
    condition: 'GENUINE_NEW',
    basePrice: 4800,
    mrp: 5500,
    weight: 11.5,
    tags: ['battery', 'car battery', 'amaron', '45ah', 'maintenance-free'],
  },
  {
    name: 'Philips X-tremeVision Headlight Bulb H4 — Twin Pack',
    slug: 'philips-xtremevision-headlight-h4-twin-pack',
    sku: 'PS-PHILIPS-H4-XT',
    description: 'Philips X-tremeVision H4 halogen bulbs. 130% more light on the road vs standard. 3350K color temperature. Universal fit for most Indian vehicles. Box of 2.',
    brand: 'Philips',
    partNumber: '12342XV+B2',
    condition: 'GENUINE_NEW',
    basePrice: 780,
    mrp: 950,
    weight: 0.15,
    tags: ['headlight', 'h4', 'philips', 'halogen', 'bulb'],
  },
  {
    name: 'NGK BP6ES Spark Plug — Set of 4',
    slug: 'ngk-bp6es-spark-plug-set-4',
    sku: 'PS-NGK-BP6ES-4',
    description: 'NGK BP6ES Standard Series spark plugs. Resistor type for noise suppression. Suitable for 1000cc-1500cc petrol engines. Set of 4 plugs. Replace every 30,000 km.',
    brand: 'NGK',
    partNumber: 'BP6ES',
    condition: 'GENUINE_NEW',
    basePrice: 560,
    mrp: 700,
    weight: 0.2,
    tags: ['spark plug', 'ngk', 'ignition', 'petrol'],
  },
  {
    name: 'TVS Apache RTR 160 Brake Pad Set — Front & Rear',
    slug: 'tvs-apache-rtr160-brake-pad-set',
    sku: 'PS-TVS-BP-RTR160',
    description: 'OEM-grade brake pads for TVS Apache RTR 160 (2018-2023). Semi-metallic compound for consistent stopping power. Set includes both front and rear pads.',
    brand: 'EBC Brakes',
    partNumber: 'FA412HH',
    condition: 'GENUINE_NEW',
    basePrice: 650,
    mrp: 850,
    weight: 0.3,
    tags: ['brake pads', 'tvs', 'apache', 'rtr 160', 'disc brake'],
  },
  {
    name: 'Pioneer MVH-S215BT Car Stereo — Refurbished',
    slug: 'pioneer-mvh-s215bt-car-stereo-refurbished',
    sku: 'PS-PIONEER-S215-RF',
    description: 'Pioneer MVH-S215BT single-DIN Bluetooth car stereo. Refurbished to excellent condition. USB, AUX, Bluetooth. 4x50W max output. 12-month seller warranty.',
    brand: 'Pioneer',
    partNumber: 'MVH-S215BT',
    condition: 'REFURBISHED',
    basePrice: 3200,
    mrp: 5500,
    weight: 1.2,
    tags: ['stereo', 'pioneer', 'bluetooth', 'music system', 'refurbished'],
  },
  {
    name: 'Exide FEP0-EP12A-12AH Bike Battery — 12Ah',
    slug: 'exide-fep0-ep12a-12ah-bike-battery',
    sku: 'PS-EXIDE-FEP0-12AH',
    description: 'Exide FEP0 series sealed maintenance-free battery. 12Ah capacity. Compatible with Royal Enfield Classic 350, Thunderbird 350, 500cc bikes. 18-month warranty.',
    brand: 'Exide',
    partNumber: 'FEP0-EP12A',
    condition: 'GENUINE_NEW',
    basePrice: 1850,
    mrp: 2100,
    weight: 3.8,
    tags: ['battery', 'bike battery', 'exide', 'royal enfield', '12ah'],
  },
  {
    name: 'Minda TPMS Tyre Pressure Monitoring System',
    slug: 'minda-tpms-tyre-pressure-monitoring-system',
    sku: 'PS-MINDA-TPMS-01',
    description: 'Minda Industries TPMS with 4 external sensors. Real-time tyre pressure and temperature monitoring. Display unit, solar-powered. Universal fit for all 4-wheeler cars.',
    brand: 'Minda',
    partNumber: 'TPMS-EX4',
    condition: 'GENUINE_NEW',
    basePrice: 2800,
    mrp: 3500,
    weight: 0.45,
    tags: ['tpms', 'sensor', 'tyre pressure', 'minda', 'safety'],
  },
];

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedVehicles() {
  console.log('🚗 Seeding vehicle data...');
  let makeCount = 0, variantCount = 0;

  for (const makeData of vehicleData) {
    const make = await prisma.vehicleMake.upsert({
      where: { name: makeData.name },
      update: {},
      create: { name: makeData.name, type: makeData.type },
    });
    makeCount++;

    for (const modelData of makeData.models) {
      const model = await prisma.vehicleModel.upsert({
        where: { makeId_name: { makeId: make.id, name: modelData.name } },
        update: {},
        create: { makeId: make.id, name: modelData.name, type: makeData.type },
      });

      for (const variantData of modelData.variants) {
        await prisma.vehicleVariant.upsert({
          where: {
            modelId_name_year_fuelType: {
              modelId: model.id,
              name: variantData.name,
              year: variantData.year,
              fuelType: variantData.fuelType,
            },
          },
          update: {},
          create: { modelId: model.id, ...variantData },
        });
        variantCount++;
      }
    }
  }

  console.log(`   ✅ ${makeCount} makes, ${variantCount} variants seeded.`);
}

async function seedCategories() {
  console.log('📦 Seeding categories...');
  let count = 0;

  for (const catData of categoryData) {
    const { children, ...parentData } = catData;

    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {},
      create: parentData,
    });
    count++;

    if (children) {
      for (const childData of children) {
        await prisma.category.upsert({
          where: { slug: childData.slug },
          update: {},
          create: { ...childData, parentId: parent.id },
        });
        count++;
      }
    }
  }

  console.log(`   ✅ ${count} categories seeded.`);
}

async function seedAdminUser() {
  console.log('👤 Seeding admin user...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@partsphere.in' },
    update: {},
    create: {
      email: 'admin@partsphere.in',
      password: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Demo customer
  const customerPassword = await bcrypt.hash('Demo@1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@partsphere.in' },
    update: {},
    create: {
      email: 'demo@partsphere.in',
      password: customerPassword,
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '9876543210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // Create cart for demo customer if not exists
  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  console.log(`   ✅ Admin: admin@partsphere.in / Admin@123`);
  console.log(`   ✅ Demo customer: demo@partsphere.in / Demo@1234`);
}

async function seedProducts() {
  console.log('🔧 Seeding sample products...');

  // Get category IDs
  const airFilter = await prisma.category.findUnique({ where: { slug: 'air-filters' } });
  const batteries = await prisma.category.findUnique({ where: { slug: 'car-batteries' } });
  const bikeBatteries = await prisma.category.findUnique({ where: { slug: 'bike-batteries' } });
  const headlights = await prisma.category.findUnique({ where: { slug: 'headlights' } });
  const sparkPlugs = await prisma.category.findUnique({ where: { slug: 'spark-plugs' } });
  const brakePads = await prisma.category.findUnique({ where: { slug: 'brake-pads' } });
  const headUnits = await prisma.category.findUnique({ where: { slug: 'head-units' } });
  const sensors = await prisma.category.findUnique({ where: { slug: 'sensors' } });

  const categoryMap = [
    airFilter?.id,     // bosch air filter
    batteries?.id,     // amaron battery
    headlights?.id,    // philips headlight
    sparkPlugs?.id,    // ngk spark plug
    brakePads?.id,     // tvs brake pad
    headUnits?.id,     // pioneer stereo
    bikeBatteries?.id, // exide bike battery
    sensors?.id,       // minda tpms
  ];

  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    const categoryId = categoryMap[i];
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        basePrice: product.basePrice,
        mrp: product.mrp,
        categoryId,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`   ✅ ${sampleProducts.length} sample products seeded.`);
  console.log('   ℹ️  Products have no inventory yet — add a shop in Phase 3.');
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('');
  console.log('🌱 PartSphere Database Seeding Started');
  console.log('=========================================');

  await seedVehicles();
  await seedCategories();
  await seedAdminUser();
  await seedProducts();

  console.log('=========================================');
  console.log('✅ All seed data inserted successfully!');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('   Admin:    admin@partsphere.in  /  Admin@123');
  console.log('   Customer: demo@partsphere.in   /  Demo@1234');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
