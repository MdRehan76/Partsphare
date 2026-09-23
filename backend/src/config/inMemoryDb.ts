import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ============================================================================
// 1. VEHICLE CATALOG
// ============================================================================
export const initialMakes = [
  // 4-WHEELERS (20 Major Manufacturers)
  { id: 'make-maruti', name: 'Maruti Suzuki', type: 'CAR', logoUrl: '/brands/maruti.svg', createdAt: new Date() },
  { id: 'make-hyundai', name: 'Hyundai', type: 'CAR', logoUrl: '/brands/hyundai.svg', createdAt: new Date() },
  { id: 'make-tata', name: 'Tata', type: 'CAR', logoUrl: '/brands/tata.svg', createdAt: new Date() },
  { id: 'make-honda-car', name: 'Honda', type: 'CAR', logoUrl: '/brands/honda.svg', createdAt: new Date() },
  { id: 'make-toyota', name: 'Toyota', type: 'CAR', logoUrl: '/brands/toyota.svg', createdAt: new Date() },
  { id: 'make-kia', name: 'Kia', type: 'CAR', logoUrl: '/brands/kia.svg', createdAt: new Date() },
  { id: 'make-mahindra', name: 'Mahindra', type: 'CAR', logoUrl: '/brands/mahindra.svg', createdAt: new Date() },
  { id: 'make-volkswagen', name: 'Volkswagen', type: 'CAR', logoUrl: '/brands/volkswagen.svg', createdAt: new Date() },
  { id: 'make-skoda', name: 'Skoda', type: 'CAR', logoUrl: '/brands/skoda.svg', createdAt: new Date() },
  { id: 'make-renault', name: 'Renault', type: 'CAR', logoUrl: '/brands/renault.svg', createdAt: new Date() },
  { id: 'make-nissan', name: 'Nissan', type: 'CAR', logoUrl: '/brands/nissan.svg', createdAt: new Date() },
  { id: 'make-mg', name: 'MG Motor', type: 'CAR', logoUrl: '/brands/mg.svg', createdAt: new Date() },
  { id: 'make-jeep', name: 'Jeep', type: 'CAR', logoUrl: '/brands/jeep.svg', createdAt: new Date() },
  { id: 'make-ford', name: 'Ford', type: 'CAR', logoUrl: '/brands/ford.svg', createdAt: new Date() },
  { id: 'make-bmw', name: 'BMW', type: 'CAR', logoUrl: '/brands/bmw.svg', createdAt: new Date() },
  { id: 'make-mercedes', name: 'Mercedes-Benz', type: 'CAR', logoUrl: '/brands/mercedes.svg', createdAt: new Date() },
  { id: 'make-audi', name: 'Audi', type: 'CAR', logoUrl: '/brands/audi.svg', createdAt: new Date() },
  { id: 'make-isuzu', name: 'Isuzu', type: 'CAR', logoUrl: '/brands/isuzu.svg', createdAt: new Date() },
  { id: 'make-citroen', name: 'Citroen', type: 'CAR', logoUrl: '/brands/citroen.svg', createdAt: new Date() },
  { id: 'make-volvo', name: 'Volvo', type: 'CAR', logoUrl: '/brands/volvo.svg', createdAt: new Date() },

  // 2-WHEELERS (Major Manufacturers)
  { id: 'make-hero', name: 'Hero', type: 'BIKE', logoUrl: '/brands/hero.svg', createdAt: new Date() },
  { id: 'make-bajaj', name: 'Bajaj', type: 'BIKE', logoUrl: '/brands/bajaj.svg', createdAt: new Date() },
  { id: 'make-re', name: 'Royal Enfield', type: 'BIKE', logoUrl: '/brands/royalenfield.svg', createdAt: new Date() },
  { id: 'make-yamaha', name: 'Yamaha', type: 'BIKE', logoUrl: '/brands/yamaha.svg', createdAt: new Date() },
  { id: 'make-ktm', name: 'KTM', type: 'BIKE', logoUrl: '/brands/ktm.svg', createdAt: new Date() },
  { id: 'make-honda-bike', name: 'Honda Motorcycles', type: 'BIKE', logoUrl: '/brands/honda-bike.svg', createdAt: new Date() },
  { id: 'make-tvs', name: 'TVS', type: 'SCOOTER', logoUrl: '/brands/tvs.svg', createdAt: new Date() },
  { id: 'make-suzuki-sc', name: 'Suzuki', type: 'SCOOTER', logoUrl: '/brands/suzuki.svg', createdAt: new Date() },
  { id: 'make-ola', name: 'Ola Electric', type: 'SCOOTER', logoUrl: '/brands/ola.svg', createdAt: new Date() },
];

