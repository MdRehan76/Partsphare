import React, { useState, useEffect } from 'react';
import deliveryService from '../../services/deliveryService';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import toast from 'react-hot-toast';

export const CodReconciliationPage = () => {
  const { partner, refreshProfile } = useDeliveryAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);

  // Deposit Form
  const [hubLocation, setHubLocation] = useState('Indiranagar Central Logistics Hub');
  const [depositMethod, setDepositMethod] = useState('CASH_AT_HUB');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dash, recs] = await Promise.all([
        deliveryService.getDashboard(),
        deliveryService.getReconciliations(),
      ]);
      setDashboardData(dash);
      setReconciliations(recs);
    } catch (err) {
      toast.error('Failed to load COD cash records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDepositCash = async (e) => {
    e.preventDefault();
    const pendingCash = dashboardData?.metrics?.pendingCashInHand || 0;
    if (pendingCash <= 0) {
      toast.error('No pending COD cash in hand to reconcile.');
      return;
    }

    try {
      setDepositing(true);
      await deliveryService.reconcileCod({
        amount: pendingCash,
        hubLocation,
        depositMethod,
        notes: notes || 'Cash deposited with logistics cashier desk.',
      });
      toast.success(`Successfully deposited ₹${pendingCash.toLocaleString('en-IN')}! Reconciliation receipt generated.`);
      await fetchData();
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cash deposit reconciliation failed.');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💵</div>
        <div>Loading COD Cash reconciliation records...</div>
      </div>
    );
  }

  const pendingCash = dashboardData?.metrics?.pendingCashInHand || 0;
  const unreconciledJobs = dashboardData?.unreconciledCodJobs || [];

  return (
    <div className="delivery-container">
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Cash on Delivery (COD) & Hub Reconciliation
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Track cash collected at customer doorstep and deposit with logistics hub finance cashier.
        </p>
      </div>

      {/* Cash in Hand Big Card */}
      <div
        className="delivery-card"
        style={{
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(245, 158, 11, 0.05))',
          border: '1px solid rgba(234, 88, 12, 0.3)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Current Cash in Hand (Physical Currency)
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#EA580C' }}>
            ₹{pendingCash.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Collected across {unreconciledJobs.length} delivered order(s)
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              const el = document.getElementById('deposit-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={pendingCash <= 0}
            className="btn btn-primary"
            style={{ background: '#EA580C', padding: '0.85rem 1.5rem' }}
          >
            Deposit Cash with Hub Cashier ↓
          </button>
        </div>
      </div>

      {/* Table: Unreconciled Deliveries with Cash Collected */}
      <div className="delivery-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
          📦 Orders with Collected COD Cash ({unreconciledJobs.length})
        </h2>

        {unreconciledJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            ✓ All collected COD funds have been reconciled and cleared with finance.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Order #</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer / Drop</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>COD Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Collection Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Collected At</th>
                </tr>
              </thead>
              <tbody>
                {unreconciledJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                      {job.orderNumber || job.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{job.dropLocation?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{job.dropLocation?.address}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#EA580C' }}>
                      ₹{job.codAmountCollected || job.codAmountToCollect}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="delivery-badge badge-cod">
                        {job.codStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {job.collectedAt ? new Date(job.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Action Form */}
      <div id="deposit-section" className="delivery-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          🏦 Deposit Cash & Hub Reconciliation Settlement
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Submit physical cash to the designated logistics hub finance officer to generate a digital clearance receipt.
        </p>

        <form onSubmit={handleDepositCash}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Logistics Hub Location</label>
              <select
                className="form-select"
                value={hubLocation}
                onChange={(e) => setHubLocation(e.target.value)}
              >
                <option value="Indiranagar Central Logistics Hub">Indiranagar Central Logistics Hub</option>
                <option value="Whitefield Express Hub">Whitefield Express Hub</option>
                <option value="Koramangala Dispatch Center">Koramangala Dispatch Center</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Channel</label>
              <select
                className="form-select"
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
              >
                <option value="CASH_AT_HUB">Cash Handover at Hub Desk</option>
                <option value="UPI_TO_FINANCE_DESK">Instant UPI to PartSphere Treasury</option>
                <option value="NEFT_TRANSFER">Bank Transfer / NEFT</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Remarks / Slip Reference (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handed over ₹1,850 currency notes to Desk Officer Gopal Krishna."
            />
          </div>

          <button
            type="submit"
            disabled={depositing || pendingCash <= 0}
            className="btn btn-primary"
            style={{ background: '#EA580C', padding: '0.85rem 1.75rem', marginTop: '0.5rem' }}
          >
            {depositing ? 'Processing Settlement...' : `Confirm Deposit of ₹${pendingCash.toLocaleString('en-IN')} & Reconcile`}
          </button>
        </form>
      </div>

      {/* Historical Settlement Ledger */}
      <div className="delivery-card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
          📜 Reconciliation Settlement History ({reconciliations.length})
        </h2>

        {reconciliations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No prior reconciliation batches on record.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Reconciliation ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Hub & Cashier</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total Deposited</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date Settled</th>
                </tr>
              </thead>
              <tbody>
                {reconciliations.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                      <div>{r.reconciliationNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Ref: {r.depositReference}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{r.hubLocation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Officer: {r.receivedBy}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
                      ₹{r.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="delivery-badge badge-delivered">
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodReconciliationPage;
