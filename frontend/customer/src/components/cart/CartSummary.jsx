import React, { useState } from 'react';
import { Button } from '../ui';
import './CartSummary.css';

/**
 * Reusable CartSummary Component
 * Shows authoritative pricing breakdown calculated by backend,
 * delivery progress bar, promo code form, and checkout action.
 * Fully supports Light Mode and Dark Mode.
 */
export const CartSummary = ({
  subtotal = 0,
  mrpTotal = 0,
  discount = 0,
  discountPercentage = 0,
  deliveryFee = 0,
  freeDeliveryThreshold = 999,
  amountNeededForFreeDelivery = 0,
  total = 0,
  itemCount = 0,
  includeInstallation = false,
  installationCost = 0,
  onToggleInstallation = null,
  couponCode = '',
  couponApplied = false,
  couponDiscount = 0,
  onApplyCoupon = null,
  onRemoveCoupon = null,
  onCheckout = null,
  isCheckingOut = false,
  disabled = false,
  actionButtonText = 'Proceed to Checkout →',
}) => {
  const [localCouponInput, setLocalCouponInput] = useState(couponCode);

  const deliveryProgress =
    freeDeliveryThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))
      : 100;

  const isFreeDelivery = deliveryFee === 0 && subtotal > 0;

  // Final total accounting for optional installation and coupon
  const finalTotal = Math.max(
    0,
    total + (includeInstallation ? installationCost : 0) - (couponApplied ? couponDiscount : 0)
  );

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (onApplyCoupon && localCouponInput.trim()) {
      onApplyCoupon(localCouponInput.trim());
    }
  };

  return (
    <div className="cart-summary-wrapper" id="cart-summary-component">
      {/* Free Shipping Progress Indicator */}
      <div className={`cart-free-delivery-bar ${isFreeDelivery ? 'is-unlocked' : ''}`}>
        <div className="delivery-bar-header">
          <span className="delivery-bar-icon">{isFreeDelivery ? '🎉' : '🚚'}</span>
          <span className="delivery-bar-text">
            {isFreeDelivery ? (
              <strong>You've unlocked FREE Delivery!</strong>
            ) : amountNeededForFreeDelivery > 0 ? (
              <>
                Add <strong>₹{amountNeededForFreeDelivery.toLocaleString('en-IN')}</strong> more
                for <strong>FREE Delivery</strong>
              </>
            ) : (
              'Standard Doorstep Delivery'
            )}
          </span>
        </div>
        {!isFreeDelivery && (
          <div className="delivery-progress-track">
            <div
              className="delivery-progress-fill"
              style={{ width: `${deliveryProgress}%` }}
              role="progressbar"
              aria-valuenow={deliveryProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        )}
      </div>

      {/* Main Summary Card */}
      <div className="cart-summary-card">
        <div className="cart-summary-header">
          <h2 className="cart-summary-title">Order Summary</h2>
          {itemCount > 0 && (
            <span className="cart-summary-badge">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Breakdown Rows */}
        <div className="summary-rows">
          <div className="summary-row">
            <span className="summary-row-label">Parts Subtotal</span>
            <span className="summary-row-value">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discount > 0 && (
            <div className="summary-row savings">
              <span className="summary-row-label">
                Catalog Savings
                {discountPercentage > 0 && (
                  <span className="savings-badge">{discountPercentage}% OFF</span>
                )}
              </span>
              <span className="summary-row-value text-success">
                -₹{discount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {includeInstallation && (
            <div className="summary-row">
              <span className="summary-row-label">Doorstep Installation (DIFM)</span>
              <span className="summary-row-value">₹{installationCost.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-row">
            <span className="summary-row-label">Estimated Delivery Fee</span>
            <span className="summary-row-value">
              {deliveryFee === 0 ? (
                <span className="delivery-free-tag">FREE</span>
              ) : (
                `₹${deliveryFee}`
              )}
            </span>
          </div>

          {couponApplied && couponDiscount > 0 && (
            <div className="summary-row promo">
              <span className="summary-row-label">
                Coupon ({couponCode.toUpperCase()})
                {onRemoveCoupon && (
                  <button
                    type="button"
                    className="coupon-remove-btn"
                    onClick={onRemoveCoupon}
                    title="Remove coupon"
                  >
                    ×
                  </button>
                )}
              </span>
              <span className="summary-row-value text-success">
                -₹{couponDiscount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="summary-divider" />

          {/* Authoritative Total */}
          <div className="summary-row total-row">
            <div>
              <span className="summary-total-label">Total Amount</span>
              <span className="summary-total-subtext">Inclusive of all taxes & GST</span>
            </div>
            <span className="summary-total-value">₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Promo Code Form */}
        {onApplyCoupon && (
          <form onSubmit={handleCouponSubmit} className="cart-coupon-form">
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Coupon code (e.g. PARTS10)"
                className="cart-coupon-input"
                value={localCouponInput}
                onChange={(e) => setLocalCouponInput(e.target.value)}
                disabled={couponApplied || disabled}
                id="cart-coupon-input"
              />
              <Button
                type="submit"
                variant={couponApplied ? 'teal' : 'outline'}
                size="sm"
                disabled={couponApplied || !localCouponInput.trim() || disabled}
                id="apply-coupon-btn"
              >
                {couponApplied ? '✓ Applied' : 'Apply'}
              </Button>
            </div>
          </form>
        )}

        {/* Checkout Button */}
        {onCheckout && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCheckout}
            disabled={disabled || isCheckingOut || itemCount === 0}
            id="cart-summary-checkout-btn"
            className="cart-checkout-action-btn"
          >
            {isCheckingOut ? 'Verifying Stock & Prices...' : actionButtonText}
          </Button>
        )}

        {/* Trust Guarantees */}
        <div className="cart-trust-strip">
          <div className="trust-strip-item">
            <span className="trust-icon">🛡️</span>
            <div className="trust-text">
              <strong>100% Genuine Parts</strong>
              <small>Direct from OEM / verified hubs</small>
            </div>
          </div>
          <div className="trust-strip-item">
            <span className="trust-icon">⚡</span>
            <div className="trust-text">
              <strong>Express Doorstep Delivery</strong>
              <small>Live tracking on all dispatches</small>
            </div>
          </div>
          <div className="trust-strip-item">
            <span className="trust-icon">🔄</span>
            <div className="trust-text">
              <strong>10-Day Free Return Policy</strong>
              <small>Hassle-free guarantee if fitment fails</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
