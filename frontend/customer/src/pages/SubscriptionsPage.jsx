import { useState, useEffect } from 'react';
import { subscriptionsService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Badge } from '../components/ui';
import toast from 'react-hot-toast';
import './SubscriptionsPage.css';

const DEFAULT_PLANS = [
  {
    id: 'plan_basic',
    name: 'PartNexa Basic Care',
    duration: '6 Months',
    price: 499,
    tagline: 'Essential protection & periodic checkups for daily city commutes',
    popular: false,
    benefits: [
      '1 Complimentary 24-point Vehicle Health Inspection',
      '10% Flat Discount on all mechanical labor charges',
      'Priority delivery on genuine spare parts',
      'Free Emergency Battery Jumpstart (within city limits)',
      'Digital Vehicle Health & Service History Passbook',
    ],
  },
  {
    id: 'plan_silver',
    name: 'PartNexa Silver Elite',
    duration: '1 Year',
    price: 1499,
    tagline: 'Complete peace of mind with labor waivers and doorstep convenience',
    popular: true,
    benefits: [
      '2 Comprehensive Full Vehicle Health Inspections',
      '2 Free Oil Change Labor Waivers',
      '15% Discount on genuine OEM/OES spare parts',
      'Free Doorstep Vehicle Pickup & Drop for service visits',
      '1 Free AC Cabin Filter Replacement Labor',
      '24/7 Dedicated Concierge Support Line',
    ],
  },
  {
    id: 'plan_gold',
    name: 'PartNexa Gold Concierge',
    duration: '1 Year',
    price: 2999,
    tagline: 'VIP automotive membership with unlimited checkups and RSA coverage',
    popular: false,
    benefits: [
      'Unlimited Vehicle Health & Diagnostic Scans',
      '4 Free Doorstep Maintenance Service Visits',
      '20% Maximum Discount on all genuine spare parts',
      '24x7 Pan-India Roadside Assistance (RSA) with Flatbed Towing',
      'Zero cancellation or rescheduling fees anytime',
      'Personal Master Technician assigned to your vehicle',
    ],
  },
];

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscribingPlan, setSubscribingPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [regNumber, setRegNumber] = useState('');

  useEffect(() => {
    document.title = 'Maintenance Subscriptions | PartNexa Care';
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsService.getPlans();
      if (res.data?.data && res.data.data.length > 0) {
        setPlans(res.data.data);
      }
    } catch {
      // Use DEFAULT_PLANS
    }

    if (user) {
      try {
        const myRes = await subscriptionsService.getMySubscription();
        if (myRes.data?.data) {
          setMySubscription(myRes.data.data);
        }
      } catch {
        // No active subscription
      }
    }
    setLoading(false);
  };

  const handleOpenSubscribe = (plan) => {
    setSubscribingPlan(plan);
    setModalOpen(true);
  };

  const handleConfirmSubscribe = (e) => {
    e.preventDefault();
    if (!regNumber) {
      toast.error('Please enter your vehicle registration number');
      return;
    }

    toast.success(
      `🎉 Subscribed to ${subscribingPlan.name}! Your PartNexa Care membership is active.`
    );
    setMySubscription({
      plan: subscribingPlan,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toLocaleDateString(),
      vehicleReg: regNumber,
    });
    setModalOpen(false);
    setRegNumber('');
  };

  return (
    <div className="subscriptions-page">
      {/* Hero */}
      <section className="sub-hero">
        <div className="container">
          <div className="sub-hero-badge">🛡️ PartNexa Care Membership</div>
          <h1 className="sub-hero-title">Zero-Stress Vehicle Maintenance Plans</h1>
          <p className="sub-hero-desc">
            Keep your car or two-wheeler in prime factory condition with annual servicing,
            exclusive discounts on authentic parts, and 24/7 roadside assistance.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Active Subscription Banner */}
        {mySubscription && (
          <div className="active-membership-banner">
            <div className="active-membership-info">
              <h3>
                🌟 Active Membership: {mySubscription.plan?.name || 'PartNexa Silver Elite'}
              </h3>
              <p>
                Covered Vehicle: <strong>{mySubscription.vehicleReg || 'KA01AB1234'}</strong> · Valid
                until: <strong>{mySubscription.expiresAt || 'September 2027'}</strong>
              </p>
            </div>
            <Badge variant="success">ACTIVE</Badge>
          </div>
        )}

        {/* Plans Grid */}
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
              id={`plan-card-${plan.id}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}

              <div>
                <div className="plan-header">
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-tagline">{plan.tagline}</p>
                </div>

                <div className="plan-pricing">
                  <span className="plan-price">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="plan-duration"> / {plan.duration}</span>
                </div>

                <ul className="plan-benefits">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                fullWidth
                onClick={() => handleOpenSubscribe(plan)}
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Perks / Why PartNexa Care */}
        <div className="sub-perks-grid">
          <div className="sub-perk-card">
            <div className="sub-perk-icon">🔧</div>
            <h3 className="sub-perk-title">100% Genuine Spare Parts</h3>
            <p className="sub-perk-desc">
              All parts used during service visits are authentic OES or OEM factory verified components.
            </p>
          </div>
          <div className="sub-perk-card">
            <div className="sub-perk-icon">🚗</div>
            <h3 className="sub-perk-title">Free Doorstep Delivery & Service</h3>
            <p className="sub-perk-desc">
              Technicians come directly to your home or office with diagnostic kits and replacement fluids.
            </p>
          </div>
          <div className="sub-perk-card">
            <div className="sub-perk-icon">📜</div>
            <h3 className="sub-perk-title">Warranty Protected</h3>
            <p className="sub-perk-desc">
              Every maintenance service carries a 6-month / 10,000 km PartNexa guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Subscribe to ${subscribingPlan?.name}`}
          size="md"
        >
          <form onSubmit={handleConfirmSubscribe}>
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>{subscribingPlan?.name}</span>
                  <span style={{ color: 'var(--color-primary-600)' }}>
                    ₹{subscribingPlan?.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                  Coverage: {subscribingPlan?.duration} · Cancel anytime
                </div>
              </div>

              <Input
                label="Vehicle Registration Number"
                placeholder="e.g. KA03 HA 4821"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Activate Membership
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SubscriptionsPage;
