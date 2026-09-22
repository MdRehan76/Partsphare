import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // KYC Inspection Modal
  const [inspectPartner, setInspectPartner] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await adminService.listDeliveryPartners({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setPartners(data);
    } catch (err) {
      toast.error('Failed to load delivery fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleVerifyKyc = async (status, rejectionReason = '') => {
    if (!inspectPartner) return;
    setIsVerifying(true);
    try {
      await adminService.verifyDeliveryPartnerKyc(inspectPartner.id, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Documents rejected by compliance desk' : undefined,
      });
      toast.success(`Partner KYC marked as ${status} and activation updated.`);
      setInspectPartner(null);
      fetchPartners();
    } catch (err) {
      toast.error('Failed to verify partner KYC.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleActivation = async (partner) => {
    const nextState = !partner.isActivated;
    try {
      await adminService.togglePartnerActivation(partner.id, nextState);
      toast.success(`Partner ${partner.driverName} ${nextState ? 'activated' : 'deactivated'}.`);
      fetchPartners();
    } catch (err) {
      toast.error('Failed to update partner activation status.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Delivery Fleet & KYC Verification
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Review rider licenses, approve vehicle registrations, inspect KYC documents, and monitor live fleet duty states.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); fetchPartners(); }} className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by vehicle number, rider name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All KYC States</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
          <button onClick={() => { setSearch(''); setStatusFilter(''); fetchPartners(); }} className="btn btn-secondary btn-sm">
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
                <th>Rider & Contact</th>
                <th>Vehicle & Plate</th>
                <th>Duty & Telemetry</th>
                <th>Deliveries</th>
                <th>COD Cash in Hand</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading delivery fleet...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No delivery partner records found.
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.driverName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.driverEmail}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.driverPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.vehicleNum || 'Plate Pending'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.vehicleType || 'Two-Wheeler'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: p.isOnline ? 'var(--color-success)' : 'var(--text-muted)',
                          }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: p.isOnline ? 'var(--color-success)' : 'var(--text-muted)' }}>
                          {p.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ★ {p.rating || 4.9} Rating • {p.activeTrips || 0} active trips
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.completedDeliveries || 0} Delivered</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: Number(p.cashInHand) > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                        ₹{Number(p.cashInHand || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.kycStatus === 'APPROVED'
                            ? 'badge-success'
                            : p.kycStatus === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {p.kycStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setInspectPartner(p)}
                          className="btn btn-sm btn-secondary"
                        >
                          Inspect KYC
                        </button>
                        <button
                          onClick={() => handleToggleActivation(p)}
                          className={`btn btn-sm ${p.isActivated ? 'btn-danger' : 'btn-success'}`}
                        >
                          {p.isActivated ? 'Deactivate' : 'Activate'}
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

      {/* KYC Inspection Modal */}
      {inspectPartner && (
        <div className="modal-overlay" onClick={() => setInspectPartner(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  KYC Review: {inspectPartner.driverName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Vehicle: {inspectPartner.vehicleNum} ({inspectPartner.vehicleType})
                </div>
              </div>
              <button onClick={() => setInspectPartner(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                Uploaded Identity & Vehicle Documents
              </h4>

              {inspectPartner.kycDocuments && inspectPartner.kycDocuments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {inspectPartner.kycDocuments.map((doc, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        {doc.documentType.replace('_', ' ')}
                      </div>
                      <div
                        style={{
                          height: '110px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--border-color)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {doc.fileUrl ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.documentType}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📄</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span className={`badge ${doc.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                          {doc.verificationStatus}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {doc.mimeType || 'image/jpeg'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No documents uploaded yet for this driver.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => handleVerifyKyc('REJECTED', 'Documents incomplete or illegible')}
                disabled={isVerifying}
                className="btn btn-danger"
              >
                Reject KYC
              </button>
              <button
                type="button"
                onClick={() => handleVerifyKyc('APPROVED')}
                disabled={isVerifying}
                className="btn btn-success"
              >
                Approve & Activate Fleet Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
