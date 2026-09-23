import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function PlatformConfigPage() {
  const [difmConfig, setDifmConfig] = useState(null);
  const [commissionConfig, setCommissionConfig] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [savingDifm, setSavingDifm] = useState(false);
  const [savingCommission, setSavingCommission] = useState(false);

  // Subscription plan edit modal
  const [editingPlan, setEditingPlan] = useState(null);
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState('');
  const [planYearlyPrice, setPlanYearlyPrice] = useState('');

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const [difm, comm, plans, ledgerData] = await Promise.all([
        adminService.getDifmConfig(),
        adminService.getCommissionConfig(),
        adminService.listSubscriptionPlans(),
        adminService.getCommissionLedger({
          releaseStatus: ledgerStatusFilter !== 'ALL' ? ledgerStatusFilter : undefined,
        }),
      ]);
      setDifmConfig(difm);
      setCommissionConfig(comm);
      setSubscriptionPlans(plans);
      setLedgers(ledgerData || []);
    } catch (err) {
      toast.error('Failed to load platform configuration.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    try {
      const ledgerData = await adminService.getCommissionLedger({
        releaseStatus: ledgerStatusFilter !== 'ALL' ? ledgerStatusFilter : undefined,
      });
      setLedgers(ledgerData || []);
    } catch (err) {
      toast.error('Failed to update commission ledger.');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    fetchLedgers();
  }, [ledgerStatusFilter]);

  const handleReleasePayout = async (ledgerId) => {
    try {
      await adminService.releaseCommissionPayout(ledgerId);
      toast.success('Shop commission payout released successfully.');
      fetchLedgers();
    } catch (err) {
      toast.error('Failed to release commission payout.');
    }
  };

  const handleSaveDifm = async (e) => {
    e.preventDefault();
    setSavingDifm(true);
    try {
      await adminService.updateDifmConfig(difmConfig);
      toast.success('DIFM and delivery pricing rules updated.');
    } catch (err) {
      toast.error('Failed to update DIFM configuration.');
    } finally {
      setSavingDifm(false);
    }
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    const rate = Number(commissionConfig.defaultRate);
    if (isNaN(rate) || rate < 10.0 || rate > 15.0) {
      return toast.error('Commission rate must be strictly between 10.0% and 15.0%.');
    }

    setSavingCommission(true);
    try {
      await adminService.updateCommissionConfig({ defaultRate: rate });
      toast.success('Global platform commission rate updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update commission rate.');
    } finally {
      setSavingCommission(false);
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSubscriptionPlan(editingPlan.id, {
        monthlyPrice: Number(planMonthlyPrice),
        yearlyPrice: Number(planYearlyPrice),
        price: Number(planMonthlyPrice),
      });
      toast.success(`Plan ${editingPlan.name} pricing updated.`);
      setEditingPlan(null);
      fetchConfigs();
    } catch (err) {
      toast.error('Failed to update subscription plan.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading platform parameters & pricing engines...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Platform & Financial Engine Configuration
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Manage global marketplace rules, DIFM fee models, automated commission bounds, and subscription plans.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 1. Global Workshop Commission Configuration */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Automated 10%–15% Commission Engine
            </h3>
            <span className="badge badge-primary">Platform Rule</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Workshops operate on a platform commission model strictly bounded between 10.0% and 15.0%. Payout releases are mathematically locked until both service completion and payment clearance.
          </p>

          <form onSubmit={handleSaveCommission} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Default Network Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="15"
                value={commissionConfig?.defaultRate || 12}
                onChange={(e) => setCommissionConfig({ ...commissionConfig, defaultRate: e.target.value })}
                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Allowed Range: 10.0% to 15.0% • Currently set to {commissionConfig?.defaultRate}%
              </div>
            </div>

            <button type="submit" disabled={savingCommission} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              {savingCommission ? 'Saving...' : 'Update Commission Engine'}
            </button>
          </form>
        </div>

        {/* 2. DIFM & Logistics Engine Rules */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              DIFM Surcharges & Delivery Thresholds
            </h3>
            <span className="badge badge-info">Cart Pricing Engine</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Calculates Option A (Home visit surcharge), Option B (Shop install), and standard checkout freight fees.
          </p>

          <form onSubmit={handleSaveDifm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Home Base Surcharge (₹)
                </label>
                <input
                  type="number"
                  value={difmConfig?.homeVisitBaseSurcharge || 99}
                  onChange={(e) => setDifmConfig({ ...difmConfig, homeVisitBaseSurcharge: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Per-Km Extra Rate (₹/km)
                </label>
                <input
                  type="number"
                  value={difmConfig?.homeVisitPerKmRate || 20}
                  onChange={(e) => setDifmConfig({ ...difmConfig, homeVisitPerKmRate: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={difmConfig?.freeDeliveryThreshold || 999}
                  onChange={(e) => setDifmConfig({ ...difmConfig, freeDeliveryThreshold: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={difmConfig?.standardDeliveryFee || 49}
                  onChange={(e) => setDifmConfig({ ...difmConfig, standardDeliveryFee: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Base Installation Service Fee (₹)
                </label>
                <input
                  type="number"
                  value={difmConfig?.defaultBaseServiceFee || 299}
                  onChange={(e) => setDifmConfig({ ...difmConfig, defaultBaseServiceFee: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Service Options Enabled</span>
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={difmConfig?.optionAEnabled !== false}
                      onChange={(e) => setDifmConfig({ ...difmConfig, optionAEnabled: e.target.checked })}
                    />
                    Opt A (Home)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={difmConfig?.optionBEnabled !== false}
                      onChange={(e) => setDifmConfig({ ...difmConfig, optionBEnabled: e.target.checked })}
                    />
                    Opt B (Shop)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={difmConfig?.optionCEnabled !== false}
                      onChange={(e) => setDifmConfig({ ...difmConfig, optionCEnabled: e.target.checked })}
                    />
                    Opt C (DIY)
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={savingDifm} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              {savingDifm ? 'Saving...' : 'Update DIFM Engine'}
            </button>
          </form>
        </div>
      </div>

      {/* 3. Subscription Plans Configuration */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              PartSphere Club Subscription Plans
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configure club tier pricing, member entitlements, and recurring billing models.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Monthly Price</th>
                <th>Yearly Price</th>
                <th>Annual Savings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionPlans.map((plan) => {
                const monthly = Number(plan.monthlyPrice || plan.price || 499);
                const yearly = Number(plan.yearlyPrice || monthly * 10);
                return (
                  <tr key={plan.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{plan.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{plan.description}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        ₹{monthly}/mo
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                        ₹{yearly}/yr
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        Save {Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${plan.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {plan.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanMonthlyPrice(monthly);
                          setPlanYearlyPrice(yearly);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit Pricing
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Commission Ledger & Payout Settlement */}
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Workshop Commission Ledger & Payout Settlement
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Live transaction ledger tracking workshop service cut, platform fee, and held/released settlement balances.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={ledgerStatusFilter}
              onChange={(e) => setLedgerStatusFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Settlement States</option>
              <option value="HELD">Held Only</option>
              <option value="RELEASED">Released Payouts</option>
            </select>
            <button onClick={fetchLedgers} className="btn btn-secondary btn-sm">
              Refresh Ledger
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Workshop Partner</th>
                <th>Gross Service Fee</th>
                <th>Platform Commission</th>
                <th>Workshop Payout</th>
                <th>Settlement Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No commission ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledgers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {item.order?.orderNumber || item.orderNumber || item.orderId?.slice(0, 8) || 'DIFM-ORD'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.shop?.name || 'Authorized Partner Workshop'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.shop?.city || 'Bengaluru Hub'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{Number(item.grossAmount || item.serviceFee || item.commissionAmount * 8 || 1200).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                        ₹{Number(item.commissionAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.commissionRate || 12}% Tier
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--color-success)' }}>
                        ₹{Number(item.shopPayout || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.releaseStatus === 'RELEASED' ? 'badge-success' : 'badge-warning'}`}>
                        {item.releaseStatus || item.payoutStatus || 'HELD'}
                      </span>
                    </td>
                    <td>
                      {item.releaseStatus !== 'RELEASED' ? (
                        <button
                          onClick={() => handleReleasePayout(item.id)}
                          className="btn btn-sm btn-success"
                        >
                          Release Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ✓ Paid ({item.payoutRef?.slice(0, 12) || 'TRF'})
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="modal-overlay" onClick={() => setEditingPlan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Pricing: {editingPlan.name}
              </h3>
              <button onClick={() => setEditingPlan(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSavePlan}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Monthly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={planMonthlyPrice}
                    onChange={(e) => setPlanMonthlyPrice(e.target.value)}
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Yearly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={planYearlyPrice}
                    onChange={(e) => setPlanYearlyPrice(e.target.value)}
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingPlan(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Pricing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
