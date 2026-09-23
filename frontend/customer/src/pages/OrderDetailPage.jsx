import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersService, paymentsService } from '../services';
import { Button, Badge, Skeleton, EmptyState } from '../components/ui';
import RazorpayModal from '../components/checkout/RazorpayModal';
import toast from 'react-hot-toast';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentSession, setActivePaymentSession] = useState(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isSwitchingToCOD, setIsSwitchingToCOD] = useState(false);

  useEffect(() => {
    document.title = `Order #${id} | PartNexa`;
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await ordersService.getOrder(id);
      if (res.data?.data) {
        setOrder(res.data.data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchPayment = async () => {
    if (!order) return;
    setIsRetryingPayment(true);
    try {
      const res = await paymentsService.retryPayment(order.id);
      const sessionData = res.data?.data;
      setActivePaymentSession(sessionData);
      setIsPaymentModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment session.');
    } finally {
      setIsRetryingPayment(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    setIsPaymentModalOpen(false);
    const toastId = toast.loading('Verifying payment signature with backend...');
    try {
      await paymentsService.verifyPayment({
        orderId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
      toast.success('Payment verified! Order is now confirmed.', { id: toastId });
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.', { id: toastId });
    }
  };

  const handlePaymentFailure = async (errData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: errData.orderId,
        errorCode: errData.errorCode || 'PAYMENT_FAILED',
        errorReason: errData.errorDescription || 'Payment declined by bank',
      });
    } catch (e) {
      console.error(e);
    }
    toast.error(errData.errorDescription || 'Payment declined');
    fetchOrderDetail();
  };

  const handlePaymentCancel = async (cancelData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: cancelData.orderId,
        errorCode: 'PAYMENT_CANCELLED_BY_USER',
        errorReason: 'Payment cancelled in modal',
      });
    } catch (e) {
      console.error(e);
    }
    toast.error('Payment cancelled');
    fetchOrderDetail();
  };

  const handleSwitchToCOD = async () => {
    if (!order) return;
    setIsSwitchingToCOD(true);
    try {
      await paymentsService.switchPaymentMethod(order.id, {
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      toast.success('Order switched to Cash on Delivery! 📦');
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to switch payment method.');
    } finally {
      setIsSwitchingToCOD(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <Skeleton height={60} borderRadius={12} />
          <div style={{ marginTop: '24px' }}>
            <Skeleton height={200} borderRadius={16} />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <EmptyState
            title="Order Not Found"
            description={`Could not find order "${id}". It may not exist or belongs to another customer account.`}
            action={
              <Link to="/orders" style={{ textDecoration: 'none' }}>
                <Button variant="primary">Return to My Orders</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  // Derive status milestones based on real order state
  const isDelivered = order.status === 'DELIVERED';
  const isShipped = ['SHIPPED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isDifmCompleted = order.difmRequest?.status === 'COMPLETED';

  const trackingEvents = Array.isArray(order.tracking) ? order.tracking : [];

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Top bar */}
        <div className="order-detail-top">
          <div className="order-detail-title-wrap">
            <h1>Order #{order.orderNumber || order.id}</h1>
            <p>
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'} · Payment:{' '}
              <strong>{order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery' : '⚡ Razorpay'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/orders" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                ← Back to Orders
              </Button>
            </Link>
            <Button
              variant="teal"
              size="sm"
              onClick={() => toast.success(`Invoice for #${order.orderNumber || order.id} downloaded`)}
            >
              📄 Download Invoice
            </Button>
          </div>
        </div>

        {/* Live Milestone Progress */}
        <div className="tracking-stepper-card">
          <div className="stepper-header">
            <div className="stepper-header-title">Live Fulfillment & Delivery Tracking</div>
            <div className="stepper-eta">
              Status: <span style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>{order.status}</span>
            </div>
          </div>

          <div className="stepper-track">
            <div className={`stepper-step ${order.status !== 'CANCELLED' ? 'completed' : 'danger'}`}>
              <div className="stepper-dot">✓</div>
              <div>
                <div className="stepper-label">Order Confirmed</div>
                <div className="stepper-time">
                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                </div>
              </div>
            </div>

            <div className={`stepper-step ${isShipped ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isShipped ? '✓' : '2'}</div>
              <div>
                <div className="stepper-label">Dispatched / In Transit</div>
                <div className="stepper-time">{isShipped ? 'On the way' : 'Pending dispatch'}</div>
              </div>
            </div>

            <div className={`stepper-step ${isOutForDelivery ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isOutForDelivery ? '✓' : '3'}</div>
              <div>
                <div className="stepper-label">Out for Delivery</div>
                <div className="stepper-time">{isOutForDelivery ? 'With Delivery Rider' : 'Pending route'}</div>
              </div>
            </div>

            <div className={`stepper-step ${isDelivered ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isDelivered ? '✓' : '4'}</div>
              <div>
                <div className="stepper-label">Delivered</div>
                <div className="stepper-time">{isDelivered ? 'Delivered to Doorstep' : 'Awaiting arrival'}</div>
              </div>
            </div>

            {order.difmType && order.difmType !== 'NO_INSTALLATION' && (
              <div className={`stepper-step ${isDifmCompleted ? 'completed' : 'pending'}`}>
                <div className="stepper-dot">{isDifmCompleted ? '✓' : '5'}</div>
                <div>
                  <div className="stepper-label">
                    {order.difmType === 'HOME_INSTALLATION' ? 'Home Installation' : 'Workshop Fitment'}
                  </div>
                  <div className="stepper-time">
                    {isDifmCompleted ? 'Installation Completed' : order.difmRequest?.status || 'Scheduled'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real Chronological Activity Logs */}
          {trackingEvents.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Chronological Activity Log ({trackingEvents.length} events)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trackingEvents.map((t, idx) => (
                  <div key={t.id || idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>•</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.status}: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.message}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Two-column Order Details */}
        <div className="order-detail-grid">
          {/* Left Column: Items */}
          <div className="order-detail-items-col">
            <div className="order-items-card">
              <h2 className="card-title-bordered">Ordered Items ({order.items?.length || 0})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(order.items || []).map((item) => {
                  const unitPrice = Number(item.unitPrice || item.priceSnapshot || 0);
                  const totalPrice = Number(item.totalPrice || (unitPrice * item.quantity));
                  const imgUrl = item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=200';

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '16px',
                        borderBottom: '1px solid var(--border-color)',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={imgUrl}
                          alt=""
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            background: 'var(--bg-tertiary)',
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.product?.name || 'Automotive Component'}
                          </div>
                          <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                            Qty: {item.quantity} × ₹{unitPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.95rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.installationFee || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Professional Installation (DIFM)</span>
                    <span>₹{Number(order.installationFee).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(order.homeVisitSurcharge || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Doorstep Visit Surcharge</span>
                    <span>₹{Number(order.homeVisitSurcharge).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span>{Number(order.deliveryFee || 0) > 0 ? `₹${Number(order.deliveryFee).toLocaleString('en-IN')}` : <span className="text-success font-semibold">FREE</span>}</span>
                </div>
                {Number(order.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success-600)' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: 'var(--text-primary)',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <span>Grand Total</span>
                  <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Assignments */}
          <div className="order-detail-side-col">
            {/* Payment Status Card */}
            <div className="order-side-card" id="order-payment-status-card">
              <h3 className="card-title-bordered">💳 Payment Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery' : '⚡ Razorpay Online'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                  <span>
                    {order.paymentStatus === 'PAID' || order.paymentStatus === 'CAPTURED' ? (
                      <span className="status-pill-paid">✓ PAID</span>
                    ) : order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                      <span className="status-pill-cod">⏳ PENDING COD</span>
                    ) : order.paymentStatus === 'FAILED' ? (
                      <span className="status-pill-pending">❌ FAILED</span>
                    ) : (
                      <span className="status-pill-pending">⏳ PENDING</span>
                    )}
                  </span>
                </div>

                {order.payment?.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment ID:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {order.payment.razorpayPaymentId}
                    </span>
                  </div>
                )}

                {/* If payment is failed or pending online, allow Retry or Switch to COD */}
                {order.paymentStatus !== 'CAPTURED' && order.paymentStatus !== 'PAID' && order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={handleLaunchPayment}
                      loading={isRetryingPayment}
                      id="order-retry-payment-btn"
                    >
                      🔄 Complete / Retry Payment
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      fullWidth
                      onClick={handleSwitchToCOD}
                      loading={isSwitchingToCOD}
                      id="order-switch-cod-btn"
                    >
                      💵 Switch to Cash on Delivery
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="order-side-card">
              <h3 className="card-title-bordered">📍 Delivery Address</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {order.address?.fullName || 'Customer'}
                </div>
                <div>{order.address?.line1}</div>
                {order.address?.line2 && <div>{order.address.line2}</div>}
                <div>
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </div>
                <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                  📞 {order.address?.phone || 'Phone not specified'}
                </div>
              </div>
            </div>

            {/* DIFM Installation Details (if requested) */}
            {order.difmType && order.difmType !== 'NO_INSTALLATION' && (
              <div
                className="order-side-card"
                style={{ borderColor: 'var(--color-teal-400)', background: 'var(--bg-surface)' }}
              >
                <h3 className="card-title-bordered" style={{ color: 'var(--color-teal-600)' }}>
                  🔧 {order.difmType === 'HOME_INSTALLATION' ? 'Doorstep Mechanic (Option A)' : 'Partnered Workshop (Option B)'}
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {order.difmRequest?.shop?.name || 'Assigned Partner Workshop'}
                  </div>
                  {order.difmRequest?.shop?.phone && (
                    <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                      📞 Workshop Contact: {order.difmRequest.shop.phone}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                    <Badge variant={order.difmRequest?.status === 'COMPLETED' ? 'success' : 'teal'}>
                      {order.difmRequest?.status || 'SCHEDULED'}
                    </Badge>
                  </div>
                  {order.difmRequest?.preferredDate && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📅 Scheduled Date: {new Date(order.difmRequest.preferredDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Assignment Info */}
            {order.deliveryAssignments && order.deliveryAssignments.length > 0 && (
              <div className="order-side-card">
                <h3 className="card-title-bordered">🚚 Logistics Partner</h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {order.deliveryAssignments[0].deliveryPartner?.user
                      ? `${order.deliveryAssignments[0].deliveryPartner.user.firstName} ${order.deliveryAssignments[0].deliveryPartner.user.lastName}`
                      : 'Delivery Fleet Broadcast'}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trip Status:</span>
                    <Badge variant={order.deliveryAssignments[0].status === 'DELIVERED' ? 'success' : 'primary'}>
                      {order.deliveryAssignments[0].status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="order-side-card">
              <h3 className="card-title-bordered">Need Assistance?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Questions about your order fitment, return request, or rescheduling technician?
              </p>
              <Link to={`/support?orderId=${order.orderNumber || order.id}`} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" fullWidth>
                  💬 Contact PartNexa Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Modal for Retrying Payment on Order Detail */}
      <RazorpayModal
        isOpen={isPaymentModalOpen}
        paymentData={activePaymentSession}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
};

export default OrderDetailPage;
