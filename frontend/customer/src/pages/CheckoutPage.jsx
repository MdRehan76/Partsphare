import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usersService, ordersService, paymentsService } from '../services';
import { Button, Input } from '../components/ui';
import RazorpayModal from '../components/checkout/RazorpayModal';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    landmark: '',
    isDefault: true,
  });

  // DIFM Options State
  // OPTION A: HOME_INSTALLATION (Mechanic comes to customer's home)
  // OPTION B: SHOP_INSTALLATION (Customer visits partnered local shop)
  // OPTION C: NO_INSTALLATION (No installation / Delivery only)
  const [difmOption, setDifmOption] = useState('HOME_INSTALLATION');
  const [selectedShopId, setSelectedShopId] = useState(null);

  // Coupons & Pricing Quote State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [quote, setQuote] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Payment & Order Placement State
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY_DEMO');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Razorpay Sandbox & Payment Lifecycle States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentSession, setActivePaymentSession] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentFailureData, setPaymentFailureData] = useState(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isSwitchingToCOD, setIsSwitchingToCOD] = useState(false);

  // Fetch addresses on mount
  useEffect(() => {
    document.title = 'DIFM Secure Checkout | PartNexa';

    if (user) {
      usersService
        .getAddresses()
        .then(({ data }) => {
          const addrs = data.data || [];
          setAddresses(addrs);
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          if (def) {
            setSelectedAddressId(def.id);
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch(() => {
          setShowNewAddressForm(true);
        });
    } else {
      setShowNewAddressForm(true);
    }
  }, [user]);

  // Authoritative Backend Quote Fetcher
  const fetchCheckoutQuote = useCallback(async () => {
    if (!user) return;
    if (!cart?.items || cart.items.length === 0) return;

    setIsQuoteLoading(true);
    try {
      const res = await ordersService.getCheckoutQuote({
        addressId: selectedAddressId,
        difmType: difmOption,
        shopId: selectedShopId,
        couponCode: appliedCoupon,
      });

      const quoteData = res.data?.data;
      if (quoteData) {
        setQuote(quoteData);
        // If shop is not explicitly selected yet, default to the assigned shop from backend
        if (!selectedShopId && quoteData.difm?.assignedShop?.id) {
          setSelectedShopId(quoteData.difm.assignedShop.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch checkout quote:', err);
    } finally {
      setIsQuoteLoading(false);
    }
  }, [user, cart?.items, selectedAddressId, difmOption, selectedShopId, appliedCoupon]);

  // Recalculate quote immediately whenever option, address, shop, or coupon changes
  useEffect(() => {
    fetchCheckoutQuote();
  }, [fetchCheckoutQuote]);

  // Handle address creation
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill in all mandatory address fields');
      return;
    }

    setIsSavingAddress(true);
    try {
      const { data } = await usersService.createAddress(newAddress);
      const saved = data.data;
      setAddresses((prev) => [saved, ...prev]);
      setSelectedAddressId(saved.id);
      setShowNewAddressForm(false);
      toast.success('Delivery address saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Handle coupon apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
    toast.success(`Applying coupon ${code}...`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    toast.success('Coupon removed');
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address to proceed.');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      toast.error('Your shopping cart is empty');
      navigate('/cart');
      return;
    }

    // Acceptance test rule: Difficult-install product cannot bypass required DIFM selection
    if (quote?.cartSummary?.hasDifficultParts && !difmOption) {
      toast.error('Please select an installation preference (Option A, B, or C) for your difficult-to-install parts.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        difmType: difmOption,
        shopId: selectedShopId,
        paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
        couponCode: appliedCoupon || undefined,
        notes: orderNotes || undefined,
      };

      const res = await ordersService.createOrder(payload);
      const createdOrder = res.data?.data;

      if (!createdOrder) {
        throw new Error('Failed to create order');
      }

      if (paymentMethod === 'COD') {
        // COD flow: immediately confirmed, payment collection pending
        await clearCart();
        setConfirmedOrder(createdOrder);
        toast.success('Order confirmed with Cash on Delivery! 📦');
      } else {
        // Razorpay Sandbox flow:
        // Request backend payment order session with safe gateway reference
        const sessionRes = await paymentsService.createPaymentOrder({ orderId: createdOrder.id });
        const sessionData = sessionRes.data?.data;

        setActivePaymentSession(sessionData);
        setPaymentFailureData(null);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authoritative Backend Verification of Razorpay Sandbox Payment
  // Never trust frontend success callback alone!
  const handlePaymentSuccess = async (result) => {
    setIsPaymentModalOpen(false);
    setIsVerifyingPayment(true);
    const toastId = toast.loading('Verifying payment signature with backend HMAC-SHA256...');

    try {
      const verifyRes = await paymentsService.verifyPayment({
        orderId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });

      const verifiedData = verifyRes.data?.data;
      await clearCart();
      setPaymentFailureData(null);
      setPaymentSuccessData(verifiedData);
      setConfirmedOrder(verifiedData.order);
      toast.success('Payment verified & order confirmed! 🎉', { id: toastId });
    } catch (err) {
      console.error('Payment verification failed:', err);
      const errMsg = err.response?.data?.message || 'Backend payment verification failed.';
      toast.error(errMsg, { id: toastId });

      setPaymentFailureData({
        orderId: result.orderId,
        orderNumber: activePaymentSession?.orderNumber,
        errorCode: 'SIGNATURE_VERIFICATION_FAILED',
        errorDescription: errMsg,
        amount: activePaymentSession?.amount,
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Payment Failure (e.g. Bank Decline)
  const handlePaymentFailure = async (errData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: errData.orderId,
        errorCode: errData.errorCode || 'BAD_REQUEST_PAYMENT_DECLINED',
        errorReason: errData.errorDescription || errData.reason || 'Payment was declined by bank',
      });
    } catch (e) {
      console.error('Failed to record payment failure:', e);
    }

    setPaymentFailureData({
      orderId: errData.orderId,
      orderNumber: activePaymentSession?.orderNumber,
      errorCode: errData.errorCode || 'BAD_REQUEST_PAYMENT_DECLINED',
      errorDescription: errData.errorDescription || 'The card/payment was declined by the simulated bank.',
      amount: activePaymentSession?.amountInRupees || (activePaymentSession?.amount && activePaymentSession?.amount === activePaymentSession?.amountInPaise ? activePaymentSession.amount / 100 : activePaymentSession?.amount),
    });
    toast.error(errData.errorDescription || 'Payment declined by bank');
  };

  // Payment Cancelled by User
  const handlePaymentCancel = async (cancelData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: cancelData.orderId,
        errorCode: cancelData.errorCode || 'PAYMENT_CANCELLED_BY_USER',
        errorReason: cancelData.reason || 'Payment cancelled by customer in modal',
      });
    } catch (e) {
      console.error('Failed to record payment cancellation:', e);
    }

    setPaymentFailureData({
      orderId: cancelData.orderId,
      orderNumber: activePaymentSession?.orderNumber,
      errorCode: 'PAYMENT_CANCELLED_BY_USER',
      errorDescription: cancelData.reason || 'You closed the Razorpay sandbox window before completing payment.',
      amount: activePaymentSession?.amountInRupees || (activePaymentSession?.amount && activePaymentSession?.amount === activePaymentSession?.amountInPaise ? activePaymentSession.amount / 100 : activePaymentSession?.amount),
    });
    toast.error('Payment cancelled');
  };

  // Retry Payment via Razorpay
  const handleRetryPayment = async (orderId) => {
    setIsRetryingPayment(true);
    try {
      const res = await paymentsService.retryPayment(orderId);
      const sessionData = res.data?.data;
      setActivePaymentSession(sessionData);
      setPaymentFailureData(null);
      setIsPaymentModalOpen(true);
      toast.success('Restarted payment session. Please complete checkout.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retry payment. Please try again.');
    } finally {
      setIsRetryingPayment(false);
    }
  };

  // Switch Payment Method to Cash on Delivery (COD)
  const handleSwitchToCOD = async (orderId) => {
    setIsSwitchingToCOD(true);
    try {
      const res = await paymentsService.switchPaymentMethod(orderId, {
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      const updatedOrder = res.data?.data?.order;
      await clearCart();
      setPaymentFailureData(null);
      setConfirmedOrder(updatedOrder);
      toast.success('Switched to Cash on Delivery! Order is confirmed. 📦');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to switch payment method.');
    } finally {
      setIsSwitchingToCOD(false);
    }
  };

  const items = cart?.items || [];
  const difficultItems = quote?.cartSummary?.difficultItems || [];
  const hasDifficultParts = Boolean(quote?.cartSummary?.hasDifficultParts);

  // Extract authoritative pricing breakdown from backend quote
  const partSubtotalEst = items.reduce((s, it) => {
    const p = Number(it.priceSnapshot) || Number(it.unitPrice) || Number(it.product?.basePrice) || Number(it.product?.sellingPrice) || 0;
    const q = Number(it.quantity) || 1;
    return s + p * q;
  }, 0);

  const pricing = quote?.pricing || {
    partSubtotal: partSubtotalEst,
    deliveryFee: partSubtotalEst >= 999 || partSubtotalEst === 0 ? 0 : 49,
    installationFee: difmOption === 'NO_INSTALLATION' ? 0 : 299,
    homeVisitSurcharge: difmOption === 'HOME_INSTALLATION' ? 135 : 0,
    discount: 0,
    grandTotal: Math.max(
      partSubtotalEst > 0 ? 1 : 0,
      partSubtotalEst +
        (partSubtotalEst >= 999 || partSubtotalEst === 0 ? 0 : 49) +
        (difmOption === 'NO_INSTALLATION' ? 0 : 299) +
        (difmOption === 'HOME_INSTALLATION' ? 135 : 0)
    ),
  };

  const eligibleShops = quote?.eligibleShops || [];
  const assignedShop = quote?.difm?.assignedShop || eligibleShops[0];
  const distanceKm = quote?.difm?.distanceKm || 4.8;
  const durationMinutes = quote?.difm?.durationMinutes || 25;

  // View: Payment Failure / Cancelled State with Retry & Switch to COD
  if (paymentFailureData && !confirmedOrder) {
    return (
      <div className="checkout-page payment-result-view" id="payment-failure-screen">
        <div className="container">
          <div className="payment-failure-card">
            <div className="failure-badge-icon">⚠️</div>
            <h1 className="failure-title">Payment Not Completed</h1>
            <p className="failure-subtitle">
              {paymentFailureData.errorCode === 'PAYMENT_CANCELLED_BY_USER'
                ? 'The payment session was cancelled by you.'
                : 'The transaction could not be processed by the sandbox payment gateway.'}
            </p>

            <div className="failure-details-box">
              <div className="conf-row">
                <span className="conf-label">Order Reference:</span>
                <span className="conf-val font-mono">{paymentFailureData.orderNumber || paymentFailureData.orderId}</span>
              </div>
              <div className="conf-row">
                <span className="conf-label">Reason / Code:</span>
                <span className="conf-val text-danger font-semibold">
                  {paymentFailureData.errorDescription} ({paymentFailureData.errorCode})
                </span>
              </div>
              <div className="conf-row">
                <span className="conf-label">Order Status:</span>
                <span className="conf-val status-pill-pending">PENDING PAYMENT</span>
              </div>
              <div className="conf-divider" />
              <div className="conf-row total-row">
                <span className="conf-label">Amount Outstanding:</span>
                <span className="conf-val total-amount">
                  ₹{Number(paymentFailureData.amount || pricing.grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="failure-advice">
              💡 Don't worry! Your order has been saved. You can retry paying online with Razorpay Sandbox or instantly switch this order to Cash on Delivery (COD).
            </div>

            <div className="payment-action-buttons">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleRetryPayment(paymentFailureData.orderId)}
                loading={isRetryingPayment}
                id="retry-payment-button"
              >
                🔄 Retry Razorpay Payment
              </Button>
              <Button
                variant="teal"
                size="md"
                onClick={() => handleSwitchToCOD(paymentFailureData.orderId)}
                loading={isSwitchingToCOD}
                id="switch-cod-button"
              >
                💵 Switch to Cash on Delivery (COD)
              </Button>
              <Link to={`/orders/${paymentFailureData.orderId}`}>
                <Button variant="outline" size="md">
                  View in Order History
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Razorpay Modal for Retries */}
        <RazorpayModal
          isOpen={isPaymentModalOpen}
          paymentData={activePaymentSession}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  // View: Order Confirmation (For both Verified Razorpay and Confirmed COD)
  if (confirmedOrder) {
    const isRazorpay = confirmedOrder.paymentMethod === 'RAZORPAY';
    const payment = confirmedOrder.payment || paymentSuccessData?.payment;

    return (
      <div className="checkout-page confirmation-view" id="order-confirmation-screen">
        <div className="container">
          <div className="order-confirmation-card">
            <div className="confirmation-badge-icon">{isRazorpay ? '✅' : '📦'}</div>
            <h1 className="confirmation-title">
              {isRazorpay ? 'Payment Verified & Order Confirmed!' : 'Order Placed (Cash on Delivery)'}
            </h1>
            <p className="confirmation-subtitle">
              Order Reference: <strong className="font-mono">{confirmedOrder.orderNumber}</strong>
            </p>

            {/* Payment & Security Assurance Banner */}
            <div className={`payment-assurance-banner ${isRazorpay ? 'paid' : 'cod'}`}>
              <div className="assurance-icon">{isRazorpay ? '🔒' : '💵'}</div>
              <div className="assurance-text">
                {isRazorpay ? (
                  <>
                    <strong>Payment Captured via Razorpay Sandbox</strong>
                    <p>Cryptographically verified with backend HMAC-SHA256 signature. Safe metadata stored.</p>
                  </>
                ) : (
                  <>
                    <strong>Cash on Delivery (Pending Collection)</strong>
                    <p>Payment of ₹{Number(confirmedOrder.total).toLocaleString('en-IN')} will be collected upon parts delivery / technician fitment completion.</p>
                  </>
                )}
              </div>
            </div>

            <div className="confirmation-details-box">
              {/* Payment Safe Metadata */}
              <div className="conf-row">
                <span className="conf-label">Payment Method:</span>
                <span className="conf-val">
                  {isRazorpay ? '💳 Razorpay Sandbox / Demo Gateway' : '💵 Cash on Delivery (COD)'}
                </span>
              </div>

              <div className="conf-row">
                <span className="conf-label">Payment Status:</span>
                <span className={`conf-val ${isRazorpay ? 'status-pill-paid' : 'status-pill-cod'}`}>
                  {isRazorpay ? '✓ CAPTURED & PAID' : '⏳ PENDING COD COLLECTION'}
                </span>
              </div>

              {isRazorpay && payment?.razorpayPaymentId && (
                <div className="conf-row">
                  <span className="conf-label">Payment ID:</span>
                  <span className="conf-val font-mono">{payment.razorpayPaymentId}</span>
                </div>
              )}

              {isRazorpay && payment?.razorpayOrderId && (
                <div className="conf-row">
                  <span className="conf-label">Gateway Order ID:</span>
                  <span className="conf-val font-mono">{payment.razorpayOrderId}</span>
                </div>
              )}

              <div className="conf-divider" />

              <div className="conf-row">
                <span className="conf-label">Fitment Mode:</span>
                <span className="conf-val">
                  {confirmedOrder.difmType === 'HOME_INSTALLATION' && 'Option A: Home Doorstep Mechanic Visit'}
                  {confirmedOrder.difmType === 'SHOP_INSTALLATION' && 'Option B: Partnered Local Workshop Fitment'}
                  {confirmedOrder.difmType === 'NO_INSTALLATION' && 'Option C: Self Installation / Delivery Only'}
                </span>
              </div>

              {confirmedOrder.difmRequest?.shop && (
                <div className="conf-row">
                  <span className="conf-label">Assigned Workshop:</span>
                  <span className="conf-val">
                    {confirmedOrder.difmRequest.shop.name} ({confirmedOrder.difmRequest.shop.city})
                  </span>
                </div>
              )}

              <div className="conf-row">
                <span className="conf-label">Delivery Address:</span>
                <span className="conf-val">
                  {confirmedOrder.address?.fullName}, {confirmedOrder.address?.line1}, {confirmedOrder.address?.city} - {confirmedOrder.address?.pincode}
                </span>
              </div>

              <div className="conf-divider" />

              <div className="conf-row total-row">
                <span className="conf-label">Final Verified Total:</span>
                <span className="conf-val total-amount">₹{Number(confirmedOrder.total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Safe metadata notice */}
            <div className="safe-metadata-notice">
              🛡️ <strong>Zero Credential Storage Guarantee:</strong> PartSphere never stores card numbers, CVVs, or bank credentials. Only safe transaction IDs and gateway references are retained.
            </div>

            <div className="confirmation-actions">
              <Link to={`/orders/${confirmedOrder.id}`}>
                <Button variant="primary" size="md" id="view-order-details-btn">
                  View Order Details & Tracking
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="md" id="continue-shopping-btn">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Step Progress Header */}
        <div className="checkout-header">
          <div className="checkout-breadcrumbs">
            <Link to="/cart" className="crumb-link">Cart</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">DIFM Checkout Engine</span>
          </div>
          <h1 className="checkout-title">Do-It-For-Me (DIFM) Checkout</h1>
          <p className="checkout-subtitle">
            Authoritative backend pricing engine with certified garage dispatch & fitment assurance
          </p>
        </div>

        {/* Difficult Parts Notice Banner */}
        {hasDifficultParts && (
          <div className="difficult-alert-card" id="difm-requirement-alert">
            <div className="difficult-alert-icon">⚠️</div>
            <div className="difficult-alert-content">
              <div className="difficult-alert-title">
                Professional Fitment Required for Difficult Parts
              </div>
              <p className="difficult-alert-desc">
                Your cart contains automotive components marked as complex or safety-critical. Please choose between doorstep technician visit (Option A), partnered workshop bay (Option B), or self-fitment (Option C).
              </p>
              <div className="difficult-chips-list">
                {difficultItems.map((di) => (
                  <span key={di.productId} className="difficult-chip">
                    🔧 {di.productName} ({di.difficulty} Installation)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="checkout-layout">
          {/* Main Form Column */}
          <div className="checkout-steps">
            {/* Step 1: Delivery Address */}
            <div className="checkout-section" id="step-address">
              <div className="checkout-section-header">
                <span className="checkout-step-number">1</span>
                <div>
                  <h2 className="checkout-section-title">Delivery Address & Fitment Location</h2>
                  <p className="checkout-step-sub">Used to calculate distance and assign the nearest verified workshop</p>
                </div>
              </div>

              {!showNewAddressForm && addresses.length > 0 ? (
                <>
                  <div className="address-grid">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`address-select-card ${
                          selectedAddressId === addr.id ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedAddressId(addr.id)}
                        id={`address-card-${addr.id}`}
                      >
                        {addr.isDefault && <span className="address-badge">Default</span>}
                        <div className="address-label">{addr.label || 'Saved Address'}</div>
                        <div className="address-name">{addr.fullName}</div>
                        <div className="address-lines">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                        </div>
                        <div className="address-city">
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </div>
                        <div className="address-phone">📞 {addr.phone}</div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewAddressForm(true)}
                    id="add-new-address-btn"
                  >
                    + Add New Delivery Address
                  </Button>
                </>
              ) : (
                <form onSubmit={handleCreateAddress} className="address-new-form">
                  <div className="form-grid-2">
                    <Input
                      label="Full Name *"
                      placeholder="e.g. Aarav Sharma"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      required
                    />
                    <Input
                      label="Mobile Phone *"
                      placeholder="9876543210"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <Input
                      label="Street Address / House / Flat No. *"
                      placeholder="e.g. Flat 402, Green Glen Layout, Bellandur"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid-3">
                    <Input
                      label="City *"
                      placeholder="Bengaluru"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State *"
                      placeholder="Karnataka"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                    <Input
                      label="Pincode *"
                      placeholder="560103"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <Input
                      label="Landmark (Optional)"
                      placeholder="e.g. Opposite Central Mall"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <Button type="submit" variant="primary" size="sm" loading={isSavingAddress}>
                      Save and Use Address
                    </Button>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: DIFM Selection */}
            <div className="checkout-section" id="step-difm-selection">
              <div className="checkout-section-header">
                <span className="checkout-step-number">2</span>
                <div>
                  <h2 className="checkout-section-title">DIFM (Do-It-For-Me) Installation Selection</h2>
                  <p className="checkout-step-sub">Choose how you want your parts to be fitted onto your vehicle</p>
                </div>
              </div>

              <div className="difm-options-grid">
                {/* OPTION A */}
                <div
                  className={`difm-option-card ${difmOption === 'HOME_INSTALLATION' ? 'selected' : ''}`}
                  onClick={() => setDifmOption('HOME_INSTALLATION')}
                  id="difm-option-a"
                >
                  <div className="difm-radio-indicator">
                    <span className="radio-circle" />
                  </div>
                  <div className="difm-option-main">
                    <div className="difm-option-header-row">
                      <div className="difm-option-title-group">
                        <span className="difm-badge-code">OPTION A</span>
                        <h3 className="difm-option-title">Mechanic Comes to Customer's Home</h3>
                      </div>
                      <div className="difm-price-pill" id="option-a-price-pill">
                        +₹{(Number(pricing.installationFee || 0) + Number(pricing.homeVisitSurcharge || 0))}
                      </div>
                    </div>
                    <p className="difm-option-desc">
                      Certified technician from partner workshop arrives at your doorstep with tools and fitment rig.
                    </p>
                    <div className="difm-formula-badge">
                      <span>Formula:</span>
                      <code>Installation Fee (₹{pricing.installationFee || 0}) + Home Visit Surcharge (₹{pricing.homeVisitSurcharge || 0})</code>
                    </div>
                    {difmOption === 'HOME_INSTALLATION' && (
                      <div className="difm-subdetails">
                        📍 Distance to nearest hub: <strong>{distanceKm} km</strong> (~{durationMinutes} mins away)
                      </div>
                    )}
                  </div>
                </div>

                {/* OPTION B */}
                <div
                  className={`difm-option-card ${difmOption === 'SHOP_INSTALLATION' ? 'selected' : ''}`}
                  onClick={() => setDifmOption('SHOP_INSTALLATION')}
                  id="difm-option-b"
                >
                  <div className="difm-radio-indicator">
                    <span className="radio-circle" />
                  </div>
                  <div className="difm-option-main">
                    <div className="difm-option-header-row">
                      <div className="difm-option-title-group">
                        <span className="difm-badge-code">OPTION B</span>
                        <h3 className="difm-option-title">Customer Visits Partnered Local Shop</h3>
                      </div>
                      <div className="difm-price-pill" id="option-b-price-pill">
                        +₹{pricing.installationFee || 0}
                      </div>
                    </div>
                    <p className="difm-option-desc">
                      Drive to your selected partnered workshop. Includes reserved ramp bay, hoist lifting & master technician labor.
                    </p>
                    <div className="difm-formula-badge">
                      <span>Formula:</span>
                      <code>Installation Fee (₹{pricing.installationFee || 0}) + Home Visit Surcharge (₹0)</code>
                    </div>
                    {difmOption === 'SHOP_INSTALLATION' && (
                      <div className="difm-subdetails">
                        🏬 Priority bay reservation at your selected garage
                      </div>
                    )}
                  </div>
                </div>

                {/* OPTION C */}
                <div
                  className={`difm-option-card ${difmOption === 'NO_INSTALLATION' ? 'selected' : ''}`}
                  onClick={() => setDifmOption('NO_INSTALLATION')}
                  id="difm-option-c"
                >
                  <div className="difm-radio-indicator">
                    <span className="radio-circle" />
                  </div>
                  <div className="difm-option-main">
                    <div className="difm-option-header-row">
                      <div className="difm-option-title-group">
                        <span className="difm-badge-code">OPTION C</span>
                        <h3 className="difm-option-title">No Installation / DIY Delivery</h3>
                      </div>
                      <div className="difm-price-pill free" id="option-c-price-pill">
                        FREE (₹0)
                      </div>
                    </div>
                    <p className="difm-option-desc">
                      Standard delivery of genuine parts in tamper-evident sealed packaging. You install yourself or with your mechanic.
                    </p>
                    <div className="difm-formula-badge">
                      <span>Formula:</span>
                      <code>Installation Fee = ₹0</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Partnered Workshop Selection (For Option A or Option B) */}
            {difmOption !== 'NO_INSTALLATION' && (
              <div className="checkout-section" id="step-workshop-selection">
                <div className="checkout-section-header">
                  <span className="checkout-step-number">3</span>
                  <div>
                    <h2 className="checkout-section-title">
                      {difmOption === 'HOME_INSTALLATION'
                        ? 'Assigned Workshop & Doorstep Mechanic Hub'
                        : 'Select Your Partnered Local Workshop'}
                    </h2>
                    <p className="checkout-step-sub">
                      {difmOption === 'HOME_INSTALLATION'
                        ? 'Technician dispatched from this certified local partner hub'
                        : 'Choose the garage you will drive to for priority installation'}
                    </p>
                  </div>
                </div>

                <div className="workshops-list">
                  {eligibleShops.map((shop) => (
                    <div
                      key={shop.id}
                      className={`workshop-card ${selectedShopId === shop.id ? 'selected' : ''}`}
                      onClick={() => setSelectedShopId(shop.id)}
                      id={`workshop-${shop.id}`}
                    >
                      <div className="workshop-card-top">
                        <div className="workshop-info">
                          <div className="workshop-name-row">
                            <h4 className="workshop-name">{shop.name}</h4>
                            {shop.isVerified && <span className="verified-badge">✓ Verified Hub</span>}
                          </div>
                          <div className="workshop-address">{shop.address}</div>
                          <div className="workshop-hours">🕒 {shop.operatingHours} · 📞 {shop.phone}</div>
                        </div>

                        <div className="workshop-metrics">
                          <div className="workshop-rating">★ {shop.rating}</div>
                          <div className="workshop-distance" id={`shop-dist-${shop.id}`}>
                            {shop.distanceKm} km away
                          </div>
                          <div className="workshop-time">~{shop.durationMinutes} mins</div>
                        </div>
                      </div>

                      <div className="workshop-services">
                        {shop.servicesOffered?.map((srv, idx) => (
                          <span key={idx} className="service-tag">{srv}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Payment Method */}
            <div className="checkout-section" id="step-payment">
              <div className="checkout-section-header">
                <span className="checkout-step-number">{difmOption === 'NO_INSTALLATION' ? '3' : '4'}</span>
                <div>
                  <h2 className="checkout-section-title">Payment Method</h2>
                  <p className="checkout-step-sub">Select preferred payment method (Payment gateway demo mode)</p>
                </div>
              </div>

              <div className="payment-methods-grid">
                <div
                  className={`payment-method-card ${
                    paymentMethod === 'RAZORPAY_DEMO' ? 'selected' : ''
                  }`}
                  onClick={() => setPaymentMethod('RAZORPAY_DEMO')}
                  id="payment-razorpay"
                >
                  <div className="payment-method-left">
                    <span className="payment-method-icon">💳</span>
                    <div>
                      <div className="payment-method-name">Razorpay Sandbox / Demo Gateway</div>
                      <div className="payment-method-sub">
                        UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking
                      </div>
                    </div>
                  </div>
                  <span className="payment-badge">Demo Mode</span>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                  id="payment-cod"
                >
                  <div className="payment-method-left">
                    <span className="payment-method-icon">💵</span>
                    <div>
                      <div className="payment-method-name">Cash on Delivery (COD)</div>
                      <div className="payment-method-sub">
                        Pay cash or scan QR upon parts delivery / installation completion
                      </div>
                    </div>
                  </div>
                  <span className="payment-badge">Cash / UPI</span>
                </div>
              </div>

              <div className="notes-field">
                <Input
                  label="Special Instructions / Fitment Notes (Optional)"
                  placeholder="e.g. Please call before arriving. Lift available on site."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Summary Column: Authoritative Pricing Breakdown */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <div className="summary-card-header">
                <h3 className="summary-heading">Pricing Summary</h3>
                <span className="backend-verified-pill" title="Calculated strictly on the backend">
                  🔒 Backend Authoritative
                </span>
              </div>

              {/* Items in Cart mini-list */}
              <div className="summary-items-list">
                {items.map((it) => {
                  const itemPrice = Number(it.priceSnapshot) || Number(it.unitPrice) || Number(it.product?.basePrice) || Number(it.product?.sellingPrice) || 0;
                  const itemQty = Number(it.quantity) || 1;
                  return (
                    <div key={it.id} className="summary-item-row">
                      <div className="summary-item-meta">
                        <span className="summary-item-name">{it.product?.name}</span>
                        <span className="summary-item-qty">Qty: {itemQty}</span>
                      </div>
                      <span className="summary-item-price">
                        ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Box */}
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <div className="coupon-input-wrap">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. PARTS10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="coupon-input"
                    id="coupon-input-field"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="coupon-btn remove"
                      id="remove-coupon-btn"
                    >
                      Remove
                    </button>
                  ) : (
                    <button type="submit" className="coupon-btn" id="apply-coupon-btn">
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="applied-coupon-tag">
                    🏷️ Coupon <strong>{appliedCoupon}</strong> active
                  </div>
                )}
              </form>

              {/* Complete Price Breakdown (MANDATORY FIELDS) */}
              <div className="price-breakdown-table" id="pricing-breakdown-box">
                {/* 1. Part subtotal */}
                <div className="breakdown-row" id="row-part-subtotal">
                  <span className="row-label">Product Subtotal</span>
                  <span className="row-value" id="val-part-subtotal">
                    ₹{Number(pricing.partSubtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 2. Delivery fee */}
                <div className="breakdown-row" id="row-delivery-fee">
                  <span className="row-label">Delivery Fee</span>
                  <span className="row-value" id="val-delivery-fee">
                    {Number(pricing.deliveryFee || 0) === 0 ? (
                      <span className="text-free">FREE</span>
                    ) : (
                      `₹${pricing.deliveryFee}`
                    )}
                  </span>
                </div>

                {/* 3. Installation fee */}
                <div className="breakdown-row" id="row-installation-fee">
                  <span className="row-label">
                    Installation Fee
                    {difmOption === 'HOME_INSTALLATION' && (
                      <span className="fee-subnote"> (Base service fee)</span>
                    )}
                  </span>
                  <span className="row-value" id="val-installation-fee">
                    {difmOption === 'NO_INSTALLATION' || Number(pricing.installationFee || 0) === 0 ? (
                      <span className="text-free">₹0</span>
                    ) : (
                      `₹${pricing.installationFee}`
                    )}
                  </span>
                </div>

                {/* 4. Home-visit fee */}
                <div className="breakdown-row" id="row-home-visit-fee">
                  <span className="row-label">
                    Home Visit Surcharge
                    {difmOption === 'HOME_INSTALLATION' && (
                      <span className="fee-subnote"> ({distanceKm} km surcharge)</span>
                    )}
                  </span>
                  <span className="row-value" id="val-home-visit-fee">
                    {difmOption === 'HOME_INSTALLATION' && Number(pricing.homeVisitSurcharge || 0) > 0 ? (
                      `₹${pricing.homeVisitSurcharge}`
                    ) : (
                      '₹0'
                    )}
                  </span>
                </div>

                {/* 5. Discount */}
                <div className="breakdown-row discount-row" id="row-discount">
                  <span className="row-label">Discount</span>
                  <span className="row-value text-discount" id="val-discount">
                    {Number(pricing.discount || 0) > 0 ? `-₹${pricing.discount}` : '₹0'}
                  </span>
                </div>

                <div className="breakdown-divider" />

                {/* 6. Grand total */}
                <div className="breakdown-row grand-total-row" id="row-grand-total">
                  <span className="grand-label">Grand Total</span>
                  <span className="grand-value" id="val-grand-total">
                    {isQuoteLoading && !quote ? 'Calculating...' : `₹${Number(pricing.grandTotal || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {/* DIFM Active Summary Badge */}
              <div className="difm-status-pill">
                {difmOption === 'HOME_INSTALLATION' && '🏡 Option A: Doorstep Mechanic Visit'}
                {difmOption === 'SHOP_INSTALLATION' && '🏬 Option B: Partnered Workshop Fitment'}
                {difmOption === 'NO_INSTALLATION' && '📦 Option C: Parts Only (No Installation)'}
              </div>

              {/* Place Order CTA */}
              <Button
                variant="teal"
                size="lg"
                fullWidth
                onClick={handlePlaceOrder}
                loading={isSubmitting}
                disabled={items.length === 0}
                id="place-order-button"
              >
                {isSubmitting
                  ? 'Processing Checkout...'
                  : `Confirm Order · ₹${pricing.grandTotal.toLocaleString('en-IN')}`}
              </Button>

              <div className="checkout-trust-footer">
                <span>🛡️ Anti-tamper backend price validation</span>
                <span>🔒 256-bit encrypted checkout</span>
                <span>⚙️ PartNexa 100% Fitment Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Sandbox Checkout Modal */}
      <RazorpayModal
        isOpen={isPaymentModalOpen}
        paymentData={activePaymentSession}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onCancel={handlePaymentCancel}
      />

      {/* Backend Authoritative Verification Overlay */}
      {isVerifyingPayment && (
        <div className="payment-verifying-overlay" id="payment-verifying-overlay">
          <div className="payment-verifying-card">
            <div className="verifying-spinner" />
            <h3 className="verifying-title">Verifying Payment with Server</h3>
            <p className="verifying-sub">
              Performing HMAC-SHA256 signature verification & double-spend check...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
