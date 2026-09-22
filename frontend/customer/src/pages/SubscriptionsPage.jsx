import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionsService, vehiclesService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Badge } from '../components/ui';
import RazorpayModal from '../components/checkout/RazorpayModal';
import toast from 'react-hot-toast';
import './SubscriptionsPage.css';

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'
  const [plans, setPlans] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe Checkout Dialog State
  const [subscribingPlan, setSubscribingPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'CASH_ON_DELIVERY'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Razorpay Gateway Modal State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    document.title = 'Maintenance Subscriptions & Care Plans | PartNexa';
    loadPlansAndData();
  }, [billingCycle, user]);

  const loadPlansAndData = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsService.getPlans({ frequency: billingCycle });
      if (res.data?.data) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }

    if (user) {
      try {
        const myRes = await subscriptionsService.getMySubscriptions();
        if (myRes.data?.data) {
          setActiveSubscription(myRes.data.data.activeSubscription);
        }
      } catch {
        // Not subscribed
      }

      try {
        const vRes = await vehiclesService.getGarage();
        const userVehicles = vRes.data?.data || [];
        setVehicles(userVehicles);
        const primary = userVehicles.find((v) => v.isPrimary) || userVehicles[0];
        if (primary) {
          setSelectedVehicleId(primary.id);
          setRegNumber(primary.regNumber || '');
        }
      } catch {
        // No vehicles
      }
    }
    setLoading(false);
  };

  const handleOpenSubscribe = (plan) => {
    if (!user) {
      toast('Please log in or create an account to activate a membership.', { icon: '🔐' });
      navigate('/login?redirect=/subscriptions');
      return;
    }
    setSubscribingPlan(plan);
    setCheckoutModalOpen(true);
  };

  const handleVehicleSelect = (e) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    const chosen = vehicles.find((v) => v.id === vId);
    if (chosen?.regNumber) {
      setRegNumber(chosen.regNumber);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!regNumber.trim()) {
      toast.error('Please provide a vehicle registration number for membership coverage.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        planId: subscribingPlan.id,
        billingCycle,
        vehicleId: selectedVehicleId || undefined,
        vehicleReg: regNumber.trim().toUpperCase(),
        paymentMethod,
        autoRenew: true,
      };

      const res = await subscriptionsService.subscribe(payload);
      const data = res.data?.data;

      if (!data.requiresOnlinePayment) {
        // COD / Pay on first visit flow: immediate activation!
        setCheckoutModalOpen(false);
        toast.success('🎉 Subscription Activated! Payment scheduled on first service.');
        navigate('/my-subscriptions');
      } else {
        // Online Razorpay flow: open sandbox modal
        setCheckoutModalOpen(false);
        setPaymentSession({
          ...data.paymentSession,
          orderId: data.paymentSession.subscriptionId,
          orderNumber: `SUB-${subscribingPlan.slug.toUpperCase()}`,
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
    const toastId = toast.loading('Verifying subscription payment with backend HMAC...');

    try {
      await subscriptionsService.verifyPayment({
        subscriptionId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });

      toast.success('🎉 Membership activated successfully! Welcome to PartNexa Care.', { id: toastId });
      navigate('/my-subscriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment verification failed.', { id: toastId });
    }
  };

  const handleRazorpayFailure = (errData) => {
    setIsRazorpayOpen(false);
    toast.error(errData.errorDescription || 'Subscription payment was declined by bank.');
  };

  const handleRazorpayCancel = () => {
    setIsRazorpayOpen(false);
    toast('Subscription payment window closed.', { icon: 'ℹ️' });
  };

  return (
    <div className="subscriptions-page" id="subscriptions-page">
      {/* Hero Header */}
      <section className="sub-hero">
        <div className="container">
          <div className="sub-hero-badge">🛡️ PartNexa Care Memberships</div>
          <h1 className="sub-hero-title">Zero-Stress Vehicle Maintenance Plans</h1>
          <p className="sub-hero-desc">
            Continuous automotive protection with free scheduled servicing, nationwide 24/7 roadside assistance,
            exclusive genuine spare parts discounts, and certified technician coverage.
          </p>

          {/* Active Membership Banner Callout */}
          {activeSubscription && (
            <div className="active-membership-banner" id="active-subscription-banner">
              <div className="active-membership-info">
                <div className="active-pill-row">
                  <span className="live-dot" />
                  <span className="active-tag">Active Membership</span>
                  <Badge variant="success">ACTIVE</Badge>
                </div>
                <h3 className="active-plan-title">
                  {activeSubscription.plan?.name || 'PartNexa Care'} ({activeSubscription.billingCycle || 'Yearly'})
                </h3>
                <p className="active-meta">
                  Covered Vehicle: <strong>{activeSubscription.vehicleReg || 'All Garaged Vehicles'}</strong> · Valid until:{' '}
                  <strong>{new Date(activeSubscription.endDate).toLocaleDateString()}</strong> · Auto-renew:{' '}
                  <strong>{activeSubscription.autoRenew ? 'Enabled' : 'Disabled'}</strong>
                </p>
              </div>
              <div className="active-actions">
                <Link to="/my-subscriptions">
                  <Button variant="teal" size="sm" id="view-my-membership-btn">
                    Manage My Subscription →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="billing-cycle-switch" id="billing-cycle-switch">
            <button
              className={`cycle-btn ${billingCycle === 'MONTHLY' ? 'active' : ''}`}
              onClick={() => setBillingCycle('MONTHLY')}
              id="cycle-monthly-btn"
            >
              Monthly Billing
            </button>
            <button
              className={`cycle-btn ${billingCycle === 'YEARLY' ? 'active' : ''}`}
              onClick={() => setBillingCycle('YEARLY')}
              id="cycle-yearly-btn"
            >
              Yearly Billing
              <span className="save-badge">Save Up to 30%</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Tiered Plans Grid */}
        <div className="plans-grid" id="subscription-plans-grid">
          {plans.map((plan) => {
            const isPopular = plan.isPopular || plan.slug === 'standard-care';
            const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`plan-card ${isPopular ? 'popular' : ''}`}
                id={`plan-card-${plan.slug}`}
              >
                {isPopular && <div className="popular-badge">⭐ Most Popular</div>}

                <div className="plan-header">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-tagline">{plan.description}</p>
                </div>

                <div className="plan-pricing">
                  <span className="plan-currency">₹</span>
                  <span className="plan-price">{Number(price).toLocaleString('en-IN')}</span>
                  <span className="plan-duration">/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                </div>

                {billingCycle === 'YEARLY' && plan.savingsPercent > 0 && (
                  <div className="plan-savings-pill">
                    ⚡ Includes {plan.savingsPercent}% annual commitment discount
                  </div>
                )}

                {/* Service Limits Highlights */}
                <div className="plan-limits-section">
                  <div className="limits-title">Service Limits:</div>
                  <div className="limits-chips">
                    {plan.serviceLimits?.map((sl, idx) => (
                      <span key={idx} className="limit-chip">
                        • {sl.feature}: <strong>{sl.limit}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Discount Highlights */}
                <div className="plan-discounts-row">
                  {plan.discountBenefits?.map((db, idx) => (
                    <span key={idx} className="discount-tag">
                      🏷️ {db.discountPercent}% off {db.category}
                    </span>
                  ))}
                </div>

                {/* Feature bullets */}
                <ul className="plan-benefits">
                  {plan.features?.map((f, idx) => (
                    <li key={idx} className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="plan-card-footer">
                  <Button
                    variant={isPopular ? 'teal' : 'primary'}
                    size="lg"
                    fullWidth
                    onClick={() => handleOpenSubscribe(plan)}
                    id={`subscribe-btn-${plan.slug}`}
                  >
                    Subscribe Now · ₹{Number(price).toLocaleString('en-IN')}
                  </Button>

                  <Link to={`/subscriptions/${plan.slug}`} className="plan-detail-link" id={`view-details-${plan.slug}`}>
                    View Full Specifications & Limits →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Comparison Matrix Section */}
        <section className="comparison-matrix-section" id="comparison-matrix">
          <div className="section-header-centered">
            <h2 className="matrix-heading">Detailed Plan Comparison</h2>
            <p className="matrix-sub">
              Compare included services, discount percentages, emergency assistance, and service quotas
            </p>
          </div>

          <div className="matrix-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="feature-col">Feature & Coverage</th>
                  <th>Basic Care</th>
                  <th className="highlight-col">Standard Care ⭐</th>
                  <th>Premium Care 👑</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-title">Monthly Price</td>
                  <td>₹299 / mo</td>
                  <td className="highlight-col">₹699 / mo</td>
                  <td>₹1,299 / mo</td>
                </tr>
                <tr>
                  <td className="row-title">Yearly Price (30% off)</td>
                  <td>₹2,499 / yr</td>
                  <td className="highlight-col">₹5,999 / yr</td>
                  <td>₹11,999 / yr</td>
                </tr>
                <tr>
                  <td className="row-title">24/7 Breakdown Assistance</td>
                  <td>✓ Nationwide</td>
                  <td className="highlight-col">✓ Nationwide</td>
                  <td>✓ Priority VIP Dispatch</td>
                </tr>
                <tr>
                  <td className="row-title">Emergency Towing Radius</td>
                  <td>2 Tows (up to 25 km)</td>
                  <td className="highlight-col">5 Tows (up to 50 km)</td>
                  <td>Unlimited Nationwide</td>
                </tr>
                <tr>
                  <td className="row-title">Periodic General Service</td>
                  <td>✕ Optional Add-on</td>
                  <td className="highlight-col">1 Free Service / Term</td>
                  <td>2 Free Comprehensive Services</td>
                </tr>
                <tr>
                  <td className="row-title">Computer Diagnostic Scan</td>
                  <td>✕</td>
                  <td className="highlight-col">2 Scans (40-Point OBD)</td>
                  <td>Unlimited On-Demand Scans</td>
                </tr>
                <tr>
                  <td className="row-title">Spare Parts Discount</td>
                  <td>5% Flat</td>
                  <td className="highlight-col">10% Flat</td>
                  <td>20% VIP Maximum</td>
                </tr>
                <tr>
                  <td className="row-title">Workshop Labor Discount</td>
                  <td>10% Flat</td>
                  <td className="highlight-col">20% Flat</td>
                  <td>30% Flat</td>
                </tr>
                <tr>
                  <td className="row-title">DIFM Doorstep Delivery Fee</td>
                  <td>Standard (₹49)</td>
                  <td className="highlight-col">FREE (₹0)</td>
                  <td>FREE (₹0)</td>
                </tr>
                <tr>
                  <td className="row-title">Doorstep DIFM Labor Waiver</td>
                  <td>✕</td>
                  <td className="highlight-col">✕</td>
                  <td>100% Free Mechanic Labor</td>
                </tr>
                <tr>
                  <td className="row-title">Valet Pickup & Drop</td>
                  <td>✕</td>
                  <td className="highlight-col">✕</td>
                  <td>4 Free Visits / Term</td>
                </tr>
                <tr>
                  <td className="row-title">Vehicle Eligibility</td>
                  <td>All 2W & 4W Vehicles</td>
                  <td className="highlight-col">Cars & Bikes &gt; 150cc</td>
                  <td>All Passenger & Luxury Vehicles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why PartNexa Care */}
        <section className="why-care-section">
          <div className="sub-perks-grid">
            <div className="sub-perk-card">
              <div className="sub-perk-icon">🛡️</div>
              <h3 className="sub-perk-title">100% Genuine Spare Parts</h3>
              <p className="sub-perk-desc">
                All maintenance visits use factory-certified OEM and verified high-grade OES components with warranty.
              </p>
            </div>
            <div className="sub-perk-card">
              <div className="sub-perk-icon">🔧</div>
              <h3 className="sub-perk-title">Certified Master Technicians</h3>
              <p className="sub-perk-desc">
                Skilled mechanics equipped with digital OBD scanners, mobile hoists, and torque calibration rigs.
              </p>
            </div>
            <div className="sub-perk-card">
              <div className="sub-perk-icon">📍</div>
              <h3 className="sub-perk-title">Doorstep Convenience</h3>
              <p className="sub-perk-desc">
                Never wait in line at garages. Schedule servicing at your home, office, or apartment bay.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Subscribe & Checkout Modal */}
      {checkoutModalOpen && subscribingPlan && (
        <Modal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title={`Activate ${subscribingPlan.name}`}
          size="md"
        >
          <form onSubmit={handleProceedToPayment} className="sub-checkout-form" id="subscription-checkout-form">
            {/* Plan Summary Card */}
            <div className="sub-checkout-summary">
              <div className="checkout-plan-row">
                <span className="checkout-plan-name">{subscribingPlan.name}</span>
                <span className="checkout-plan-price">
                  ₹{Number(billingCycle === 'YEARLY' ? subscribingPlan.yearlyPrice : subscribingPlan.monthlyPrice).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="checkout-plan-meta">
                Billing: <strong>{billingCycle === 'YEARLY' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</strong> · Cancel anytime
              </div>
            </div>

            {/* Covered Vehicle Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub-vehicle-select">Select Vehicle from Garage</label>
              {vehicles.length > 0 ? (
                <select
                  id="sub-vehicle-select"
                  className="form-input"
                  value={selectedVehicleId}
                  onChange={handleVehicleSelect}
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
                placeholder="e.g. KA01AB1234 or MH02CD5678"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                required
                id="sub-reg-input"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="sub-payment-options">
                <label className={`sub-pay-option ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="subPaymentMethod"
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
                    name="subPaymentMethod"
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
              <Button
                type="submit"
                variant="teal"
                loading={isSubmitting}
                id="confirm-subscription-btn"
              >
                Proceed to Checkout
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Razorpay Sandbox Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        paymentData={paymentSession}
        onSuccess={handleRazorpaySuccess}
        onFailure={handleRazorpayFailure}
        onCancel={handleRazorpayCancel}
      />
    </div>
  );
};

export default SubscriptionsPage;
