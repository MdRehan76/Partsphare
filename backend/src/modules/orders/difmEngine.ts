import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { DIFMType } from '@prisma/client';

export interface LocationPoint {
  latitude?: number | null;
  longitude?: number | null;
  pincode?: string | null;
  city?: string | null;
  address?: string | null;
}

export interface DistanceCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  provider: string;
}

export interface IDistanceProvider {
  calculateDistance(origin: LocationPoint, destination: LocationPoint): Promise<DistanceCalculationResult>;
}

// Known coordinates dictionary for demo fallback
const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; city: string }> = {
  // Bengaluru
  '560038': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru' }, // Indiranagar
  '560034': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru' }, // Koramangala
  '560103': { lat: 12.9260, lng: 77.6762, city: 'Bengaluru' }, // Bellandur
  '560093': { lat: 12.9866, lng: 77.6638, city: 'Bengaluru' }, // CV Raman Nagar
  '560066': { lat: 12.9698, lng: 77.7500, city: 'Bengaluru' }, // Whitefield
  '560001': { lat: 12.9779, lng: 77.5952, city: 'Bengaluru' }, // MG Road
  // Mumbai
  '400053': { lat: 19.1363, lng: 72.8277, city: 'Mumbai' }, // Andheri West
  '400001': { lat: 18.9322, lng: 72.8338, city: 'Mumbai' }, // Fort
  '400050': { lat: 19.0596, lng: 72.8295, city: 'Mumbai' }, // Bandra
  // Delhi
  '110001': { lat: 28.6315, lng: 77.2167, city: 'New Delhi' }, // Connaught Place
  '110020': { lat: 28.5355, lng: 77.2678, city: 'New Delhi' }, // Okhla
};

const CITY_DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
};

export class HaversineDistanceProvider implements IDistanceProvider {
  async calculateDistance(origin: LocationPoint, destination: LocationPoint): Promise<DistanceCalculationResult> {
    const originCoords = this.resolveCoordinates(origin);
    const destCoords = this.resolveCoordinates(destination);

    if (!originCoords || !destCoords) {
      // Default demo estimate when location coordinates cannot be determined
      return {
        distanceKm: 4.8,
        durationMinutes: 25,
        provider: 'FallbackDemoEstimate',
      };
    }

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(destCoords.lat - originCoords.lat);
    const dLng = toRad(destCoords.lng - originCoords.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(originCoords.lat)) *
        Math.cos(toRad(destCoords.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rawDistanceKm = R * c;

    // Road circuity factor ~1.25x for urban travel
    const roadDistanceKm = Math.round(Math.max(1.2, rawDistanceKm * 1.25) * 10) / 10;
    const durationMinutes = Math.round(roadDistanceKm * 4 + 10); // ~15 km/h urban speed + 10m buffer

    return {
      distanceKm: roadDistanceKm,
      durationMinutes,
      provider: 'HaversineUrbanRouting',
    };
  }

  private resolveCoordinates(loc: LocationPoint): { lat: number; lng: number } | null {
    if (loc.latitude != null && loc.longitude != null) {
      return { lat: Number(loc.latitude), lng: Number(loc.longitude) };
    }
    if (loc.pincode && PINCODE_COORDINATES[loc.pincode]) {
      return PINCODE_COORDINATES[loc.pincode];
    }
    if (loc.city && CITY_DEFAULT_COORDINATES[loc.city]) {
      return CITY_DEFAULT_COORDINATES[loc.city];
    }
    return null;
  }
}

// Active distance provider (can be swapped in production for Google Maps / Mapbox)
export const activeDistanceProvider: IDistanceProvider = new HaversineDistanceProvider();

/**
 * Calculates Home Visit Surcharge based on road distance:
 * - Base surcharge up to 3km: ₹99
 * - Beyond 3km: ₹99 + ₹20/km
 */
export function calculateHomeVisitSurcharge(distanceKm: number): number {
  const baseSurcharge = 99;
  const thresholdKm = 3.0;
  const perKmRate = 20;

  if (distanceKm <= thresholdKm) {
    return baseSurcharge;
  }

  const extraDistance = distanceKm - thresholdKm;
  return Math.round(baseSurcharge + extraDistance * perKmRate);
}

/**
 * Resolves the unit price for a cart item safely with fallbacks.
 * Prevents NaN, null, and 0 when product has a price.
 */
export function resolveItemUnitPrice(it: any): number {
  if (!it) return 0;
  const candidates = [
    it.priceSnapshot,
    it.unitPrice,
    it.price,
    it.sellingPrice,
    it.product?.sellingPrice,
    it.product?.basePrice,
    it.product?.lowestPrice,
    it.product?.mrp,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null) {
      const val = Number(c);
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }
  }
  return 0;
}

/**
 * Inspects cart items to determine if any difficult-to-install parts require DIFM
 */
export function evaluateCartDIFM(cartItems: any[]) {
  const difficultItems = (cartItems || []).filter(
    (it) => it.product?.requiresDIFM === true || it.product?.installationDifficulty === 'HARD' || it.product?.installationDifficulty === 'MODERATE'
  );

  const requiresDIFM = difficultItems.length > 0;

  // Calculate base service fee across items:
  // Primary (highest fee item) + 50% for additional DIFM items
  let baseServiceFee = 0;
  if (requiresDIFM) {
    const fees = difficultItems.map((it) => Number(it.product?.baseServiceFee) || 299).sort((a, b) => b - a);
    baseServiceFee = fees[0];
    for (let i = 1; i < fees.length; i++) {
      baseServiceFee += Math.round(fees[i] * 0.5);
    }
  } else {
    // For standard / normal products when customer opts for installation (Option A or Option B)
    const fees = (cartItems || []).map((it) => Number(it.product?.baseServiceFee) || 199).sort((a, b) => b - a);
    baseServiceFee = fees[0] || 199;
  }

  return {
    requiresDIFM,
    difficultItems: difficultItems.map((it) => ({
      itemId: it.id,
      productId: it.product?.id || it.productId,
      productName: it.product?.name,
      partNumber: it.product?.partNumber,
      difficulty: it.product?.installationDifficulty || 'HARD',
      baseServiceFee: Number(it.product?.baseServiceFee) || 299,
      estimatedMinutes: Number(it.product?.estimatedInstallTimeMinutes) || 30,
    })),
    baseServiceFee,
  };
}

/**
 * Calculates standard e-commerce delivery fee:
 * Free for orders >= ₹999, else ₹49
 */
export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal >= 999 || subtotal === 0) {
    return 0;
  }
  return 49;
}

