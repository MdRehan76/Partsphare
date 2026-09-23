import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { subscriptionsService, vehiclesService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Badge, Skeleton } from '../components/ui';
import RazorpayModal from '../components/checkout/RazorpayModal';
import toast from 'react-hot-toast';
import './SubscriptionPlanDetailPage.css';

const SubscriptionPlanDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe Checkout Dialog State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Razorpay Gateway Modal State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [id, billingCycle]);

  useEffect(() => {
    if (user) {
      vehiclesService
        .getGarage()
        .then((res) => {
          const userVehicles = res.data?.data || [];
          setVehicles(userVehicles);
          const primary = userVehicles.find((v) => v.isPrimary) || userVehicles[0];
          if (primary) {
            setSelectedVehicleId(primary.id);
            setRegNumber(primary.regNumber || '');
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsService.getPlan(id, { frequency: billingCycle });
      if (res.data?.data) {
        setPlan(res.data.data);
        document.title = `${res.data.data.name} Maintenance Plan | PartNexa Care`;
      }
    } catch (err) {
      toast.error('Could not load plan details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubscribe = () => {
    if (!user) {
      toast('Please log in or create an account to activate this membership.', { icon: '🔐' });
      navigate(`/login?redirect=/subscriptions/${id}`);
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!regNumber.trim()) {
      toast.error('Please enter your vehicle registration number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        planId: plan.id,
        billingCycle,
        vehicleId: selectedVehicleId || undefined,
        vehicleReg: regNumber.trim().toUpperCase(),
        paymentMethod,
        autoRenew: true,
      };

      const res = await subscriptionsService.subscribe(payload);
      const data = res.data?.data;

      if (!data.requiresOnlinePayment) {
        setCheckoutModalOpen(false);
        toast.success('🎉 Subscription Activated! Payment scheduled on first service.');
        navigate('/customer/my-subscriptions');
      } else {
        setCheckoutModalOpen(false);
        setPaymentSession({
          ...data.paymentSession,
          orderId: data.paymentSession.subscriptionId,
          orderNumber: `SUB-${plan.slug.toUpperCase()}`,
        });
        setIsRazorpayOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpaySuccess = async (result) => {
    setIsRazorpayOpen(false);
    const toastId = toast.loading('Verifying payment signature with backend...');

    try {
      await subscriptionsService.verifyPayment({
        subscriptionId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });

      toast.success(`🎉 ${plan.name} activated! Welcome to PartNexa Care.`, { id: toastId });
      navigate('/customer/my-subscriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="plan-detail-page">
        <div className="container" style={{ padding: '60px 0' }}>
          <Skeleton height={50} width={300} borderRadius={12} />
          <div style={{ marginTop: '24px' }}>
            <Skeleton height={240} borderRadius={16} />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="plan-detail-page not-found-state">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2>Plan Not Found</h2>
          <p>The requested subscription membership does not exist or has expired.</p>
          <Link to="/subscriptions">
            <Button variant="primary">View All Available Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className="plan-detail-page" id="plan-detail-page">
      {/* Header Banner */}
      <section className="plan-detail-hero">
        <div className="container">
          <div className="plan-detail-breadcrumbs">
            <Link to="/subscriptions" className="crumb-link">← All Subscriptions</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">{plan.name}</span>
          </div>

          <div className="plan-hero-content">
            <div className="plan-hero-left">
              <div className="plan-badge-row">
                <span className="plan-tier-badge">PartNexa Care Membership</span>
                {plan.isPopular && <Badge variant="teal">Most Popular Choice</Badge>}
              </div>
              <h1 className="plan-detail-title">{plan.name}</h1>
              <p className="plan-detail-desc">{plan.description}</p>

              {/* Billing Cycle Switch */}
              <div className="detail-billing-toggle">
                <button
                  className={`detail-cycle-btn ${billingCycle === 'MONTHLY' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('MONTHLY')}
                  id="detail-cycle-monthly"
                >
                  Monthly: ₹{Number(plan.monthlyPrice).toLocaleString('en-IN')}/mo
                </button>
                <button
                  className={`detail-cycle-btn ${billingCycle === 'YEARLY' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('YEARLY')}
                  id="detail-cycle-yearly"
                >
                  Yearly: ₹{Number(plan.yearlyPrice).toLocaleString('en-IN')}/yr
                  {plan.savingsPercent > 0 && <span className="save-chip">{plan.savingsPercent}% OFF</span>}
                </button>
              </div>
            </div>

            {/* Quick Pricing Card */}
            <div className="plan-pricing-box">
              <div className="pricing-box-label">Membership Fee</div>
              <div className="pricing-box-amount">
                <span className="currency">₹</span>
                <span className="value">{Number(price).toLocaleString('en-IN')}</span>
                <span className="period">/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
              </div>
              <p className="pricing-box-sub">
                Includes all services, roadside assistance, and labor discount perks. Cancel anytime.
              </p>
              <Button
                variant="teal"
                size="lg"
                fullWidth
                onClick={handleOpenSubscribe}
                id="plan-detail-subscribe-btn"
              >
                Activate {plan.name}
              </Button>
              <div className="pricing-box-guarantee">
                🛡️ 100% PartNexa Fitment & Quality Guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container plan-detail-body">
        <div className="detail-layout">
          {/* Main Column */}
          <div className="detail-main-col">
            {/* Included Services Section */}
            <section className="detail-card" id="included-services-card">
              <h2 className="detail-section-heading">🔧 Included Maintenance & Repair Services</h2>
              <p className="detail-section-sub">
                Every service visit is carried out by certified master mechanics with OEM/OES components
              </p>

              <div className="services-catalog-grid">
                {plan.includedServices?.map((service, idx) => (
                  <div key={idx} className="service-catalog-item">
                    <div className="service-check-icon">✓</div>
                    <div>
                      <h3 className="service-item-name">{service.name}</h3>
                      <p className="service-item-desc">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Discount Benefits Section */}
            <section className="detail-card" id="discount-benefits-card">
              <h2 className="detail-section-heading">🏷️ Exclusive Member Discount Benefits</h2>
              <p className="detail-section-sub">
                Automatically applied at checkout across all products, orders, and partnered garage services
              </p>

              <div className="discounts-catalog-grid">
                {plan.discountBenefits?.map((benefit, idx) => (
                  <div key={idx} className="discount-benefit-card">
                    <div className="discount-percent-badge">{benefit.discountPercent}% OFF</div>
                    <h3 className="discount-category-name">{benefit.category}</h3>
                    <p className="discount-category-desc">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Service Limits & Entitlements Section */}
            <section className="detail-card" id="service-limits-card">
              <h2 className="detail-section-heading">📊 Service Limits & Entitlements Quotas</h2>
              <p className="detail-section-sub">
                Allowable usage limits per active subscription billing period ({billingCycle === 'YEARLY' ? '365 Days' : '30 Days'})
              </p>

              <div className="limits-table-wrap">
                <table className="limits-table">
                  <thead>
                    <tr>
                      <th>Service / Feature</th>
                      <th>Allowed Limit</th>
                      <th>Coverage Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.serviceLimits?.map((sl, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{sl.feature}</td>
                        <td className="limit-highlight">{sl.limit}</td>
                        <td className="text-muted">Refreshes every {billingCycle.toLowerCase()} renewal cycle</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Sticky Sidebar */}
          <div className="detail-side-col">
            {/* Vehicle Eligibility Card */}
            <div className="side-detail-card">
              <h3 className="side-card-title">🚗 Vehicle Eligibility</h3>
              <p className="eligibility-text">{plan.eligibility}</p>
              <div className="eligibility-chips">
                <span className="el-chip">✓ Hatchbacks & Sedans</span>
                <span className="el-chip">✓ Compact & Full SUVs</span>
                <span className="el-chip">✓ Motorcycles & Scooters</span>
              </div>
            </div>

            {/* Coverage Perks */}
            <div className="side-detail-card">
              <h3 className="side-card-title">✨ Member Perks</h3>
              <ul className="side-perks-list">
                <li>🕒 Priority garage bay reservations</li>
                <li>📲 Direct master mechanic hotline</li>
                <li>📍 GPS-tracked technician dispatch</li>
                <li>🧾 Digital service history passbook</li>
                <li>🔄 Easy auto-renewal or cancel anytime</li>
              </ul>
            </div>

            {/* CTA Box */}
            <div className="side-cta-card">
              <div className="side-price-tag">
                ₹{Number(price).toLocaleString('en-IN')} / {billingCycle === 'YEARLY' ? 'year' : 'month'}
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleOpenSubscribe}
              >
                Choose This Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribe & Checkout Modal */}
      {checkoutModalOpen && (
        <Modal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title={`Activate ${plan.name}`}
          size="md"
        >
          <form onSubmit={handleProceedToPayment} className="sub-checkout-form">
            <div className="sub-checkout-summary">
              <div className="checkout-plan-row">
                <span className="checkout-plan-name">{plan.name}</span>
                <span className="checkout-plan-price">₹{Number(price).toLocaleString('en-IN')}</span>
              </div>
              <div className="checkout-plan-meta">
                Billing Cycle: <strong>{billingCycle === 'YEARLY' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-vehicle-select">Select Vehicle from Garage</label>
              {vehicles.length > 0 ? (
                <select
                  id="plan-vehicle-select"
                  className="form-input"
                  value={selectedVehicleId}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setSelectedVehicleId(vId);
                    const chosen = vehicles.find((v) => v.id === vId);
                    if (chosen?.regNumber) setRegNumber(chosen.regNumber);
                  }}
                >
                  {vehicles.map((veh) => (
                    <option key={veh.id} value={veh.id}>
                      {veh.variant?.model?.make?.name} {veh.variant?.model?.name} {veh.regNumber ? `(${veh.regNumber})` : ''}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="form-group">
              <Input
                label="Vehicle Registration Number *"
                placeholder="e.g. KA01AB1234"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="sub-payment-options">
                <label className={`sub-pay-option ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                  />
                  <div className="pay-option-content">
                    <div className="pay-option-title">⚡ Razorpay Sandbox / Demo Gateway</div>
                    <div className="pay-option-sub">UPI, Credit/Debit Card, Net Banking (Instant Activation)</div>
                  </div>
                </label>

                <label className={`sub-pay-option ${paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  />
                  <div className="pay-option-content">
                    <div className="pay-option-title">💵 Cash / UPI on First Service Visit (COD)</div>
                    <div className="pay-option-sub">Activate immediately; pay during your first technician appointment</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="sub-checkout-actions">
              <Button type="button" variant="ghost" onClick={() => setCheckoutModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" loading={isSubmitting}>
                Confirm & Activate
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        paymentData={paymentSession}
        onSuccess={handleRazorpaySuccess}
        onFailure={(err) => {
          setIsRazorpayOpen(false);
          toast.error(err.errorDescription || 'Payment declined');
        }}
        onCancel={() => setIsRazorpayOpen(false)}
      />
    </div>
  );
};

export default SubscriptionPlanDetailPage;
