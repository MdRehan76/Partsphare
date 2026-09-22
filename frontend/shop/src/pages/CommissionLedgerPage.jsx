import React, { useState, useEffect } from 'react';
import shopService from '../services/shopService';
import toast from 'react-hot-toast';

export const CommissionLedgerPage = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await shopService.getCommissionLedger();
      setLedgerData(res.data);
    } catch (err) {
      toast.error('Failed to load commission ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    try {
      const res = await shopService.requestPayout();
      toast.success('Payout processed successfully!');
      setPayoutReceipt(res.data);
      fetchLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payout request failed.');
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading commission ledger...
      </div>
    );
  }

  const { shopName, commissionRate, summary, items = [] } = ledgerData || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Commission System & Ledger</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Automated workshop revenue sharing, dual-condition release verification, and payout history.
          </p>
        </div>

        <button
          onClick={handleRequestPayout}
          disabled={requestingPayout || !summary?.releasedForPayout || summary?.releasedForPayout <= 0}
          className="btn btn-success btn-lg"
          style={{ boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
        >
          {requestingPayout ? 'Processing...' : `Request Payout (₹${(summary?.releasedForPayout || 0).toLocaleString('en-IN')})`}
        </button>
      </div>

      {/* Strict Release Rule Explanation Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(16, 185, 129, 0.05))',
          border: '1px solid var(--color-primary-light)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            ⚖️
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
              Strict Dual-Condition Commission Release Protocol
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              In accordance with PartSphere platform governance, earnings for DIFM installation and customer vehicle services
              must <strong>NEVER</strong> be released to workshop payout balances until <strong>BOTH</strong> conditions are satisfied:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>1️⃣</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Condition 1: Service Completion</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Workshop marks service job COMPLETED after physical fitment & inspection.
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>2️⃣</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Condition 2: Payment Clearance</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Customer Razorpay online payment captured or Cash-on-Delivery settled.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Financial Breakdown Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-title">Gross Service Value</div>
          <div className="stat-card-val">₹{(summary?.totalGross || 0).toLocaleString('en-IN')}</div>
          <div className="stat-card-sub">Total customer billing</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Platform Fee ({commissionRate}%)</div>
          <div className="stat-card-val" style={{ color: 'var(--color-primary)' }}>
            ₹{(summary?.platformCommission || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">PartSphere platform cut</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Net Workshop Revenue</div>
          <div className="stat-card-val" style={{ color: 'var(--color-text-primary)' }}>
            ₹{(summary?.netEarnings || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">{100 - commissionRate}% Shop share</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-card-title">Released for Payout</div>
          <div className="stat-card-val" style={{ color: '#10B981' }}>
            ₹{(summary?.releasedForPayout || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">Both conditions verified ✓</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-card-title">Locked (Pending Completion)</div>
          <div className="stat-card-val" style={{ color: '#F59E0B' }}>
            ₹{(summary?.lockedPendingCompletion || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">Awaiting job finish</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="stat-card-title">Locked (Pending Payment)</div>
          <div className="stat-card-val" style={{ color: '#EF4444' }}>
            ₹{(summary?.lockedPendingPayment || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">e.g. COD not yet collected</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Already Settled</div>
          <div className="stat-card-val" style={{ color: 'var(--color-text-muted)' }}>
            ₹{(summary?.alreadyPaidOut || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-sub">Paid out to bank</div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Commission Ledger Entries</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Detailed audit trail of all service bookings, cuts, and payout states.
            </p>
          </div>
          <span className="badge badge-neutral">{items.length} Transactions</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / Order</th>
                <th>Service Description</th>
                <th>Gross Fee</th>
                <th>Cut ({commissionRate}%)</th>
                <th>Net Payout</th>
                <th>Service Status</th>
                <th>Payment Status</th>
                <th>Release State</th>
                <th>Payout State</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => {
                const isReleased = entry.releaseStatus === 'RELEASED';
                const isPendingPayment = entry.releaseStatus === 'LOCKED_PENDING_PAYMENT';
                const isPendingCompletion = entry.releaseStatus === 'LOCKED_PENDING_COMPLETION';

                return (
                  <tr key={entry.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{entry.orderNumber || entry.id}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{entry.serviceName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Job ID: {entry.jobId || 'N/A'}</div>
                    </td>
                    <td>₹{Number(entry.grossAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--color-error)' }}>
                      -₹{Number(entry.commissionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>
                      ₹{Number(entry.shopPayout || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${entry.serviceStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                        {entry.serviceStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${entry.paymentStatus === 'PAID' ? 'badge-success' : 'badge-error'}`}>
                        {entry.paymentStatus} ({entry.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'ONLINE'})
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isReleased
                            ? 'badge-success'
                            : isPendingPayment
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}
                        title={
                          isReleased
                            ? 'Both conditions satisfied'
                            : isPendingPayment
                            ? 'Service finished, customer payment still pending'
                            : 'Service still in progress'
                        }
                      >
                        {isReleased
                          ? '✓ RELEASED'
                          : isPendingPayment
                          ? '⏳ PENDING PAYMENT'
                          : '⏳ PENDING SERVICE'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          entry.payoutStatus === 'PAID_OUT'
                            ? 'badge-neutral'
                            : entry.payoutStatus === 'RELEASED'
                            ? 'badge-success'
                            : 'badge-neutral'
                        }`}
                      >
                        {entry.payoutStatus === 'PAID_OUT'
                          ? `PAID (${entry.payoutRef || 'Settled'})`
                          : entry.payoutStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Confirmation Receipt Modal */}
      {payoutReceipt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'var(--color-success-bg)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  margin: '0 auto 0.75rem',
                }}
              >
                ✓
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Payout Settled Successfully!</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {payoutReceipt.message}
              </p>
            </div>

            <div
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payout Reference:</span>
                <strong style={{ fontFamily: 'monospace' }}>{payoutReceipt.payoutRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Amount Disbursed:</span>
                <strong style={{ color: '#10B981' }}>₹{payoutReceipt.totalPayout?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Transactions Settled:</span>
                <span>{payoutReceipt.itemsCount} Jobs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Disbursement Date:</span>
                <span>{new Date(payoutReceipt.settledAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setPayoutReceipt(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Done & Return to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionLedgerPage;