/**
 * Calculates coupon discount
 */
export function calculateCouponDiscount(couponCode: string | undefined, subtotal: number, deliveryFee: number, baseServiceFee: number): { discount: number; appliedCoupon: string | null } {
  if (!couponCode) return { discount: 0, appliedCoupon: null };

  const code = couponCode.trim().toUpperCase();
  if (code === 'PARTS10') {
    const disc = Math.min(300, Math.round(subtotal * 0.1));
    return { discount: disc, appliedCoupon: 'PARTS10 (10% off up to ₹300)' };
  }
  if (code === 'FREEDEL') {
    return { discount: deliveryFee, appliedCoupon: 'FREEDEL (Free Delivery)' };
  }
  if (code === 'DIFM50') {
    const disc = baseServiceFee > 0 ? Math.min(50, baseServiceFee) : 0;
    return { discount: disc, appliedCoupon: 'DIFM50 (₹50 off installation)' };
  }
  return { discount: 0, appliedCoupon: null };
}

/**
 * Central DIFM checkout pricing engine.
 * Pricing is strictly backend-authoritative!
 *
 * Formula:
 * Final Price = Product Subtotal + Delivery Fee + Installation Fee + Home Visit Surcharge - Discount
 *
 * Rules:
 * Option A (HOME_INSTALLATION): Installation_Fee = Base_Service_Fee, Home_Visit_Surcharge = distance Surcharge
 * Option B (SHOP_INSTALLATION): Installation_Fee = Base_Service_Fee, Home_Visit_Surcharge = 0
 * Option C (NO_INSTALLATION): Installation_Fee = 0, Home_Visit_Surcharge = 0
 */
