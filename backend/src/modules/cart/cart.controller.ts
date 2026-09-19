import { Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import * as cartService from './cart.service';
import { successResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.id);
    return successResponse(res, cart);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, shopId, quantity, vehicleVariantId, ignoreCompatibility } = req.body;
    const cart = await cartService.addItemToCart(req.user!.id, {
      productId,
      shopId,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : 1,
      vehicleVariantId,
      ignoreCompatibility: Boolean(ignoreCompatibility),
    });
    return successResponse(res, cart, 'Item added to cart.');
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id as string;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user!.id, itemId, parseInt(quantity, 10));
    return successResponse(res, cart, 'Cart updated.');
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id as string;
    const cart = await cartService.removeCartItem(req.user!.id, itemId);
    return successResponse(res, cart, 'Item removed from cart.');
  } catch (error) {
    next(error);
  }
};

export const clear = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.clearCart(req.user!.id);
    return successResponse(res, cart, 'Cart cleared.');
  } catch (error) {
    next(error);
  }
};

export const revalidate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.revalidateCart(req.user!.id);
    return successResponse(res, result, 'Cart inventory revalidated.');
  } catch (error) {
    next(error);
  }
};

export const simulateInventoryUpdate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, shopId, quantity, sellingPrice, isAvailable } = req.body;
    const updated = await prisma.inventory.update({
      where: { productId_shopId: { productId, shopId } },
      data: {
        ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
        ...(sellingPrice !== undefined ? { sellingPrice: Number(sellingPrice) } : {}),
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
      },
    });
    return successResponse(res, updated, 'Inventory updated.');
  } catch (error) {
    next(error);
  }
};