export const initialModels = [
  // 1. Maruti Suzuki
  { id: 'model-swift', makeId: 'make-maruti', name: 'Swift', type: 'CAR', imageUrl: null },
  { id: 'model-baleno', makeId: 'make-maruti', name: 'Baleno', type: 'CAR', imageUrl: null },
  { id: 'model-brezza', makeId: 'make-maruti', name: 'Brezza', type: 'CAR', imageUrl: null },
  { id: 'model-dzire', makeId: 'make-maruti', name: 'Dzire', type: 'CAR', imageUrl: null },
  { id: 'model-fronx', makeId: 'make-maruti', name: 'Fronx', type: 'CAR', imageUrl: null },
  { id: 'model-grand-vitara', makeId: 'make-maruti', name: 'Grand Vitara', type: 'CAR', imageUrl: null },
  { id: 'model-ertiga', makeId: 'make-maruti', name: 'Ertiga', type: 'CAR', imageUrl: null },
  { id: 'model-s-presso', makeId: 'make-maruti', name: 'S-Presso', type: 'CAR', imageUrl: null },

  // 2. Hyundai
  { id: 'model-i20', makeId: 'make-hyundai', name: 'i20', type: 'CAR', imageUrl: null },
  { id: 'model-creta', makeId: 'make-hyundai', name: 'Creta', type: 'CAR', imageUrl: null },
  { id: 'model-venue', makeId: 'make-hyundai', name: 'Venue', type: 'CAR', imageUrl: null },
  { id: 'model-verna', makeId: 'make-hyundai', name: 'Verna', type: 'CAR', imageUrl: null },
  { id: 'model-exter', makeId: 'make-hyundai', name: 'Exter', type: 'CAR', imageUrl: null },
  { id: 'model-tucson', makeId: 'make-hyundai', name: 'Tucson', type: 'CAR', imageUrl: null },
  { id: 'model-aura', makeId: 'make-hyundai', name: 'Aura', type: 'CAR', imageUrl: null },

  // 3. Tata
  { id: 'model-nexon', makeId: 'make-tata', name: 'Nexon', type: 'CAR', imageUrl: null },
  { id: 'model-punch', makeId: 'make-tata', name: 'Punch', type: 'CAR', imageUrl: null },
  { id: 'model-altroz', makeId: 'make-tata', name: 'Altroz', type: 'CAR', imageUrl: null },
  { id: 'model-tiago', makeId: 'make-tata', name: 'Tiago', type: 'CAR', imageUrl: null },
  { id: 'model-harrier', makeId: 'make-tata', name: 'Harrier', type: 'CAR', imageUrl: null },
  { id: 'model-safari', makeId: 'make-tata', name: 'Safari', type: 'CAR', imageUrl: null },
  { id: 'model-tigor', makeId: 'make-tata', name: 'Tigor', type: 'CAR', imageUrl: null },

  // 4. Honda
  { id: 'model-city', makeId: 'make-honda-car', name: 'City', type: 'CAR', imageUrl: null },
  { id: 'model-amaze', makeId: 'make-honda-car', name: 'Amaze', type: 'CAR', imageUrl: null },
  { id: 'model-elevate', makeId: 'make-honda-car', name: 'Elevate', type: 'CAR', imageUrl: null },
  { id: 'model-wrv', makeId: 'make-honda-car', name: 'WR-V', type: 'CAR', imageUrl: null },

  // 5. Toyota
  { id: 'model-innova-crysta', makeId: 'make-toyota', name: 'Innova Crysta', type: 'CAR', imageUrl: null },
  { id: 'model-fortuner', makeId: 'make-toyota', name: 'Fortuner', type: 'CAR', imageUrl: null },
  { id: 'model-hyryder', makeId: 'make-toyota', name: 'Urban Cruiser Hyryder', type: 'CAR', imageUrl: null },
  { id: 'model-glanza', makeId: 'make-toyota', name: 'Glanza', type: 'CAR', imageUrl: null },
  { id: 'model-hilux', makeId: 'make-toyota', name: 'Hilux', type: 'CAR', imageUrl: null },

  // 6. Kia
  { id: 'model-seltos', makeId: 'make-kia', name: 'Seltos', type: 'CAR', imageUrl: null },
  { id: 'model-sonet', makeId: 'make-kia', name: 'Sonet', type: 'CAR', imageUrl: null },
  { id: 'model-carens', makeId: 'make-kia', name: 'Carens', type: 'CAR', imageUrl: null },
  { id: 'model-ev6', makeId: 'make-kia', name: 'EV6', type: 'CAR', imageUrl: null },

  // 7. Mahindra
  { id: 'model-scorpio-n', makeId: 'make-mahindra', name: 'Scorpio-N', type: 'CAR', imageUrl: null },
  { id: 'model-xuv700', makeId: 'make-mahindra', name: 'XUV700', type: 'CAR', imageUrl: null },
  { id: 'model-xuv300', makeId: 'make-mahindra', name: 'XUV300 / 3XO', type: 'CAR', imageUrl: null },
  { id: 'model-thar', makeId: 'make-mahindra', name: 'Thar', type: 'CAR', imageUrl: null },
  { id: 'model-bolero', makeId: 'make-mahindra', name: 'Bolero Neo', type: 'CAR', imageUrl: null },

  // 8. Volkswagen
  { id: 'model-taigun', makeId: 'make-volkswagen', name: 'Taigun', type: 'CAR', imageUrl: null },
  { id: 'model-virtus', makeId: 'make-volkswagen', name: 'Virtus', type: 'CAR', imageUrl: null },
  { id: 'model-tiguan', makeId: 'make-volkswagen', name: 'Tiguan', type: 'CAR', imageUrl: null },
  { id: 'model-polo', makeId: 'make-volkswagen', name: 'Polo', type: 'CAR', imageUrl: null },

  // 9. Skoda
  { id: 'model-kushaq', makeId: 'make-skoda', name: 'Kushaq', type: 'CAR', imageUrl: null },
  { id: 'model-slavia', makeId: 'make-skoda', name: 'Slavia', type: 'CAR', imageUrl: null },
  { id: 'model-kodiaq', makeId: 'make-skoda', name: 'Kodiaq', type: 'CAR', imageUrl: null },
  { id: 'model-octavia', makeId: 'make-skoda', name: 'Octavia', type: 'CAR', imageUrl: null },

  // 10. Renault
  { id: 'model-kiger', makeId: 'make-renault', name: 'Kiger', type: 'CAR', imageUrl: null },
  { id: 'model-kwid', makeId: 'make-renault', name: 'Kwid', type: 'CAR', imageUrl: null },
  { id: 'model-triber', makeId: 'make-renault', name: 'Triber', type: 'CAR', imageUrl: null },
  { id: 'model-duster', makeId: 'make-renault', name: 'Duster', type: 'CAR', imageUrl: null },

  // 11. Nissan
  { id: 'model-magnite', makeId: 'make-nissan', name: 'Magnite', type: 'CAR', imageUrl: null },
  { id: 'model-kicks', makeId: 'make-nissan', name: 'Kicks', type: 'CAR', imageUrl: null },
  { id: 'model-xtrail', makeId: 'make-nissan', name: 'X-Trail', type: 'CAR', imageUrl: null },

  // 12. MG Motor
  { id: 'model-hector', makeId: 'make-mg', name: 'Hector', type: 'CAR', imageUrl: null },
  { id: 'model-astor', makeId: 'make-mg', name: 'Astor', type: 'CAR', imageUrl: null },
  { id: 'model-gloster', makeId: 'make-mg', name: 'Gloster', type: 'CAR', imageUrl: null },
  { id: 'model-comet', makeId: 'make-mg', name: 'Comet EV', type: 'CAR', imageUrl: null },
  { id: 'model-zsev', makeId: 'make-mg', name: 'ZS EV', type: 'CAR', imageUrl: null },

  // 13. Jeep
  { id: 'model-compass', makeId: 'make-jeep', name: 'Compass', type: 'CAR', imageUrl: null },
  { id: 'model-meridian', makeId: 'make-jeep', name: 'Meridian', type: 'CAR', imageUrl: null },
  { id: 'model-wrangler', makeId: 'make-jeep', name: 'Wrangler', type: 'CAR', imageUrl: null },
  { id: 'model-grand-cherokee', makeId: 'make-jeep', name: 'Grand Cherokee', type: 'CAR', imageUrl: null },

  // 14. Ford
  { id: 'model-ecosport', makeId: 'make-ford', name: 'EcoSport', type: 'CAR', imageUrl: null },
  { id: 'model-endeavour', makeId: 'make-ford', name: 'Endeavour', type: 'CAR', imageUrl: null },
  { id: 'model-figo', makeId: 'make-ford', name: 'Figo', type: 'CAR', imageUrl: null },

  // 15. BMW
  { id: 'model-bmw-3series', makeId: 'make-bmw', name: '3 Series', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-5series', makeId: 'make-bmw', name: '5 Series', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x1', makeId: 'make-bmw', name: 'X1', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x3', makeId: 'make-bmw', name: 'X3', type: 'CAR', imageUrl: null },
  { id: 'model-bmw-x5', makeId: 'make-bmw', name: 'X5', type: 'CAR', imageUrl: null },

  // 16. Mercedes-Benz
  { id: 'model-merc-c-class', makeId: 'make-mercedes', name: 'C-Class', type: 'CAR', imageUrl: null },
  { id: 'model-merc-e-class', makeId: 'make-mercedes', name: 'E-Class', type: 'CAR', imageUrl: null },
  { id: 'model-merc-gla', makeId: 'make-mercedes', name: 'GLA', type: 'CAR', imageUrl: null },
  { id: 'model-merc-glc', makeId: 'make-mercedes', name: 'GLC', type: 'CAR', imageUrl: null },
  { id: 'model-merc-gle', makeId: 'make-mercedes', name: 'GLE', type: 'CAR', imageUrl: null },

  // 17. Audi
  { id: 'model-audi-a4', makeId: 'make-audi', name: 'A4', type: 'CAR', imageUrl: null },
  { id: 'model-audi-a6', makeId: 'make-audi', name: 'A6', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q3', makeId: 'make-audi', name: 'Q3', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q5', makeId: 'make-audi', name: 'Q5', type: 'CAR', imageUrl: null },
  { id: 'model-audi-q7', makeId: 'make-audi', name: 'Q7', type: 'CAR', imageUrl: null },

  // 18. Isuzu
  { id: 'model-isuzu-vcross', makeId: 'make-isuzu', name: 'D-Max V-Cross', type: 'CAR', imageUrl: null },
  { id: 'model-isuzu-mux', makeId: 'make-isuzu', name: 'MU-X', type: 'CAR', imageUrl: null },
  { id: 'model-isuzu-hilander', makeId: 'make-isuzu', name: 'Hi-Lander', type: 'CAR', imageUrl: null },

  // 19. Citroen
  { id: 'model-citroen-c3', makeId: 'make-citroen', name: 'C3', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-c3-aircross', makeId: 'make-citroen', name: 'C3 Aircross', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-basalt', makeId: 'make-citroen', name: 'Basalt', type: 'CAR', imageUrl: null },
  { id: 'model-citroen-c5', makeId: 'make-citroen', name: 'C5 Aircross', type: 'CAR', imageUrl: null },

  // 20. Volvo
  { id: 'model-volvo-xc40', makeId: 'make-volvo', name: 'XC40', type: 'CAR', imageUrl: null },
  { id: 'model-volvo-xc60', makeId: 'make-volvo', name: 'XC60', type: 'CAR', imageUrl: null },
  { id: 'model-volvo-xc90', makeId: 'make-volvo', name: 'XC90', type: 'CAR', imageUrl: null },

  // --- 2-WHEELERS ---
  // Hero
  { id: 'model-splendor', makeId: 'make-hero', name: 'Splendor Plus', type: 'BIKE', imageUrl: null },
  { id: 'model-hf-deluxe', makeId: 'make-hero', name: 'HF Deluxe', type: 'BIKE', imageUrl: null },
  { id: 'model-passion-pro', makeId: 'make-hero', name: 'Passion Pro', type: 'BIKE', imageUrl: null },
  { id: 'model-xpulse', makeId: 'make-hero', name: 'Xpulse 200 4V', type: 'BIKE', imageUrl: null },

  // Bajaj
  { id: 'model-pulsar', makeId: 'make-bajaj', name: 'Pulsar 150', type: 'BIKE', imageUrl: null },
  { id: 'model-pulsar-ns', makeId: 'make-bajaj', name: 'Pulsar NS200', type: 'BIKE', imageUrl: null },
  { id: 'model-pulsar-n250', makeId: 'make-bajaj', name: 'Pulsar N250', type: 'BIKE', imageUrl: null },
  { id: 'model-dominar', makeId: 'make-bajaj', name: 'Dominar 400', type: 'BIKE', imageUrl: null },
  { id: 'model-avenger', makeId: 'make-bajaj', name: 'Avenger Street 160', type: 'BIKE', imageUrl: null },

  // Royal Enfield
  { id: 'model-classic-350', makeId: 'make-re', name: 'Classic 350', type: 'BIKE', imageUrl: null },
  { id: 'model-hunter-350', makeId: 'make-re', name: 'Hunter 350', type: 'BIKE', imageUrl: null },
  { id: 'model-meteor-350', makeId: 'make-re', name: 'Meteor 350', type: 'BIKE', imageUrl: null },
  { id: 'model-bullet-350', makeId: 'make-re', name: 'Bullet 350', type: 'BIKE', imageUrl: null },
  { id: 'model-himalayan', makeId: 'make-re', name: 'Himalayan 450', type: 'BIKE', imageUrl: null },

  // Yamaha
  { id: 'model-r15', makeId: 'make-yamaha', name: 'YZF R15 V4', type: 'BIKE', imageUrl: null },
  { id: 'model-mt15', makeId: 'make-yamaha', name: 'MT-15 V2', type: 'BIKE', imageUrl: null },
  { id: 'model-fzs', makeId: 'make-yamaha', name: 'FZS-FI V4', type: 'BIKE', imageUrl: null },
  { id: 'model-fascino', makeId: 'make-yamaha', name: 'Fascino 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ray-zr', makeId: 'make-yamaha', name: 'Ray-ZR 125', type: 'SCOOTER', imageUrl: null },

  // KTM
  { id: 'model-duke-200', makeId: 'make-ktm', name: 'Duke 200', type: 'BIKE', imageUrl: null },
  { id: 'model-duke-390', makeId: 'make-ktm', name: 'Duke 390', type: 'BIKE', imageUrl: null },
  { id: 'model-rc390', makeId: 'make-ktm', name: 'RC 390', type: 'BIKE', imageUrl: null },

  // Honda Motorcycles & Scooters
  { id: 'model-cb300r', makeId: 'make-honda-bike', name: 'CB300R', type: 'BIKE', imageUrl: null },
  { id: 'model-unicorn', makeId: 'make-honda-bike', name: 'Unicorn', type: 'BIKE', imageUrl: null },
  { id: 'model-shine', makeId: 'make-honda-bike', name: 'Shine 125', type: 'BIKE', imageUrl: null },
  { id: 'model-activa', makeId: 'make-honda-bike', name: 'Activa 6G', type: 'SCOOTER', imageUrl: null },
  { id: 'model-dio', makeId: 'make-honda-bike', name: 'Dio 125', type: 'SCOOTER', imageUrl: null },

  // TVS
  { id: 'model-jupiter', makeId: 'make-tvs', name: 'Jupiter 110', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ntorq', makeId: 'make-tvs', name: 'Ntorq 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-iqube', makeId: 'make-tvs', name: 'iQube Electric', type: 'SCOOTER', imageUrl: null },
  { id: 'model-raider', makeId: 'make-tvs', name: 'Raider 125', type: 'BIKE', imageUrl: null },
  { id: 'model-apache', makeId: 'make-tvs', name: 'Apache RTR 160 4V', type: 'BIKE', imageUrl: null },

  // Suzuki
  { id: 'model-access', makeId: 'make-suzuki-sc', name: 'Access 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-burgman', makeId: 'make-suzuki-sc', name: 'Burgman Street 125', type: 'SCOOTER', imageUrl: null },
  { id: 'model-gixxer', makeId: 'make-suzuki-sc', name: 'Gixxer SF 250', type: 'BIKE', imageUrl: null },

  // Ola Electric
  { id: 'model-ola-s1', makeId: 'make-ola', name: 'S1 Pro', type: 'SCOOTER', imageUrl: null },
  { id: 'model-ola-s1x', makeId: 'make-ola', name: 'S1 X', type: 'SCOOTER', imageUrl: null },
];

export const initialVariants = [
  // --- 1. Maruti Suzuki ---
  { id: 'var-swift-vxi', modelId: 'model-swift', name: 'VXi', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi', modelId: 'model-swift', name: 'ZXi', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-swift-zxi-plus', modelId: 'model-swift', name: 'ZXi Plus AMT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-baleno-delta', modelId: 'model-baleno', name: 'Delta', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-baleno-alpha', modelId: 'model-baleno', name: 'Alpha CVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-brezza-vxi', modelId: 'model-brezza', name: 'VXi', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-brezza-zxi', modelId: 'model-brezza', name: 'ZXi AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1462 },
  { id: 'var-dzire-vxi', modelId: 'model-dzire', name: 'VXi CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-dzire-zxi', modelId: 'model-dzire', name: 'ZXi AMT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-fronx-delta', modelId: 'model-fronx', name: 'Delta Plus 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-fronx-alpha', modelId: 'model-fronx', name: 'Alpha 1.0 Turbo AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 998 },
  { id: 'var-gv-zeta', modelId: 'model-grand-vitara', name: 'Zeta Mild-Hybrid MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-gv-alpha-hybrid', modelId: 'model-grand-vitara', name: 'Alpha Plus Strong Hybrid e-CVT', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1490 },
  { id: 'var-ertiga-vxi', modelId: 'model-ertiga', name: 'VXi CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1462 },
  { id: 'var-ertiga-zxi', modelId: 'model-ertiga', name: 'ZXi Plus AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1462 },
  { id: 'var-spresso-vxi', modelId: 'model-s-presso', name: 'VXi Plus', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 998 },

  // --- 2. Hyundai ---
  { id: 'var-i20-magna', modelId: 'model-i20', name: 'Magna 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-i20-asta', modelId: 'model-i20', name: 'Asta (O) IVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-creta-sx', modelId: 'model-creta', name: 'SX Executive', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-creta-sx-o', modelId: 'model-creta', name: 'SX (O) Turbo DCT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-creta-n-line', modelId: 'model-creta', name: 'N Line N8 DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-venue-s', modelId: 'model-venue', name: 'S Turbo iMT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 998 },
  { id: 'var-venue-sx', modelId: 'model-venue', name: 'SX (O) Turbo DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 998 },
  { id: 'var-verna-s', modelId: 'model-verna', name: 'S 1.5 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-verna-sx-turbo', modelId: 'model-verna', name: 'SX (O) 1.5 Turbo DCT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-exter-sx', modelId: 'model-exter', name: 'SX 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-exter-sx-cng', modelId: 'model-exter', name: 'SX 1.2 Hy-CNG Dual Cylinder', year: 2024, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-tucson-signature', modelId: 'model-tucson', name: 'Signature 2.0 4WD Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1997 },
  { id: 'var-aura-sx', modelId: 'model-aura', name: 'SX 1.2 CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1197 },

  // --- 3. Tata ---
  { id: 'var-nexon-creative', modelId: 'model-nexon', name: 'Creative Plus 1.2 MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-nexon-fearless', modelId: 'model-nexon', name: 'Fearless Plus DCA', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-nexon-ev-empowered', modelId: 'model-nexon', name: 'EV Empowered Plus LR', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-punch-accomplished', modelId: 'model-punch', name: 'Accomplished Dazzle MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-punch-creative-cng', modelId: 'model-punch', name: 'Creative i-CNG', year: 2024, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-altroz-xz', modelId: 'model-altroz', name: 'XZ Plus i-Turbo MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-altroz-racer', modelId: 'model-altroz', name: 'Racer R3 1.2 Turbo', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-tiago-xz', modelId: 'model-tiago', name: 'XZ Plus i-CNG', year: 2023, fuelType: 'CNG', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-tiago-ev-xz', modelId: 'model-tiago', name: 'EV XZ Plus Tech LUX', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-harrier-xz', modelId: 'model-harrier', name: 'XZ Plus Dark Edition', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-harrier-fearless', modelId: 'model-harrier', name: 'Fearless Plus Dark AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-safari-accomplished', modelId: 'model-safari', name: 'Accomplished Plus 6-Str AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },

  // --- 4. Honda ---
  { id: 'var-city-v', modelId: 'model-city', name: 'V 5th Gen MT', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1498 },
  { id: 'var-city-zx', modelId: 'model-city', name: 'ZX e:HEV Strong Hybrid', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-amaze-vx', modelId: 'model-amaze', name: 'VX CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-amaze-s', modelId: 'model-amaze', name: 'S MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-elevate-zx', modelId: 'model-elevate', name: 'ZX CVT ADAS', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-elevate-v', modelId: 'model-elevate', name: 'V MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1498 },

  // --- 5. Toyota ---
  { id: 'var-innova-crysta-gx', modelId: 'model-innova-crysta', name: 'GX 7-Str Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2393 },
  { id: 'var-innova-crysta-zx', modelId: 'model-innova-crysta', name: 'ZX 7-Str Diesel MT', year: 2024, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2393 },
  { id: 'var-fortuner-4x4', modelId: 'model-fortuner', name: '4x4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2755 },
  { id: 'var-fortuner-legender', modelId: 'model-fortuner', name: 'Legender 4x4 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2755 },
  { id: 'var-hyryder-s-hybrid', modelId: 'model-hyryder', name: 'S Grand Strong Hybrid e-CVT', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1490 },
  { id: 'var-glanza-g', modelId: 'model-glanza', name: 'G AMT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1197 },
  { id: 'var-hilux-high', modelId: 'model-hilux', name: 'High 4x4 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2755 },

  // --- 6. Kia ---
  { id: 'var-seltos-htx', modelId: 'model-seltos', name: 'HTX 1.5 Turbo DCT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1482 },
  { id: 'var-seltos-gtx', modelId: 'model-seltos', name: 'GTX Plus 1.5 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1493 },
  { id: 'var-sonet-htx', modelId: 'model-sonet', name: 'HTX 1.5 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1493 },
  { id: 'var-carens-luxury', modelId: 'model-carens', name: 'Luxury Plus 1.5 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1493 },
  { id: 'var-ev6-gt-line', modelId: 'model-ev6', name: 'GT-Line AWD Electric', year: 2023, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },

  // --- 7. Mahindra ---
  { id: 'var-scorpio-n-z8', modelId: 'model-scorpio-n', name: 'Z8 L 4x4 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2198 },
  { id: 'var-scorpio-n-z4', modelId: 'model-scorpio-n', name: 'Z4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2198 },
  { id: 'var-xuv700-ax7', modelId: 'model-xuv700', name: 'AX7 L AWD Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2198 },
  { id: 'var-xuv300-w8', modelId: 'model-xuv300', name: 'W8 Option Turbo MT', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1197 },
  { id: 'var-thar-4x4', modelId: 'model-thar', name: 'LX Hard Top 4x4 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 2184 },
  { id: 'var-bolero-n10', modelId: 'model-bolero', name: 'N10 Option Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1493 },

  // --- 8. Volkswagen ---
  { id: 'var-taigun-topline', modelId: 'model-taigun', name: 'Topline 1.0 TSI AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-taigun-gt-plus', modelId: 'model-taigun', name: 'GT Plus 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-virtus-highline', modelId: 'model-virtus', name: 'Highline 1.0 TSI AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-virtus-gt-edge', modelId: 'model-virtus', name: 'GT Edge 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-tiguan-elegance', modelId: 'model-tiguan', name: 'Elegance 2.0 TSI 4MOTION DSG', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-polo-gt-tsi', modelId: 'model-polo', name: 'GT 1.0 TSI AT', year: 2021, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },

  // --- 9. Skoda ---
  { id: 'var-kushaq-style', modelId: 'model-kushaq', name: 'Style 1.5 TSI AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-kushaq-monte-carlo', modelId: 'model-kushaq', name: 'Monte Carlo 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-slavia-style', modelId: 'model-slavia', name: 'Style 1.5 TSI DSG', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1498 },
  { id: 'var-kodiaq-l-and-k', modelId: 'model-kodiaq', name: 'L&K 2.0 TSI 4x4 DSG', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },

  // --- 10. Renault ---
  { id: 'var-kiger-rxt', modelId: 'model-kiger', name: 'RXT Turbo CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-kwid-rxt', modelId: 'model-kwid', name: 'RXT AMT', year: 2022, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-triber-rzx', modelId: 'model-triber', name: 'RZX EASY-R AMT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },

  // --- 11. Nissan ---
  { id: 'var-magnite-tekna', modelId: 'model-magnite', name: 'Tekna Plus Turbo CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 999 },
  { id: 'var-magnite-geza', modelId: 'model-magnite', name: 'GEZA Edition 1.0 MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 999 },
  { id: 'var-xtrail-hybrid', modelId: 'model-xtrail', name: 'e-POWER Hybrid 4WD', year: 2024, fuelType: 'HYBRID', transmission: 'AUTOMATIC', engineCC: 1498 },

  // --- 12. MG Motor ---
  { id: 'var-hector-smart', modelId: 'model-hector', name: 'Smart Pro 2.0 Diesel MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1956 },
  { id: 'var-hector-sharp-pro', modelId: 'model-hector', name: 'Sharp Pro 1.5 Turbo CVT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1451 },
  { id: 'var-astor-super', modelId: 'model-astor', name: 'Super CVT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1349 },
  { id: 'var-comet-plush', modelId: 'model-comet', name: 'Plush Fast-Charging EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-zsev-exclusive', modelId: 'model-zsev', name: 'Exclusive Plus EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },

  // --- 13. Jeep ---
  { id: 'var-compass-limited', modelId: 'model-compass', name: 'Limited 2.0 Diesel 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-compass-model-s', modelId: 'model-compass', name: 'Model S (O) 4x4 Diesel AT', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-meridian-limited-plus', modelId: 'model-meridian', name: 'Limited Plus 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1956 },
  { id: 'var-wrangler-rubicon', modelId: 'model-wrangler', name: 'Rubicon 4x4 2.0 Turbo AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1995 },

  // --- 14. Ford ---
  { id: 'var-ecosport-titanium', modelId: 'model-ecosport', name: 'Titanium 1.5 Petrol MT', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1497 },
  { id: 'var-endeavour-titanium-plus', modelId: 'model-endeavour', name: 'Titanium Plus 4x4 2.0 AT', year: 2021, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1996 },
  { id: 'var-figo-titanium', modelId: 'model-figo', name: 'Titanium Blu 1.2 MT', year: 2021, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1194 },

  // --- 15. BMW ---
  { id: 'var-bmw-330li-m', modelId: 'model-bmw-3series', name: '330Li M Sport Gran Limousine', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1998 },
  { id: 'var-bmw-m340i', modelId: 'model-bmw-3series', name: 'M340i xDrive 3.0 Turbo', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 2998 },
  { id: 'var-bmw-520d-luxury', modelId: 'model-bmw-5series', name: '520d Luxury Line', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x1-sdrive18d', modelId: 'model-bmw-x1', name: 'sDrive18d M Sport', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x1-sdrive18i', modelId: 'model-bmw-x1', name: 'sDrive18i xLine', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1499 },
  { id: 'var-bmw-x3-xdrive20d', modelId: 'model-bmw-x3', name: 'xDrive20d M Sport', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1995 },
  { id: 'var-bmw-x5-xdrive30d', modelId: 'model-bmw-x5', name: 'xDrive30d xLine', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2993 },

  // --- 16. Mercedes-Benz ---
  { id: 'var-merc-c200-petrol', modelId: 'model-merc-c-class', name: 'C 200 Avantgarde Mild Hybrid', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1496 },
  { id: 'var-merc-c220d-diesel', modelId: 'model-merc-c-class', name: 'C 220d 4MATIC', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1993 },
  { id: 'var-merc-e200-exclusive', modelId: 'model-merc-e-class', name: 'E 200 Exclusive LWB', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1991 },
  { id: 'var-merc-gla200', modelId: 'model-merc-gla', name: 'GLA 200 Progressive Line', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1332 },
  { id: 'var-merc-glc300', modelId: 'model-merc-glc', name: 'GLC 300 4MATIC Coupe', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1999 },
  { id: 'var-merc-gle300d', modelId: 'model-merc-gle', name: 'GLE 300d 4MATIC LWB', year: 2024, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1993 },

  // --- 17. Audi ---
  { id: 'var-audi-a4-technology', modelId: 'model-audi-a4', name: '40 TFSI Technology', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-a4-premium', modelId: 'model-audi-a4', name: '40 TFSI Premium Plus', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-a6-technology', modelId: 'model-audi-a6', name: '45 TFSI Technology Matrix', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q3-premium-plus', modelId: 'model-audi-q3', name: '40 TFSI quattro Premium Plus', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q5-technology', modelId: 'model-audi-q5', name: '45 TFSI quattro Technology', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1984 },
  { id: 'var-audi-q7-technology', modelId: 'model-audi-q7', name: '55 TFSI quattro Technology', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 2995 },

  // --- 18. Isuzu ---
  { id: 'var-isuzu-vcross-z-prestige', modelId: 'model-isuzu-vcross', name: 'Z-Prestige 4x4 AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1898 },
  { id: 'var-isuzu-vcross-4x4-mt', modelId: 'model-isuzu-vcross', name: 'Z 4x4 MT', year: 2024, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1898 },
  { id: 'var-isuzu-mux-4x4', modelId: 'model-isuzu-mux', name: '4x4 3.0 Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 2999 },
  { id: 'var-isuzu-hilander-4x2', modelId: 'model-isuzu-hilander', name: '4x2 Crew Cab MT', year: 2023, fuelType: 'DIESEL', transmission: 'MANUAL', engineCC: 1898 },

  // --- 19. Citroen ---
  { id: 'var-citroen-c3-shine-turbo', modelId: 'model-citroen-c3', name: 'Shine 1.2 PureTech Turbo MT', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1199 },
  { id: 'var-citroen-c3-feel', modelId: 'model-citroen-c3', name: 'Feel 1.2 MT', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 1198 },
  { id: 'var-citroen-c3-aircross-max', modelId: 'model-citroen-c3-aircross', name: 'Max 7-Str 1.2 Turbo AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-citroen-basalt-max-turbo', modelId: 'model-citroen-basalt', name: 'Max 1.2 Turbo AT Coupe', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1199 },
  { id: 'var-citroen-c5-shine', modelId: 'model-citroen-c5', name: 'Shine 2.0 HDi Diesel AT', year: 2023, fuelType: 'DIESEL', transmission: 'AUTOMATIC', engineCC: 1997 },

  // --- 20. Volvo ---
  { id: 'var-volvo-xc40-b4-ultimate', modelId: 'model-volvo-xc40', name: 'B4 Ultimate Mild Hybrid AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },
  { id: 'var-volvo-xc40-recharge', modelId: 'model-volvo-xc40', name: 'Recharge Twin Motor EV', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-volvo-xc60-b5-ultimate', modelId: 'model-volvo-xc60', name: 'B5 Ultimate AWD AT', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },
  { id: 'var-volvo-xc90-b6-ultimate', modelId: 'model-volvo-xc90', name: 'B6 Ultimate 7-Str AWD AT', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 1969 },

  // --- 2-WHEELERS ---
  // Hero
  { id: 'var-splendor-drum', modelId: 'model-splendor', name: 'Drum Self-Cast BS6', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  { id: 'var-splendor-xtec', modelId: 'model-splendor', name: 'XTEC Bluetooth', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 97 },
  { id: 'var-passion-pro-xtec', modelId: 'model-passion-pro', name: 'XTEC Disc', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 113 },
  { id: 'var-xpulse-4v', modelId: 'model-xpulse', name: 'Pro 4V Rally Edition', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },

  // Bajaj
  { id: 'var-pulsar-twin', modelId: 'model-pulsar', name: 'Twin Disc BS6', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-pulsar-single', modelId: 'model-pulsar', name: 'Single Disc', year: 2022, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-ns200-standard', modelId: 'model-pulsar-ns', name: 'Dual-Channel ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },
  { id: 'var-n250-standard', modelId: 'model-pulsar-n250', name: 'Dual-Channel ABS', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 249 },
  { id: 'var-dominar-standard', modelId: 'model-dominar', name: 'Touring Edition 400', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 373 },

  // Royal Enfield
  { id: 'var-classic-halcyon', modelId: 'model-classic-350', name: 'Halcyon Series Dual-ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-classic-dark', modelId: 'model-classic-350', name: 'Dark Stealth Black Dual-ABS', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-hunter-dapper', modelId: 'model-hunter-350', name: 'Dapper Ash Retro', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-meteor-fireball', modelId: 'model-meteor-350', name: 'Fireball Yellow', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 349 },
  { id: 'var-himalayan-standard', modelId: 'model-himalayan', name: 'Hanle Black Tubeless', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 452 },

  // Yamaha
  { id: 'var-r15-v4', modelId: 'model-r15', name: 'V4 Racing Blue Quickshifter', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 155 },
  { id: 'var-mt15-v2', modelId: 'model-mt15', name: 'V2 Ice Fluo Vermillion', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 155 },
  { id: 'var-fzs-v4', modelId: 'model-fzs', name: 'V4 Deluxe Traction Control', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 149 },
  { id: 'var-fascino-std', modelId: 'model-fascino', name: 'Disc Hybrid Fi', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 125 },
  { id: 'var-ray-zr-std', modelId: 'model-ray-zr', name: 'Street Rally 125 Fi Hybrid', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 125 },

  // KTM
  { id: 'var-duke200-standard', modelId: 'model-duke-200', name: 'Electronic Orange', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 199 },
  { id: 'var-duke390-standard', modelId: 'model-duke-390', name: 'Gen 3 Quickshifter Plus', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 398 },

  // Honda Motorcycles & Scooters
  { id: 'var-unicorn-standard', modelId: 'model-unicorn', name: 'Standard Alloy CBS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 162 },
  { id: 'var-shine-standard', modelId: 'model-shine', name: 'Celebration Edition CBS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 124 },
  { id: 'var-activa-std', modelId: 'model-activa', name: 'Standard BS6', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  { id: 'var-activa-deluxe', modelId: 'model-activa', name: 'Deluxe Smart Key H-Smart', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 109 },
  { id: 'var-dio-125-std', modelId: 'model-dio', name: 'H-Smart 125', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },

  // TVS
  { id: 'var-jupiter-zx', modelId: 'model-jupiter', name: 'ZX SmartXonnect Disc', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 113 },
  { id: 'var-ntorq-race', modelId: 'model-ntorq', name: 'Race XP Stealth Edition', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-iqube-std', modelId: 'model-iqube', name: 'Standard 3.4 kWh', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-apache-160-4v', modelId: 'model-apache', name: 'RTR 160 4V Special Edition', year: 2024, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 159 },

  // Suzuki
  { id: 'var-access-std', modelId: 'model-access', name: 'Ride Connect Bluetooth Edition', year: 2023, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-burgman-std', modelId: 'model-burgman', name: 'EX Executive Luxury Maxi', year: 2024, fuelType: 'PETROL', transmission: 'AUTOMATIC', engineCC: 124 },
  { id: 'var-gixxer-sf', modelId: 'model-gixxer', name: 'SF 250 Dual Channel ABS', year: 2023, fuelType: 'PETROL', transmission: 'MANUAL', engineCC: 249 },

  // Ola Electric
  { id: 'var-ola-s1-pro', modelId: 'model-ola-s1', name: 'S1 Pro Gen 2 (4 kWh)', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
  { id: 'var-ola-s1x-2kw', modelId: 'model-ola-s1x', name: 'S1 X (3 kWh)', year: 2024, fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', engineCC: 0 },
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
    slug: 'apex-auto-care',
    ownerId: 'shop-owner-1',
    ownerName: 'Rajesh Verma',
    email: 'apex.auto@partsphare.test',
    city: 'Bengaluru',
    state: 'Karnataka',
    rating: 4.8,
    totalRatings: 128,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 12,
    vehicleCategories: ['CAR', 'BIKE', 'SCOOTER'],
    address: '12th Main Road, HAL 2nd Stage, Indiranagar',
    addressLine1: '12th Main Road, HAL 2nd Stage, Indiranagar',
    pincode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '+91 98450 12345',
    operatingHours: '08:30 AM - 08:30 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Brake Fitment', 'Battery Replacement', 'Electrical Systems', 'Doorstep Mechanic', 'Engine Diagnostics', 'Periodic Maintenance'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-2',
    name: 'Speedy Wheels Garage & Spares',
    slug: 'speedy-wheels-garage',
    ownerId: 'shop-owner-2',
    ownerName: 'Sunil Rao',
    email: 'speedy.wheels@partsphare.test',
    city: 'Mumbai',
    state: 'Maharashtra',
    rating: 4.6,
    totalRatings: 94,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 10,
    vehicleCategories: ['CAR'],
    address: 'Link Road, Andheri West',
    addressLine1: 'Link Road, Andheri West',
    pincode: '400053',
    latitude: 19.1363,
    longitude: 72.8277,
    phone: '+91 98200 54321',
    operatingHours: '09:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Engine Diagnostics', 'Spark Plug & Ignition', 'Suspension', 'Lubrication'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-3',
    name: 'Sai Car Clinic & Genuine Parts',
    slug: 'sai-car-clinic',
    ownerId: 'shop-owner-3',
    ownerName: 'Manoj Gupta',
    email: 'sai.clinic@partsphare.test',
    city: 'New Delhi',
    state: 'Delhi',
    rating: 4.9,
    totalRatings: 180,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 15,
    vehicleCategories: ['CAR', 'BIKE'],
    address: 'Block C, Connaught Place',
    addressLine1: 'Block C, Connaught Place',
    pincode: '110001',
    latitude: 28.6315,
    longitude: 77.2167,
    phone: '+91 98110 98765',
    operatingHours: '09:00 AM - 09:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['OEM Fitment', 'Brakes & Hydraulics', 'Electrical Lighting', 'Used Part Fitting'],
    serviceAvailable: true,
    isActive: true,
  },
  {
    id: 'shop-4',
    name: 'Precision Auto Works & Tuners',
    slug: 'precision-auto-works',
    ownerId: 'shop-owner-4',
    ownerName: 'Kavita Reddy',
    email: 'precision.auto@partsphare.test',
    city: 'Bengaluru',
    state: 'Karnataka',
    rating: 4.9,
    totalRatings: 215,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    commissionRate: 12,
    vehicleCategories: ['CAR', 'BIKE', 'SCOOTER'],
    address: '80 Feet Road, 4th Block, Koramangala',
    addressLine1: '80 Feet Road, 4th Block, Koramangala',
    pincode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+91 98451 99887',
    operatingHours: '08:00 AM - 08:00 PM',
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Performance Brakes', 'Starter Motor Replacement', 'Battery Diagnostics', 'Doorstep Mechanic'],
    serviceAvailable: true,
    isActive: true,
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
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600', isPrimary: true, altText: 'Exide Matrix Red Battery', sortOrder: 0 },
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
      { id: 'img-6-1', url: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600', isPrimary: true, altText: 'Uno Minda Oil Filter', sortOrder: 0 },
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
      { id: 'img-7-1', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', isPrimary: true, altText: 'Refurbished Starter Motor', sortOrder: 0 },
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
      { id: 'img-8-1', url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600', isPrimary: true, altText: 'Used Verified Fuel Pump Assembly', sortOrder: 0 },
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
      { id: 'img-9-1', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', isPrimary: true, altText: 'Amaron Pro Rider Battery', sortOrder: 0 },
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
// 4. SUBSCRIPTION PLANS & ENTITLEMENTS INITIAL DATA
// ============================================================================
export const initialSubscriptionPlans = [
  {
    id: 'plan-basic-care',
    name: 'Basic Care',
    slug: 'basic-care',
    description: 'Essential emergency roadside assistance, battery jumpstart support, and baseline discounts for commuter vehicles.',
    price: 299,
    monthlyPrice: 299,
    yearlyPrice: 2499,
    durationDays: 30,
    features: [
      '24/7 Nationwide Emergency Roadside Assistance',
      '2 Free Breakdown Tows per period (up to 25 km)',
      'Free Doorstep Battery Jumpstart & Flat Tyre Assistance',
      '5% Flat Discount on Genuine Spare Parts',
      '10% Labor Discount at Partnered Workshops',
      'Digital Vehicle Health Passbook & Service History',
    ],
    includedServices: [
      { name: 'Roadside Breakdown Assistance', description: '24/7 emergency dispatch across 500+ cities with live technician GPS tracking.' },
      { name: 'Emergency Breakdown Towing', description: 'Flatbed or wheel-lift towing to nearest authorized service center (up to 25 km free).' },
      { name: 'Doorstep Battery Jumpstart', description: 'Mobile technician dispatched with high-amperage booster pack within 30-45 minutes.' },
      { name: 'Flat Tyre Repair / Spare Swapping', description: 'Tubeless puncture repair or spare wheel fitment on the spot.' },
      { name: 'Digital Vehicle Passbook', description: 'Real-time maintenance logging with tamper-proof service records.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 5, description: '5% off on all OEM and certified OES spare parts.' },
      { category: 'Workshop Labor', discountPercent: 10, description: '10% discount on labor fees at verified mechanical hubs.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: '2 per term (up to 25 km each)' },
      { feature: 'Battery Jumpstart', limit: '2 per term' },
      { feature: 'Flat Tyre Assist', limit: '2 per term' },
    ],
    eligibility: 'All 2-Wheelers & 4-Wheelers (Cars, Bikes, Scooters) under 15 years old.',
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan-standard-care',
    name: 'Standard Care',
    slug: 'standard-care',
    description: 'Comprehensive maintenance & preventive care membership with free scheduled general servicing and diagnostic scans.',
    price: 699,
    monthlyPrice: 699,
    yearlyPrice: 5999,
    durationDays: 30,
    features: [
      'All Basic Care features included',
      '1 Free Periodic General Service (oil & filter change labor covered)',
      '1 Free 40-Point Computerized Diagnostic Health Scan',
      '5 Free Breakdown Tows per period (up to 50 km)',
      '10% Flat Discount on Genuine Spare Parts',
      '20% Labor Discount at Partnered Workshops',
      'Free Doorstep Delivery on all Spare Part Orders',
      'Priority Workshop Bay Booking',
    ],
    includedServices: [
      { name: 'All Basic Care Features Included', description: 'Unlimited access to all emergency RSA and roadside assistance benefits.' },
      { name: 'Periodic General Service', description: 'Comprehensive multipoint inspection, engine oil drain & fill, filter replacement, spark plug check, brake tuning, and wash.' },
      { name: '40-Point Computer Diagnostic Scan', description: 'OBD-II scanner health report covering engine, transmission, ABS, airbag sensors, and battery health.' },
      { name: 'Long-Distance Towing', description: '5 free tows up to 50 km radius to your preferred garage or home.' },
      { name: 'Doorstep Delivery Waiver', description: '100% free delivery on all spare parts and DIFM orders.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 10, description: '10% off on all OEM/OES components.' },
      { category: 'Workshop Labor', discountPercent: 20, description: '20% off all labor operations at partner garages.' },
      { category: 'DIFM Delivery', discountPercent: 100, description: 'Free delivery on all orders.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: '5 per term (up to 50 km each)' },
      { feature: 'Periodic General Service', limit: '1 per term' },
      { feature: 'Computer Diagnostic Scan', limit: '2 per term' },
      { feature: 'Battery Health Check', limit: 'Unlimited' },
    ],
    eligibility: 'All Cars and Motorcycles above 150cc.',
    isPopular: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan-premium-care',
    name: 'Premium Care',
    slug: 'premium-care',
    description: 'VIP automotive coverage with 2 comprehensive periodic services, unlimited towing, zero DIFM fees, and dedicated master mechanic.',
    price: 1299,
    monthlyPrice: 1299,
    yearlyPrice: 11999,
    durationDays: 30,
    features: [
      'Unlimited 24/7 Pan-India Breakdown Towing & RSA',
      '2 Free Comprehensive Periodic General Services (all consumables & labor covered)',
      'Unlimited Computerized Diagnostic Scans',
      '20% VIP Discount on All Genuine Spare Parts',
      '30% Labor Discount on Major Mechanical Repairs & Bodywork',
      '100% Doorstep DIFM Installation Fee Waiver (Free Mechanic Visit)',
      'Free Vehicle Pickup & Drop Valet Service',
      'Dedicated Personal Master Technician',
    ],
    includedServices: [
      { name: 'Unlimited 24/7 Breakdown Towing', description: 'Zero-distance restriction nationwide flatbed towing to any verified hub.' },
      { name: '2 Comprehensive Annual Services', description: 'Synthetic oil, air filter, oil filter, cabin AC filter, coolant top-up, brake bleeding, and full detailing included.' },
      { name: 'Unlimited OBD Diagnostics', description: 'On-demand doorstep computerized vehicle scans and sensor resets.' },
      { name: 'Free Doorstep DIFM Fitment', description: 'Zero labor and home visit fee on all parts installed at home.' },
      { name: 'Valet Concierge', description: 'Free insured driver pickup and drop for all garage servicing visits.' },
      { name: 'Dedicated Master Technician', description: 'Direct WhatsApp/phone access to a certified senior automotive specialist.' }
    ],
    discountBenefits: [
      { category: 'Spare Parts', discountPercent: 20, description: '20% maximum discount on all genuine parts.' },
      { category: 'Workshop Labor', discountPercent: 30, description: '30% off all major mechanical, engine, and transmission repairs.' },
      { category: 'DIFM Installation Fee', discountPercent: 100, description: '100% free doorstep DIFM mechanic labor.' },
    ],
    serviceLimits: [
      { feature: 'Emergency Towing', limit: 'Unlimited nationwide' },
      { feature: 'Periodic General Service', limit: '2 per term' },
      { feature: 'Computer Diagnostic Scan', limit: 'Unlimited' },
      { feature: 'Doorstep DIFM Home Visits', limit: 'Unlimited free visits' },
      { feature: 'Pickup & Drop Valet', limit: '4 per term' },
    ],
    eligibility: 'All Passenger Cars, SUVs, Luxury Vehicles, and Fleet Vehicles.',
    isPopular: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const initialSubscriptionEntitlements = [
  // Basic Care
  { id: 'ent-basic-1', planId: 'plan-basic-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-2', planId: 'plan-basic-care', featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-3', planId: 'plan-basic-care', featureCode: 'FLAT_TYRE_ASSIST', featureName: 'Flat Tyre Assist', limitValue: 2, isUnlimited: false },
  { id: 'ent-basic-4', planId: 'plan-basic-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 5, isUnlimited: false },
  { id: 'ent-basic-5', planId: 'plan-basic-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 10, isUnlimited: false },

  // Standard Care
  { id: 'ent-std-1', planId: 'plan-standard-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: 5, isUnlimited: false },
  { id: 'ent-std-2', planId: 'plan-standard-care', featureCode: 'GENERAL_SERVICE', featureName: 'Periodic General Service', limitValue: 1, isUnlimited: false },
  { id: 'ent-std-3', planId: 'plan-standard-care', featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: 2, isUnlimited: false },
  { id: 'ent-std-4', planId: 'plan-standard-care', featureCode: 'BATTERY_JUMPSTART', featureName: 'Battery Jump Start', limitValue: 5, isUnlimited: false },
  { id: 'ent-std-5', planId: 'plan-standard-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 10, isUnlimited: false },
  { id: 'ent-std-6', planId: 'plan-standard-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 20, isUnlimited: false },

  // Premium Care
  { id: 'ent-prem-1', planId: 'plan-premium-care', featureCode: 'FREE_TOWING', featureName: 'Free Breakdown Towing', limitValue: null, isUnlimited: true },
  { id: 'ent-prem-2', planId: 'plan-premium-care', featureCode: 'GENERAL_SERVICE', featureName: 'Comprehensive General Service', limitValue: 2, isUnlimited: false },
  { id: 'ent-prem-3', planId: 'plan-premium-care', featureCode: 'DIAGNOSTIC_SCAN', featureName: 'Computer Diagnostic Scan', limitValue: null, isUnlimited: true },
  { id: 'ent-prem-4', planId: 'plan-premium-care', featureCode: 'PARTS_DISCOUNT_PCT', featureName: 'Parts Discount Percent', limitValue: 20, isUnlimited: false },
  { id: 'ent-prem-5', planId: 'plan-premium-care', featureCode: 'LABOR_DISCOUNT_PCT', featureName: 'Labor Discount Percent', limitValue: 30, isUnlimited: false },
  { id: 'ent-prem-6', planId: 'plan-premium-care', featureCode: 'VALET_PICKUP_DROP', featureName: 'Valet Pickup & Drop', limitValue: 4, isUnlimited: false },
];

// ============================================================================
// 4B. USED PART LISTINGS INITIAL DATA
// ============================================================================
export const initialUsedPartListings = [
  {
    id: 'used_demo_1',
    sellerId: 'demo-user-1',
    title: 'OEM LED Headlight Assembly (Right)',
    partNumber: '92102-M6000',
    vehicleModel: 'Hyundai Creta 2018 - 2020 1.6L',
    category: 'LIGHTING',
    condition: 'EXCELLENT',
    conditionGrade: 'A+',
    description: 'Original OEM genuine headlight removed before upgrading to aftermarket matrix LEDs. Lenses clear, brackets intact, bulb connectors perfect.',
    purchaseAge: '1-2 Years',
    expectedPrice: 3800,
    estimatedValuation: 3400,
    finalValuation: 3400,
    payoutStatus: 'PAID',
    payoutAmount: 3400,
    payoutMethod: 'UPI',
    payoutTransactionRef: 'UPI_REF_892374921',
    images: [
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Indiranagar, Bengaluru, Karnataka - 560038',
    status: 'LISTED',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Lenses verified free of micro-cracks. Electrical testing passed. High/low beam diodes 100% operational.',
    isSold: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_2',
    sellerId: 'demo-user-1',
    title: 'Front Brake Caliper Pair with Ceramic Pads',
    partNumber: 'RE-BRK-350-BS6',
    vehicleModel: 'Royal Enfield Classic 350 (BS6)',
    category: 'BRAKES',
    condition: 'GOOD',
    conditionGrade: 'A',
    description: 'ByBre OEM twin-piston calipers. Serviced at 6,000 km, ceramic pads with ~75% life remaining.',
    purchaseAge: '6-12 Months',
    expectedPrice: 2100,
    estimatedValuation: 1800,
    finalValuation: 1800,
    payoutStatus: 'PAID',
    payoutAmount: 1800,
    payoutMethod: 'BANK_TRANSFER',
    payoutTransactionRef: 'NEFT_HDFC_91283921',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Kothrud, Pune, Maharashtra - 411038',
    status: 'PAID',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Caliper pistons polished, no hydraulic fluid weeping. Seals intact.',
    isSold: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_3',
    sellerId: 'demo-user-1',
    title: 'Alternator 12V 90A (Bosch OE)',
    partNumber: 'F002G10814',
    vehicleModel: 'Maruti Suzuki Swift DDiS Diesel',
    category: 'ELECTRICAL',
    condition: 'GOOD',
    conditionGrade: 'B+',
    description: 'Fully working Bosch alternator with pulley. Output tested steady 14.2V under load.',
    purchaseAge: '2-3 Years',
    expectedPrice: 3200,
    estimatedValuation: 2700,
    finalValuation: 2700,
    payoutStatus: 'PENDING',
    payoutAmount: 2700,
    payoutMethod: 'UPI',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Noida Sector 62, Delhi NCR - 201301',
    status: 'VALUED',
    verificationStatus: 'APPROVED',
    verificationNotes: 'Dynamic bench test passed. Output voltage 14.1V. Ready for seller payout authorization.',
    isSold: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_4',
    sellerId: 'demo-user-1',
    title: 'Electric Power Steering Column Motor',
    partNumber: '53500-T9A-H01',
    vehicleModel: 'Honda City 4th Gen i-VTEC',
    category: 'SUSPENSION',
    condition: 'EXCELLENT',
    conditionGrade: null,
    description: 'Original EPS rack module. Smooth torque sensor response, zero play.',
    purchaseAge: '1-2 Years',
    expectedPrice: 4800,
    estimatedValuation: 4200,
    finalValuation: null,
    payoutStatus: 'PENDING',
    payoutAmount: 0,
    images: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Andheri West, Mumbai, Maharashtra - 400053',
    status: 'VERIFICATION_PENDING',
    verificationStatus: 'INSPECTING',
    verificationNotes: 'Part picked up by Delivery Partner. Currently at PartSphere Hub mechanical bay for bench testing.',
    isSold: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'used_demo_5',
    sellerId: 'demo-user-1',
    title: 'Rear Combination Tail Lamp Set (LED)',
    partNumber: '35670M68P00',
    vehicleModel: 'Maruti Suzuki Baleno Alpha',
    category: 'LIGHTING',
    condition: 'LIKE_NEW',
    conditionGrade: null,
    description: 'Factory rear tail light set. Zero scratches, all clips in factory condition.',
    purchaseAge: '< 6 Months',
    expectedPrice: 2600,
    estimatedValuation: 2300,
    finalValuation: null,
    payoutStatus: 'PENDING',
    payoutAmount: 0,
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Whitefield, Bengaluru, Karnataka - 560066',
    status: 'SUBMITTED',
    verificationStatus: 'SUBMITTED',
    verificationNotes: 'Listing submitted by customer. Delivery partner pickup assignment pending.',
    isSold: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ============================================================================
// 5. IN-MEMORY STORE CLASS
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
  public subscriptionPlans: any[] = [...initialSubscriptionPlans];
  public subscriptionEntitlements: any[] = [...initialSubscriptionEntitlements];
  public customerSubscriptions: any[] = [];
  public subscriptionPayments: any[] = [];
  public usedPartListings: any[] = [...initialUsedPartListings];
  public shopJobs: any[] = [];
  public commissionLedgers: any[] = [];
  public shopDeliveries: any[] = [];
  public usedPartIntakes: any[] = [];
  public shopTickets: any[] = [];
  public deliveryPartners: any[] = [];
  public kycRecords: any[] = [];
  public kycDocuments: any[] = [];
  public deliveryAssignments: any[] = [];
  public codReconciliations: any[] = [];
  public supportTickets: any[] = [];
  public platformConfigs: any = {
    difm: {
      homeVisitBaseSurcharge: 99,
      homeVisitPerKmRate: 20,
      freeDeliveryThreshold: 999,
      standardDeliveryFee: 49,
      defaultBaseServiceFee: 299,
      optionAEnabled: true,
      optionBEnabled: true,
      optionCEnabled: true,
    },
    commissions: {
      defaultRate: 12.0,
      minRate: 10.0,
      maxRate: 15.0,
    },
  };

  constructor() {
    this.seedDefaultUser();
    this.seedInventoriesAndShops();
    this.seedDefaultAddresses();
    this.seedShopPortalData();
    this.seedDeliveryPartnerData();
    this.seedOrdersData();
    this.seedSupportTicketsData();
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

  private seedDefaultUser() {
    const passwordHash = bcrypt.hashSync('Password@123', 10);
    const demo1234Hash = bcrypt.hashSync('Demo@1234', 10);
    const shop1234Hash = bcrypt.hashSync('Shop@1234', 10);
    const rider1234Hash = bcrypt.hashSync('Rider@1234', 10);
    const admin1234Hash = bcrypt.hashSync('Admin@1234', 10);
    const admin12345Hash = bcrypt.hashSync('Admin@12345', 10);

    // 1. Customer Accounts (Official seed: demo@partsphere.in / Demo@1234)
    this.users.push({
      id: 'demo-user-1',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'demo@partsphere.in',
      password: demo1234Hash,
      phone: '+919876500002',
      avatar: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'demo-user-aarav',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav@partsphare.com',
      password: passwordHash,
      phone: '9876500001',
      avatar: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Shop Owner Accounts (Official seed: apex.shop@partsphere.in / Shop@1234)
    this.users.push({
      id: 'shop-owner-official',
      firstName: 'Ramesh',
      lastName: 'Gowda',
      email: 'apex.shop@partsphere.in',
      password: shop1234Hash,
      phone: '+919876500003',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'shop-owner-1',
      firstName: 'Rajesh',
      lastName: 'Verma',
      email: 'apex.auto@partsphare.test',
      password: passwordHash,
      phone: '+91 98450 12345',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'shop-owner-apex',
      firstName: 'Rajesh',
      lastName: 'Verma',
      email: 'apex@autocare.com',
      password: passwordHash,
      phone: '+91 98450 12346',
      avatar: null,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Delivery Partner Accounts (Official seed: rider.rajesh@partsphere.in / Rider@1234)
    this.users.push({
      id: 'rider-user-official',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rider.rajesh@partsphere.in',
      password: rider1234Hash,
      phone: '+919876500006',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'rider-user-1',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'rider.vikram@partsphare.test',
      password: passwordHash,
      phone: '+91 98451 99882',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'rider-user-vikram',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram@delivery.com',
      password: passwordHash,
      phone: '+91 98451 99883',
      avatar: null,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Admin Accounts (Official seed: admin@partsphere.in / Admin@1234)
    this.users.push({
      id: 'admin-user-official',
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@partsphere.in',
      password: admin1234Hash,
      phone: '+919876500001',
      avatar: null,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'admin-user-1',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@partsphare.test',
      password: passwordHash,
      phone: '+91 99999 00000',
      avatar: null,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.push({
      id: 'admin-user-main',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@partsphare.com',
      password: admin12345Hash,
      phone: '+91 99999 00001',
      avatar: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private seedShopPortalData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Seed initial Jobs for shop-1 (Apex Auto Care)
    this.shopJobs = [
      {
        id: 'job-101',
        shopId: 'shop-1',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        difmRequestId: 'difm-seed-101',
        jobType: 'DIFM_SHOP_VISIT',
        status: 'SCHEDULED',
        customerName: 'Rohit Sharma',
        customerPhone: '+91 98765 43210',
        customerEmail: 'rohit.sharma@example.com',
        vehicleInfo: 'Maruti Suzuki Swift 1.2 DualJet (2021)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-05-MN-9812',
        serviceName: 'Bosch Super 4 Spark Plug Installation',
        serviceFee: 350,
        homeVisitSurcharge: 0,
        totalServiceAmount: 350,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru',
        scheduledDate: new Date(`${todayStr}T14:00:00`),
        scheduledSlot: '02:00 PM - 03:30 PM',
        notes: 'Customer reported minor engine misfire on cold start.',
        mechanicAssigned: 'Vikram Singh (Senior Mechanic)',
        startedAt: null,
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'job-102',
        shopId: 'shop-1',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        difmRequestId: 'difm-seed-102',
        jobType: 'DIFM_HOME_INSTALLATION',
        status: 'IN_PROGRESS',
        customerName: 'Priya Nair',
        customerPhone: '+91 98451 22334',
        customerEmail: 'priya.nair@example.com',
        vehicleInfo: 'Hyundai Creta 1.5 SX (2022)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-03-HA-4411',
        serviceName: 'Amaron Battery Doorstep Fitment & Alternator Check',
        serviceFee: 500,
        homeVisitSurcharge: 150,
        totalServiceAmount: 650,
        locationType: 'DOORSTEP',
        serviceAddress: 'Flat 301, Palm Meadows, Whitefield, Bengaluru',
        scheduledDate: new Date(`${todayStr}T11:00:00`),
        scheduledSlot: '11:00 AM - 12:30 PM',
        notes: 'Vehicle parked in basement B2 slot 44. Gate security notified.',
        mechanicAssigned: 'Kiran Gowda (Doorstep Specialist)',
        startedAt: new Date(Date.now() - 3600000 * 1),
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'job-103',
        shopId: 'shop-1',
        orderId: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        difmRequestId: 'difm-seed-103',
        jobType: 'DIFM_SHOP_VISIT',
        status: 'COMPLETED',
        customerName: 'Anand Kulkarni',
        customerPhone: '+91 98112 33445',
        customerEmail: 'anand.k@example.com',
        vehicleInfo: 'Honda City i-VTEC (2020)',
        vehicleCategory: 'CAR',
        vehicleNumber: 'KA-01-EF-7722',
        serviceName: 'Front Brake Pad Replacement & Disc Inspection',
        serviceFee: 750,
        homeVisitSurcharge: 0,
        totalServiceAmount: 750,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, Indiranagar',
        scheduledDate: new Date(Date.now() - 86400000),
        scheduledSlot: '10:00 AM - 11:30 AM',
        notes: 'Brake pads replaced and bedded in. Road test confirmed smooth stopping.',
        mechanicAssigned: 'Vikram Singh',
        startedAt: new Date(Date.now() - 86400000 + 3600000),
        completedAt: new Date(Date.now() - 86400000 + 7200000),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'job-104',
        shopId: 'shop-1',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        difmRequestId: 'difm-seed-104',
        jobType: 'CUSTOMER_VEHICLE_VISIT',
        status: 'COMPLETED',
        customerName: 'Sunil Mehta',
        customerPhone: '+91 99001 88221',
        customerEmail: 'sunil.mehta@example.com',
        vehicleInfo: 'Royal Enfield Classic 350 (2023)',
        vehicleCategory: 'BIKE',
        vehicleNumber: 'KA-51-AB-1290',
        serviceName: 'Motul 7100 Engine Oil Flush & Chain Lubrication',
        serviceFee: 400,
        homeVisitSurcharge: 0,
        totalServiceAmount: 400,
        locationType: 'SHOP',
        serviceAddress: '12th Main Road, Indiranagar',
        scheduledDate: new Date(Date.now() - 86400000 * 2),
        scheduledSlot: '04:00 PM - 05:00 PM',
        notes: 'Chain cleaned and tension set to 25mm slack. Oil filter replaced.',
        mechanicAssigned: 'Santosh Rao',
        startedAt: new Date(Date.now() - 86400000 * 2 + 1800000),
        completedAt: new Date(Date.now() - 86400000 * 2 + 4500000),
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    // Seed Commission Ledger for shop-1 (Apex Auto Care)
    // STRICT RULE DEMONSTRATED IN SEED DATA:
    // Job 101: Scheduled, Paid via Razorpay -> LOCKED_PENDING_COMPLETION
    // Job 102: In progress, Paid via Razorpay -> LOCKED_PENDING_COMPLETION
    // Job 103: Completed, Paid via Razorpay -> RELEASED (both conditions met!)
    // Job 104: Completed, COD pending payment -> LOCKED_PENDING_PAYMENT (payment not yet cleared!)
    this.commissionLedgers = [
      {
        id: 'comm-101',
        shopId: 'shop-1',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        jobId: 'job-101',
        serviceName: 'Bosch Super 4 Spark Plug Installation',
        grossAmount: 350,
        commissionRate: 12,
        commissionAmount: 42,
        shopPayout: 308,
        serviceStatus: 'SCHEDULED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'comm-102',
        shopId: 'shop-1',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        jobId: 'job-102',
        serviceName: 'Amaron Battery Doorstep Fitment',
        grossAmount: 650,
        commissionRate: 12,
        commissionAmount: 78,
        shopPayout: 572,
        serviceStatus: 'IN_PROGRESS',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'LOCKED_PENDING_COMPLETION',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'comm-103',
        shopId: 'shop-1',
        orderId: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        jobId: 'job-103',
        serviceName: 'Front Brake Pad Replacement',
        grossAmount: 750,
        commissionRate: 12,
        commissionAmount: 90,
        shopPayout: 660,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        releaseStatus: 'RELEASED',
        payoutStatus: 'RELEASED',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'comm-104',
        shopId: 'shop-1',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        jobId: 'job-104',
        serviceName: 'Motul 7100 Engine Oil Flush',
        grossAmount: 400,
        commissionRate: 12,
        commissionAmount: 48,
        shopPayout: 352,
        serviceStatus: 'COMPLETED',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        releaseStatus: 'LOCKED_PENDING_PAYMENT',
        payoutStatus: 'PENDING',
        payoutRef: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    // Seed Incoming Deliveries for shop-1
    this.shopDeliveries = [
      {
        id: 'del-101',
        shopId: 'shop-1',
        trackingNumber: 'PND-782109',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        relatedJobId: 'job-101',
        carrier: 'PartsNexa Logistics Express',
        status: 'DELIVERED',
        items: [
          { productName: 'Bosch Super 4 Spark Plug FR78X (Set of 4)', sku: 'BOSCH-SP-FR78X', quantity: 1, condition: 'NEW' },
        ],
        eta: 'Delivered',
        receivedAt: new Date(Date.now() - 3600000 * 3),
        receivedBy: 'Ramesh (Inventory Desk)',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'del-102',
        shopId: 'shop-1',
        trackingNumber: 'PND-782194',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        relatedJobId: 'job-102',
        carrier: 'Blue Dart Surface Hub',
        status: 'IN_TRANSIT',
        items: [
          { productName: 'Amaron Pro DIN55 Automotive Battery', sku: 'AMR-PRO-55', quantity: 1, condition: 'NEW' },
        ],
        eta: 'Today, 03:30 PM',
        receivedAt: null,
        receivedBy: null,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: 'del-103',
        shopId: 'shop-1',
        trackingNumber: 'PND-782250',
        orderId: 'ord-seed-105',
        orderNumber: 'PN-2026-90510',
        relatedJobId: null,
        carrier: 'PartsNexa Hub Direct',
        status: 'EXPECTED_TODAY',
        items: [
          { productName: 'Motul 7100 4T 10W-50 Synthetic 1L', sku: 'MOT-7100-10W50', quantity: 5, condition: 'NEW' },
        ],
        eta: 'Today, 05:00 PM',
        receivedAt: null,
        receivedBy: null,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ];

    // Seed Used-Part Intakes for shop-1
    this.usedPartIntakes = [
      {
        id: 'intake-101',
        shopId: 'shop-1',
        listingId: 'used-part-1',
        partTitle: 'OEM Maruti Suzuki Swift Alternator (Denso 12V 70A)',
        sellerName: 'Vikram Singh',
        vehicleModel: 'Maruti Swift Diesel 2018',
        intakeDate: new Date(Date.now() - 86400000),
        physicalCondition: 'GOOD',
        technicalTestStatus: 'PASSED',
        technicianNotes: 'Tested on test rig under 40A load. Steady 14.2V output confirmed.',
        status: 'VERIFIED_ACCEPTED',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'intake-102',
        shopId: 'shop-1',
        listingId: 'used-part-2',
        partTitle: 'Hyundai Creta Projector Headlamp Assembly (Right)',
        sellerName: 'Deepak Patel',
        vehicleModel: 'Hyundai Creta 2020',
        intakeDate: new Date(),
        physicalCondition: 'FAIR',
        technicalTestStatus: 'NEEDS_TESTING',
        technicianNotes: 'Lens intact, slight tab scuff. Need wiring harness test for leveling motor.',
        status: 'IN_STORAGE',
        createdAt: new Date(),
      },
    ];

    // Seed Shop Support Tickets for shop-1
    this.shopTickets = [
      {
        id: 'tkt-shop-101',
        ticketNumber: 'TKT-SHP-101',
        shopId: 'shop-1',
        category: 'COMMISSION_PAYOUT',
        subject: 'Payout settlement query for August batch',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        messages: [
          {
            id: 'msg-1',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Hi team, checking when the NEFT batch for August released commissions will be processed.',
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            id: 'msg-2',
            senderName: 'PartsNexa Finance Admin',
            senderRole: 'ADMIN',
            message: 'Processed via UTR PNX99201482 into your registered HDFC bank account.',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'tkt-shop-102',
        ticketNumber: 'TKT-SHP-102',
        shopId: 'shop-1',
        category: 'PARTS_DELIVERY',
        subject: 'Tracking update for shock absorber package',
        priority: 'HIGH',
        status: 'OPEN',
        messages: [
          {
            id: 'msg-3',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Delivery PND-782194 ETA is 3:30 PM today. Customer appointment is at 4:00 PM. Kindly expedite driver dispatch.',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private seedDeliveryPartnerData() {
    this.deliveryPartners = [
      {
        id: 'partner-1',
        userId: 'rider-user-1',
        vehicleType: 'Scooter (TVS Ntorq 125)',
        vehicleNum: 'KA-01-EQ-9124',
        licenseNumber: 'DL-KA01-2021004921',
        isOnline: true,
        currentLat: 12.9716,
        currentLng: 77.5946,
        rating: 4.9,
        totalDeliveries: 142,
        isActivated: true,
        verificationStatus: 'APPROVED',
        cashInHand: 1850,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.kycRecords = [
      {
        id: 'kyc-partner-1',
        userId: 'rider-user-1',
        status: 'APPROVED',
        panNumber: 'ABCDE1234F',
        aadharNumber: 'XXXX-XXXX-9012',
        rejectionReason: null,
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        reviewedBy: 'admin-1',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];

    this.kycDocuments = [
      {
        id: 'doc-1',
        kycId: 'kyc-partner-1',
        documentType: 'PAN_CARD',
        objectKey: 'kyc/rider-user-1/pan_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-2',
        kycId: 'kyc-partner-1',
        documentType: 'AADHAAR_CARD',
        objectKey: 'kyc/rider-user-1/aadhaar_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-3',
        kycId: 'kyc-partner-1',
        documentType: 'DRIVING_LICENSE',
        objectKey: 'kyc/rider-user-1/driving_license.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'doc-4',
        kycId: 'kyc-partner-1',
        documentType: 'VEHICLE_RC',
        objectKey: 'kyc/rider-user-1/vehicle_rc.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        mimeType: 'image/jpeg',
        verificationStatus: 'APPROVED',
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];

    this.deliveryAssignments = [
      {
        id: 'assign-101',
        orderId: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        usedPartListingId: null,
        deliveryPartnerId: 'partner-1',
        type: 'CUSTOMER_DELIVERY',
        status: 'IN_TRANSIT',
        pickupLocation: {
          name: 'PartSphere Central Hub - Indiranagar',
          address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Suresh (Hub Manager)',
          phone: '+91 98450 11223',
        },
        dropLocation: {
          name: 'Aarav Sharma',
          address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
          lat: 12.9260,
          lng: 77.6762,
          contactPerson: 'Aarav Sharma',
          phone: '+91 98765 00002',
        },
        items: [
          { title: 'Bosch Super 4 Spark Plug FR78X', quantity: 1, sku: 'BOSCH-SP-FR78X', price: 950 },
        ],
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        codAmountToCollect: 0,
        codAmountCollected: 0,
        codStatus: 'NOT_APPLICABLE',
        deliveryFee: 120,
        distanceKm: 6.4,
        navigationInfo: {
          currentDistance: '2.1 km away',
          etaMinutes: 8,
          routeSummary: 'Via Marathahalli - Sarjapur Outer Ring Rd',
        },
        notes: 'Express order. Customer requested gate call on arrival.',
        assignedAt: new Date(Date.now() - 3600000 * 2),
        acceptedAt: new Date(Date.now() - 3600000 * 1.8),
        pickedUpAt: new Date(Date.now() - 3600000 * 0.8),
        deliveredAt: null,
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 0.8),
      },
      {
        id: 'assign-102',
        orderId: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        usedPartListingId: null,
        deliveryPartnerId: null, // Broadcast unassigned job available for any partner
        type: 'CUSTOMER_DELIVERY',
        status: 'ASSIGNED',
        pickupLocation: {
          name: 'Apex Auto Care (Partner Shop)',
          address: '88, 100 Feet Road, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        dropLocation: {
          name: 'Priya Nair',
          address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru - 560066',
          lat: 12.9698,
          lng: 77.7499,
          contactPerson: 'Priya Nair',
          phone: '+91 98765 12345',
        },
        items: [
          { title: 'Amaron Pro DIN55 Automotive Battery', quantity: 1, sku: 'AMARON-PRO-DIN55', price: 4200 },
        ],
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        codAmountToCollect: 4850,
        codAmountCollected: 0,
        codStatus: 'PENDING',
        deliveryFee: 180,
        distanceKm: 12.2,
        navigationInfo: {
          currentDistance: '12.2 km away',
          etaMinutes: 28,
          routeSummary: 'Via HAL Old Airport Rd to Whitefield Main Rd',
        },
        notes: 'Fragile battery package, keep upright. Collect COD cash ₹4,850.',
        assignedAt: new Date(Date.now() - 1800000),
        acceptedAt: null,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(Date.now() - 1800000),
      },
      {
        id: 'assign-103',
        orderId: null,
        orderNumber: 'PN-UP-70192',
        usedPartListingId: 'used_demo_5',
        deliveryPartnerId: 'partner-1',
        type: 'USED_PART_PICKUP',
        status: 'ASSIGNED',
        pickupLocation: {
          name: 'Seller: Deepak Patel',
          address: 'Whitefield, Bengaluru, Karnataka - 560066',
          lat: 12.9698,
          lng: 77.7499,
          contactPerson: 'Deepak Patel',
          phone: '+91 99112 33445',
        },
        dropLocation: {
          name: 'Apex Auto Care (Hub Intake)',
          address: '88, 100 Feet Road, Indiranagar, Bengaluru - 560038',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        items: [
          {
            title: 'Rear Combination Tail Lamp Set (LED)',
            quantity: 1,
            expectedPrice: 2600,
            estimatedValuation: 2300,
            condition: 'LIKE_NEW',
          },
        ],
        paymentMethod: null,
        paymentStatus: null,
        codAmountToCollect: 0,
        codAmountCollected: 0,
        codStatus: 'NOT_APPLICABLE',
        deliveryFee: 150,
        distanceKm: 11.5,
        navigationInfo: {
          currentDistance: '8.4 km away',
          etaMinutes: 22,
          routeSummary: 'Via Varthur Main Rd',
        },
        notes: 'Doorstep Used-Part Inspection required. Verify physical condition, mounting tabs, and LED circuit.',
        assignedAt: new Date(Date.now() - 3600000 * 3),
        acceptedAt: new Date(Date.now() - 3600000 * 2.5),
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 2.5),
      },
      {
        id: 'assign-104',
        orderId: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        usedPartListingId: null,
        deliveryPartnerId: 'partner-1',
        type: 'CUSTOMER_DELIVERY',
        status: 'DELIVERED',
        pickupLocation: {
          name: 'Apex Auto Care',
          address: '88, 100 Feet Road, Indiranagar',
          lat: 12.9716,
          lng: 77.6412,
          contactPerson: 'Rajesh Verma',
          phone: '+91 98450 12345',
        },
        dropLocation: {
          name: 'Sunil Mehta',
          address: '12th Main Road, Indiranagar, Bengaluru',
          lat: 12.9720,
          lng: 77.6420,
          contactPerson: 'Sunil Mehta',
          phone: '+91 99001 88221',
        },
        items: [
          { title: 'Motul 7100 4T 10W-50 Fully Synthetic Engine Oil', quantity: 1, sku: 'MOTUL-7100-10W50', price: 1850 },
        ],
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        codAmountToCollect: 1850,
        codAmountCollected: 1850,
        codStatus: 'COLLECTED', // Cash collected by partner, pending hub reconciliation
        deliveryFee: 90,
        distanceKm: 1.8,
        navigationInfo: {
          currentDistance: 'Delivered',
          etaMinutes: 0,
          routeSummary: 'Completed trip',
        },
        notes: 'Delivered successfully and collected cash ₹1,850.',
        assignedAt: new Date(Date.now() - 86400000),
        acceptedAt: new Date(Date.now() - 86400000 + 600000),
        pickedUpAt: new Date(Date.now() - 86400000 + 1800000),
        deliveredAt: new Date(Date.now() - 86400000 + 3600000),
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000 + 3600000),
      },
    ];

    this.codReconciliations = [
      {
        id: 'recon-1',
        reconciliationNumber: 'COD-REC-892101',
        deliveryPartnerId: 'partner-1',
        totalAmount: 3400,
        orderCount: 2,
        status: 'RECONCILED',
        depositMethod: 'CASH_AT_HUB',
        depositReference: 'HUB-DEP-44912',
        hubLocation: 'Indiranagar Central Logistics Hub',
        receivedBy: 'Gopal Krishna (Finance Desk)',
        notes: 'Previous cycle batch reconciliation cleared and receipt generated.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  private seedOrdersData() {
    this.orders = [
      {
        id: 'ord-seed-101',
        orderNumber: 'PN-2026-90412',
        userId: 'demo-user-1',
        addressId: 'addr-demo-home',
        status: 'IN_TRANSIT',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        subtotal: 950,
        deliveryFee: 120,
        discount: 0,
        installationFee: 350,
        homeVisitSurcharge: 0,
        total: 1420,
        couponCode: null,
        notes: 'Express order. Customer requested gate call on arrival.',
        difmType: 'SHOP_VISIT',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 0.8),
      },
      {
        id: 'ord-seed-102',
        orderNumber: 'PN-2026-90488',
        userId: 'demo-user-1',
        addressId: 'addr-demo-work',
        status: 'PROCESSING',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        subtotal: 4200,
        deliveryFee: 180,
        discount: 0,
        installationFee: 500,
        homeVisitSurcharge: 150,
        total: 5030,
        couponCode: null,
        notes: 'Fragile battery package, keep upright. Collect COD cash ₹5,030.',
        difmType: 'HOME_INSTALLATION',
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'ord-seed-103',
        orderNumber: 'PN-2026-90350',
        userId: 'demo-user-1',
        addressId: 'addr-demo-home',
        status: 'DELIVERED',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        subtotal: 1850,
        deliveryFee: 0,
        discount: 0,
        installationFee: 750,
        homeVisitSurcharge: 0,
        total: 2600,
        couponCode: null,
        notes: 'DIFM Brake pad replacement completed.',
        difmType: 'SHOP_VISIT',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'ord-seed-104',
        orderNumber: 'PN-2026-90310',
        userId: 'demo-user-1',
        addressId: 'addr-demo-work',
        status: 'DELIVERED',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        subtotal: 1850,
        deliveryFee: 90,
        discount: 0,
        installationFee: 0,
        homeVisitSurcharge: 0,
        total: 1940,
        couponCode: null,
        notes: 'Delivered successfully.',
        difmType: 'NO_INSTALLATION',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000 + 3600000),
      },
    ];

    // Seed corresponding orderItems
    this.orderItems.push(
      {
        id: 'item-101',
        orderId: 'ord-seed-101',
        productId: 'prod-001',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 950,
        totalPrice: 950,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: 'item-102',
        orderId: 'ord-seed-102',
        productId: 'prod-002',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
      {
        id: 'item-103',
        orderId: 'ord-seed-103',
        productId: 'prod-003',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 1850,
        totalPrice: 1850,
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'item-104',
        orderId: 'ord-seed-104',
        productId: 'prod-004',
        shopId: 'shop-1',
        quantity: 1,
        unitPrice: 1850,
        totalPrice: 1850,
        createdAt: new Date(Date.now() - 86400000),
      }
    );

    // Seed corresponding DIFM requests
    this.difmRequests.push(
      {
        id: 'difm-seed-101',
        orderId: 'ord-seed-101',
        shopId: 'shop-1',
        type: 'SHOP_VISIT',
        status: 'SCHEDULED',
        installationFee: 350,
        homeVisitSurcharge: 0,
        preferredDate: new Date(),
        scheduledDate: new Date(),
        notes: 'Bosch spark plug installation appointment.',
        createdAt: new Date(Date.now() - 3600000 * 5),
        updatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: 'difm-seed-102',
        orderId: 'ord-seed-102',
        shopId: 'shop-1',
        type: 'HOME_INSTALLATION',
        status: 'IN_PROGRESS',
        installationFee: 500,
        homeVisitSurcharge: 150,
        preferredDate: new Date(),
        scheduledDate: new Date(),
        notes: 'Doorstep battery installation.',
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'difm-seed-103',
        orderId: 'ord-seed-103',
        shopId: 'shop-1',
        type: 'SHOP_VISIT',
        status: 'COMPLETED',
        installationFee: 750,
        homeVisitSurcharge: 0,
        preferredDate: new Date(Date.now() - 86400000),
        scheduledDate: new Date(Date.now() - 86400000),
        notes: 'Front brake replacement completed.',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000),
      }
    );
  }

  private seedSupportTicketsData() {
    this.supportTickets = [
      {
        id: 'tkt-cust-101',
        ticketNumber: 'TKT-2026-1001',
        userId: 'demo-user-1',
        userName: 'Aarav Sharma',
        userEmail: 'demo@partsphere.in',
        userRole: 'CUSTOMER',
        category: 'ORDER_ISSUE',
        subject: 'Fitment inquiry for Bosch spark plugs on Swift 2022',
        priority: 'MEDIUM',
        slaHours: 24,
        slaDeadline: new Date(Date.now() + 24 * 3600000),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-cust-1',
            senderId: 'demo-user-1',
            senderName: 'Aarav Sharma',
            senderRole: 'CUSTOMER',
            message: 'Hello, I ordered Bosch Super 4 Spark Plugs. Can the technician bring gapping tools during home installation?',
            createdAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: 'tkt-shop-101',
        ticketNumber: 'TKT-2026-1002',
        userId: 'shop-owner-1',
        userName: 'Rajesh Verma',
        userEmail: 'apex.auto@partsphare.test',
        userRole: 'SHOP_OWNER',
        category: 'COMMISSION_PAYOUT',
        subject: 'Weekly commission settlement reference request',
        priority: 'HIGH',
        slaHours: 6,
        slaDeadline: new Date(Date.now() + 6 * 3600000),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'IN_PROGRESS',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-shop-1',
            senderId: 'shop-owner-1',
            senderName: 'Rajesh Verma',
            senderRole: 'SHOP_OWNER',
            message: 'Our completed DIFM batch from yesterday has 3 orders. When will the direct bank deposit be processed?',
            createdAt: new Date(Date.now() - 3600000 * 3),
          },
          {
            id: 'msg-shop-2',
            senderId: 'admin-user-1',
            senderName: 'Super Admin',
            senderRole: 'ADMIN',
            message: 'Hi Rajesh, the payout batch PO-APX-500588 has been queued for automated settlement tonight.',
            createdAt: new Date(Date.now() - 3600000 * 1),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        id: 'tkt-rider-101',
        ticketNumber: 'TKT-2026-1003',
        userId: 'rider-user-1',
        userName: 'Vikram Singh',
        userEmail: 'rider.vikram@partsphare.test',
        userRole: 'DELIVERY_PARTNER',
        category: 'DELIVERY_DELAY',
        subject: 'Gated community security passcode verification',
        priority: 'URGENT',
        slaHours: 2,
        slaDeadline: new Date(Date.now() + 2 * 3600000),
        assignedAdminId: null,
        assignedAdminName: null,
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages: [
          {
            id: 'msg-rider-1',
            senderId: 'rider-user-1',
            senderName: 'Vikram Singh',
            senderRole: 'DELIVERY_PARTNER',
            message: 'Gate security at Palm Meadows requires approval code for battery delivery. Customer not answering intercom.',
            createdAt: new Date(Date.now() - 3600000 * 0.5),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 0.5),
        updatedAt: new Date(Date.now() - 3600000 * 0.5),
      },
      {
        id: 'tkt-cust-102',
        ticketNumber: 'TKT-2026-1004',
        userId: 'demo-user-1',
        userName: 'Priya Patel',
        userEmail: 'priya.patel@example.com',
        userRole: 'CUSTOMER',
        category: 'USED_PART_VALUATION',
        subject: 'Used Alternator pickup inspection confirmation',
        priority: 'LOW',
        slaHours: 48,
        slaDeadline: new Date(Date.now() - 3600000 * 2),
        assignedAdminId: 'admin-user-1',
        assignedAdminName: 'Super Admin',
        status: 'RESOLVED',
        resolutionNotes: 'Technician verified item condition as Grade A. Payout ₹2,080 approved.',
        resolvedAt: new Date(Date.now() - 3600000 * 12),
        messages: [
          {
            id: 'msg-cust-2',
            senderId: 'demo-user-1',
            senderName: 'Priya Patel',
            senderRole: 'CUSTOMER',
            message: 'Listing used_demo_5 was inspected this morning. When will my UPI payout reflect?',
            createdAt: new Date(Date.now() - 3600000 * 24),
          },
          {
            id: 'msg-admin-2',
            senderId: 'admin-user-1',
            senderName: 'Super Admin',
            senderRole: 'ADMIN',
            message: 'Inspection Grade A has been verified and UPI transfer of ₹2,080 initiated.',
            createdAt: new Date(Date.now() - 3600000 * 12),
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 24),
        updatedAt: new Date(Date.now() - 3600000 * 12),
      },
    ];
  }

  // --- USER ---
  public user = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.users.filter((u) => {
        if (where?.role && u.role !== where.role) return false;
        if (where?.status && u.status !== where.status) return false;
        return true;
      });
      return list;
    },
    findUnique: async ({ where, select }: { where: { email?: string; id?: string }; select?: any }) => {
      const u = this.users.find(
        (usr) => (where.email && usr.email.toLowerCase() === where.email.toLowerCase()) || (where.id && usr.id === where.id)
      );
      if (!u) return null;
      const countVehicles = this.customerVehicles.filter((v) => v.userId === u.id).length;
      const linkedShop = this.shops.find((s) => s.ownerId === u.id) || (u.role === 'SHOP_OWNER' ? this.shops[0] : null);
      const deliveryPartner = this.deliveryPartners.find((dp) => dp.userId === u.id) || (u.role === 'DELIVERY_PARTNER' ? this.deliveryPartners[0] : null);
      const kyc = this.kycRecords.find((k) => k.userId === u.id) || null;
      return {
        ...u,
        shop: linkedShop,
        deliveryPartner,
        kyc,
        _count: { orders: 0, customerVehicles: countVehicles },
      };
    },
    findFirst: async ({ where, select }: { where?: any; select?: any } = {}) => {
      const u = this.users.find((usr) => {
        if (where?.id && usr.id !== where.id) return false;
        if (where?.email && usr.email.toLowerCase() !== where.email.toLowerCase()) return false;
        if (where?.role && usr.role !== where.role) return false;
        if (where?.status && usr.status !== where.status) return false;
        return true;
      });
      if (!u) return null;
      return u;
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
        ) || this.inventories.find((i) => i.productId === item.productId);

        const fallbackPrice = inv?.sellingPrice ? Number(inv.sellingPrice) : (p?.basePrice ? Number(p.basePrice) : (p?.mrp ? Number(p.mrp) : 0));
        const resolvedPrice = (item.priceSnapshot !== undefined && item.priceSnapshot !== null && !isNaN(Number(item.priceSnapshot)) && Number(item.priceSnapshot) > 0)
          ? Number(item.priceSnapshot)
          : fallbackPrice;

        return {
          ...item,
          priceSnapshot: resolvedPrice,
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
      const inv = this.inventories.find(
        (i) => i.productId === data.productId && i.shopId === data.shopId
      ) || this.inventories.find((i) => i.productId === data.productId);
      const p = initialProducts.find((prod) => prod.id === data.productId);
      const fallbackPrice = inv?.sellingPrice ? Number(inv.sellingPrice) : (p?.basePrice ? Number(p.basePrice) : 0);
      const resolvedPrice = (data.priceSnapshot !== undefined && data.priceSnapshot !== null && !isNaN(Number(data.priceSnapshot)) && Number(data.priceSnapshot) > 0)
        ? Number(data.priceSnapshot)
        : fallbackPrice;

      const newItem = {
        id: crypto.randomUUID(),
        cartId: data.cartId,
        productId: data.productId,
        shopId: data.shopId,
        quantity: Math.max(1, Number(data.quantity) || 1),
        priceSnapshot: resolvedPrice,
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
      let list = this.inventories.filter((inv) => {
        if (where?.productId && inv.productId !== where.productId) return false;
        if (where?.shopId && inv.shopId !== where.shopId) return false;
        if (where?.isAvailable !== undefined && inv.isAvailable !== where.isAvailable) return false;
        return true;
      });
      return list.map((inv) => {
        const prod = initialProducts.find((p) => p.id === inv.productId);
        const shop = this.shops.find((s) => s.id === inv.shopId);
        return {
          ...inv,
          product: prod ? this.populateProduct(prod) : null,
          shop: shop ? { id: shop.id, name: shop.name, city: shop.city } : null,
        };
      });
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || 'inv-' + Math.random().toString(36).substring(2, 9);
      const qty = Math.max(0, Number(data.quantity ?? 0));
      const newInv = {
        id,
        productId: data.productId,
        shopId: data.shopId || 'shop-1',
        quantity: qty,
        reservedQty: 0,
        sellingPrice: Number(data.sellingPrice || 999),
        isAvailable: qty > 0,
        availabilityStatus:
          qty > 0 ? (qty <= (data.lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
        lowStockThreshold: data.lowStockThreshold || 5,
        updatedAt: new Date(),
      };
      this.inventories.unshift(newInv);
      return newInv;
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
      let qty = this.inventories[idx].quantity;
      if (data.quantity !== undefined) {
        qty = Math.max(0, Number(data.quantity));
      } else if (data.decrement !== undefined) {
        qty = Math.max(0, qty - Number(data.decrement));
      } else if (data.increment !== undefined) {
        qty = qty + Number(data.increment);
      }
      this.inventories[idx] = {
        ...this.inventories[idx],
        ...data,
        quantity: qty,
        availabilityStatus:
          qty > 0 ? (qty <= (this.inventories[idx].lowStockThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
        isAvailable: qty > 0,
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
          if (where?.ownerId && s.ownerId !== where.ownerId) return false;
          if (where?.slug && s.slug !== where.slug) return false;
          if (where?.email && s.email?.toLowerCase() !== where.email?.toLowerCase()) return false;
          if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
          return true;
        }) || null
      );
    },
    findUnique: async ({ where }: { where: { id?: string; slug?: string; ownerId?: string } }) => {
      return (
        this.shops.find(
          (s) =>
            (where.id && s.id === where.id) ||
            (where.slug && s.slug === where.slug) ||
            (where.ownerId && s.ownerId === where.ownerId)
        ) || null
      );
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.shops.filter((s) => {
        if (where?.isActive !== undefined && s.isActive !== where.isActive) return false;
        if (where?.isVerified !== undefined && s.isVerified !== where.isVerified) return false;
        if (where?.city) {
          const c = typeof where.city === 'object' && where.city.equals ? where.city.equals : where.city;
          if (s.city.toLowerCase() !== c.toLowerCase()) return false;
        }
        return true;
      });
      if (orderBy?.rating === 'desc') {
        list.sort((a, b) => b.rating - a.rating);
      }
      return list;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'shop-' + (this.shops.length + 1);
      const newShop = {
        id,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        ownerId: data.ownerId,
        ownerName: data.ownerName || '',
        email: data.email || null,
        phone: data.phone,
        address: data.address || data.addressLine1,
        addressLine1: data.addressLine1 || data.address,
        city: data.city,
        state: data.state || 'Karnataka',
        pincode: data.pincode,
        latitude: Number(data.latitude || 12.9716),
        longitude: Number(data.longitude || 77.5946),
        rating: 5.0,
        totalRatings: 1,
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        verificationStatus: data.verificationStatus || 'VERIFIED',
        commissionRate: Number(data.commissionRate || 12),
        vehicleCategories: Array.isArray(data.vehicleCategories) ? data.vehicleCategories : ['CAR', 'BIKE', 'SCOOTER'],
        servicesOffered: Array.isArray(data.servicesOffered) ? data.servicesOffered : ['General Service', 'Brake Fitment'],
        supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
        operatingHours: data.operatingHours || '09:00 AM - 08:00 PM',
        serviceAvailable: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shops.push(newShop);
      return newShop;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shops.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;
      this.shops[idx] = { ...this.shops[idx], ...data, updatedAt: new Date() };
      return this.shops[idx];
    },
  };

  // --- SHOP JOB ---
  public shopJob = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.shopJobs.filter((j) => {
        if (where?.shopId && j.shopId !== where.shopId) return false;
        if (where?.status && j.status !== where.status) return false;
        if (where?.jobType && j.jobType !== where.jobType) return false;
        return true;
      });
      if (orderBy?.scheduledDate === 'desc') {
        list.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      } else {
        list.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopJobs.find((j) => j.id === where.id) || null;
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.shopJobs.find((j) => {
          if (where?.id && j.id !== where.id) return false;
          if (where?.shopId && j.shopId !== where.shopId) return false;
          if (where?.orderId && j.orderId !== where.orderId) return false;
          return true;
        }) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = 'job-' + (this.shopJobs.length + 101);
      const newJob = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shopJobs.unshift(newJob);
      return newJob;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopJobs.findIndex((j) => j.id === where.id);
      if (idx === -1) return null;
      const updated = { ...this.shopJobs[idx], ...data, updatedAt: new Date() };
      this.shopJobs[idx] = updated;

      // When job status changes, sync with commission ledger and DIFM request
      if (data.status) {
        if (updated.difmRequestId || updated.orderId) {
          const difmIdx = this.difmRequests.findIndex(
            (d) =>
              (updated.difmRequestId && d.id === updated.difmRequestId) ||
              (updated.orderId && d.orderId === updated.orderId)
          );
          if (difmIdx !== -1) {
            this.difmRequests[difmIdx].status =
              data.status === 'COMPLETED'
                ? 'COMPLETED'
                : data.status === 'CANCELLED'
                ? 'CANCELLED'
                : 'ACCEPTED';
            this.difmRequests[difmIdx].updatedAt = new Date();
          }
        }

        if (updated.orderId && data.status === 'COMPLETED') {
          this.orderTrackings.push({
            id: crypto.randomUUID(),
            orderId: updated.orderId,
            status: 'DIFM_COMPLETED',
            message: 'DIFM installation completed by certified workshop technician.',
            createdAt: new Date(),
          });
        }

        const commIdx = this.commissionLedgers.findIndex(
          (c) => c.jobId === updated.id || (updated.orderId && c.orderId === updated.orderId)
        );
        if (commIdx !== -1) {
          const comm = this.commissionLedgers[commIdx];
          comm.serviceStatus = data.status;
          // STRICT RULE: Commission released ONLY when BOTH service is COMPLETED AND payment is PAID
          if (data.status === 'COMPLETED' && comm.paymentStatus === 'PAID') {
            comm.releaseStatus = 'RELEASED';
            comm.payoutStatus = 'RELEASED';
          } else if (data.status === 'COMPLETED' && comm.paymentStatus !== 'PAID') {
            comm.releaseStatus = 'LOCKED_PENDING_PAYMENT';
          } else if (data.status !== 'COMPLETED' && comm.paymentStatus === 'PAID') {
            comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
          }
          comm.updatedAt = new Date();
        }
      }
      return updated;
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.shopJobs.filter((j) => {
        if (where?.shopId && j.shopId !== where.shopId) return false;
        if (where?.status && j.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  public mechanicJob = this.shopJob;

  // --- COMMISSION LEDGER ---
  public commissionLedger = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.commissionLedgers.filter((c) => {
        if (where?.shopId && c.shopId !== where.shopId) return false;
        if (where?.payoutStatus && c.payoutStatus !== where.payoutStatus) return false;
        if (where?.releaseStatus && c.releaseStatus !== where.releaseStatus) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.commissionLedgers.find((c) => c.id === where.id) || null;
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.commissionLedgers.find((c) => {
          if (where?.id && c.id !== where.id) return false;
          if (where?.shopId && c.shopId !== where.shopId) return false;
          if (where?.orderId && c.orderId !== where.orderId) return false;
          return true;
        }) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const id = 'comm-' + (this.commissionLedgers.length + 101);
      const gross = Number(data.grossAmount || 0);
      const rate = Number(data.commissionRate || 12);
      const commissionAmount = Number(data.commissionAmount || Math.round(gross * (rate / 100)));
      const shopPayout = Number(data.shopPayout || (gross - commissionAmount));
      
      const serviceStatus = data.serviceStatus || 'SCHEDULED';
      const paymentStatus = data.paymentStatus || 'PENDING';
      let releaseStatus = 'LOCKED_PENDING_COMPLETION';
      if (serviceStatus === 'COMPLETED' && paymentStatus === 'PAID') {
        releaseStatus = 'RELEASED';
      } else if (serviceStatus === 'COMPLETED' && paymentStatus !== 'PAID') {
        releaseStatus = 'LOCKED_PENDING_PAYMENT';
      } else if (serviceStatus !== 'COMPLETED' && paymentStatus === 'PAID') {
        releaseStatus = 'LOCKED_PENDING_COMPLETION';
      }

      const item = {
        id,
        shopId: data.shopId,
        orderId: data.orderId || null,
        orderNumber: data.orderNumber || null,
        jobId: data.jobId || null,
        serviceName: data.serviceName || 'DIFM Service',
        grossAmount: gross,
        commissionRate: rate,
        commissionAmount,
        shopPayout,
        serviceStatus,
        paymentStatus,
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        releaseStatus: data.releaseStatus || releaseStatus,
        payoutStatus: (data.releaseStatus || releaseStatus) === 'RELEASED' ? 'RELEASED' : (data.payoutStatus || 'PENDING'),
        payoutRef: data.payoutRef || null,
        paidAt: data.paidAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.commissionLedgers.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.commissionLedgers.findIndex((c) => c.id === where.id);
      if (idx === -1) return null;
      this.commissionLedgers[idx] = { ...this.commissionLedgers[idx], ...data, updatedAt: new Date() };
      return this.commissionLedgers[idx];
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.commissionLedgers.filter((c) => {
        if (where?.shopId && c.shopId !== where.shopId) return false;
        return true;
      }).length;
    },
  };

  // --- SHOP DELIVERY ---
  public shopDelivery = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.shopDeliveries
        .filter((d) => !where?.shopId || d.shopId === where.shopId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopDeliveries.find((d) => d.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'del-' + (this.shopDeliveries.length + 101);
      const item = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.shopDeliveries.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopDeliveries.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      this.shopDeliveries[idx] = { ...this.shopDeliveries[idx], ...data, updatedAt: new Date() };
      return this.shopDeliveries[idx];
    },
  };

  // --- USED PART INTAKE ---
  public usedPartIntake = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.usedPartIntakes
        .filter((i) => !where?.shopId || i.shopId === where.shopId)
        .sort((a, b) => new Date(b.intakeDate).getTime() - new Date(a.intakeDate).getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.usedPartIntakes.find((i) => i.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'intake-' + (this.usedPartIntakes.length + 101);
      const item = { id, ...data, intakeDate: new Date(), createdAt: new Date(), updatedAt: new Date() };
      this.usedPartIntakes.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.usedPartIntakes.findIndex((i) => i.id === where.id);
      if (idx === -1) return null;
      this.usedPartIntakes[idx] = { ...this.usedPartIntakes[idx], ...data, updatedAt: new Date() };
      return this.usedPartIntakes[idx];
    },
  };

  // --- SHOP TICKET ---
  public shopTicket = {
    findMany: async ({ where }: { where?: any } = {}) => {
      return this.shopTickets
        .filter((t) => !where?.shopId || t.shopId === where.shopId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.shopTickets.find((t) => t.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const num = 100 + this.shopTickets.length + 1;
      const item = {
        id: 'tkt-shop-' + num,
        ticketNumber: `TKT-SHP-${num}`,
        status: 'OPEN',
        messages: [],
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shopTickets.unshift(item);
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.shopTickets.findIndex((t) => t.id === where.id);
      if (idx === -1) return null;
      this.shopTickets[idx] = { ...this.shopTickets[idx], ...data, updatedAt: new Date() };
      return this.shopTickets[idx];
    },
  };

  // --- DELIVERY PARTNERS ---
  public deliveryPartner = {
    findUnique: async ({ where, include }: { where: { id?: string; userId?: string }; include?: any }) => {
      const p = this.deliveryPartners.find(
        (dp) => (where.id && dp.id === where.id) || (where.userId && dp.userId === where.userId)
      );
      if (!p) return null;
      const user = include?.user ? this.users.find((u) => u.id === p.userId) : null;
      const rawKyc = this.kycRecords.find((k) => k.userId === p.userId) || null;
      const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
      return {
        ...p,
        user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
        kyc,
      };
    },
    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      const p = this.deliveryPartners.find((dp) => {
        if (where?.id && dp.id !== where.id) return false;
        if (where?.userId && dp.userId !== where.userId) return false;
        if (where?.isOnline !== undefined && dp.isOnline !== where.isOnline) return false;
        if (where?.OR && Array.isArray(where.OR)) {
          const match = where.OR.some((cond: any) => {
            if (cond.id && dp.id === cond.id) return true;
            if (cond.userId && dp.userId === cond.userId) return true;
            return false;
          });
          if (!match) return false;
        }
        return true;
      });
      if (!p) return null;
      const user = include?.user ? this.users.find((u) => u.id === p.userId) : null;
      const rawKyc = this.kycRecords.find((k) => k.userId === p.userId) || null;
      const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
      return {
        ...p,
        user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
        kyc,
      };
    },
    findMany: async ({ where, include }: { where?: any; include?: any } = {}) => {
      return this.deliveryPartners
        .filter((dp) => {
          if (where?.isOnline !== undefined && dp.isOnline !== where.isOnline) return false;
          if (where?.verificationStatus !== undefined && dp.verificationStatus !== where.verificationStatus) return false;
          if (where?.vehicleType !== undefined && dp.vehicleType !== where.vehicleType) return false;
          return true;
        })
        .map((dp) => {
          const user = include?.user ? this.users.find((u) => u.id === dp.userId) : null;
          const rawKyc = this.kycRecords.find((k) => k.userId === dp.userId) || null;
          const kyc = rawKyc ? { ...rawKyc, documents: this.kycDocuments.filter((d) => d.kycId === rawKyc.id) } : null;
          return {
            ...dp,
            user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null,
            kyc,
            assignments: [],
          };
        });
    },
    create: async ({ data }: { data: any }) => {
      const id = 'partner-' + (this.deliveryPartners.length + 1);
      const newPartner = {
        id,
        userId: data.userId,
        vehicleType: data.vehicleType || 'Bike',
        vehicleNum: data.vehicleNum || null,
        licenseNumber: data.licenseNumber || null,
        isOnline: data.isOnline !== undefined ? data.isOnline : false,
        isActivated: data.isActivated !== undefined ? data.isActivated : false,
        verificationStatus: data.verificationStatus || 'PENDING',
        currentLat: data.currentLat || 12.9716,
        currentLng: data.currentLng || 77.5946,
        rating: 5.0,
        totalDeliveries: 0,
        cashInHand: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.deliveryPartners.push(newPartner);
      return newPartner;
    },
    update: async ({ where, data }: { where: { id?: string; userId?: string }; data: any }) => {
      const idx = this.deliveryPartners.findIndex(
        (dp) => (where.id && dp.id === where.id) || (where.userId && dp.userId === where.userId)
      );
      if (idx === -1) return null;
      this.deliveryPartners[idx] = { ...this.deliveryPartners[idx], ...data, updatedAt: new Date() };
      return this.deliveryPartners[idx];
    },
    count: async () => this.deliveryPartners.length,
  };

  // --- KYC & DOCUMENTS ---
  public kYC = {
    findUnique: async ({ where, include }: { where: { userId?: string; id?: string }; include?: any }) => {
      const k = this.kycRecords.find(
        (rec) => (where.userId && rec.userId === where.userId) || (where.id && rec.id === where.id)
      );
      if (!k) return null;
      const documents = this.kycDocuments.filter((d) => d.kycId === k.id);
      return { ...k, documents };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const k = this.kycRecords.find(
        (rec) => (!where.userId || rec.userId === where.userId) && (!where.id || rec.id === where.id)
      );
      if (!k) return null;
      const documents = this.kycDocuments.filter((d) => d.kycId === k.id);
      return { ...k, documents };
    },
    upsert: async ({ where, create, update }: { where: { userId: string }; create: any; update: any }) => {
      let k = this.kycRecords.find((rec) => rec.userId === where.userId);
      if (k) {
        Object.assign(k, update, { updatedAt: new Date() });
        return { ...k, documents: this.kycDocuments.filter((d) => d.kycId === k.id) };
      }
      const id = 'kyc-' + Math.random().toString(36).substring(2, 9);
      const newRec = {
        id,
        userId: where.userId,
        status: create.status || 'NOT_SUBMITTED',
        panNumber: create.panNumber || null,
        aadharNumber: create.aadharNumber || null,
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycRecords.push(newRec);
      return { ...newRec, documents: [] };
    },
    create: async ({ data }: { data: any }) => {
      const id = 'kyc-' + Math.random().toString(36).substring(2, 9);
      const newRec = {
        id,
        userId: data.userId,
        status: data.status || 'NOT_SUBMITTED',
        panNumber: data.panNumber || null,
        aadharNumber: data.aadharNumber || null,
        rejectionReason: data.rejectionReason || null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycRecords.push(newRec);
      return { ...newRec, documents: [] };
    },
    update: async ({ where, data }: { where: { userId?: string; id?: string }; data: any }) => {
      const idx = this.kycRecords.findIndex(
        (rec) => (where.userId && rec.userId === where.userId) || (where.id && rec.id === where.id)
      );
      if (idx === -1) return null;
      this.kycRecords[idx] = { ...this.kycRecords[idx], ...data, updatedAt: new Date() };
      return {
        ...this.kycRecords[idx],
        documents: this.kycDocuments.filter((d) => d.kycId === this.kycRecords[idx].id),
      };
    },
  };
  public kyc = this.kYC;

  public kYCDocument = {
    findMany: async ({ where }: { where?: { kycId?: string } } = {}) => {
      return this.kycDocuments.filter((d) => !where?.kycId || d.kycId === where.kycId);
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.kycDocuments.find((d) => d.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const doc = {
        id: 'kdoc-' + Math.random().toString(36).substring(2, 9),
        kycId: data.kycId,
        documentType: data.documentType,
        objectKey: data.objectKey || `kyc/${data.kycId}/${data.documentType.toLowerCase()}.pdf`,
        fileUrl: data.fileUrl || `https://storage.partsphare.test/kyc/${data.documentType.toLowerCase()}`,
        mimeType: data.mimeType || 'application/pdf',
        verificationStatus: data.verificationStatus || 'PENDING',
        rejectionReason: data.rejectionReason || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kycDocuments.push(doc);
      return doc;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.kycDocuments.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      this.kycDocuments[idx] = { ...this.kycDocuments[idx], ...data, updatedAt: new Date() };
      return this.kycDocuments[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.kycDocuments.findIndex((d) => d.id === where.id);
      if (idx === -1) return null;
      return this.kycDocuments.splice(idx, 1)[0];
    },
  };

  // --- DELIVERY ASSIGNMENTS ---
  public deliveryAssignment = {
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let list = this.deliveryAssignments.filter((a) => {
        if (where?.deliveryPartnerId !== undefined) {
          if (where.deliveryPartnerId === null) {
            if (a.deliveryPartnerId !== null) return false;
          } else {
            if (a.deliveryPartnerId !== where.deliveryPartnerId) return false;
          }
        }
        if (where?.status) {
          if (typeof where.status === 'string') {
            if (a.status !== where.status) return false;
          } else if (where.status.in && Array.isArray(where.status.in)) {
            if (!where.status.in.includes(a.status)) return false;
          }
        }
        if (where?.orderId && a.orderId !== where.orderId) return false;
        return true;
      });

      if (orderBy?.assignedAt === 'desc' || orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.assignedAt || b.createdAt).getTime() - new Date(a.assignedAt || a.createdAt).getTime());
      }

      return list.map((a) => {
        const order = include?.order && a.orderId ? this.orders.find((o) => o.id === a.orderId) : null;
        const partner = include?.deliveryPartner && a.deliveryPartnerId ? this.deliveryPartners.find((p) => p.id === a.deliveryPartnerId) : null;
        return {
          ...a,
          order: order ? this.populateOrder(order) : a.order || null,
          deliveryPartner: partner || null,
        };
      });
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const a = this.deliveryAssignments.find((item) => item.id === where.id);
      if (!a) return null;
      const order = include?.order && a.orderId ? this.orders.find((o) => o.id === a.orderId) : null;
      const partner = include?.deliveryPartner && a.deliveryPartnerId ? this.deliveryPartners.find((p) => p.id === a.deliveryPartnerId) : null;
      return {
        ...a,
        order: order ? this.populateOrder(order) : a.order || null,
        deliveryPartner: partner || null,
      };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const a = this.deliveryAssignments.find((item) => {
        if (where?.id && item.id !== where.id) return false;
        if (where?.orderId && item.orderId !== where.orderId) return false;
        if (where?.deliveryPartnerId && item.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && item.status !== where.status) return false;
        return true;
      });
      if (!a) return null;
      return a;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'assign-' + (this.deliveryAssignments.length + 101);
      const newAssign = {
        id,
        orderId: data.orderId || null,
        orderNumber: data.orderNumber || null,
        usedPartListingId: data.usedPartListingId || null,
        deliveryPartnerId: data.deliveryPartnerId || null,
        type: data.type || (data.usedPartListingId ? 'USED_PART_PICKUP' : 'CUSTOMER_DELIVERY'),
        status: data.status || 'ASSIGNED',
        pickupLocation: data.pickupLocation || { name: 'PartSphere Hub', address: 'Indiranagar, Bengaluru' },
        dropLocation: data.dropLocation || { name: 'Customer Destination', address: 'Bengaluru' },
        items: data.items || [],
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        paymentStatus: data.paymentStatus || 'PAID',
        codAmountToCollect: Number(data.codAmountToCollect || 0),
        codAmountCollected: Number(data.codAmountCollected || 0),
        codStatus: data.codStatus || (data.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'NOT_APPLICABLE'),
        deliveryFee: Number(data.deliveryFee || 100),
        distanceKm: Number(data.distanceKm || 5.0),
        navigationInfo: data.navigationInfo || { currentDistance: '5.0 km', etaMinutes: 15, routeSummary: 'Fastest route' },
        notes: data.notes || '',
        assignedAt: new Date(),
        acceptedAt: data.acceptedAt || null,
        pickedUpAt: data.pickedUpAt || null,
        deliveredAt: data.deliveredAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.deliveryAssignments.unshift(newAssign);
      return newAssign;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.deliveryAssignments.findIndex((a) => a.id === where.id);
      if (idx === -1) return null;
      this.deliveryAssignments[idx] = { ...this.deliveryAssignments[idx], ...data, updatedAt: new Date() };
      const updatedAssignment = this.deliveryAssignments[idx];

      // Real-time synchronization to linked Order and Customer Tracking
      if (updatedAssignment.orderId && data.status) {
        const orderIdx = this.orders.findIndex((o) => o.id === updatedAssignment.orderId);
        if (orderIdx !== -1) {
          if (data.status === 'PICKED_UP' || data.status === 'IN_TRANSIT') {
            this.orders[orderIdx].status = 'SHIPPED';
            this.orders[orderIdx].updatedAt = new Date();
            this.orderTrackings.push({
              id: crypto.randomUUID(),
              orderId: updatedAssignment.orderId,
              status: 'OUT_FOR_DELIVERY',
              message: 'Package picked up by delivery partner and is out for doorstep delivery.',
              createdAt: new Date(),
            });
          } else if (data.status === 'DELIVERED') {
            this.orders[orderIdx].status = 'DELIVERED';
            if (this.orders[orderIdx].paymentMethod === 'CASH_ON_DELIVERY') {
              this.orders[orderIdx].paymentStatus = 'PAID';
            }
            this.orders[orderIdx].updatedAt = new Date();
            this.orderTrackings.push({
              id: crypto.randomUUID(),
              orderId: updatedAssignment.orderId,
              status: 'DELIVERED',
              message: 'Package successfully delivered to customer doorstep by delivery partner.',
              createdAt: new Date(),
            });
          }
        }
      }

      return updatedAssignment;
    },
    count: async ({ where }: { where?: any } = {}) => {
      return this.deliveryAssignments.filter((a) => {
        if (where?.deliveryPartnerId && a.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && a.status !== where.status) return false;
        return true;
      }).length;
    },
  };

  // --- COD RECONCILIATIONS ---
  public cODReconciliation = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = this.codReconciliations.filter((r) => {
        if (where?.deliveryPartnerId && r.deliveryPartnerId !== where.deliveryPartnerId) return false;
        if (where?.status && r.status !== where.status) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.codReconciliations.find((r) => r.id === where.id) || null;
    },
    create: async ({ data }: { data: any }) => {
      const id = 'recon-' + (this.codReconciliations.length + 101);
      const newRecon = {
        id,
        reconciliationNumber: `COD-REC-${Date.now().toString().slice(-6)}`,
        deliveryPartnerId: data.deliveryPartnerId,
        totalAmount: Number(data.totalAmount || 0),
        orderCount: Number(data.orderCount || 1),
        status: data.status || 'RECONCILED',
        depositMethod: data.depositMethod || 'CASH_AT_HUB',
        depositReference: data.depositReference || `HUB-DEP-${Date.now().toString().slice(-5)}`,
        hubLocation: data.hubLocation || 'Indiranagar Central Logistics Hub',
        receivedBy: data.receivedBy || 'Finance Desk Officer',
        notes: data.notes || 'Full cash reconciliation verified.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.codReconciliations.unshift(newRecon);
      return newRecon;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.codReconciliations.findIndex((r) => r.id === where.id);
      if (idx === -1) return null;
      this.codReconciliations[idx] = { ...this.codReconciliations[idx], ...data, updatedAt: new Date() };
      return this.codReconciliations[idx];
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
      let list = this.orders.filter((o) => {
        if (where?.userId && o.userId !== where.userId) return false;
        if (where?.status && o.status !== where.status) return false;
        if (where?.paymentStatus && o.paymentStatus !== where.paymentStatus) return false;
        if (where?.difmType && o.difmType !== where.difmType) return false;
        return true;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list.map((o) => {
        const base = this.populateOrder(o);
        const user = this.users.find((u) => u.id === o.userId) || null;
        const difm = this.difmRequests.find((d) => d.orderId === o.id) || null;
        const job = this.shopJobs.find((j) => j.orderId === o.id) || null;
        const delivery = this.deliveryAssignments.find((a) => a.orderId === o.id) || null;

        return {
          ...base,
          user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
          difmRequest: difm ? { ...difm, shop: this.shops.find((s) => s.id === difm.shopId) || null } : null,
          mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
          deliveryAssignment: delivery
            ? {
                ...delivery,
                deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                  ? {
                      ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                      user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                    }
                  : null,
              }
            : null,
        };
      });
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find((o) => {
        if (where.userId && o.userId !== where.userId) return false;
        if (where.id && o.id !== where.id) return false;
        if (where.orderNumber && o.orderNumber !== where.orderNumber) return false;
        if (where.OR && Array.isArray(where.OR)) {
          const matchOr = where.OR.some(
            (cond: any) =>
              (cond.id && o.id === cond.id) || (cond.orderNumber && o.orderNumber === cond.orderNumber)
          );
          if (!matchOr) return false;
        }
        return true;
      });
      if (!order) return null;
      const base = this.populateOrder(order);
      const user = this.users.find((u) => u.id === order.userId) || null;
      const difm = this.difmRequests.find((d) => d.orderId === order.id) || null;
      const job = this.shopJobs.find((j) => j.orderId === order.id) || null;
      const delivery = this.deliveryAssignments.find((a) => a.orderId === order.id) || null;

      return {
        ...base,
        user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
        difmRequest: difm ? { ...difm, shop: this.shops.find((s) => s.id === difm.shopId) || null } : null,
        mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
        deliveryAssignment: delivery
          ? {
              ...delivery,
              deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                ? {
                    ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                    user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                  }
                : null,
            }
          : null,
      };
    },
    findUnique: async ({ where, include }: { where: any; include?: any }) => {
      const order = this.orders.find((o) => {
        if (where.id && o.id !== where.id) return false;
        if (where.orderNumber && o.orderNumber !== where.orderNumber) return false;
        if (where.OR && Array.isArray(where.OR)) {
          const matchOr = where.OR.some(
            (cond: any) =>
              (cond.id && o.id === cond.id) || (cond.orderNumber && o.orderNumber === cond.orderNumber)
          );
          if (!matchOr) return false;
        }
        return true;
      });
      if (!order) return null;
      const base = this.populateOrder(order);
      const user = this.users.find((u) => u.id === order.userId) || null;
      const difm = this.difmRequests.find((d) => d.orderId === order.id) || null;
      const job = this.shopJobs.find((j) => j.orderId === order.id) || null;
      const delivery = this.deliveryAssignments.find((a) => a.orderId === order.id) || null;

      return {
        ...base,
        user: include?.user ? (user ? { ...user, fullName: `${user.firstName} ${user.lastName}`.trim() } : null) : undefined,
        difmRequest: difm ? { ...difm, shop: this.shops.find((s) => s.id === difm.shopId) || null } : null,
        mechanicJob: job ? { ...job, shop: this.shops.find((s) => s.id === job.shopId) || null } : null,
        deliveryAssignment: delivery
          ? {
              ...delivery,
              deliveryPartner: this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)
                ? {
                    ...this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId),
                    user: this.users.find((u) => u.id === this.deliveryPartners.find((dp) => dp.id === delivery.deliveryPartnerId)?.userId),
                  }
                : null,
            }
          : null,
      };
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
        const difmRecord = {
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
        };
        this.difmRequests.push(difmRecord);

        // Auto-create connected Shop Job and Commission Ledger
        const assignedShop = this.shops.find((s) => s.id === (difmRecord.shopId || 'shop-1')) || this.shops[0];
        const cust = this.users.find((u) => u.id === newOrder.userId);
        const addr = this.addresses.find((a) => a.id === newOrder.addressId);
        const fee = difmRecord.installationFee + difmRecord.homeVisitSurcharge;
        const rate = assignedShop?.commissionRate || 12;
        const commCut = Math.round(fee * (rate / 100));
        const shopNet = fee - commCut;

        const jobId = 'job-' + Math.random().toString(36).substring(2, 9);
        const newJob = {
          id: jobId,
          shopId: assignedShop.id,
          orderId,
          orderNumber: newOrder.orderNumber,
          difmRequestId: difmRecord.id,
          jobType: difmRecord.type === 'HOME_INSTALLATION' ? 'DIFM_HOME_INSTALLATION' : 'DIFM_SHOP_VISIT',
          status: 'SCHEDULED',
          customerName: cust ? `${cust.firstName} ${cust.lastName}` : (addr?.fullName || 'Customer'),
          customerPhone: cust?.phone || addr?.phone || '+91 98765 00002',
          customerEmail: cust?.email || 'customer@partsphere.in',
          vehicleInfo: 'Customer Vehicle',
          vehicleCategory: 'CAR',
          vehicleNumber: 'KA-01-XX-0000',
          serviceName: 'DIFM Professional Part Installation',
          serviceFee: difmRecord.installationFee,
          homeVisitSurcharge: difmRecord.homeVisitSurcharge,
          totalServiceAmount: fee,
          locationType: difmRecord.type === 'HOME_INSTALLATION' ? 'DOORSTEP' : 'SHOP',
          serviceAddress: difmRecord.type === 'HOME_INSTALLATION' && addr ? `${addr.line1}, ${addr.city} - ${addr.pincode}` : assignedShop.address,
          scheduledDate: difmRecord.scheduledDate || difmRecord.preferredDate || new Date(Date.now() + 86400000),
          scheduledSlot: '11:00 AM - 01:00 PM',
          notes: difmRecord.notes || 'Order placed via PartSphere checkout.',
          mechanicAssigned: 'Assigned Shop Technician',
          startedAt: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.shopJobs.unshift(newJob);

        const isPaid = newOrder.paymentStatus === 'PAID' || newOrder.paymentStatus === 'CAPTURED';
        this.commissionLedgers.unshift({
          id: 'comm-' + Math.random().toString(36).substring(2, 9),
          shopId: assignedShop.id,
          orderId,
          orderNumber: newOrder.orderNumber,
          jobId: newJob.id,
          serviceName: newJob.serviceName,
          grossAmount: fee,
          commissionRate: rate,
          commissionAmount: commCut,
          shopPayout: shopNet,
          serviceStatus: 'SCHEDULED',
          paymentStatus: isPaid ? 'PAID' : 'PENDING',
          paymentMethod: newOrder.paymentMethod || 'RAZORPAY',
          releaseStatus: 'LOCKED_PENDING_COMPLETION',
          payoutStatus: 'PENDING',
          payoutRef: null,
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Auto-broadcast unassigned delivery assignment for fleet
      const isCod = newOrder.paymentMethod === 'CASH_ON_DELIVERY';
      const addr = this.addresses.find((a) => a.id === newOrder.addressId);
      const assignedShop = this.shops.find((s) => s.id === 'shop-1') || this.shops[0];
      const assignId = 'assign-' + Math.random().toString(36).substring(2, 9);
      this.deliveryAssignments.unshift({
        id: assignId,
        orderId,
        orderNumber: newOrder.orderNumber,
        usedPartListingId: null,
        deliveryPartnerId: null, // Broadcast unassigned job for any active delivery partner
        type: 'CUSTOMER_DELIVERY',
        status: 'ASSIGNED',
        pickupLocation: {
          name: assignedShop.name,
          address: assignedShop.address,
          lat: assignedShop.latitude,
          lng: assignedShop.longitude,
          contactPerson: assignedShop.ownerName || 'Dispatch Desk',
          phone: assignedShop.phone,
        },
        dropLocation: {
          name: addr?.fullName || 'Customer',
          address: addr ? `${addr.line1}, ${addr.city} - ${addr.pincode}` : 'Customer Address',
          lat: addr?.latitude || 12.9260,
          lng: addr?.longitude || 77.6762,
          contactPerson: addr?.fullName || 'Customer',
          phone: addr?.phone || '+91 98765 00002',
        },
        items: (data.items?.create || []).map((it: any) => ({
          title: 'Automotive Component',
          quantity: it.quantity || 1,
          sku: 'PN-SKU',
          price: it.unitPrice,
        })),
        paymentMethod: newOrder.paymentMethod || 'RAZORPAY',
        paymentStatus: newOrder.paymentStatus || 'PENDING',
        codAmountToCollect: isCod ? Number(newOrder.total) : 0,
        codAmountCollected: 0,
        codStatus: isCod ? 'PENDING' : 'NOT_APPLICABLE',
        deliveryFee: Number(newOrder.deliveryFee || 99),
        distanceKm: 6.2,
        navigationInfo: {
          currentDistance: '6.2 km away',
          etaMinutes: 18,
          routeSummary: 'Via arterial corridor to drop pin',
        },
        notes: 'Handle package with care.',
        assignedAt: new Date(),
        acceptedAt: null,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return this.populateOrder(newOrder);
    },
    update: async ({ where, data }: { where: { id?: string; orderNumber?: string }; data: any }) => {
      const idx = this.orders.findIndex(
        (o) => (where.id && o.id === where.id) || (where.orderNumber && o.orderNumber === where.orderNumber)
      );
      if (idx === -1) return null;
      this.orders[idx] = { ...this.orders[idx], ...data, updatedAt: new Date() };

      // Sync commission ledger if payment cleared
      if (data.paymentStatus === 'PAID' || data.paymentStatus === 'CAPTURED') {
        const orderId = this.orders[idx].id;
        for (const comm of this.commissionLedgers) {
          if (comm.orderId === orderId) {
            comm.paymentStatus = 'PAID';
            if (comm.serviceStatus === 'COMPLETED') {
              comm.releaseStatus = 'RELEASED';
              comm.payoutStatus = 'RELEASED';
            } else {
              comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
            }
            comm.updatedAt = new Date();
          }
        }
      }

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
    findUnique: async ({ where }: { where: { id?: string; orderId?: string; razorpayOrderId?: string } }) => {
      return (
        this.payments.find(
          (p) =>
            (where.id && p.id === where.id) ||
            (where.orderId && p.orderId === where.orderId) ||
            (where.razorpayOrderId && p.razorpayOrderId === where.razorpayOrderId)
        ) || null
      );
    },
    findFirst: async ({ where }: { where: any }) => {
      return (
        this.payments.find(
          (p) =>
            (!where.id || p.id === where.id) &&
            (!where.orderId || p.orderId === where.orderId) &&
            (!where.razorpayOrderId || p.razorpayOrderId === where.razorpayOrderId) &&
            (!where.status || p.status === where.status)
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const p = {
        id: crypto.randomUUID(),
        currency: 'INR',
        status: data.status || 'PENDING',
        ...data,
        amount: Number(data.amount),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.payments.push(p);
      return p;
    },
    update: async ({ where, data }: { where: { id?: string; orderId?: string; razorpayOrderId?: string }; data: any }) => {
      const idx = this.payments.findIndex(
        (p) =>
          (where.id && p.id === where.id) ||
          (where.orderId && p.orderId === where.orderId) ||
          (where.razorpayOrderId && p.razorpayOrderId === where.razorpayOrderId)
      );
      if (idx === -1) return null;
      this.payments[idx] = {
        ...this.payments[idx],
        ...data,
        ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
        updatedAt: new Date(),
      };

      if (data.status === 'CAPTURED' || data.status === 'PAID') {
        const orderId = this.payments[idx].orderId;
        for (const comm of this.commissionLedgers) {
          if (comm.orderId === orderId) {
            comm.paymentStatus = 'PAID';
            if (comm.serviceStatus === 'COMPLETED') {
              comm.releaseStatus = 'RELEASED';
              comm.payoutStatus = 'RELEASED';
            } else {
              comm.releaseStatus = 'LOCKED_PENDING_COMPLETION';
            }
            comm.updatedAt = new Date();
          }
        }
      }

      return this.payments[idx];
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
    create: async ({ data }: { data: any }) => {
      const newCat = {
        id: data.id || 'cat-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        slug: data.slug || String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || initialCategories.length + 1,
      };
      initialCategories.push(newCat as any);
      return newCat;
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
    create: async ({ data }: { data: any }) => {
      const newBrand = {
        id: data.id || 'brand-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        slug: data.slug || String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logoUrl: data.logoUrl || null,
        originCountry: data.originCountry || 'India',
        isOem: Boolean(data.isOem),
      };
      initialBrands.push(newBrand as any);
      return newBrand;
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
      inventories: productInventories,
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

    findFirst: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      const results = await this.product.findMany({ where, skip: 0, take: 1, orderBy, include });
      return results[0] || null;
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

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || 'prod-' + Math.random().toString(36).substring(2, 9);
      const slug = data.slug || String(data.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newProd = {
        id,
        name: data.name,
        slug,
        description: data.description || '',
        sku: data.sku || ('SKU-' + Date.now()),
        partNumber: data.partNumber || null,
        categoryId: data.categoryId || 'cat-engine',
        brandId: data.brandId || 'brand-bosch',
        brand: data.brand || 'PartSphere Genuine',
        condition: data.condition || 'GENUINE_NEW',
        status: data.status || 'ACTIVE',
        basePrice: Number(data.basePrice || 999),
        mrp: Number(data.mrp || (Number(data.basePrice || 999) * 1.2)),
        warranty: data.warranty || '1 Year Manufacturer Warranty',
        rating: 5.0,
        weight: Number(data.weight || 1),
        dimensions: data.dimensions || '10x10x10 cm',
        tags: Array.isArray(data.tags) ? data.tags : ['genuine', 'oem'],
        requiresDIFM: Boolean(data.requiresDIFM),
        installationDifficulty: data.installationDifficulty || 'MODERATE',
        baseServiceFee: Number(data.baseServiceFee || 299),
        estimatedInstallTimeMinutes: Number(data.estimatedInstallTimeMinutes || 30),
        images: Array.isArray(data.images) ? data.images : [
          { id: 'img-' + Date.now(), url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600', isPrimary: true }
        ],
        compatibleVariantIds: Array.isArray(data.compatibleVariantIds) ? data.compatibleVariantIds : [],
        specs: [],
        inventories: [],
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      initialProducts.unshift(newProd as any);

      // Create connected inventory record for this product
      this.inventories.unshift({
        id: 'inv-' + Date.now(),
        productId: newProd.id,
        shopId: 'shop-1',
        quantity: Number(data.stockQuantity || 25),
        reservedQty: 0,
        sellingPrice: newProd.basePrice,
        isAvailable: true,
        availabilityStatus: 'IN_STOCK',
        lowStockThreshold: 5,
        updatedAt: new Date(),
      });

      return this.populateProduct(newProd);
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = initialProducts.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      initialProducts[idx] = { ...initialProducts[idx], ...data, updatedAt: new Date() };
      return this.populateProduct(initialProducts[idx]);
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = initialProducts.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      const [removed] = initialProducts.splice(idx, 1);
      return removed;
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

  // --- SUBSCRIPTIONS & ENTITLEMENTS ---
  public populateSubscription(sub: any) {
    if (!sub) return null;
    const rawPlan = this.subscriptionPlans.find((p) => p.id === sub.planId) || null;
    const plan = rawPlan
      ? {
          ...rawPlan,
          entitlements: this.subscriptionEntitlements.filter((e) => e.planId === sub.planId),
        }
      : null;
    const rawEntitlements = this.subscriptionEntitlements.filter((e) => e.planId === sub.planId);
    const usages = sub.entitlementUsages || {};

    const entitlements = rawEntitlements.map((e) => {
      const usedCount =
        typeof usages === 'object' && !Array.isArray(usages)
          ? (usages[e.featureCode] || 0)
          : Array.isArray(usages)
          ? usages.filter((u: any) => u.featureCode === e.featureCode).length
          : 0;
      const isUnlimited = Boolean(e.isUnlimited || e.limitValue === null || e.quotaLimit === null);
      const limit = e.limitValue !== undefined ? e.limitValue : e.quotaLimit;
      const remainingCount = isUnlimited ? null : Math.max(0, (limit || 0) - usedCount);
      return {
        ...e,
        name: e.featureName || e.name,
        quotaLimit: limit,
        limitValue: limit,
        usedCount,
        remainingCount,
        isUnlimited,
      };
    });

    let vehicle = null;
    if (sub.vehicleId) {
      const rawVeh = this.customerVehicles.find((v) => v.id === sub.vehicleId);
      if (rawVeh) {
        vehicle = this.populateVehicle(rawVeh);
      }
    }

    const payments = this.subscriptionPayments.filter((p) => p.subscriptionId === sub.id);

    return {
      ...sub,
      plan,
      entitlements,
      vehicle,
      payments,
    };
  }

  public subscriptionPlan = {
    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let list = [...this.subscriptionPlans];
      if (where?.isActive !== undefined) {
        list = list.filter((p) => p.isActive === where.isActive);
      }
      if (orderBy?.price === 'asc') {
        list.sort((a, b) => Number(a.price || a.monthlyPrice) - Number(b.price || b.monthlyPrice));
      }
      return list.map((p) => ({
        ...p,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === p.id),
      }));
    },

    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      let found = this.subscriptionPlans.find((p) => {
        if (where.id && p.id === where.id) return true;
        if (where.slug && p.slug === where.slug) return true;
        if (where.OR && Array.isArray(where.OR)) {
          return where.OR.some((cond: any) => (cond.id && p.id === cond.id) || (cond.slug && p.slug === cond.slug));
        }
        return false;
      });

      if (!found) return null;
      return {
        ...found,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === found.id),
      };
    },

    findUnique: async ({ where, include }: { where: { id?: string; slug?: string }; include?: any }) => {
      const found = this.subscriptionPlans.find(
        (p) => (where.id && p.id === where.id) || (where.slug && p.slug === where.slug)
      );
      if (!found) return null;
      return {
        ...found,
        entitlements: this.subscriptionEntitlements.filter((e) => e.planId === found.id),
      };
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.subscriptionPlans.findIndex((p) => p.id === where.id);
      if (idx === -1) return null;
      this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...data, updatedAt: new Date() };
      return this.subscriptionPlans[idx];
    },
  };

  public subscriptionEntitlement = {
    findMany: async ({ where }: { where?: { planId?: string } } = {}) => {
      let list = [...this.subscriptionEntitlements];
      if (where?.planId) {
        list = list.filter((e) => e.planId === where.planId);
      }
      return list;
    },
  };

  public customerSubscription = {
    findFirst: async ({ where, include, orderBy }: { where: any; include?: any; orderBy?: any }) => {
      let list = [...this.customerSubscriptions];

      if (where.id) list = list.filter((s) => s.id === where.id);
      if (where.userId) list = list.filter((s) => s.userId === where.userId);
      if (where.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const match = list[0];
      return match ? this.populateSubscription(match) : null;
    },

    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const match = this.customerSubscriptions.find((s) => s.id === where.id);
      return match ? this.populateSubscription(match) : null;
    },

    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let list = [...this.customerSubscriptions];

      if (where?.userId) list = list.filter((s) => s.userId === where.userId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return list.map((s) => this.populateSubscription(s));
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.customerSubscriptions];
      if (where?.userId) list = list.filter((s) => s.userId === where.userId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((s) => s.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((s) => where.status.in.includes(s.status));
        }
      }
      return list.length;
    },

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = 'sub_' + Math.random().toString(36).substring(2, 11);
      const newSub = {
        id,
        userId: data.userId,
        planId: data.planId,
        billingCycle: data.billingCycle || 'MONTHLY',
        status: data.status || 'ACTIVE',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
        pricePaid: Number(data.pricePaid || 0),
        vehicleId: data.vehicleId || null,
        vehicleReg: data.vehicleReg || null,
        paymentMethod: data.paymentMethod || 'RAZORPAY',
        razorpayOrderId: data.razorpayOrderId || null,
        razorpayPaymentId: data.razorpayPaymentId || null,
        razorpaySignature: data.razorpaySignature || null,
        cancellationReason: data.cancellationReason || null,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : null,
        entitlementUsages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.customerSubscriptions.push(newSub);
      return this.populateSubscription(newSub);
    },

    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.customerSubscriptions.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;

      const current = this.customerSubscriptions[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };

      this.customerSubscriptions[idx] = updated;
      return this.populateSubscription(updated);
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.customerSubscriptions.findIndex((s) => s.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.customerSubscriptions.splice(idx, 1);
      return removed;
    },
  };

  public subscriptionPayment = {
    create: async ({ data }: { data: any }) => {
      const id = 'sub_pay_' + Math.random().toString(36).substring(2, 11);
      const newPayment = {
        id,
        subscriptionId: data.subscriptionId,
        userId: data.userId,
        amount: Number(data.amount || 0),
        method: data.method || data.paymentMethod || 'RAZORPAY',
        paymentMethod: data.paymentMethod || data.method || 'RAZORPAY',
        status: data.status || data.paymentStatus || 'PAID',
        paymentStatus: data.paymentStatus || data.status || 'PAID',
        gatewayPaymentId: data.gatewayPaymentId || null,
        gatewayOrderId: data.gatewayOrderId || null,
        createdAt: new Date(),
      };
      this.subscriptionPayments.push(newPayment);
      return newPayment;
    },

    findMany: async ({ where }: { where?: { subscriptionId?: string; userId?: string } } = {}) => {
      let list = [...this.subscriptionPayments];
      if (where?.subscriptionId) list = list.filter((p) => p.subscriptionId === where.subscriptionId);
      if (where?.userId) list = list.filter((p) => p.userId === where.userId);
      return list;
    },

    findFirst: async ({ where }: { where: any }) => {
      return this.subscriptionPayments.find((p) => {
        if (where.subscriptionId && p.subscriptionId !== where.subscriptionId) return false;
        if (where.gatewayOrderId && p.gatewayOrderId !== where.gatewayOrderId) return false;
        return true;
      }) || null;
    },

    update: async ({ where, data }: { where: { id?: string; gatewayOrderId?: string }; data: any }) => {
      const idx = this.subscriptionPayments.findIndex((p) =>
        (where.id && p.id === where.id) || (where.gatewayOrderId && p.gatewayOrderId === where.gatewayOrderId)
      );
      if (idx === -1) return null;
      this.subscriptionPayments[idx] = { ...this.subscriptionPayments[idx], ...data };
      return this.subscriptionPayments[idx];
    },
  };

  // --- USED PART MARKETPLACE ---
  public usedPartListing = {
    findMany: async ({ where, include, orderBy, skip, take }: { where?: any; include?: any; orderBy?: any; skip?: number; take?: number } = {}) => {
      let list = [...this.usedPartListings];

      if (where?.sellerId) list = list.filter((item) => item.sellerId === where.sellerId);
      if (where?.status) {
        if (typeof where.status === 'string') {
          list = list.filter((item) => item.status === where.status);
        } else if (where.status.in && Array.isArray(where.status.in)) {
          list = list.filter((item) => where.status.in.includes(item.status));
        }
      }
      if (where?.isSold !== undefined) list = list.filter((item) => item.isSold === where.isSold);
      if (where?.category) list = list.filter((item) => item.category === where.category);

      if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (orderBy?.expectedPrice === 'asc' || orderBy?.askingPrice === 'asc') {
        list.sort((a, b) => Number(a.expectedPrice || a.askingPrice) - Number(b.expectedPrice || b.askingPrice));
      }

      const offset = skip || 0;
      const limit = take !== undefined ? take : list.length;
      list = list.slice(offset, offset + limit);

      return list.map((item) => {
        const seller = include?.seller ? this.users.find((u) => u.id === item.sellerId) : null;
        return {
          ...item,
          askingPrice: item.expectedPrice || item.askingPrice,
          seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : item.seller || null,
        };
      });
    },

    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const match = this.usedPartListings.find((item) => {
        if (where.id && item.id !== where.id) return false;
        if (where.sellerId && item.sellerId !== where.sellerId) return false;
        if (where.status && item.status !== where.status) return false;
        return true;
      });
      if (!match) return null;
      const seller = include?.seller ? this.users.find((u) => u.id === match.sellerId) : null;
      return {
        ...match,
        askingPrice: match.expectedPrice || match.askingPrice,
        seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : match.seller || null,
      };
    },

    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const match = this.usedPartListings.find((item) => item.id === where.id);
      if (!match) return null;
      const seller = include?.seller ? this.users.find((u) => u.id === match.sellerId) : null;
      return {
        ...match,
        askingPrice: match.expectedPrice || match.askingPrice,
        seller: seller ? { firstName: seller.firstName, lastName: seller.lastName, email: seller.email, phone: seller.phone } : match.seller || null,
      };
    },

    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = 'used_' + Math.random().toString(36).substring(2, 11);
      const expectedPrice = Number(data.expectedPrice || data.askingPrice || 0);
      const condition = data.condition || 'GOOD';
      
      // Calculate automated initial estimated valuation range (70-85% based on condition)
      let valuationMultiplier = 0.75;
      if (condition === 'LIKE_NEW' || condition === 'EXCELLENT') valuationMultiplier = 0.85;
      else if (condition === 'GOOD' || condition === 'VERY_GOOD') valuationMultiplier = 0.78;
      else valuationMultiplier = 0.65;

      const estimatedValuation = data.estimatedValuation ? Number(data.estimatedValuation) : Math.round(expectedPrice * valuationMultiplier);

      const newListing = {
        id,
        sellerId: data.sellerId,
        title: data.title,
        partNumber: data.partNumber || null,
        vehicleModel: data.vehicleModel || 'Universal Fit',
        vehicleId: data.vehicleId || null,
        category: data.category || 'PARTS',
        condition,
        conditionGrade: data.conditionGrade || null,
        description: data.description || '',
        purchaseAge: data.purchaseAge || null,
        expectedPrice,
        askingPrice: expectedPrice,
        estimatedValuation,
        finalValuation: data.finalValuation ? Number(data.finalValuation) : null,
        payoutStatus: data.payoutStatus || 'PENDING',
        payoutAmount: data.payoutAmount ? Number(data.payoutAmount) : 0,
        payoutMethod: data.payoutMethod || 'UPI',
        payoutTransactionRef: data.payoutTransactionRef || null,
        images: Array.isArray(data.images) ? data.images : [],
        location: data.location || 'Pan-India',
        pickupAddress: data.pickupAddress || null,
        status: data.status || 'SUBMITTED',
        verificationStatus: data.verificationStatus || 'SUBMITTED',
        verificationNotes: data.verificationNotes || 'Listing submitted for PartSphere technician pickup and verification.',
        rejectionReason: data.rejectionReason || null,
        isSold: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.usedPartListings.unshift(newListing);
      return newListing;
    },

    update: async ({ where, data, include }: { where: { id: string }; data: any; include?: any }) => {
      const idx = this.usedPartListings.findIndex((item) => item.id === where.id);
      if (idx === -1) return null;

      const current = this.usedPartListings[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };

      this.usedPartListings[idx] = updated;
      return updated;
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const idx = this.usedPartListings.findIndex((item) => item.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.usedPartListings.splice(idx, 1);
      return removed;
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.usedPartListings];
      if (where?.sellerId) list = list.filter((item) => item.sellerId === where.sellerId);
      if (where?.status) list = list.filter((item) => item.status === where.status);
      return list.length;
    },
  };

  public usedPartVerification = {
    findFirst: async ({ where }: { where: { listingId: string } }) => null,
    findUnique: async ({ where }: { where: { listingId: string } }) => null,
    create: async ({ data }: { data: any }) => ({ id: 'verif_' + Date.now(), ...data, createdAt: new Date() }),
  };

  public usedPartPayout = {
    findFirst: async ({ where }: { where: { listingId?: string; sellerId?: string } }) => null,
    findUnique: async ({ where }: { where: { listingId: string } }) => null,
    create: async ({ data }: { data: any }) => ({ id: 'payout_' + Date.now(), ...data, createdAt: new Date() }),
  };

  public supportTicket = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let list = [...this.supportTickets];
      if (where?.userId) list = list.filter((t) => t.userId === where.userId);
      if (where?.userRole) list = list.filter((t) => t.userRole === where.userRole);
      if (where?.status) list = list.filter((t) => t.status === where.status);
      if (where?.priority) list = list.filter((t) => t.priority === where.priority);
      if (where?.assignedAdminId) list = list.filter((t) => t.assignedAdminId === where.assignedAdminId);
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return list;
    },

    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.supportTickets.find((t) => t.id === where.id) || null;
    },

    findFirst: async ({ where }: { where: any }) => {
      return (
        this.supportTickets.find((t) => {
          if (where.id && t.id !== where.id) return false;
          if (where.ticketNumber && t.ticketNumber !== where.ticketNumber) return false;
          return true;
        }) || null
      );
    },

    create: async ({ data }: { data: any }) => {
      const id = 'tkt-' + Math.random().toString(36).substring(2, 9);
      const ticketNumber = 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000);
      const priority = data.priority || 'MEDIUM';
      const slaMap: Record<string, number> = { URGENT: 2, HIGH: 6, MEDIUM: 24, LOW: 48 };
      const slaHours = slaMap[priority] || 24;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000);

      const initialMessage = data.messages?.create?.body || data.message || data.subject;
      const messages = initialMessage
        ? [
            {
              id: 'msg-' + Date.now(),
              senderId: data.userId,
              senderName: data.userName || 'User',
              senderRole: data.userRole || 'CUSTOMER',
              message: initialMessage,
              createdAt: new Date(),
            },
          ]
        : [];

      const newTicket = {
        id,
        ticketNumber,
        userId: data.userId,
        userName: data.userName || 'User',
        userEmail: data.userEmail || '',
        userRole: data.userRole || 'CUSTOMER',
        category: data.category || 'GENERAL',
        subject: data.subject,
        priority,
        slaHours,
        slaDeadline,
        assignedAdminId: data.assignedAdminId || null,
        assignedAdminName: data.assignedAdminName || null,
        status: data.status || 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.supportTickets.unshift(newTicket);
      return newTicket;
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.supportTickets.findIndex((t) => t.id === where.id);
      if (idx === -1) return null;
      const current = this.supportTickets[idx];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date(),
      };
      if (data.status === 'RESOLVED' && !current.resolvedAt) {
        updated.resolvedAt = new Date();
      }
      this.supportTickets[idx] = updated;
      return updated;
    },

    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.supportTickets];
      if (where?.status) list = list.filter((t) => t.status === where.status);
      return list.length;
    },
  };

  public ticketMessage = {
    create: async ({ data }: { data: any }) => {
      const ticket = this.supportTickets.find((t) => t.id === data.ticketId);
      const newMsg = {
        id: 'msg-' + Date.now(),
        ticketId: data.ticketId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole || 'ADMIN',
        message: data.message,
        createdAt: new Date(),
      };
      if (ticket) {
        ticket.messages = ticket.messages || [];
        ticket.messages.push(newMsg);
        ticket.updatedAt = new Date();
      }
      return newMsg;
    },
  };

  public commissionConfig = {
    findFirst: async ({ orderBy }: { orderBy?: any } = {}) => {
      return {
        id: 'comm-cfg-default',
        defaultRate: this.platformConfigs.commissions?.defaultRate || 12.0,
        minRate: 10.0,
        maxRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    create: async ({ data }: { data: any }) => {
      this.platformConfigs.commissions.defaultRate = Number(data.defaultRate);
      return {
        id: 'comm-cfg-' + Date.now(),
        defaultRate: Number(data.defaultRate),
        minRate: 10.0,
        maxRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  public notifications: any[] = [];

  public notification = {
    create: async ({ data }: { data: any }) => {
      const newNotif = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: data.userId,
        channel: data.channel || 'IN_APP',
        status: data.status || 'DELIVERED',
        title: data.title,
        body: data.body,
        data: data.data || null,
        isRead: Boolean(data.isRead),
        readAt: data.readAt || null,
        createdAt: new Date(),
      };
      this.notifications.push(newNotif);
      return newNotif;
    },
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let list = [...this.notifications];
      if (where?.userId) list = list.filter((n) => n.userId === where.userId);
      if (where?.isRead !== undefined) list = list.filter((n) => n.isRead === where.isRead);
      if (take) list = list.slice(0, take);
      return list;
    },
    count: async ({ where }: { where?: any } = {}) => {
      let list = [...this.notifications];
      if (where?.userId) list = list.filter((n) => n.userId === where.userId);
      if (where?.isRead !== undefined) list = list.filter((n) => n.isRead === where.isRead);
      return list.length;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.notifications.findIndex((n) => n.id === where.id);
      if (idx !== -1) {
        this.notifications[idx] = { ...this.notifications[idx], ...data, updatedAt: new Date() };
        return this.notifications[idx];
      }
      return null;
    },
    deleteMany: async ({ where }: { where?: any } = {}) => {
      if (where?.userId) {
        this.notifications = this.notifications.filter((n) => n.userId !== where.userId);
      }
      return { count: 1 };
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
