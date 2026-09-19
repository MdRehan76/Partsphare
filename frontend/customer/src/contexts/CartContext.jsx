import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useVehicle } from './VehicleContext';
import { cartService } from '../services';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const calculateGuestTotals = (items) => {
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

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { activeVehicle } = useVehicle();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    mrpTotal: 0,
    discount: 0,
    discountPercentage: 0,
    deliveryFee: 0,
    freeDeliveryThreshold: 999,
    amountNeededForFreeDelivery: 999,
    total: 0,
    itemCount: 0,
    uniqueItemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load cart from backend (if logged in) or localStorage (if guest)
  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const res = await cartService.getCart();
        setCart(res.data.data);
      } catch (err) {
        console.error('Failed to load cart from server:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const saved = localStorage.getItem('partsphere_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const totals = calculateGuestTotals(parsed.items || []);
          setCart({ ...parsed, ...totals });
        } catch {
          setCart({
            items: [],
            subtotal: 0,
            mrpTotal: 0,
            discount: 0,
            discountPercentage: 0,
            deliveryFee: 0,
            freeDeliveryThreshold: 999,
            amountNeededForFreeDelivery: 999,
            total: 0,
            itemCount: 0,
            uniqueItemCount: 0,
          });
        }
      } else {
        setCart({
          items: [],
          subtotal: 0,
          mrpTotal: 0,
          discount: 0,
          discountPercentage: 0,
          deliveryFee: 0,
          freeDeliveryThreshold: 999,
          amountNeededForFreeDelivery: 999,
          total: 0,
          itemCount: 0,
          uniqueItemCount: 0,
        });
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item
  const addToCart = async (
    product,
    shopId,
    quantity = 1,
    vehicleVariantId = null,
    ignoreCompatibility = false
  ) => {
    const targetVariantId = vehicleVariantId || activeVehicle?.variantId || null;

    if (user) {
      try {
        const res = await cartService.addItem({
          productId: product.id,
          shopId,
          quantity,
          vehicleVariantId: targetVariantId,
          ignoreCompatibility,
        });
        setCart(res.data.data);
        toast.success(`Added ${product.name} to cart`);
        return { success: true, cart: res.data.data };
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to add item to cart. Please try again.';
        toast.error(message, { duration: 5000 });
        return { success: false, error: message };
      }
    } else {
      // Local guest cart
      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex(
        (it) => it.productId === product.id && (!shopId || it.shopId === shopId)
      );

      const price = product.lowestPrice || product.basePrice || 0;
      const maxStock = product.inventories?.[0]?.quantity ?? 10;

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + quantity;
        if (newQty > maxStock) {
          toast.error(
            `Cannot add ${quantity} unit(s). Maximum stock available is ${maxStock}.`
          );
          return { success: false };
        }
        currentItems[existingIdx].quantity = newQty;
      } else {
        if (quantity > maxStock) {
          toast.error(
            `Cannot add ${quantity} unit(s). Maximum stock available is ${maxStock}.`
          );
          return { success: false };
        }
        currentItems.push({
          id: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          productId: product.id,
          shopId: shopId || 'shop-1',
          quantity,
          priceSnapshot: price,
          maxStock,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            brand: product.brand,
            partNumber: product.partNumber,
            condition: product.condition,
            mrp: product.mrp || price * 1.2,
            basePrice: product.basePrice,
            images: product.images || (product.primaryImage ? [{ url: product.primaryImage }] : []),
          },
          shop: { name: 'PartNexa Verified Hub', city: 'Bengaluru' },
        });
      }

      const totals = calculateGuestTotals(currentItems);
      const newCart = { items: currentItems, ...totals };
      setCart(newCart);
      localStorage.setItem('partsphere_guest_cart', JSON.stringify(newCart));
      toast.success(`Added ${product.name} to cart`);
      return { success: true, cart: newCart };
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (user) {
      try {
        const res = await cartService.updateItem(itemId, newQuantity);
        setCart(res.data.data);
        return { success: true, cart: res.data.data };
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to update quantity';
        toast.error(message, { duration: 4000 });
        return { success: false, error: message };
      }
    } else {
      let currentItems = [...cart.items];
      if (newQuantity <= 0) {
        currentItems = currentItems.filter((it) => it.id !== itemId);
      } else {
        const itm = currentItems.find((it) => it.id === itemId);
        if (itm && itm.maxStock && newQuantity > itm.maxStock) {
          toast.error(`Cannot set quantity to ${newQuantity}. Only ${itm.maxStock} available.`);
          return { success: false };
        }
        currentItems = currentItems.map((it) =>
          it.id === itemId ? { ...it, quantity: newQuantity } : it
        );
      }

      const totals = calculateGuestTotals(currentItems);
      const newCart = { items: currentItems, ...totals };
      setCart(newCart);
      localStorage.setItem('partsphere_guest_cart', JSON.stringify(newCart));
      return { success: true, cart: newCart };
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        const res = await cartService.removeItem(itemId);
        setCart(res.data.data);
        toast.success('Item removed from cart');
        return { success: true, cart: res.data.data };
      } catch (err) {
        toast.error('Failed to remove item');
        return { success: false };
      }
    } else {
      const currentItems = cart.items.filter((it) => it.id !== itemId);
      const totals = calculateGuestTotals(currentItems);
      const newCart = { items: currentItems, ...totals };
      setCart(newCart);
      localStorage.setItem('partsphere_guest_cart', JSON.stringify(newCart));
      toast.success('Item removed from cart');
      return { success: true, cart: newCart };
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const res = await cartService.clearCart();
        setCart(
          res.data.data?.cart || {
            items: [],
            subtotal: 0,
            mrpTotal: 0,
            discount: 0,
            discountPercentage: 0,
            deliveryFee: 0,
            freeDeliveryThreshold: 999,
            amountNeededForFreeDelivery: 999,
            total: 0,
            itemCount: 0,
            uniqueItemCount: 0,
          }
        );
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      setCart({
        items: [],
        subtotal: 0,
        mrpTotal: 0,
        discount: 0,
        discountPercentage: 0,
        deliveryFee: 0,
        freeDeliveryThreshold: 999,
        amountNeededForFreeDelivery: 999,
        total: 0,
        itemCount: 0,
        uniqueItemCount: 0,
      });
      localStorage.removeItem('partsphere_guest_cart');
    }
  };

  const revalidateCart = async () => {
    if (user) {
      try {
        setLoading(true);
        const res = await cartService.revalidate();
        const data = res.data.data;
        setCart(data.cart);
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach((w) => {
            toast(w, { icon: '⚠️', duration: 6000 });
          });
        }
        return { isValid: data.isValid, warnings: data.warnings, cart: data.cart };
      } catch (err) {
        console.error('Failed to revalidate cart:', err);
        toast.error('Unable to verify inventory right now. Please try again.');
        return { isValid: false, warnings: [], cart };
      } finally {
        setLoading(false);
      }
    }
    return { isValid: cart.items.length > 0, warnings: [], cart };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount: cart?.itemCount ?? cart?.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0,
        uniqueItemCount: cart?.uniqueItemCount ?? cart?.items?.length ?? 0,
        subtotal: Number(cart?.subtotal) || 0,
        mrpTotal: Number(cart?.mrpTotal) || 0,
        discount: Number(cart?.discount) || 0,
        discountPercentage: Number(cart?.discountPercentage) || 0,
        deliveryFee: Number(cart?.deliveryFee) || 0,
        freeDeliveryThreshold: Number(cart?.freeDeliveryThreshold) || 999,
        amountNeededForFreeDelivery: Number(cart?.amountNeededForFreeDelivery) || 0,
        total: Number(cart?.total) || 0,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        revalidateCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
