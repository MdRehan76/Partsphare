import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

export interface CartTotals {
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  mrpTotal: number;
  discount: number;
  discountPercentage: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  total: number;
}

export const calculateCartTotals = (items: any[]): CartTotals => {
  let subtotal = 0;
  let mrpTotal = 0;
  let itemCount = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.priceSnapshot) || 0;
    const mrp = Number(item.product?.mrp || item.product?.basePrice || unitPrice);

    subtotal += unitPrice * qty;
    mrpTotal += mrp * qty;
    itemCount += qty;
  }

  const discount = Math.max(0, mrpTotal - subtotal);
  const discountPercentage = mrpTotal > 0 ? Math.round((discount / mrpTotal) * 100) : 0;
  const freeDeliveryThreshold = 999;
  // Standard PartNexa rule: Free delivery above ₹999 or empty cart, else ₹49
  const deliveryFee = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 49;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const total = subtotal + deliveryFee;

  return {
    itemCount,
    uniqueItemCount: items.length,
    subtotal,
    mrpTotal,
    discount,
    discountPercentage,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    total,
  };
};

export const getCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true, slug: true } },
            },
          },
          shop: {
            select: { id: true, name: true, city: true, isVerified: true, rating: true },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, category: true },
            },
            shop: true,
          },
        },
      },
    });
  }

  const totals = calculateCartTotals(cart.items || []);

  return {
    ...cart,
    ...totals,
  };
};

export const addItemToCart = async (
  userId: string,
  {
    productId,
    shopId,
    quantity = 1,
    vehicleVariantId,
    ignoreCompatibility = false,
  }: {
    productId: string;
    shopId?: string;
    quantity?: number;
    vehicleVariantId?: string;
    ignoreCompatibility?: boolean;
  }
) => {
  const reqQuantity = Number(quantity);
  if (isNaN(reqQuantity) || reqQuantity < 1) {
    throw AppError.badRequest('Quantity must be a positive integer.');
  }

  // 1. Check Product existence & status
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'ACTIVE') {
    throw AppError.notFound('Product not found or currently unavailable.');
  }

  // 2. Compatibility check against user vehicle
  let targetVariantId = vehicleVariantId;
  if (!targetVariantId) {
    const primaryVehicle = await prisma.customerVehicle.findFirst({
      where: { userId, isPrimary: true },
    });
    if (primaryVehicle) {
      targetVariantId = primaryVehicle.variantId;
    }
  }

  if (targetVariantId && !ignoreCompatibility) {
    const compat = await prisma.productCompatibility.findFirst({
      where: { productId, variantId: targetVariantId },
    });

    if (!compat) {
      const variant = await prisma.vehicleVariant.findUnique({ where: { id: targetVariantId } });
      let vehicleDesc = 'your registered vehicle';
      if (variant) {
        const model = await prisma.vehicleModel.findUnique({ where: { id: variant.modelId } });
        const make = model ? await prisma.vehicleMake.findUnique({ where: { id: model.makeId } }) : null;
        vehicleDesc = `${make?.name || ''} ${model?.name || ''} ${variant.name} (${variant.year})`.trim();
      }

      throw AppError.badRequest(
        `Incompatible part: "${product.name}" does not fit ${vehicleDesc}. Please select a compatible part for your vehicle.`
      );
    }
  }

  // 3. Inventory & Shop selection
  let targetShopId = shopId;
  let targetInventory: any = null;

  if (targetShopId) {
    targetInventory = await prisma.inventory.findUnique({
      where: { productId_shopId: { productId, shopId: targetShopId } },
    });
  } else {
    // Pick lowest sellingPrice available shop inventory with stock > 0
    targetInventory = await prisma.inventory.findFirst({
      where: { productId, isAvailable: true, quantity: { gt: 0 } },
      orderBy: { sellingPrice: 'asc' },
    });
    if (targetInventory) {
      targetShopId = targetInventory.shopId;
    }
  }

  if (!targetInventory || !targetInventory.isAvailable || targetInventory.quantity <= 0) {
    throw AppError.badRequest(`"${product.name}" is currently out of stock.`);
  }

  const unitPrice = Number(targetInventory.sellingPrice);

  // 4. Ensure Cart exists
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // 5. Check existing item in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_shopId: {
        cartId: cart.id,
        productId,
        shopId: targetShopId!,
      },
    },
  });

  const currentCartQty = existingItem ? existingItem.quantity : 0;
  const newTotalQty = currentCartQty + reqQuantity;

  // 6. Prevent quantity beyond available stock
  if (newTotalQty > targetInventory.quantity) {
    throw AppError.badRequest(
      `Cannot add ${reqQuantity} unit(s). Maximum available stock is ${targetInventory.quantity} (you already have ${currentCartQty} in your cart).`
    );
  }

  // 7. Upsert Cart Item
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newTotalQty,
        priceSnapshot: unitPrice,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        shopId: targetShopId!,
        quantity: reqQuantity,
        priceSnapshot: unitPrice,
      },
    });
  }

  return getCart(userId);
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  const reqQuantity = Number(quantity);
  if (isNaN(reqQuantity)) {
    throw AppError.badRequest('Quantity must be a valid number.');
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw AppError.notFound('Cart not found.');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) throw AppError.notFound('Cart item not found.');

  if (reqQuantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return getCart(userId);
  }

  // Stock check
  const inventory = await prisma.inventory.findUnique({
    where: { productId_shopId: { productId: item.productId, shopId: item.shopId } },
  });

  if (inventory && reqQuantity > inventory.quantity) {
    throw AppError.badRequest(
      `Cannot set quantity to ${reqQuantity}. Only ${inventory.quantity} unit(s) available in stock.`
    );
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: reqQuantity },
  });

  return getCart(userId);
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw AppError.notFound('Cart not found.');

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });

  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return getCart(userId);
};

export const revalidateCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          shop: true,
        },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      cart: await getCart(userId),
      warnings: [],
      isValid: true,
    };
  }

  const warnings: string[] = [];

  for (const item of cart.items) {
    // 1. Product check
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.status !== 'ACTIVE') {
      await prisma.cartItem.delete({ where: { id: item.id } });
      warnings.push(
        `Item "${item.product?.name || 'Unknown'}" is no longer available and was removed from your cart.`
      );
      continue;
    }

    // 2. Inventory check
    const inventory = await prisma.inventory.findUnique({
      where: { productId_shopId: { productId: item.productId, shopId: item.shopId } },
    });

    if (!inventory || !inventory.isAvailable || inventory.quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      warnings.push(
        `Item "${product.name}" is currently out of stock and was removed from your cart.`
      );
      continue;
    }

    // 3. Stock limit clamp
    if (item.quantity > inventory.quantity) {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: inventory.quantity },
      });
      warnings.push(
        `Quantity for "${product.name}" was adjusted from ${item.quantity} to ${inventory.quantity} due to stock availability.`
      );
    }

    // 4. Price update
    const currentPrice = Number(inventory.sellingPrice);
    if (Math.abs(Number(item.priceSnapshot) - currentPrice) > 0.01) {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { priceSnapshot: currentPrice },
      });
      warnings.push(
        `Price for "${product.name}" updated from ₹${item.priceSnapshot} to ₹${currentPrice}.`
      );
    }
  }

  const updatedCart = await getCart(userId);

  return {
    cart: updatedCart,
    warnings,
    isValid: warnings.length === 0 && updatedCart.items.length > 0,
  };
};
