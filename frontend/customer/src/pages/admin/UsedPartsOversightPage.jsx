import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function UsedPartsOversightPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [valuationInput, setValuationInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsedParts({ status: statusFilter || undefined });
      setListings(data);
    } catch (err) {
      toast.error('Failed to load used parts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleQuickVerify = async (item, status) => {
    try {
      await adminService.verifyUsedPart(item.id, status);
      toast.success(`Used part inspection marked as ${status}.`);
      fetchListings();
    } catch (err) {
      toast.error('Failed to update verification status.');
    }
  };

  const handleQuickPayout = async (item) => {
    try {
      await adminService.payoutUsedPart(item.id);
      toast.success(`Seller payout of ₹${item.payoutAmount || Math.round(item.finalValuation * 0.9)} released.`);
      fetchListings();
    } catch (err) {
      toast.error('Failed to release payout.');
    }
  };

  const handleSaveValuation = async (e) => {
    e.preventDefault();
    try {
      await adminService.valueUsedPart(editingItem.id, Number(valuationInput));
      toast.success(`Valuation of ₹${valuationInput} saved (Seller payout: ₹${Math.round(valuationInput * 0.9)}).`);
      setEditingItem(null);
      fetchListings();
    } catch (err) {
      toast.error('Failed to update valuation.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Customer Used-Parts Circular Marketplace Oversight
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor technician doorstep inspection results, condition grading, final valuations, and seller payouts.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Marketplace States</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VERIFICATION_PENDING">Verification Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="VALUED">Valued</option>
            <option value="PAYOUT_PENDING">Payout Pending</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={() => { setStatusFilter(''); fetchListings(); }} className="btn btn-secondary btn-sm">
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Part Details</th>
                <th>Seller & Location</th>
                <th>Condition</th>
                <th>Verification</th>
                <th>Valuation & Payout</th>
                <th>Lifecycle Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading used parts marketplace...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No used part listings found.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Vehicle: {item.vehicleModel} • Part No: {item.partNumber || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.seller?.fullName || item.sellerName || 'Customer Seller'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.location || 'Pan-India'}</div>
                    </td>
                    <td>
                      <div>
                        <span className="badge badge-info">{item.condition}</span>
                        {item.conditionGrade && (
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                            Grade {item.conditionGrade}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.verificationStatus === 'VERIFIED'
                            ? 'badge-success'
                            : item.verificationStatus === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {item.verificationStatus || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Asking: ₹{item.expectedPrice || item.askingPrice || 0}
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                        Val: ₹{item.finalValuation || item.valuationAmount || 'Pending'}
                      </div>
                      {(item.payoutAmount || item.finalValuation) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>
                          Payout: ₹{item.payoutAmount || Math.round(Number(item.finalValuation) * 0.9)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'VALUED' || item.status === 'VERIFIED' || item.status === 'SOLD' || item.status === 'PAID'
                            ? 'badge-success'
                            : item.status === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.payoutStatus === 'PAID' && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                          ✓ Paid to seller
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {item.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleQuickVerify(item, 'VERIFIED')}
                            className="btn btn-sm btn-success"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn btn-sm btn-secondary"
                        >
                          Value
                        </button>
                        {item.status !== 'PAID' && item.status !== 'SOLD' && (item.finalValuation || item.valuationAmount) && (
                          <button
                            onClick={() => handleQuickPayout(item)}
                            className="btn btn-sm btn-primary"
                          >
                            Payout
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Set Authorized Valuation: {editingItem.title}
              </h3>
              <button onClick={() => setEditingItem(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSaveValuation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Authorized Valuation Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={valuationInput}
                    onChange={(e) => setValuationInput(e.target.value)}
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Customer asking price: ₹{editingItem.expectedPrice || editingItem.askingPrice || 0}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 700, marginTop: '0.2rem' }}>
                    Seller Payout (90%): ₹{Math.round(Number(valuationInput || 0) * 0.9)} • PartSphere Margin: ₹{Math.round(Number(valuationInput || 0) * 0.1)}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Authorize Valuation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
