import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function ShopsManagementPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Commission Edit Modal State
  const [commissionModalShop, setCommissionModalShop] = useState(null);
  const [commissionRateInput, setCommissionRateInput] = useState('');
  const [isSubmittingCommission, setIsSubmittingCommission] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await adminService.listShops({
        status: statusFilter || undefined,
        city: cityFilter || undefined,
        search: search || undefined,
      });
      setShops(data);
    } catch (err) {
      toast.error('Failed to load mechanical workshops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [statusFilter, cityFilter]);

  const handleVerify = async (shopId, status) => {
    try {
      await adminService.verifyShop(shopId, { status });
      toast.success(`Workshop status set to ${status}.`);
      fetchShops();
    } catch (err) {
      toast.error('Failed to update verification status.');
    }
  };

  const handleOpenCommissionModal = (shop) => {
    setCommissionModalShop(shop);
    setCommissionRateInput(shop.commissionRate || 12);
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    const rate = Number(commissionRateInput);

    if (isNaN(rate) || rate < 10 || rate > 15) {
      return toast.error('Commission rate must be strictly configured between 10.0% and 15.0%.');
    }

    setIsSubmittingCommission(true);
    try {
      await adminService.updateShopCommission(commissionModalShop.id, rate);
      toast.success(`Commission rate for ${commissionModalShop.name} updated to ${rate}%.`);
      setCommissionModalShop(null);
      fetchShops();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update commission rate.';
      toast.error(msg);
    } finally {
      setIsSubmittingCommission(false);
    }
  };

  const handleToggleActive = async (shop) => {
    const nextActive = !shop.isActive;
    try {
      await adminService.toggleShopStatus(shop.id, nextActive);
      toast.success(`Workshop ${shop.name} is now ${nextActive ? 'activated' : 'deactivated'}.`);
      fetchShops();
    } catch (err) {
      toast.error('Failed to update workshop activation state.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Mechanical Workshop Management
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Review partner onboarding, approve verified facilities, configure 10%–15% commission rates, and manage activation states.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); fetchShops(); }} className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search workshop name, owner, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Verifications</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
          </select>

          <button onClick={() => { setSearch(''); setStatusFilter(''); setCityFilter(''); fetchShops(); }} className="btn btn-secondary btn-sm">
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
                <th>Workshop</th>
                <th>Owner & Location</th>
                <th>Commission Rate</th>
                <th>DIFM Jobs</th>
                <th>Total Earned</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading workshops...
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No workshop records found.
                  </td>
                </tr>
              ) : (
                shops.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rating ★ {s.rating || 4.8} ({s.totalRatings || 0} reviews)</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {s.owner ? `${s.owner.firstName} ${s.owner.lastName}`.trim() : (s.ownerName || 'Workshop Partner')}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.city}, {s.state || 'KA'} - {s.pincode}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                          {s.commissionRate}%
                        </span>
                        <button
                          onClick={() => handleOpenCommissionModal(s)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-tertiary)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bounds: 10% - 15%</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.totalJobs} Total</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>{s.completedJobs} Completed</div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{s.totalEarned.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.verificationStatus === 'VERIFIED'
                            ? 'badge-success'
                            : s.verificationStatus === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {s.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.isActive !== false ? 'badge-success' : 'badge-secondary'}`}>
                        {s.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {s.verificationStatus !== 'VERIFIED' ? (
                          <button
                            onClick={() => handleVerify(s.id, 'VERIFIED')}
                            className="btn btn-sm btn-success"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(s.id, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`btn btn-sm ${s.isActive !== false ? 'btn-secondary' : 'btn-primary'}`}
                        >
                          {s.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Modal */}
      {commissionModalShop && (
        <div className="modal-overlay" onClick={() => setCommissionModalShop(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Configure Commission: {commissionModalShop.name}
              </h3>
              <button onClick={() => setCommissionModalShop(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSaveCommission}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Platform rules dictate that workshop DIFM service commission rates must be strictly bounded between <strong>10.0%</strong> and <strong>15.0%</strong>.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="15"
                    value={commissionRateInput}
                    onChange={(e) => setCommissionRateInput(e.target.value)}
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Standard default: 12.0% • Allowed range: 10.0% to 15.0%
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setCommissionModalShop(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingCommission} className="btn btn-primary">
                  {isSubmittingCommission ? 'Saving...' : 'Apply Commission Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
