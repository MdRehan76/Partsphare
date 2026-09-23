import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Modal, Badge, Skeleton } from '../../components/ui';
import toast from 'react-hot-toast';
import './MySubscriptionsPage.css';

const STATUS_BADGE_MAP = {
  ACTIVE: { variant: 'teal', label: 'Active Member', icon: '🟢' },
  PENDING: { variant: 'blue', label: 'Pending Payment', icon: '⏳' },
  CANCELLED: { variant: 'warning', label: 'Cancelled (Active till period end)', icon: '🟠' },
  EXPIRED: { variant: 'default', label: 'Expired', icon: '⚪' },
};

const MySubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [subToCancel, setSubToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Too expensive');
  const [isCancelling, setIsCancelling] = useState(false);

  // Redeem Entitlement Modal State
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [activeSubForRedeem, setActiveSubForRedeem] = useState(null);
  const [selectedFeatureCode, setSelectedFeatureCode] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    document.title = 'My Maintenance Subscriptions | PartNexa Care';
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsService.getMySubscriptions();
      setSubscriptions(res.data?.data || []);
    } catch (err) {
      toast.error('Could not load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async (sub) => {
    const nextState = !sub.autoRenew;
    try {
      await subscriptionsService.toggleAutoRenew(sub.id, nextState);
      toast.success(`Auto-renewal ${nextState ? 'enabled' : 'disabled'}.`);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, autoRenew: nextState } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update auto-renewal.');
    }
  };

  const handleSimulateRenewal = async (subId) => {
    const toastId = toast.loading('Simulating membership renewal...');
    try {
      const res = await subscriptionsService.renewSubscription(subId);
      toast.success('🎉 Subscription renewed for another cycle! Quotas reset.', { id: toastId });
      loadSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew subscription.', { id: toastId });
    }
  };

  const handleSimulateExpiration = async (subId) => {
    const toastId = toast.loading('Simulating expiration (demo)...');
    try {
      await subscriptionsService.expireSubscription(subId);
      toast.success('Subscription moved to EXPIRED status.', { id: toastId });
      loadSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to expire.', { id: toastId });
    }
  };

  const openCancelModal = (sub) => {
    setSubToCancel(sub);
    setCancelReason('Too expensive');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!subToCancel) return;
    setIsCancelling(true);
    try {
      await subscriptionsService.cancelSubscription(subToCancel.id, { reason: cancelReason });
      toast.success('Subscription cancelled. Benefits remain active until end date.');
      setCancelModalOpen(false);
      loadSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  const openRedeemModal = (sub, defaultFeatureCode = '') => {
    setActiveSubForRedeem(sub);
    setSelectedFeatureCode(defaultFeatureCode || sub.entitlements?.[0]?.featureCode || '');
    setServiceNotes('');
    setRedeemModalOpen(true);
  };

  const handleConfirmRedeem = async (e) => {
    e.preventDefault();
    if (!activeSubForRedeem || !selectedFeatureCode) {
      toast.error('Please select an entitlement service.');
      return;
    }
    setIsRedeeming(true);
    try {
      await subscriptionsService.useEntitlement(activeSubForRedeem.id, {
        featureCode: selectedFeatureCode,
        notes: serviceNotes || 'Customer redeemed service from dashboard',
      });
      toast.success('Service entitlement booked & deducted from quota!');
      setRedeemModalOpen(false);
      loadSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quota limit exceeded or invalid service.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (activeFilter === 'ALL') return true;
    return sub.status === activeFilter;
  });

  const activeSub = subscriptions.find((s) => s.status === 'ACTIVE' || s.status === 'CANCELLED');

  return (
    <div className="my-subscriptions-page" id="my-subscriptions-page">
      {/* Header Banner */}
      <section className="my-sub-header">
        <div className="container">
          <div className="my-sub-header-content">
            <div>
              <div className="my-sub-badge">🛡️ PartNexa Care Management</div>
              <h1 className="my-sub-title">My Maintenance Subscriptions</h1>
              <p className="my-sub-desc">
                Track your active vehicle coverage, check and redeem service quotas, manage renewal settings, and view past billing statements.
              </p>
            </div>
            <div className="my-sub-header-actions">
              <Link to="/subscriptions">
                <Button variant="outline-light" size="md" id="explore-plans-btn">
                  Browse All Plans →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container my-sub-body">
        {loading ? (
          <div className="sub-loading-skeleton">
            <Skeleton height={200} borderRadius={16} />
            <div style={{ marginTop: '24px' }}>
              <Skeleton height={280} borderRadius={16} />
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="no-sub-card">
            <div className="no-sub-icon">🚗</div>
            <h2 className="no-sub-title">No Active Maintenance Subscription</h2>
            <p className="no-sub-desc">
              You do not have any vehicle maintenance plan registered yet. Join PartNexa Care to get complimentary towing, free annual scheduled services, and up to 25% off all genuine spare parts.
            </p>
            <div className="no-sub-actions">
              <Link to="/subscriptions">
                <Button variant="teal" size="lg" id="get-first-plan-btn">
                  Explore PartNexa Care Plans
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Active Subscription Overview Card */}
            {activeSub && (
              <section className="active-card-wrapper">
                <div className="active-sub-card" id="active-subscription-hero">
                  <div className="active-sub-top">
                    <div className="active-sub-meta">
                      <div className="sub-badge-group">
                        <span className={`status-pill ${activeSub.status.toLowerCase()}`}>
                          {STATUS_BADGE_MAP[activeSub.status]?.icon}{' '}
                          {STATUS_BADGE_MAP[activeSub.status]?.label || activeSub.status}
                        </span>
                        <span className="cycle-pill">
                          {activeSub.billingCycle === 'YEARLY' ? 'Annual Membership' : 'Monthly Membership'}
                        </span>
                      </div>
                      <h2 className="active-plan-name">{activeSub.plan?.name || 'Maintenance Plan'}</h2>
                      <div className="active-vehicle-info">
                        <span className="veh-icon">🚗</span>
                        <span className="veh-name">
                          {activeSub.vehicle?.variant
                            ? `${activeSub.vehicle.variant?.model?.make?.name} ${activeSub.vehicle.variant?.model?.name}`
                            : 'Registered Vehicle'}
                        </span>
                        {activeSub.vehicleReg && (
                          <span className="veh-reg-badge">{activeSub.vehicleReg}</span>
                        )}
                      </div>
                    </div>

                    <div className="active-sub-pricing-col">
                      <div className="active-sub-fee-label">Subscription Rate</div>
                      <div className="active-sub-fee">
                        ₹{Number(activeSub.pricePaid || activeSub.plan?.monthlyPrice || 0).toLocaleString('en-IN')}
                        <span className="fee-period">/{activeSub.billingCycle === 'YEARLY' ? 'yr' : 'mo'}</span>
                      </div>
                      <div className="active-sub-renew-switch">
                        <label className="switch-container">
                          <input
                            type="checkbox"
                            checked={activeSub.autoRenew}
                            onChange={() => handleToggleAutoRenew(activeSub)}
                            id="auto-renew-toggle"
                          />
                          <span className="switch-slider" />
                        </label>
                        <span className="switch-label">
                          Auto-Renew: <strong>{activeSub.autoRenew ? 'ON' : 'OFF'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Timeline Bar */}
                  <div className="active-sub-dates-grid">
                    <div className="date-item">
                      <span className="date-label">Start Date</span>
                      <span className="date-value">{formatDate(activeSub.startDate)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Current Period Ends</span>
                      <span className="date-value">{formatDate(activeSub.endDate)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Next Renewal Date</span>
                      <span className="date-value">{formatDate(activeSub.renewalDate)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Billing Cycle</span>
                      <span className="date-value">{activeSub.billingCycle}</span>
                    </div>
                  </div>

                  {/* Notice Box */}
                  <div className="renewal-notice-box">
                    <span className="info-icon">💡</span>
                    <span>
                      {activeSub.autoRenew
                        ? 'Automated renewal simulation is active. Your plan will renew on ' +
                          formatDate(activeSub.renewalDate) +
                          '.'
                        : 'Auto-renewal is paused. Your benefits will expire on ' +
                          formatDate(activeSub.endDate) +
                          ' unless renewed.'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="active-sub-actions-bar">
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => openRedeemModal(activeSub)}
                      id="redeem-entitlement-btn"
                    >
                      ✨ Redeem Service Entitlement
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSimulateRenewal(activeSub.id)}
                      id="simulate-renewal-btn"
                      title="Simulate scheduled auto-renewal in demo environment"
                    >
                      🔄 Simulate Renewal
                    </Button>
                    {activeSub.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCancelModal(activeSub)}
                        className="cancel-btn"
                        id="cancel-subscription-btn"
                      >
                        Cancel Membership
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSimulateExpiration(activeSub.id)}
                      className="demo-expire-btn"
                      id="simulate-expire-btn"
                      title="Simulate expiration transition for testing"
                    >
                      ⏳ Test Expiration
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Entitlements Tracker Section */}
            {activeSub && activeSub.entitlements && activeSub.entitlements.length > 0 && (
              <section className="entitlements-tracker-section" id="entitlements-tracker">
                <div className="section-title-row">
                  <div>
                    <h2 className="section-title">📊 Service Entitlements & Quota Tracker</h2>
                    <p className="section-subtitle">
                      Allowable services for this billing period ({formatDate(activeSub.startDate)} – {formatDate(activeSub.endDate)})
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRedeemModal(activeSub)}
                  >
                    + Book Service
                  </Button>
                </div>

                <div className="entitlements-grid">
                  {activeSub.entitlements.map((ent, idx) => {
                    const isUnlimited = ent.quotaLimit === null || ent.quotaLimit === 0 || ent.isUnlimited;
                    const used = ent.usedCount || 0;
                    const limit = ent.quotaLimit || 0;
                    const remaining = ent.remainingCount !== undefined ? ent.remainingCount : isUnlimited ? 'Unlimited' : Math.max(0, limit - used);
                    const isExhausted = !isUnlimited && remaining <= 0;
                    const percentUsed = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));

                    return (
                      <div key={idx} className={`entitlement-card ${isExhausted ? 'exhausted' : ''}`}>
                        <div className="ent-card-header">
                          <h3 className="ent-name">{ent.name}</h3>
                          {isUnlimited ? (
                            <span className="badge-unlimited">Unlimited</span>
                          ) : isExhausted ? (
                            <span className="badge-exhausted">Quota Exhausted</span>
                          ) : (
                            <span className="badge-remaining">{remaining} Remaining</span>
                          )}
                        </div>

                        <p className="ent-desc">{ent.description}</p>

                        {!isUnlimited && (
                          <div className="ent-progress-wrap">
                            <div className="ent-progress-bar">
                              <div
                                className="ent-progress-fill"
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                            <div className="ent-progress-meta">
                              <span>Used: <strong>{used}</strong> of {limit}</span>
                              <span>{100 - percentUsed}% Left</span>
                            </div>
                          </div>
                        )}

                        <div className="ent-card-footer">
                          <span className="feature-code-tag">{ent.featureCode}</span>
                          <button
                            type="button"
                            className="ent-redeem-btn"
                            disabled={isExhausted}
                            onClick={() => openRedeemModal(activeSub, ent.featureCode)}
                          >
                            {isExhausted ? 'Exhausted' : 'Redeem'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Subscriptions History List & Filters */}
            <section className="sub-history-section">
              <div className="history-header">
                <h2 className="section-title">Membership History</h2>
                <div className="filter-tabs">
                  {['ALL', 'ACTIVE', 'CANCELLED', 'EXPIRED'].map((tab) => (
                    <button
                      key={tab}
                      className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                      onClick={() => setActiveFilter(tab)}
                      id={`sub-filter-${tab.toLowerCase()}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="history-list">
                {filteredSubscriptions.map((sub) => (
                  <div key={sub.id} className="history-item-card">
                    <div className="history-item-main">
                      <div className="history-item-title-row">
                        <span className="history-plan-name">{sub.plan?.name || 'Care Membership'}</span>
                        <span className={`status-pill ${sub.status.toLowerCase()}`}>
                          {STATUS_BADGE_MAP[sub.status]?.icon} {sub.status}
                        </span>
                        <span className="history-cycle-pill">{sub.billingCycle}</span>
                      </div>
                      <div className="history-meta-row">
                        <span>Period: {formatDate(sub.startDate)} – {formatDate(sub.endDate)}</span>
                        <span>•</span>
                        <span>Fee: ₹{Number(sub.pricePaid || 0).toLocaleString('en-IN')}</span>
                        {sub.vehicleReg && (
                          <>
                            <span>•</span>
                            <span>Reg: {sub.vehicleReg}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="history-item-actions">
                      <Link to={`/subscriptions/${sub.plan?.id || sub.plan?.slug}`}>
                        <Button variant="ghost" size="sm">
                          Plan Details
                        </Button>
                      </Link>
                      {sub.status === 'EXPIRED' && (
                        <Link to={`/subscriptions/${sub.plan?.id || sub.plan?.slug}`}>
                          <Button variant="teal" size="sm">
                            Renew Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {cancelModalOpen && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Maintenance Subscription"
          size="md"
        >
          <form onSubmit={handleConfirmCancel} className="cancel-sub-form">
            <p className="cancel-modal-intro">
              Are you sure you want to cancel your <strong>{subToCancel?.plan?.name}</strong> membership?
            </p>
            <div className="cancel-notice-box">
              🛡️ <strong>Good news:</strong> You will continue to receive all service entitlements, roadside assistance, and parts discount benefits until the end of your prepaid period (<strong>{formatDate(subToCancel?.endDate)}</strong>).
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cancel-reason-select">Please tell us why you are cancelling:</label>
              <select
                id="cancel-reason-select"
                className="form-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Too expensive">Too expensive</option>
                <option value="Sold my vehicle">Sold my vehicle</option>
                <option value="Switching to a different plan">Switching to a different plan</option>
                <option value="Rarely used benefits">Rarely used benefits</option>
                <option value="Relocating outside service coverage">Relocating outside service coverage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sub-checkout-actions">
              <Button type="button" variant="ghost" onClick={() => setCancelModalOpen(false)}>
                Keep Membership
              </Button>
              <Button type="submit" variant="danger" loading={isCancelling} id="confirm-cancel-sub-btn">
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Redeem Entitlement Modal */}
      {redeemModalOpen && (
        <Modal
          isOpen={redeemModalOpen}
          onClose={() => setRedeemModalOpen(false)}
          title="Redeem Service Entitlement"
          size="md"
        >
          <form onSubmit={handleConfirmRedeem} className="redeem-entitlement-form">
            <p className="redeem-modal-intro">
              Select the service you wish to schedule or redeem under your active <strong>{activeSubForRedeem?.plan?.name}</strong> coverage.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="entitlement-select">Select Entitlement Service *</label>
              <select
                id="entitlement-select"
                className="form-input"
                value={selectedFeatureCode}
                onChange={(e) => setSelectedFeatureCode(e.target.value)}
                required
              >
                {activeSubForRedeem?.entitlements?.map((ent) => {
                  const isExhausted = !ent.isUnlimited && ent.remainingCount !== undefined && ent.remainingCount <= 0;
                  return (
                    <option
                      key={ent.featureCode}
                      value={ent.featureCode}
                      disabled={isExhausted}
                    >
                      {ent.name} ({ent.isUnlimited ? 'Unlimited' : `${ent.remainingCount ?? ent.quotaLimit} left`})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="redeem-notes">Service / Booking Request Notes</label>
              <textarea
                id="redeem-notes"
                className="form-input"
                rows={3}
                placeholder="e.g. Schedule oil change for Saturday morning, or towing required from Indiranagar..."
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
              />
            </div>

            <div className="sub-checkout-actions">
              <Button type="button" variant="ghost" onClick={() => setRedeemModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" loading={isRedeeming} id="confirm-redeem-btn">
                Confirm Service Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MySubscriptionsPage;
