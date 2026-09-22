import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

export default function DeliveriesOversightPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reassignModalItem, setReassignModalItem] = useState(null);
  const [targetPartnerId, setTargetPartnerId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [delData, partData] = await Promise.all([
        adminService.listDeliveries({ status: statusFilter || undefined }),
        adminService.listDeliveryPartners(),
      ]);
      setDeliveries(delData);
      setPartners(partData);
    } catch (err) {
      toast.error('Failed to load fleet deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!targetPartnerId) {
      return toast.error('Please select an active delivery partner.');
    }

    try {
      await adminService.reassignDelivery(reassignModalItem.id, targetPartnerId);
      toast.success('Trip assigned to partner successfully.');
      setReassignModalItem(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to reassign trip.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Live Delivery Dispatches & Logistics Oversight
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor active dispatch assignments, pickup hubs, customer drops, COD collections, and manual re-routing.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Trip States</option>
            <option value="ASSIGNED">Broadcast / Unassigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <button onClick={() => { setStatusFilter(''); fetchData(); }} className="btn btn-secondary btn-sm">
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
                <th>Order / Assignment</th>
                <th>Trip Type</th>
                <th>Pickup Location</th>
                <th>Drop Destination</th>
                <th>Assigned Partner</th>
                <th>COD Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No delivery assignments matching criteria.
                  </td>
                </tr>
              ) : (
                deliveries.map((a) => {
                  const partner = partners.find((p) => p.id === a.deliveryPartnerId);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{a.orderNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {a.id}</div>
                      </td>
                      <td>
                        <span className={`badge ${a.type === 'USED_PART_PICKUP' ? 'badge-purple' : 'badge-primary'}`}>
                          {a.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {a.pickupLocation?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.pickupLocation?.address?.slice(0, 35)}...
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {a.dropLocation?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.dropLocation?.address?.slice(0, 35)}...
                        </div>
                      </td>
                      <td>
                        {partner ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{partner.driverName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{partner.vehicleNum}</div>
                          </div>
                        ) : (
                          <span className="badge badge-warning">UNASSIGNED POOL</span>
                        )}
                      </td>
                      <td>
                        {a.codAmountToCollect > 0 ? (
                          <div style={{ fontWeight: 800, color: 'var(--color-warning)' }}>
                            ₹{Number(a.codAmountToCollect).toLocaleString('en-IN')}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({a.codStatus})</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Prepaid (₹0)</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            a.status === 'DELIVERED'
                              ? 'badge-success'
                              : a.status === 'IN_TRANSIT'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => { setReassignModalItem(a); setTargetPartnerId(a.deliveryPartnerId || ''); }}
                          className="btn btn-sm btn-secondary"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModalItem && (
        <div className="modal-overlay" onClick={() => setReassignModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Dispatch / Reassign Trip: {reassignModalItem.orderNumber}
              </h3>
              <button onClick={() => setReassignModalItem(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleReassign}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Assign order <strong>{reassignModalItem.orderNumber}</strong> to an approved driver.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Select Delivery Partner
                  </label>
                  <select
                    value={targetPartnerId}
                    onChange={(e) => setTargetPartnerId(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  >
                    <option value="">-- Choose Driver --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.driverName} ({p.vehicleNum} - {p.isOnline ? 'ONLINE' : 'OFFLINE'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setReassignModalItem(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Dispatch Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
