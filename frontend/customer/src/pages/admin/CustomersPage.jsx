import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.listCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateCustomerStatus(customer.id, newStatus);
      toast.success(`Customer account ${customer.fullName} marked as ${newStatus}.`);
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to update customer status.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer Management
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Oversee registered customer accounts, garages, order volumes, and account access states.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
          <button onClick={() => { setSearch(''); setStatusFilter(''); fetchCustomers(); }} className="btn btn-secondary btn-sm">
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
                <th>Customer</th>
                <th>Contact</th>
                <th>Garage Vehicles</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading customers directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No customer accounts match the filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary-bg)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {c.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.email}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span
                        onClick={() => setSelectedCustomer(c)}
                        style={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textDecoration: 'underline',
                        }}
                      >
                        {c.vehicleCount} Vehicles
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.orderCount} Orders</td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`btn btn-sm ${c.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Garage Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedCustomer.fullName}'s Garage
              </h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="modal-body">
              {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {selectedCustomer.vehicles.map((v, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {v.customName || `${v.variantId || 'Registered Vehicle'}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Plate Number: {v.regNumber || 'Not recorded'} • Primary: {v.isPrimary ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No vehicles registered in this customer's garage yet.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedCustomer(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
