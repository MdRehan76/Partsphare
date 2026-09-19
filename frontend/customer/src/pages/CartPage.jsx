import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button, EmptyState } from '../components/ui';
import CartSummary from '../components/cart/CartSummary';
import toast from 'react-hot-toast';
import './CartPage.css';

const CartPage = () => {
  const {
    cart,
    loading,
    subtotal,
    mrpTotal,
    discount: backendDiscount,
    discountPercentage,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    total: backendTotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    revalidateCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Shopping Cart | PartNexa';
  }, []);

  const items = cart?.items || [];
  const installationCost = includeInstallation ? 199 : 0;
  // Calculate promo discount on subtotal if valid coupon applied
  const promoDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;

  const handleApplyCoupon = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) return;
    if (trimmed === 'PARTS10' || trimmed === 'WELCOME10') {
      setCouponCode(trimmed);
      setCouponApplied(true);
      toast.success('🎉 Coupon applied! 10% promo discount added.');
    } else {
      toast.error('Invalid coupon code. Try PARTS10');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    toast('Coupon removed', { icon: 'ℹ️' });
  };

  const handleRecheckInventory = async () => {
    setIsRevalidating(true);
    const result = await revalidateCart();
    setIsRevalidating(false);
    if (result.warnings && result.warnings.length > 0) {
      toast('Cart updated to latest available stock and prices.', { icon: '🔔' });
    } else {
      toast.success('All items are in stock with verified pricing!');
    }
  };

  const handleProceedToCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    // Mandatory pre-checkout inventory revalidation
    const { isValid, warnings } = await revalidateCart();
    setIsCheckingOut(false);

    if (!isValid || (warnings && warnings.length > 0)) {
      toast.error(
        'Some items changed in price or availability. Please review your cart before proceeding.',
        { duration: 5000 }
      );
      return;
    }

    navigate('/checkout', {
      state: {
        includeInstallation,
        couponCode: couponApplied ? couponCode : null,
        couponDiscount: promoDiscount,
      },
    });
  };

  if (!loading && items.length === 0) {
    return (
      <div className="cart-page" id="cart-page-empty">
        <div className="container">
          <div className="cart-empty-wrapper">
            <EmptyState
              icon="🛒"
              title="Your Cart is Empty"
              description="You haven't added any automotive parts yet. Discover precision parts and lubricants verified for your vehicle."
              actionText="Browse Spare Parts Catalog"
              onAction={() => navigate('/products')}
            />

            <div className="cart-empty-quick-links">
              <span className="quick-links-title">Popular Categories:</span>
              <div className="quick-links-pills">
                <Link to="/products?category=cat-braking" className="quick-link-pill">
                  🛑 Brake Pads
                </Link>
                <Link to="/products?category=cat-engine" className="quick-link-pill">
                  ⚡ Spark Plugs
                </Link>
                <Link to="/products?category=cat-oils" className="quick-link-pill">
                  🛢️ Engine Oils
                </Link>
                <Link to="/products?category=cat-batteries" className="quick-link-pill">
                  🔋 Car & Bike Batteries
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page-content">
      <div className="container">
        {/* Header with quick actions */}
        <div className="cart-header">
          <div className="cart-header-text">
            <h1 className="cart-title">Shopping Cart</h1>
            <p className="cart-subtitle">
              {items.length} {items.length === 1 ? 'part' : 'parts'} ({itemCount} total units) ready
              for doorstep dispatch
            </p>
          </div>

          <div className="cart-header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecheckInventory}
              disabled={isRevalidating || loading}
              title="Verify stock and current prices"
              id="recheck-inventory-btn"
            >
              {isRevalidating ? '🔄 Checking...' : '🔄 Verify Stock'}
            </Button>
            <button
              type="button"
              className="cart-clear-btn"
              onClick={clearCart}
              title="Empty entire cart"
              id="clear-cart-btn"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="cart-layout">
          {/* Items Column */}
          <div className="cart-items-column">
            <div className="cart-items-container">
              {items.map((item) => {
                const product = item.product || {};
                const image =
                  product.images?.[0]?.url ||
                  (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||
                  product.primaryImage;
                const price = Number(item.priceSnapshot || product.basePrice || 0);
                const lineTotal = price * item.quantity;
                const maxStock = item.maxStock !== undefined ? item.maxStock : 999;
                const isAtMaxStock = item.quantity >= maxStock;

                return (
                  <div key={item.id} className="cart-item-card" id={`cart-item-${item.id}`}>
                    <div className="cart-item-image-box">
                      {image ? (
                        <img src={image} alt={product.name} className="cart-item-image" />
                      ) : (
                        <span className="cart-item-placeholder">⚙️</span>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-meta-top">
                        {product.brand?.name && (
                          <span className="cart-item-brand">{product.brand.name}</span>
                        )}
                        {product.partNumber && (
                          <span className="cart-item-part-number">Part #: {product.partNumber}</span>
                        )}
                        {product.condition && (
                          <span className={`condition-tag tag-${product.condition.toLowerCase()}`}>
                            {product.condition === 'GENUINE_NEW'
                              ? 'GENUINE'
                              : product.condition === 'REFURBISHED'
                              ? 'REFURBISHED'
                              : 'VERIFIED USED'}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="cart-item-name"
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      <div className="cart-item-shop">
                        <span>🏬 Fulfilled by:</span>
                        <strong>{item.shop?.name || 'PartNexa Verified Hub'}</strong>
                        {item.shop?.city && <span className="shop-city">({item.shop.city})</span>}
                      </div>

                      <div className="cart-item-pricing-inline">
                        <span className="cart-item-price-unit">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && product.mrp > price && (
                          <span className="cart-item-mrp">
                            MRP ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Stock availability limit notice */}
                      {isAtMaxStock && (
                        <div className="cart-stock-warning">
                          ⚠️ Maximum available stock reached ({maxStock} in stock)
                        </div>
                      )}
                    </div>

                    <div className="cart-item-actions">
                      {/* Authoritative Quantity Controls */}
                      <div className="qty-control" id={`qty-control-${item.id}`}>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-val" id={`qty-val-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isAtMaxStock}
                          aria-label="Increase quantity"
                          title={
                            isAtMaxStock
                              ? `Cannot add more. Only ${maxStock} in stock.`
                              : 'Increase quantity'
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </div>

                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove part from cart"
                        aria-label="Remove part"
                        id={`remove-item-${item.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Do-It-For-Me (DIFM) Doorstep Installation Banner */}
            <div className="cart-difm-banner">
              <div className="cart-difm-content">
                <div className="cart-difm-icon">🔧</div>
                <div>
                  <div className="cart-difm-title">Do-It-For-Me (DIFM) Doorstep Installation</div>
                  <div className="cart-difm-desc">
                    Book a verified PartNexa mechanic to professionally fit your replacement parts
                    at your doorstep or garage.
                  </div>
                </div>
              </div>
              <Button
                variant={includeInstallation ? 'teal' : 'outline'}
                size="sm"
                onClick={() => setIncludeInstallation(!includeInstallation)}
                id="toggle-installation-btn"
              >
                {includeInstallation ? '✓ Included (+₹199)' : '+ Add Installation (₹199)'}
              </Button>
            </div>
          </div>

          {/* Reusable Order Summary Column */}
          <div className="cart-summary-column">
            <CartSummary
              subtotal={subtotal}
              mrpTotal={mrpTotal}
              discount={backendDiscount}
              discountPercentage={discountPercentage}
              deliveryFee={deliveryFee}
              freeDeliveryThreshold={freeDeliveryThreshold}
              amountNeededForFreeDelivery={amountNeededForFreeDelivery}
              total={backendTotal}
              itemCount={itemCount}
              includeInstallation={includeInstallation}
              installationCost={installationCost}
              couponCode={couponCode}
              couponApplied={couponApplied}
              couponDiscount={promoDiscount}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onCheckout={handleProceedToCheckout}
              isCheckingOut={isCheckingOut || isRevalidating}
              disabled={items.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
