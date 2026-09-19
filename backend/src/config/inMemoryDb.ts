import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ============================================================================
// 1. VEHICLE CATALOG
// ============================================================================
export const initialMakes = [
  { id: 'make-maruti', name: 'Maruti Suzuki', type: 'CAR', logoUrl: null, createdAt: new Date() },
  { id: 'make-hyundai', name: 'Hyundai', type: 'CAR', logoUrl: null, createdAt: new Date() },
  { id: 'make-tata', name: 'Tata', type: 'CAR', logoUrl: null, createdAt: new Date() },
  { id: 'make-honda-car', name: 'Honda', type: 'CAR', logoUrl: null, createdAt: new Date() },
  { id: 'make-hero', name: 'Hero', type: 'BIKE', logoUrl: null, createdAt: new Date() },
  { id: 'make-bajaj', name: 'Bajaj', type: 'BIKE', logoUrl: null, createdAt: new Date() },
  { id: 'make-re', name: 'Royal Enfield', type: 'BIKE', logoUrl: null, createdAt: new Date() },
  { id: 'make-tvs', name: 'TVS', type: 'SCOOTER', logoUrl: null, createdAt: new Date() },
  { id: 'make-honda-2w', name: 'Honda 2-Wheelers', type: 'SCOOTER', logoUrl: null, createdAt: new Date() },
];