export async function calculateAuthoritativePricing(params: {
  cartItems: any[];
  difmType?: DIFMType | string | null;
  customerAddress?: LocationPoint | null;
  shopLocation?: LocationPoint | null;
  couponCode?: string;
}) {
  const { cartItems, difmType, customerAddress, shopLocation, couponCode } = params;

  // 1. Authoritative Part subtotal (never NaN, guards every item)
  const partSubtotal = (cartItems || []).reduce((sum, it) => {
    const unitPrice = resolveItemUnitPrice(it);
    const qty = Math.max(1, Number(it.quantity) || 1);
    return sum + unitPrice * qty;
  }, 0);

  // 2. DIFM evaluation
  const difmEvaluation = evaluateCartDIFM(cartItems || []);

  // 3. Normalize DIFM type
  let resolvedDIFMType: DIFMType = DIFMType.NO_INSTALLATION;
  if (difmType === 'HOME_INSTALLATION' || difmType === 'HOME' || difmType === DIFMType.HOME_INSTALLATION) {
    resolvedDIFMType = DIFMType.HOME_INSTALLATION;
  } else if (difmType === 'SHOP_INSTALLATION' || difmType === 'SHOP' || difmType === DIFMType.SHOP_INSTALLATION) {
    resolvedDIFMType = DIFMType.SHOP_INSTALLATION;
  } else {
    resolvedDIFMType = DIFMType.NO_INSTALLATION;
  }

  // 4. Delivery Fee
  const deliveryFee = calculateDeliveryFee(partSubtotal);

  // 5. Distance and Installation Fees
  let distanceKm = 0;
  let durationMinutes = 0;
  let homeVisitSurcharge = 0;
  let installationFee = 0;

  if (resolvedDIFMType === DIFMType.HOME_INSTALLATION) {
    installationFee = difmEvaluation.baseServiceFee;

    // Calculate distance between customer address and partnered shop
    if (customerAddress && shopLocation) {
      const distResult = await activeDistanceProvider.calculateDistance(customerAddress, shopLocation);
      distanceKm = distResult.distanceKm;
      durationMinutes = distResult.durationMinutes;
    } else {
      distanceKm = 4.8;
      durationMinutes = 25;
    }

    homeVisitSurcharge = calculateHomeVisitSurcharge(distanceKm);
  } else if (resolvedDIFMType === DIFMType.SHOP_INSTALLATION) {
    installationFee = difmEvaluation.baseServiceFee;
    homeVisitSurcharge = 0;

    if (customerAddress && shopLocation) {
      const distResult = await activeDistanceProvider.calculateDistance(customerAddress, shopLocation);
      distanceKm = distResult.distanceKm;
      durationMinutes = distResult.durationMinutes;
    }
  } else {
    // Option C: No installation
    installationFee = 0;
    homeVisitSurcharge = 0;
  }

  // 6. Discounts
  const { discount: rawDiscount, appliedCoupon } = calculateCouponDiscount(
    couponCode,
    partSubtotal,
    deliveryFee,
    installationFee
  );

  // Discount guard: If partSubtotal > 0, discount must not reduce grandTotal to <= 0!
  const preDiscountTotal = partSubtotal + deliveryFee + installationFee + homeVisitSurcharge;
  const maxAllowedDiscount = partSubtotal > 0 ? Math.max(0, preDiscountTotal - 1) : 0;
  const discount = Math.min(rawDiscount, maxAllowedDiscount);

  // 7. Authoritative Grand Total Formula:
  // Final Price = Product Subtotal + Delivery Fee + Installation Fee + Home Visit Surcharge - Discount
  const grandTotal = Math.max(partSubtotal > 0 ? 1 : 0, preDiscountTotal - discount);

  return {
    partSubtotal,
    deliveryFee,
    installationFee,
    homeVisitSurcharge,
    discount,
    grandTotal,
    // Contextual aliases for backwards compatibility
    subtotal: partSubtotal,
    standardDeliveryFee: deliveryFee,
    baseInstallationFee: installationFee,
    finalPrice: grandTotal,
    appliedCoupon,
    resolvedDIFMType,
    difmEvaluation,
    distanceKm,
    durationMinutes,
  };
}

/**
 * Finds eligible nearby partnered workshops, annotated with distance from the customer
 */
export async function findEligiblePartneredShops(customerLocation?: LocationPoint | null) {
  const shops = await prisma.shop.findMany({
    where: { isActive: true },
  });

  const enrichedShops = await Promise.all(
    shops.map(async (shop: any) => {
      let distanceKm = 3.5;
      let durationMinutes = 20;

      if (customerLocation) {
        const distResult = await activeDistanceProvider.calculateDistance(customerLocation, {
          latitude: shop.latitude,
          longitude: shop.longitude,
          pincode: shop.pincode,
          city: shop.city,
        });
        distanceKm = distResult.distanceKm;
        durationMinutes = distResult.durationMinutes;
      }

      return {
        id: shop.id,
        name: shop.name,
        city: shop.city,
        address: shop.address || `${shop.name}, ${shop.city}`,
        pincode: shop.pincode || '560038',
        phone: shop.phone || '+91 98450 12345',
        rating: Number(shop.rating) || 4.8,
        isVerified: Boolean(shop.isVerified),
        distanceKm,
        durationMinutes,
        operatingHours: shop.operatingHours || '09:00 AM - 08:00 PM',
        servicesOffered: shop.servicesOffered || ['Brakes', 'Electrical', 'Tune-up'],
      };
    })
  );

  // Sort by nearest first
  enrichedShops.sort((a, b) => a.distanceKm - b.distanceKm);

  return enrichedShops;
}