export const initialModels = [
  // Maruti
  { id: 'model-swift', makeId: 'make-maruti', name: 'Swift', type: 'CAR', imageUrl: null },
  { id: 'model-baleno', makeId: 'make-maruti', name: 'Baleno', type: 'CAR', imageUrl: null },
  { id: 'model-brezza', makeId: 'make-maruti', name: 'Brezza', type: 'CAR', imageUrl: null },
  // Hyundai
  { id: 'model-creta', makeId: 'make-hyundai', name: 'Creta', type: 'CAR', imageUrl: null },
  { id: 'model-i20', makeId: 'make-hyundai', name: 'i20', type: 'CAR', imageUrl: null },
  // Tata
  { id: 'model-nexon', makeId: 'make-tata', name: 'Nexon', type: 'CAR', imageUrl: null },
  { id: 'model-punch', makeId: 'make-tata', name: 'Punch', type: 'CAR', imageUrl: null },
  // Honda Cars
  { id: 'model-city', makeId: 'make-honda-car', name: 'City', type: 'CAR', imageUrl: null },
  // Hero
  { id: 'model-splendor', makeId: 'make-hero', name: 'Splendor Plus', type: 'BIKE', imageUrl: null },
  { id: 'model-hf-deluxe', makeId: 'make-hero', name: 'HF Deluxe', type: 'BIKE', imageUrl: null },
  // Bajaj
  { id: 'model-pulsar', makeId: 'make-bajaj', name: 'Pulsar 150', type: 'BIKE', imageUrl: null },
  { id: 'model-pulsar-ns', makeId: 'make-bajaj', name: 'Pulsar NS200', type: 'BIKE', imageUrl: null },
  // Royal Enfield
  { id: 'model-classic-350', makeId: 'make-re', name: 'Classic 350', type: 'BIKE', imageUrl: null },
  { id: 'model-hunter-350', makeId: 'make-re', name: 'Hunter 350', type: 'BIKE', imageUrl: null },
  // TVS
  { id: 'model-jupiter', makeId: 'make-tvs', name: 'Jupiter 110', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ntorq', makeId: 'make-tvs', name: 'Ntorq 125', type: 'SCOOTER', imageUrl: null },
  // Honda 2W
  { id: 'model-activa', makeId: 'make-honda-2w', name: 'Activa 6G', type: 'SCOOTER', imageUrl: null },
  { id: 'model-dio', makeId: 'make-honda-2w', name: 'Dio 125', type: 'SCOOTER', imageUrl: null },
];

export const initialVariants = [
  // Swift
  { id: 'var-swift-vxi', modelId: 'model-swift', name: 'VXi', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi', modelId: 'model-swift', name: 'ZXi', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi-plus', modelId: 'model-swift', name: 'ZXi Plus AMT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  // Baleno
  { id: 'var-baleno-delta', modelId: 'model-baleno', name: 'Delta', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  // Creta
  { id: 'var-creta-sx', modelId: 'model-creta', name: 'SX Executive', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-creta-sx-o', modelId: 'model-creta', name: 'SX (O) Turbo', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1353 },
  // Nexon
  { id: 'var-nexon-creative', modelId: 'model-nexon', name: 'Creative Plus', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  // City
  { id: 'var-city-v', modelId: 'model-city', name: 'V 5th Gen', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1498 },
  // Splendor
  { id: 'var-splendor-drum', modelId: 'model-splendor', name: 'Drum Self-Cast', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  { id: 'var-splendor-xtec', modelId: 'model-splendor', name: 'XTEC Bluetooth', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  // Pulsar 150
  { id: 'var-pulsar-twin', modelId: 'model-pulsar', name: 'Twin Disc BS6', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-pulsar-single', modelId: 'model-pulsar', name: 'Single Disc', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  // Classic 350
  { id: 'var-classic-halcyon', modelId: 'model-classic-350', name: 'Halcyon Series Dual-ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-classic-dark', modelId: 'model-classic-350', name: 'Dark Stealth Black', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  // Activa 6G
  { id: 'var-activa-std', modelId: 'model-activa', name: 'Standard BS6', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  { id: 'var-activa-deluxe', modelId: 'model-activa', name: 'Deluxe LED', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  // Jupiter
  { id: 'var-jupiter-zx', modelId: 'model-jupiter', name: 'ZX SmartXonnect', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 113 },
];

// ============================================================================
// 2. CATEGORIES & BRANDS
// ============================================================================
export const initialCategories = [
  { id: 'cat-engine', name: 'Engine & Ignition', slug: 'engine-parts', sortOrder: 1, isActive: true, parentId: null },
  { id: 'cat-braking', name: 'Braking System', slug: 'braking-system', sortOrder: 2, isActive: true, parentId: null },
  { id: 'cat-electrical', name: 'Electrical & Lighting', slug: 'electrical-lighting', sortOrder: 3, isActive: true, parentId: null },
  { id: 'cat-batteries', name: 'Batteries & Power', slug: 'batteries-power', sortOrder: 4, isActive: true, parentId: null },
  { id: 'cat-oils', name: 'Oils & Lubricants', slug: 'oils-lubricants', sortOrder: 5, isActive: true, parentId: null },
  { id: 'cat-filters', name: 'Filters & Maintenance', slug: 'filters-maintenance', sortOrder: 6, isActive: true, parentId: null },
  { id: 'cat-suspension', name: 'Suspension & Steering', slug: 'suspension-steering', sortOrder: 7, isActive: true, parentId: null },
];

export const initialBrands = [
  { id: 'brand-bosch', name: 'Bosch', slug: 'bosch', isOem: true, country: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
  { id: 'brand-brembo', name: 'Brembo', slug: 'brembo', isOem: true, country: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=100' },
  { id: 'brand-motul', name: 'Motul', slug: 'motul', isOem: true, country: 'France', logoUrl: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=100' },
  { id: 'brand-exide', name: 'Exide', slug: 'exide', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
  { id: 'brand-amaron', name: 'Amaron', slug: 'amaron', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100' },
  { id: 'brand-lumax', name: 'Lumax', slug: 'lumax', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
  { id: 'brand-unominda', name: 'Uno Minda', slug: 'uno-minda', isOem: true, country: 'India', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100' },
  { id: 'brand-castrol', name: 'Castrol', slug: 'castrol', isOem: false, country: 'United Kingdom', logoUrl: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=100' },
];

export const initialShops = [
  {
    id: 'shop-1',
    name: 'Apex Auto Care & Spares',
    city: 'Bengaluru',
    rating: 4.8,
    isVerified: true,
    address: '12th Main Road, HAL 2nd Stage, Indiranagar',
    pincode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '+91 98450 12345',
    operatingHours: '08:30 AM - 08:30 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Brake Fitment', 'Battery Replacement', 'Electrical Systems', 'Doorstep Mechanic'],
  },
  {
    id: 'shop-2',
    name: 'Speedy Wheels Garage & Spares',
    city: 'Mumbai',
    rating: 4.6,
    isVerified: true,
    address: 'Link Road, Andheri West',
    pincode: '400053',
    latitude: 19.1363,
    longitude: 72.8277,
    phone: '+91 98200 54321',
    operatingHours: '09:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Engine Diagnostics', 'Spark Plug & Ignition', 'Suspension', 'Lubrication'],
  },
  {
    id: 'shop-3',
    name: 'Sai Car Clinic & Genuine Parts',
    city: 'New Delhi',
    rating: 4.9,
    isVerified: true,
    address: 'Block C, Connaught Place',
    pincode: '110001',
    latitude: 28.6315,
    longitude: 77.2167,
    phone: '+91 98110 98765',
    operatingHours: '09:00 AM - 09:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['OEM Fitment', 'Brakes & Hydraulics', 'Electrical Lighting', 'Used Part Fitting'],
  },
  {
    id: 'shop-4',
    name: 'Precision Auto Works & Tuners',
    city: 'Bengaluru',
    rating: 4.9,
    isVerified: true,
    address: '80 Feet Road, 4th Block, Koramangala',
    pincode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+91 98451 99887',
    operatingHours: '08:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Performance Brakes', 'Starter Motor Replacement', 'Battery Diagnostics', 'Doorstep Mechanic'],
  },
];

// ============================================================================
// 3. PRODUCTS CATALOG & SEEDS
// ============================================================================
export const initialProducts = [
  {
    id: 'prod-bosch-spark',
    name: 'Bosch Super 4 Spark Plug FR78X (Set of 4)',
    slug: 'bosch-super-4-spark-plug-fr78x',
    description: 'Bosch Super 4 with 4 ground electrodes and a silver-plated center electrode for maximum ignition reliability and combustion efficiency. Improves fuel economy and smoother cold starting.',
    sku: 'BOSCH-SP-FR78X',
    partNumber: '0242232502',
    categoryId: 'cat-engine',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 850,
    mrp: 999,
    warranty: '1 Year Manufacturer Warranty',
    rating: 4.8,
    weight: 0.25,
    dimensions: '10x8x3 cm',
    tags: ['spark plug', 'ignition', 'bosch', 'engine', 'fuel economy'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 299,
    estimatedInstallTimeMinutes: 30,
    createdAt: new Date('2024-01-10'),
    images: [
      { id: 'img-1-1', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', isPrimary: true, altText: 'Bosch Super 4 Spark Plug Set', sortOrder: 0 },
      { id: 'img-1-2', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600', isPrimary: false, altText: 'Spark Plug Electrodes Close-up', sortOrder: 1 },
    ],
    specs: [
      { key: 'Electrode Material', value: 'Silver Plated Yttrium', unit: '' },
      { key: 'Thread Size', value: '14mm x 1.25', unit: 'mm' },
      { key: 'Hex Size', value: '16', unit: 'mm' },
      { key: 'Ground Electrodes', value: '4', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-creta-sx', 'var-city-v'],
    inventories: [
      { id: 'inv-1-1', shopId: 'shop-1', shop: initialShops[0], quantity: 45, sellingPrice: 820, isAvailable: true },
      { id: 'inv-1-2', shopId: 'shop-2', shop: initialShops[1], quantity: 28, sellingPrice: 850, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-1', userId: 'user-1', user: { id: 'user-1', firstName: 'Vikram', lastName: 'Rao', avatar: null }, rating: 5, title: 'Noticeable pickup improvement', body: 'Fitted these on my Maruti Swift VXi. Cold starts are instant now.', isVerifiedPurchase: true, createdAt: new Date() },
      { id: 'rev-2', userId: 'user-2', user: { id: 'user-2', firstName: 'Sameer', lastName: 'Kulkarni', avatar: null }, rating: 4, title: 'Genuine Bosch part', body: 'Packaged very well with holographic security seal.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },
  {
    id: 'prod-brembo-brakes',
    name: 'Brembo Front Brake Pads Set P 54 040',
    slug: 'brembo-front-brake-pads-set-p54040',
    description: 'Brembo low-metallic front brake pad kit with chamfered slots for fade-free performance, reduced rotor wear, and silent stopping under heavy braking.',
    sku: 'BREMBO-BP-P54040',
    partNumber: 'P54040',
    categoryId: 'cat-braking',
    brandId: 'brand-brembo',
    brand: 'Brembo',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1650,
    mrp: 1999,
    warranty: '6 Months Replacement Warranty',
    rating: 4.9,
    weight: 1.2,
    dimensions: '15x10x6 cm',
    tags: ['brake pads', 'braking', 'brembo', 'disc brakes', 'stopping power'],
    requiresDIFM: true,
    installationDifficulty: 'HARD',
    baseServiceFee: 499,
    estimatedInstallTimeMinutes: 45,
    createdAt: new Date('2024-01-15'),
    images: [
      { id: 'img-2-1', url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600', isPrimary: true, altText: 'Brembo Front Brake Pads Set', sortOrder: 0 },
    ],
    specs: [
      { key: 'Axle Location', value: 'Front Axle', unit: '' },
      { key: 'Friction Material', value: 'Low-Metallic Compound', unit: '' },
      { key: 'Thickness', value: '16.5', unit: 'mm' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-baleno-delta', 'var-city-v'],
    inventories: [
      { id: 'inv-2-1', shopId: 'shop-1', shop: initialShops[0], quantity: 18, sellingPrice: 1599, isAvailable: true },
      { id: 'inv-2-2', shopId: 'shop-3', shop: initialShops[2], quantity: 12, sellingPrice: 1650, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-3', userId: 'user-3', user: { id: 'user-3', firstName: 'Anand', lastName: 'Nair', avatar: null }, rating: 5, title: 'Outstanding stopping bite', body: 'Best brake pads for Swift. No squeaks or brake dust.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },
  {
    id: 'prod-motul-oil',
    name: 'Motul 7100 4T 10W-50 Fully Synthetic Engine Oil (1L)',
    slug: 'motul-7100-4t-10w50-synthetic-engine-oil-1l',
    description: '100% Synthetic 4-Stroke motorcycle lubricant with Ester Technology. Superior shear resistance protects engine and gearbox. Specially tuned for Indian summer driving.',
    sku: 'MOTUL-7100-10W50-1L',
    partNumber: '104080',
    categoryId: 'cat-oils',
    brandId: 'brand-motul',
    brand: 'Motul',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 899,
    mrp: 1040,
    warranty: 'Genuine Sealed Pack Guarantee',
    rating: 4.7,
    weight: 0.95,
    dimensions: '22x12x6 cm',
    tags: ['engine oil', 'synthetic', 'motul', '2 wheeler', 'bike oil', 'ester'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-02-01'),
    images: [
      { id: 'img-3-1', url: 'https://images.unsplash.com/photo-1635773054018-22c676c8c105?w=600', isPrimary: true, altText: 'Motul 7100 4T Engine Oil', sortOrder: 0 },
    ],
    specs: [
      { key: 'Viscosity Grade', value: '10W-50', unit: '' },
      { key: 'Standards', value: 'API SN / JASO MA2', unit: '' },
      { key: 'Base Oil', value: '100% Synthetic with Ester', unit: '' },
    ],
    compatibleVariantIds: ['var-pulsar-twin', 'var-pulsar-single', 'var-classic-halcyon', 'var-classic-dark', 'var-splendor-drum'],
    inventories: [
      { id: 'inv-3-1', shopId: 'shop-2', shop: initialShops[1], quantity: 50, sellingPrice: 875, isAvailable: true },
      { id: 'inv-3-2', shopId: 'shop-3', shop: initialShops[2], quantity: 35, sellingPrice: 899, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-4', userId: 'user-4', user: { id: 'user-4', firstName: 'Karan', lastName: 'Singh', avatar: null }, rating: 5, title: 'Smooth gear shifts on Pulsar', body: 'Engine runs noticeably cooler during highway cruising.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },
  {
    id: 'prod-exide-battery',
    name: 'Exide Matrix Red MT40L 35Ah Maintenance Free Car Battery',
    slug: 'exide-matrix-red-mt40l-35ah-battery',
    description: 'Zero maintenance automotive battery with special Alloy Grid formula designed for extreme Indian temperatures and heavy electrical accessory loads.',
    sku: 'EXIDE-MT40L-35AH',
    partNumber: 'MT40L',
    categoryId: 'cat-batteries',
    brandId: 'brand-exide',
    brand: 'Exide',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 4200,
    mrp: 4950,
    warranty: '36 Months Manufacturer Warranty',
    rating: 4.6,
    weight: 10.5,
    dimensions: '20x13x22 cm',
    tags: ['battery', 'exide', 'car battery', 'matrix red', 'power'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 249,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-02-10'),
    images: [
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', isPrimary: true, altText: 'Exide Matrix Red Battery', sortOrder: 0 },
    ],
    specs: [
      { key: 'Capacity', value: '35', unit: 'Ah' },
      { key: 'Voltage', value: '12', unit: 'V' },
      { key: 'Warranty Period', value: '36 (18F+18P)', unit: 'Months' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-creta-sx', 'var-nexon-creative'],
    inventories: [
      { id: 'inv-4-1', shopId: 'shop-1', shop: initialShops[0], quantity: 15, sellingPrice: 4050, isAvailable: true },
      { id: 'inv-4-2', shopId: 'shop-2', shop: initialShops[1], quantity: 20, sellingPrice: 4200, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-5', userId: 'user-5', user: { id: 'user-5', firstName: 'Pooja', lastName: 'Mehta', avatar: null }, rating: 5, title: 'Direct replacement for factory battery', body: 'Fits Swift battery tray perfectly.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },
  {
    id: 'prod-lumax-headlight',
    name: 'Lumax H4 All-Weather Xenon White Headlight Bulb (Set of 2)',
    slug: 'lumax-h4-all-weather-headlight-bulb-set',
    description: 'High-intensity halogen bulb with quartz glass and UV filter. Provides 130% extra brightness and 40m longer beam distance in rain or fog.',
    sku: 'LUMAX-H4-6055W',
    partNumber: 'H4-6055W',
    categoryId: 'cat-electrical',
    brandId: 'brand-lumax',
    brand: 'Lumax',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 499,
    mrp: 699,
    warranty: '1 Year Replacement Warranty',
    rating: 4.5,
    weight: 0.15,
    dimensions: '8x5x5 cm',
    tags: ['headlight', 'bulb', 'lumax', 'lighting', 'xenon', 'fog light'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 149,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-02-18'),
    images: [
      { id: 'img-5-1', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600', isPrimary: true, altText: 'Lumax H4 Headlight Bulbs', sortOrder: 0 },
    ],
    specs: [
      { key: 'Bulb Base', value: 'H4 (P43t)', unit: '' },
      { key: 'Wattage', value: '60/55W', unit: 'W' },
      { key: 'Color Temperature', value: '4300', unit: 'K' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-pulsar-twin', 'var-classic-halcyon'],
    inventories: [
      { id: 'inv-5-1', shopId: 'shop-1', shop: initialShops[0], quantity: 30, sellingPrice: 475, isAvailable: true },
      { id: 'inv-5-2', shopId: 'shop-3', shop: initialShops[2], quantity: 25, sellingPrice: 499, isAvailable: true },
    ],
    reviews: [
      { id: 'rev-6', userId: 'user-6', user: { id: 'user-6', firstName: 'Ramesh', lastName: 'Kumar', avatar: null }, rating: 4, title: 'Crisp white throw', body: 'Much better than yellowish stock bulbs.', isVerifiedPurchase: true, createdAt: new Date() },
    ],
  },
  {
    id: 'prod-unominda-filter',
    name: 'Uno Minda High Efficiency Oil Filter (Spin-on)',
    slug: 'uno-minda-high-efficiency-oil-filter',
    description: 'Multi-layer synthetic filter media catches 99% of engine contaminants, ensuring clean lubrication and prolonged engine life.',
    sku: 'MINDA-OF-8812',
    partNumber: 'OF-8812',
    categoryId: 'cat-filters',
    brandId: 'brand-unominda',
    brand: 'Uno Minda',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 240,
    mrp: 310,
    warranty: '6 Months Warranty',
    rating: 4.4,
    weight: 0.28,
    dimensions: '9x8x8 cm',
    tags: ['oil filter', 'filter', 'minda', 'maintenance', 'lubrication'],
    requiresDIFM: false,
    installationDifficulty: 'EASY',
    baseServiceFee: 99,
    estimatedInstallTimeMinutes: 15,
    createdAt: new Date('2024-02-22'),
    images: [
      { id: 'img-6-1', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600', isPrimary: true, altText: 'Uno Minda Oil Filter', sortOrder: 0 },
    ],
    specs: [
      { key: 'Filter Type', value: 'Spin-on Synthetic Filter', unit: '' },
      { key: 'Anti-drainback Valve', value: 'Yes (Silicone)', unit: '' },
    ],
    compatibleVariantIds: ['var-splendor-drum', 'var-splendor-xtec', 'var-pulsar-twin', 'var-pulsar-single', 'var-activa-std'],
    inventories: [
      { id: 'inv-6-1', shopId: 'shop-2', shop: initialShops[1], quantity: 60, sellingPrice: 225, isAvailable: true },
      { id: 'inv-6-2', shopId: 'shop-3', shop: initialShops[2], quantity: 40, sellingPrice: 240, isAvailable: true },
    ],
    reviews: [],
  },
  {
    id: 'prod-refurb-starter',
    name: 'Bosch Certified Refurbished Starter Motor Assembly',
    slug: 'bosch-refurbished-starter-motor-assembly',
    description: 'Dynamometer tested, rewound armature, new heavy-duty carbon brushes and solenoid switch. Delivers factory starting torque at 50% OEM price.',
    sku: 'BOSCH-RF-SM-3310',
    partNumber: 'RF-SM-3310',
    categoryId: 'cat-electrical',
    brandId: 'brand-bosch',
    brand: 'Bosch',
    condition: 'REFURBISHED',
    status: 'ACTIVE',
    basePrice: 2850,
    mrp: 5500,
    warranty: '6 Months PartSphere Certified Warranty',
    rating: 4.6,
    weight: 3.8,
    dimensions: '22x14x14 cm',
    tags: ['starter motor', 'refurbished', 'bosch', 'engine starter', 'circular economy'],
    requiresDIFM: true,
    installationDifficulty: 'HARD',
    baseServiceFee: 599,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-03-01'),
    images: [
      { id: 'img-7-1', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600', isPrimary: true, altText: 'Refurbished Starter Motor', sortOrder: 0 },
    ],
    specs: [
      { key: 'Condition Grade', value: 'A+ (Factory Remanufactured)', unit: '' },
      { key: 'Voltage', value: '12V', unit: '' },
      { key: 'Power Output', value: '0.9 kW', unit: '' },
    ],
    compatibleVariantIds: ['var-swift-vxi', 'var-swift-zxi', 'var-nexon-creative'],
    inventories: [
      { id: 'inv-7-1', shopId: 'shop-1', shop: initialShops[0], quantity: 6, sellingPrice: 2750, isAvailable: true },
    ],
    reviews: [],
  },
  {
    id: 'prod-used-fuelpump',
    name: 'Hyundai Genuine Used Verified Fuel Pump Assembly',
    slug: 'hyundai-used-verified-fuel-pump-assembly',
    description: 'Removed from a 2022 low-mileage donor vehicle, pressure bench tested at 3.5 bar, ultrasonically cleaned and sealed. Certified by Apex Auto Care technicians.',
    sku: 'HYUNDAI-UV-FP-9901',
    partNumber: '31110-C9000',
    categoryId: 'cat-engine',
    brandId: 'brand-bosch',
    brand: 'Hyundai OEM',
    condition: 'USED_VERIFIED',
    status: 'ACTIVE',
    basePrice: 1950,
    mrp: 6800,
    warranty: '3 Months Inspection Warranty',
    rating: 4.3,
    weight: 1.4,
    dimensions: '25x12x12 cm',
    tags: ['fuel pump', 'used parts', 'verified', 'hyundai', 'fuel injection', 'salvage'],
    requiresDIFM: true,
    installationDifficulty: 'HARD',
    baseServiceFee: 699,
    estimatedInstallTimeMinutes: 60,
    createdAt: new Date('2024-03-05'),
    images: [
      { id: 'img-8-1', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', isPrimary: true, altText: 'Used Verified Fuel Pump Assembly', sortOrder: 0 },
    ],
    specs: [
      { key: 'Working Pressure', value: '3.5', unit: 'Bar' },
      { key: 'Testing Status', value: '100% Flow Bench Tested', unit: '' },
    ],
    compatibleVariantIds: ['var-creta-sx', 'var-creta-sx-o'],
    inventories: [
      { id: 'inv-8-1', shopId: 'shop-3', shop: initialShops[2], quantity: 2, sellingPrice: 1950, isAvailable: true },
    ],
    reviews: [],
  },
  {
    id: 'prod-amaron-battery-oos',
    name: 'Amaron Pro Rider BTZ4 12V 4Ah Motorcycle Battery',
    slug: 'amaron-pro-rider-btz4-motorcycle-battery',
    description: 'VRLA motorcycle battery with high cranking power and spill-proof design for bikes and scooters. Built to withstand vibration on tough Indian roads.',
    sku: 'AMARON-BTZ4-OOS',
    partNumber: 'BTZ4-OOS',
    categoryId: 'cat-batteries',
    brandId: 'brand-amaron',
    brand: 'Amaron',
    condition: 'GENUINE_NEW',
    status: 'ACTIVE',
    basePrice: 1150,
    mrp: 1350,
    warranty: '24 Months Warranty',
    rating: 4.7,
    weight: 1.8,
    dimensions: '11x7x9 cm',
    tags: ['bike battery', 'amaron', '2 wheeler', 'motorcycle battery'],
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 199,
    estimatedInstallTimeMinutes: 20,
    createdAt: new Date('2024-03-10'),
    images: [
      { id: 'img-9-1', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', isPrimary: true, altText: 'Amaron Pro Rider Battery', sortOrder: 0 },
    ],
    specs: [
      { key: 'Capacity', value: '4', unit: 'Ah' },
      { key: 'Technology', value: 'VRLA Maintenance Free', unit: '' },
    ],
    compatibleVariantIds: ['var-splendor-drum', 'var-activa-std', 'var-jupiter-zx'],
    inventories: [
      { id: 'inv-9-1', shopId: 'shop-1', shop: initialShops[0], quantity: 0, sellingPrice: 1150, isAvailable: false },
    ],
    reviews: [],
  },
];

// ============================================================================
// 4. IN-MEMORY STORE CLASS
// ============================================================================
class InMemoryStore {
  public users: any[] = [];
  public refreshTokens: any[] = [];
  public carts: any[] = [];
  public cartItems: any[] = [];
  public inventories: any[] = [];
  public shops: any[] = [];
  public auditLogs: any[] = [];
  public customerVehicles: any[] = [];
  public addresses: any[] = [];
  public orders: any[] = [];
  public orderItems: any[] = [];
  public difmRequests: any[] = [];
  public payments: any[] = [];
  public orderTrackings: any[] = [];

  constructor() {
    this.seedDefaultUser();
    this.seedInventoriesAndShops();
    this.seedDefaultAddresses();
  }

  private seedInventoriesAndShops() {
    this.shops = initialShops.map((s) => ({ ...s, isActive: true }));
    this.inventories = initialProducts.flatMap((p) =>
      (p.inventories || []).map((inv) => ({
        id: inv.id,
        productId: p.id,
        shopId: inv.shopId,
        quantity: inv.quantity,
        reservedQty: 0,
        sellingPrice: Number(inv.sellingPrice),
        isAvailable: inv.isAvailable,
        availabilityStatus: inv.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        updatedAt: new Date(),
      }))
    );
  }

  private seedDefaultAddresses() {
    this.addresses.push({
      id: 'addr-demo-home',
      userId: 'demo-user-1',
      label: 'Home',
      fullName: 'Aarav Sharma',
      phone: '9876500002',
      line1: 'Flat 402, Green Glen Layout, Bellandur',
      line2: 'Near Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      landmark: 'Opposite Central Mall',
      latitude: 12.9260,
      longitude: 77.6762,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.addresses.push({
      id: 'addr-demo-work',
      userId: 'demo-user-1',
      label: 'Work / Office',
      fullName: 'Aarav Sharma',
      phone: '9876500002',
      line1: 'Tower B, 6th Floor, Bagmane Tech Park, CV Raman Nagar',
      line2: 'Byrasandra',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560093',
      landmark: 'Near Indiranagar Metro',
      latitude: 12.9866,
      longitude: 77.6638,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async seedDefaultUser() {
    const passwordHash = await bcrypt.hash('Demo@1234', 10);
    this.users.push({
      id: 'demo-user-1',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'demo@partsphere.in',
      password: passwordHash,
      phone: '9876500002',
      avatar: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // --- USER ---
  public user = {
    findUnique: async ({ where, select }: { where: { email?: string; id?: string }; select?: any }) => {
      const u = this.users.find(
        (usr) => (where.email && usr.email.toLowerCase() === where.email.toLowerCase()) || (where.id && usr.id === where.id)
      );
      if (!u) return null;
      const countVehicles = this.customerVehicles.filter((v) => v.userId === u.id).length;
      return {
        ...u,
        _count: { orders: 0, customerVehicles: countVehicles },
      };
    },
    create: async ({ data }: { data: any }) => {
      const newUser = {
        id: crypto.randomUUID(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        avatar: null,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.users.findIndex((u) => u.id === where.id);
      if (idx === -1) return null;
      this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
      return this.users[idx];
    },
  };

  // --- CART ---
  private populateCart(cart: any) {
    const items = this.cartItems
      .filter((it) => it.cartId === cart.id)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .map((item) => {
        const p = initialProducts.find((prod) => prod.id === item.productId);
        const product = p ? this.populateProduct(p) : null;
        const s = this.shops.find((shp) => shp.id === item.shopId) || initialShops[0];
        const inv = this.inventories.find(
          (i) => i.productId === item.productId && i.shopId === item.shopId
        );
        return {
          ...item,
          priceSnapshot: Number(item.priceSnapshot),
          maxStock: inv ? inv.quantity : 0,
          isAvailable: inv ? inv.isAvailable && inv.quantity > 0 : false,
          product,
          shop: s
            ? { id: s.id, name: s.name, city: s.city, isVerified: s.isVerified, rating: s.rating }
            : null,
        };
      });

    return {
      ...cart,
      items,
    };
  }

  public cart = {
    findUnique: async ({
      where,
      include,
    }: {
      where: { userId?: string; id?: string };
      include?: any;
    }) => {
      const c = this.carts.find(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (!c) return null;
      return this.populateCart(c);
    },
    findFirst: async ({
      where,
      include,
    }: {
      where: { userId?: string; id?: string };
      include?: any;
    }) => {
      const c = this.carts.find(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (!c) return null;
      return this.populateCart(c);
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const newCart = {
        id: crypto.randomUUID(),
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.push(newCart);
      return this.populateCart(newCart);
    },
    update: async ({ where, data }: { where: { id?: string; userId?: string }; data: any }) => {
      const idx = this.carts.findIndex(
        (ct) => (where.userId && ct.userId === where.userId) || (where.id && ct.id === where.id)
      );
      if (idx === -1) return null;
      this.carts[idx] = { ...this.carts[idx], ...data, updatedAt: new Date() };
      return this.populateCart(this.carts[idx]);
    },
  };

  // --- CART ITEM ---
  public cartItem = {
    findUnique: async ({
      where,
      include,
    }: {
      where: {
        id?: string;
        cartId_productId_shopId?: { cartId: string; productId: string; shopId: string };
      };
      include?: any;
    }) => {
      const item = this.cartItems.find(
        (it) =>
          (where.id && it.id === where.id) ||
          (where.cartId_productId_shopId &&
            it.cartId === where.cartId_productId_shopId.cartId &&
            it.productId === where.cartId_productId_shopId.productId &&
            it.shopId === where.cartId_productId_shopId.shopId)
      );
      return item ? { ...item, priceSnapshot: Number(item.priceSnapshot) } : null;
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const item = this.cartItems.find(
        (it) =>
          (!where.id || it.id === where.id) &&
          (!where.cartId || it.cartId === where.cartId) &&
          (!where.productId || it.productId === where.productId) &&
          (!where.shopId || it.shopId === where.shopId)
      );
      return item ? { ...item, priceSnapshot: Number(item.priceSnapshot) } : null;
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.cartItems.filter(
        (it) =>
          (!where?.cartId || it.cartId === where.cartId) &&
          (!where?.productId || it.productId === where.productId)
      );
      return list.map((it) => ({ ...it, priceSnapshot: Number(it.priceSnapshot) }));
    },
    create: async ({ data }: { data: any }) => {
      const newItem = {
        id: crypto.randomUUID(),
        cartId: data.cartId,
        productId: data.productId,
        shopId: data.shopId,
        quantity: data.quantity || 1,
        priceSnapshot: Number(data.priceSnapshot),
        addedAt: new Date(),
      };
      this.cartItems.push(newItem);
      return { ...newItem };
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.cartItems.findIndex((it) => it.id === where.id);
      if (idx === -1) return null;
      this.cartItems[idx] = {
        ...this.cartItems[idx],
        ...data,
        ...(data.priceSnapshot !== undefined ? { priceSnapshot: Number(data.priceSnapshot) } : {}),
      };
      return { ...this.cartItems[idx] };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.cartItems.findIndex((it) => it.id === where.id);
      if (idx !== -1) {
        const deleted = this.cartItems.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }: { where: { cartId?: string; id?: string } }) => {
      const beforeLen = this.cartItems.length;
      this.cartItems = this.cartItems.filter((it) => {
        const matchesCartId = !where.cartId || it.cartId === where.cartId;
        const matchesId = !where.id || it.id === where.id;
        return !(matchesCartId && matchesId);
      });
      return { count: beforeLen - this.cartItems.length };
    },
  };

  // --- INVENTORY ---
  public inventory = {
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.inventories.filter((inv) => {
        if (where?.productId && inv.productId !== where.productId) return false;
        if (where?.shopId && inv.shopId !== where.shopId) return false;
        if (where?.isAvailable !== undefined && inv.isAvailable !== where.isAvailable) return false;
        if (where?.quantity?.gte !== undefined && inv.quantity < where.quantity.gte) return false;
        if (where?.quantity?.gt !== undefined && inv.quantity <= where.quantity.gt) return false;
        return true;
      });

      if (orderBy?.sellingPrice) {
        list.sort((a, b) =>
          orderBy.sellingPrice === 'asc'
            ? a.sellingPrice - b.sellingPrice
            : b.sellingPrice - a.sellingPrice
        );
      }
      return list[0] || null;
    },
    findUnique: async ({
      where,
    }: {
      where: { id?: string; productId_shopId?: { productId: string; shopId: string } };
    }) => {
      return (
        this.inventories.find(
          (inv) =>
            (where.id && inv.id === where.id) ||
            (where.productId_shopId &&
              inv.productId === where.productId_shopId.productId &&
              inv.shopId === where.productId_shopId.shopId)
        ) || null
      );
    },
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.inventories.filter((inv) => {
        if (where?.productId && inv.productId !== where.productId) return false;
        if (where?.shopId && inv.shopId !== where.shopId) return false;
        if (where?.isAvailable !== undefined && inv.isAvailable !== where.isAvailable) return false;
        return true;
      });
    },
    update: async ({
      where,
      data,
    }: {
      where: { id?: string; productId_shopId?: { productId: string; shopId: string } };
      data: any;
    }) => {
      const idx = this.inventories.findIndex(
        (inv) =>
          (where.id && inv.id === where.id) ||
          (where.productId_shopId &&
            inv.productId === where.productId_shopId.productId &&
            inv.shopId === where.productId_shopId.shopId)
      );
      if (idx === -1) return null;
      this.inventories[idx] = {
        ...this.inventories[idx],
        ...data,
        updatedAt: new Date(),
      };
      return this.inventories[idx];
    },
  };

  // --- SHOP ---
  public shop = {
    findFirst: async ({ where }: { where?: any } = {}) => {
      return (
        this.shops.find((s) => {
          if (where?.id && s.id !== where.id) return false;
          if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
          return true;
        }) || null
      );
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shops.find((s) => s.id === where.id) || null;
    },
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.shops.filter((s) => {
        if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
        return true;
      });
    },
  };

  // --- REFRESH TOKEN ---
  public refreshToken = {
    create: async ({ data }: { data: any }) => {
      const tokenRecord = {
        id: crypto.randomUUID(),
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
        isRevoked: false,
        createdAt: new Date(),
      };
      this.refreshTokens.push(tokenRecord);
      return tokenRecord;
    },
    findUnique: async ({ where, include }: { where: { token?: string; id?: string }; include?: any }) => {
      const t = this.refreshTokens.find(
        (tok) => (where.token && tok.token === where.token) || (where.id && tok.id === where.id)
      );
      if (!t) return null;
      if (include?.user) {
        const u = this.users.find((usr) => usr.id === t.userId);
        return { ...t, user: u || null };
      }
      return t;
    },
    update: async ({ where, data }: { where: { id?: string; token?: string }; data: any }) => {
      const idx = this.refreshTokens.findIndex(
        (t) => (where.id && t.id === where.id) || (where.token && t.token === where.token)
      );
      if (idx === -1) return null;
      this.refreshTokens[idx] = { ...this.refreshTokens[idx], ...data };
      return this.refreshTokens[idx];
    },
    updateMany: async ({ where, data }: { where: { userId?: string; token?: string }; data: any }) => {
      let count = 0;
      this.refreshTokens.forEach((t) => {
        if ((where.userId && t.userId === where.userId) || (where.token && t.token === where.token)) {
          Object.assign(t, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { token?: string; id?: string } }) => {
      const idx = this.refreshTokens.findIndex(
        (t) => (where.token && t.token === where.token) || (where.id && t.id === where.id)
      );
      if (idx !== -1) {
        const deleted = this.refreshTokens.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }: { where: { userId?: string; token?: string } }) => {
      const initialLen = this.refreshTokens.length;
      this.refreshTokens = this.refreshTokens.filter(
        (t) => (!where.userId || t.userId !== where.userId) && (!where.token || t.token !== where.token)
      );
      return { count: initialLen - this.refreshTokens.length };
    },
  };

  // --- AUDIT LOG ---
  public auditLog = {
    create: async ({ data }: { data: any }) => {
      const log = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.auditLogs.push(log);
      return log;
    },
  };

  // --- ADDRESS ---
  public address = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.addresses.filter((a) => !where?.userId || a.userId === where.userId);
      list.sort((a, b) => {
        if (a.isDefault !== b.isDefault) return b.isDefault ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return list;
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.addresses.filter(
        (a) =>
          (!where?.id || a.id === where.id) &&
          (!where?.userId || a.userId === where.userId) &&
          (where?.isDefault === undefined || a.isDefault === where.isDefault)
      );
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list[0] || null;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.addresses.find((a) => a.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const newAddr = {
        id: crypto.randomUUID(),
        userId: data.userId,
        label: data.label || 'Home',
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || null,
        latitude: data.latitude || (data.pincode === '560038' ? 12.9716 : 12.9260),
        longitude: data.longitude || (data.pincode === '560038' ? 77.5946 : 77.6762),
        isDefault: Boolean(data.isDefault),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.addresses.push(newAddr);
      return newAddr;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.addresses.findIndex((a) => a.id === where.id);
      if (idx === -1) return null;
      this.addresses[idx] = { ...this.addresses[idx], ...data, updatedAt: new Date() };
      return this.addresses[idx];
    },
    updateMany: async ({ where, data }: { where: { userId?: string }; data: any }) => {
      let count = 0;
      this.addresses.forEach((a) => {
        if (!where?.userId || a.userId === where.userId) {
          Object.assign(a, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.addresses.findIndex((a) => a.id === where.id);
      if (idx !== -1) {
        const deleted = this.addresses.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
    count: async ({ where }: { where?: { userId: string } } = {}) => {
      return this.addresses.filter((a) => !where?.userId || a.userId === where.userId).length;
    },
  };

  // --- ORDERS & TRACKING ---
  private populateOrder(order: any) {
    const items = this.orderItems
      .filter((oi) => oi.orderId === order.id)
      .map((oi) => {
        const p = initialProducts.find((prod) => prod.id === oi.productId);
        const product = p ? this.populateProduct(p) : null;
        const s = this.shops.find((shp) => shp.id === oi.shopId) || initialShops[0];
        return {
          ...oi,
          unitPrice: Number(oi.unitPrice),
          totalPrice: Number(oi.totalPrice),
          product,
          shop: s
            ? {
                id: s.id,
                name: s.name,
                city: s.city,
                address: s.address,
                phone: s.phone,
                rating: s.rating,
              }
            : null,
        };
      });

    const address = this.addresses.find((a) => a.id === order.addressId) || null;
    const payment = this.payments.find((pm) => pm.orderId === order.id) || null;
    const difmReq = this.difmRequests.find((d) => d.orderId === order.id);
    const difmRequest = difmReq
      ? {
          ...difmReq,
          installationFee: Number(difmReq.installationFee || 0),
          homeVisitSurcharge: Number(difmReq.homeVisitSurcharge || 0),
          shop: this.shops.find((s) => s.id === difmReq.shopId) || null,
          serviceBooking: null,
        }
      : null;
    const tracking = this.orderTrackings
      .filter((t) => t.orderId === order.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee || 0),
      discount: Number(order.discount || 0),
      installationFee: Number(order.installationFee || 0),
      homeVisitSurcharge: Number(order.homeVisitSurcharge || 0),
      total: Number(order.total),
      items,
      address,
      payment,
      difmRequest,
      tracking,
      statusHistory: [],
    };
  }

  public order = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.orders.filter((o) => !where?.userId || o.userId === where.userId);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list.map((o) => this.populateOrder(o));
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find(
        (o) =>
          (!where.id || o.id === where.id) &&
          (!where.userId || o.userId === where.userId) &&
          (!where.orderNumber || o.orderNumber === where.orderNumber)
      );
      return order ? this.populateOrder(order) : null;
    },
    findUnique: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find(
        (o) =>
          (!where.id || o.id === where.id) &&
          (!where.orderNumber || o.orderNumber === where.orderNumber)
      );
      return order ? this.populateOrder(order) : null;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const orderId = crypto.randomUUID();
      const newOrder = {
        id: orderId,
        orderNumber: data.orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        status: data.status || 'CONFIRMED',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PENDING',
        subtotal: Number(data.subtotal),
        deliveryFee: Number(data.deliveryFee || 0),
        discount: Number(data.discount || 0),
        installationFee: Number(data.installationFee || 0),
        homeVisitSurcharge: Number(data.homeVisitSurcharge || 0),
        total: Number(data.total),
        couponCode: data.couponCode || null,
        notes: data.notes || null,
        difmType: data.difmType || 'NO_INSTALLATION',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.orders.push(newOrder);

      // Unpack nested items
      if (data.items?.create && Array.isArray(data.items.create)) {
        for (const it of data.items.create) {
          this.orderItems.push({
            id: crypto.randomUUID(),
            orderId,
            productId: it.productId,
            shopId: it.shopId,
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
            totalPrice: Number(it.totalPrice),
            createdAt: new Date(),
          });
        }
      }

      // Unpack nested payment
      if (data.payment?.create) {
        this.payments.push({
          id: crypto.randomUUID(),
          orderId,
          method: data.payment.create.method,
          amount: Number(data.payment.create.amount),
          status: data.payment.create.status || 'PENDING',
          razorpayOrderId: data.payment.create.razorpayOrderId || null,
          createdAt: new Date(),
        });
      }

      // Unpack nested tracking
      if (data.tracking?.create) {
        const trData = Array.isArray(data.tracking.create) ? data.tracking.create : [data.tracking.create];
        for (const tr of trData) {
          this.orderTrackings.push({
            id: crypto.randomUUID(),
            orderId,
            status: tr.status || newOrder.status,
            message: tr.message || 'Order placed successfully and confirmed.',
            createdAt: new Date(),
          });
        }
      }

      // Unpack nested difmRequest
      if (data.difmRequest?.create) {
        this.difmRequests.push({
          id: crypto.randomUUID(),
          orderId,
          shopId: data.difmRequest.create.shopId || null,
          type: data.difmRequest.create.type,
          status: data.difmRequest.create.status || 'PENDING',
          installationFee: Number(data.difmRequest.create.installationFee || 0),
          homeVisitSurcharge: Number(data.difmRequest.create.homeVisitSurcharge || 0),
          preferredDate: data.difmRequest.create.preferredDate || null,
          scheduledDate: data.difmRequest.create.scheduledDate || null,
          notes: data.difmRequest.create.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return this.populateOrder(newOrder);
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.orders.findIndex((o) => o.id === where.id);
      if (idx === -1) return null;
      this.orders[idx] = { ...this.orders[idx], ...data, updatedAt: new Date() };
      return this.populateOrder(this.orders[idx]);
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.orders.filter((o) => !where?.userId || o.userId === where.userId).length;
    },
  };

  public orderItem = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.orderItems.filter((it) => !where?.orderId || it.orderId === where.orderId);
    },
    create: async ({ data }: { data: any }) => {
      const it = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.orderItems.push(it);
      return it;
    },
    createMany: async ({ data }: { data: any[] }) => {
      let count = 0;
      for (const d of data) {
        this.orderItems.push({ id: crypto.randomUUID(), ...d, createdAt: new Date() });
        count++;
      }
      return { count };
    },
  };

  public difmRequest = {
    findUnique: async ({ where }: { where: { id?: string; orderId?: string } }) => {
      const d = this.difmRequests.find(
        (req) => (where.id && req.id === where.id) || (where.orderId && req.orderId === where.orderId)
      );
      if (!d) return null;
      return {
        ...d,
        shop: this.shops.find((s) => s.id === d.shopId) || null,
      };
    },
    findFirst: async ({ where }: { where: any }) => {
      const d = this.difmRequests.find(
        (req) => (!where.orderId || req.orderId === where.orderId) && (!where.shopId || req.shopId === where.shopId)
      );
      if (!d) return null;
      return {
        ...d,
        shop: this.shops.find((s) => s.id === d.shopId) || null,
      };
    },
    create: async ({ data }: { data: any }) => {
      const newDIFM = {
        id: crypto.randomUUID(),
        orderId: data.orderId,
        shopId: data.shopId || null,
        type: data.type,
        status: data.status || 'PENDING',
        installationFee: Number(data.installationFee || 0),
        homeVisitSurcharge: Number(data.homeVisitSurcharge || 0),
        preferredDate: data.preferredDate || null,
        scheduledDate: data.scheduledDate || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.difmRequests.push(newDIFM);
      return {
        ...newDIFM,
        shop: this.shops.find((s) => s.id === newDIFM.shopId) || null,
      };
    },
    update: async ({ where, data }: { where: { id?: string; orderId?: string }; data: any }) => {
      const idx = this.difmRequests.findIndex(
        (d) => (where.id && d.id === where.id) || (where.orderId && d.orderId === where.orderId)
      );
      if (idx === -1) return null;
      this.difmRequests[idx] = { ...this.difmRequests[idx], ...data, updatedAt: new Date() };
      return {
        ...this.difmRequests[idx],
        shop: this.shops.find((s) => s.id === this.difmRequests[idx].shopId) || null,
      };
    },
  };

  public payment = {
    findUnique: async ({ where }: { where: { id?: string; orderId?: string } }) => {
      return (
        this.payments.find(
          (p) => (where.id && p.id === where.id) || (where.orderId && p.orderId === where.orderId)
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const p = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.payments.push(p);
      return p;
    },
  };

  public orderTracking = {
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let list = this.orderTrackings.filter((t) => !where?.orderId || t.orderId === where.orderId);
      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (take) list = list.slice(0, take);
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const t = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
      this.orderTrackings.push(t);
      return t;
    },
  };

  // --- VEHICLE CATALOG ---
  public vehicleMake = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialMakes];
      if (where?.type) {
        if (where.type.in) {
          results = results.filter((m) => where.type.in.includes(m.type));
        } else {
          results = results.filter((m) => m.type === where.type);
        }
      }
      if (orderBy?.name === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results.map((m) => ({
        ...m,
        _count: { models: initialModels.filter((model) => model.makeId === m.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string; name?: string } }) => {
      return initialMakes.find((m) => (where.id && m.id === where.id) || (where.name && m.name === where.name)) || null;
    },
  };

  public vehicleModel = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialModels];
      if (where?.makeId) {
        results = results.filter((m) => m.makeId === where.makeId);
      }
      if (where?.type) {
        results = results.filter((m) => m.type === where.type);
      }
      if (orderBy?.name === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results.map((m) => ({
        ...m,
        _count: { variants: initialVariants.filter((v) => v.modelId === m.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string } }) => {
      return initialModels.find((m) => m.id === where.id) || null;
    },
  };

  public vehicleVariant = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let results = [...initialVariants];
      if (where?.modelId) {
        results = results.filter((v) => v.modelId === where.modelId);
      }
      if (Array.isArray(orderBy)) {
        results.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
      }
      return results;
    },
    findUnique: async ({ where }: { where: { id?: string } }) => {
      return initialVariants.find((v) => v.id === where.id) || null;
    },
  };

  private populateVehicle(veh: any) {
    const variant = initialVariants.find((v) => v.id === veh.variantId);
    if (!variant) return { ...veh, variant: null };
    const model = initialModels.find((m) => m.id === variant.modelId);
    const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
    return {
      ...veh,
      variant: {
        ...variant,
        model: model ? { ...model, make: make || null } : null,
      },
    };
  }

  public customerVehicle = {
    findMany: async ({ where, orderBy }: { where?: { userId: string }; orderBy?: any }) => {
      let results = this.customerVehicles.filter((v) => !where?.userId || v.userId === where.userId);
      results = results.map((v) => this.populateVehicle(v));
      results.sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return b.isPrimary ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return results;
    },
    findFirst: async ({ where }: { where: { id?: string; userId?: string } }) => {
      const v = this.customerVehicles.find(
        (veh) => (!where.id || veh.id === where.id) && (!where.userId || veh.userId === where.userId)
      );
      return v ? this.populateVehicle(v) : null;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      const v = this.customerVehicles.find((veh) => veh.id === where.id);
      return v ? this.populateVehicle(v) : null;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const newVehicle = {
        id: crypto.randomUUID(),
        userId: data.userId,
        variantId: data.variantId,
        nickname: data.nickname || null,
        regNumber: data.regNumber || null,
        isPrimary: Boolean(data.isPrimary),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.customerVehicles.push(newVehicle);
      return this.populateVehicle(newVehicle);
    },
    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.customerVehicles.findIndex((v) => v.id === where.id);
      if (idx === -1) return null;
      this.customerVehicles[idx] = {
        ...this.customerVehicles[idx],
        ...data,
        updatedAt: new Date(),
      };
      return this.populateVehicle(this.customerVehicles[idx]);
    },
    updateMany: async ({ where, data }: { where: { userId?: string }; data: any }) => {
      let count = 0;
      this.customerVehicles.forEach((v) => {
        if (!where.userId || v.userId === where.userId) {
          Object.assign(v, data);
          count++;
        }
      });
      return { count };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.customerVehicles.findIndex((v) => v.id === where.id);
      if (idx !== -1) {
        const deleted = this.customerVehicles.splice(idx, 1)[0];
        return this.populateVehicle(deleted);
      }
      return null;
    },
    count: async ({ where }: { where?: { userId: string } }) => {
      return this.customerVehicles.filter((v) => !where?.userId || v.userId === where.userId).length;
    },
  };

  // --- CATEGORIES ---
  public category = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let cats = [...initialCategories];
      if (where?.parentId !== undefined) {
        cats = cats.filter((c) => c.parentId === where.parentId);
      }
      if (where?.isActive !== undefined) {
        cats = cats.filter((c) => c.isActive === where.isActive);
      }
      if (orderBy?.sortOrder === 'asc') {
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return cats.map((c) => ({
        ...c,
        children: [],
        _count: { products: initialProducts.filter((p) => p.categoryId === c.id).length },
      }));
    },
    findUnique: async ({ where, include }: { where: { id?: string; slug?: string }; include?: any }) => {
      const c = initialCategories.find(
        (cat) => (where.id && cat.id === where.id) || (where.slug && cat.slug === where.slug)
      );
      if (!c) return null;
      return {
        ...c,
        children: [],
        parent: null,
        _count: { products: initialProducts.filter((p) => p.categoryId === c.id).length },
      };
    },
  };

  // --- BRANDS ---
  public brand = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      const brands = [...initialBrands];
      if (orderBy?.name === 'asc') {
        brands.sort((a, b) => a.name.localeCompare(b.name));
      }
      return brands.map((b) => ({
        ...b,
        _count: { products: initialProducts.filter((p) => p.brandId === b.id).length },
      }));
    },
    findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
      return initialBrands.find((b) => (where.id && b.id === where.id) || (where.slug && b.slug === where.slug)) || null;
    },
  };

  // --- PRODUCT CATALOG ---
  private populateProduct(p: any) {
    const category = initialCategories.find((c) => c.id === p.categoryId) || null;
    const brandRel = initialBrands.find((b) => b.id === p.brandId) || null;
    const compatibilities = (p.compatibleVariantIds || []).map((vId: string) => {
      const variant = initialVariants.find((v) => v.id === vId);
      const model = variant ? initialModels.find((m) => m.id === variant.modelId) : null;
      const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
      return {
        id: `compat-${p.id}-${vId}`,
        productId: p.id,
        variantId: vId,
        variant: variant
          ? {
              ...variant,
              model: model ? { ...model, make: make || null } : null,
            }
          : null,
      };
    });

    const productInventories = this.inventories
      .filter((inv) => inv.productId === p.id)
      .map((inv) => {
        const shop = this.shops.find((s) => s.id === inv.shopId) || initialShops[0];
        return {
          ...inv,
          shop,
        };
      });

    return {
      ...p,
      category,
      brandRel,
      compatibilities,
      inventories: productInventories.length > 0 ? productInventories : p.inventories,
      _count: {
        reviews: p.reviews?.length || 0,
        compatibilities: compatibilities.length,
      },
    };
  }

  public product = {
    findMany: async ({
      where,
      skip = 0,
      take = 12,
      orderBy,
      include,
    }: {
      where?: any;
      skip?: number;
      take?: number;
      orderBy?: any;
      include?: any;
    } = {}) => {
      let list = initialProducts.map((p) => this.populateProduct(p));

      // Filter by active status
      if (where?.status) {
        list = list.filter((p) => p.status === where.status);
      }

      // Keyword Search
      if (where?.OR && Array.isArray(where.OR)) {
        const searchTerms = where.OR.flatMap((cond: any) =>
          Object.values(cond).map((val: any) => (val?.contains ? String(val.contains).toLowerCase() : ''))
        ).filter(Boolean);

        if (searchTerms.length > 0) {
          const query = searchTerms[0];
          list = list.filter((p) => {
            const matchesName = p.name.toLowerCase().includes(query);
            const matchesDesc = p.description.toLowerCase().includes(query);
            const matchesBrand = p.brand.toLowerCase().includes(query);
            const matchesPart = p.partNumber?.toLowerCase().includes(query);
            const matchesTags = p.tags?.some((t: string) => t.toLowerCase().includes(query));
            return matchesName || matchesDesc || matchesBrand || matchesPart || matchesTags;
          });
        }
      }

      // Filter by category
      if (where?.categoryId) {
        list = list.filter((p) => p.categoryId === where.categoryId);
      }

      // Filter by condition
      if (where?.condition) {
        list = list.filter((p) => p.condition === where.condition);
      }

      // Filter by brand
      if (where?.brandId) {
        list = list.filter((p) => p.brandId === where.brandId);
      }

      // Filter by compatibility
      if (where?.compatibilities?.some?.variantId) {
        const targetVariantId = where.compatibilities.some.variantId;
        list = list.filter((p) => p.compatibleVariantIds?.includes(targetVariantId));
      }

      // Filter by price range
      if (where?.inventories?.some) {
        const invCond = where.inventories.some;
        list = list.filter((p) => {
          const lowest = p.inventories?.[0]?.sellingPrice || p.basePrice;
          if (invCond.sellingPrice?.gte && lowest < invCond.sellingPrice.gte) return false;
          if (invCond.sellingPrice?.lte && lowest > invCond.sellingPrice.lte) return false;
          return true;
        });
      }

      // Sorting
      if (orderBy) {
        if (orderBy.name) {
          list.sort((a, b) =>
            orderBy.name === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
          );
        } else if (orderBy.basePrice) {
          list.sort((a, b) =>
            orderBy.basePrice === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
          );
        } else if (orderBy.rating) {
          list.sort((a, b) =>
            orderBy.rating === 'asc' ? a.rating - b.rating : b.rating - a.rating
          );
        } else if (orderBy.createdAt) {
          list.sort((a, b) =>
            orderBy.createdAt === 'asc'
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }

      return list.slice(skip, skip + take);
    },

    findUnique: async ({
      where,
      include,
    }: {
      where: { id?: string; slug?: string };
      include?: any;
    }) => {
      const p = initialProducts.find(
        (prod) => (where.id && prod.id === where.id) || (where.slug && prod.slug === where.slug)
      );
      if (!p) return null;
      return this.populateProduct(p);
    },

    count: async ({ where }: { where?: any } = {}) => {
      const items = await this.product.findMany({ where, skip: 0, take: 9999 });
      return items.length;
    },
  };

  public productCompatibility = {
    findFirst: async ({ where }: { where: { productId: string; variantId?: string } }) => {
      const p = initialProducts.find((prod) => prod.id === where.productId);
      if (!p) return null;
      if (where.variantId) {
        if (!p.compatibleVariantIds?.includes(where.variantId)) return null;
        return {
          id: `compat-${p.id}-${where.variantId}`,
          productId: p.id,
          variantId: where.variantId,
        };
      }
      return null;
    },
    findMany: async ({ where }: { where: { productId: string } }) => {
      const p = initialProducts.find((prod) => prod.id === where.productId);
      if (!p) return [];
      return (p.compatibleVariantIds || []).map((vId) => {
        const variant = initialVariants.find((v) => v.id === vId);
        const model = variant ? initialModels.find((m) => m.id === variant.modelId) : null;
        const make = model ? initialMakes.find((mk) => mk.id === model.makeId) : null;
        return {
          id: `compat-${p.id}-${vId}`,
          productId: p.id,
          variantId: vId,
          variant: variant ? { ...variant, model: model ? { ...model, make: make || null } : null } : null,
        };
      });
    },
  };

  public async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn(this);
  }

  public async $connect() {
    return Promise.resolve();
  }

  public async $disconnect() {
    return Promise.resolve();
  }
}

export const inMemoryDb = new InMemoryStore();
export default inMemoryDb;
