import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [orderList, shopList, partnerList] = await Promise.all([
        adminService.listOrders({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: search.trim() ? search.trim() : undefined,
        }),
        adminService.listShops(),
        adminService.listDeliveryPartners(),
      ]);
      setOrders(orderList || []);
      setShops(shopList || []);
      setPartners(partnerList || []);
    } catch (err) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignDelivery = async (orderId, deliveryPartnerId) => {
    try {
      await adminService.assignOrderDelivery(orderId, deliveryPartnerId);
      toast.success('Assigned delivery partner successfully.');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const partner = partners.find((p) => p.id === deliveryPartnerId);
        setSelectedOrder((prev) => ({
          ...prev,
          deliveryPartnerName: partner?.driverName || 'Assigned Partner',
          deliveryStatus: 'ACCEPTED',
        }));
      }
    } catch (err) {
      toast.error('Failed to assign delivery partner.');
    }
  };

  const handleAssignDifm = async (orderId, shopId) => {
    try {
      await adminService.assignOrderDifm(orderId, shopId);
      toast.success('Assigned workshop partner for DIFM installation.');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const shop = shops.find((s) => s.id === shopId);
        setSelectedOrder((prev) => ({
          ...prev,
          difmShop: shop?.name || 'Assigned Workshop',
          difmStatus: 'SCHEDULED',
        }));
      }
    } catch (err) {
      toast.error('Failed to assign workshop partner.');
    }
  };

  // Calculated stats
  const totalCount = orders.length;
  const inTransitCount = orders.filter((o) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPPED'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const difmCount = orders.filter((o) => o.difmType && o.difmType !== 'NO_INSTALLATION').length;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Orders & DIFM Operations Management
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor live fulfillment states, customer dispatches, payments, and mechanical workshop installations.
        </p>
      </div>

      {/* KPI Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Orders
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {totalCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            In-Flight Dispatches
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.2rem' }}>
            {inTransitCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Delivered & Paid
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {deliveredCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DIFM Installations
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.2rem' }}>
            {difmCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Email, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading orders from database...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ORDER #</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AMOUNT</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DELIVERY</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DIFM</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {o.orderNumber || o.id.slice(0, 10)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        className={`badge ${
                          o.status === 'DELIVERED'
                            ? 'badge-success'
                            : o.status === 'CANCELLED'
                            ? 'badge-danger'
                            : o.status === 'PROCESSING' || o.status === 'CONFIRMED'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {o.paymentMethod}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: o.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {o.deliveryPartnerName ? (
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{o.deliveryPartnerName}</div>
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>{o.deliveryStatus || 'ASSIGNED'}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned Fleet</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {o.difmType && o.difmType !== 'NO_INSTALLATION' ? (
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8b5cf6' }}>
                            {o.difmShop || 'Workshop Pending'}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.difmType}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parts Only</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedOrder(o)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Management Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Order #{selectedOrder.orderNumber || selectedOrder.id}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Customer Information
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.customerName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedOrder.customerEmail} • {selectedOrder.customerPhone}
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Items Ordered ({selectedOrder.items?.length || 1})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div
                    key={it.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {it.product?.name || it.title || 'Automotive Component'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Qty: {it.quantity || 1} • Unit: ₹{Number(it.unitPrice || it.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{Number(it.totalPrice || (it.price * (it.quantity || 1)) || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                <span>Total Amount:</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick Actions & Assignments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Lifecycle Status Update */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Update Fulfillment Status:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.2rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: selectedOrder.status === st ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        backgroundColor: selectedOrder.status === st ? 'var(--color-primary-bg)' : 'transparent',
                        color: selectedOrder.status === st ? 'var(--color-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {st.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Assignment Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Assign Delivery Partner:
                </label>
                <select
                  className="form-input"
                  value={partners.find((p) => p.driverName === selectedOrder.deliveryPartnerName)?.id || ''}
                  onChange={(e) => handleAssignDelivery(selectedOrder.id, e.target.value)}
                >
                  <option value="">-- Select Rider from Fleet --</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.driverName} ({p.vehicleType || 'Bike'} - {p.vehicleNum || 'Rider'})
                    </option>
                  ))}
                </select>
              </div>

              {/* DIFM Workshop Assignment Dropdown */}
              {selectedOrder.difmType && selectedOrder.difmType !== 'NO_INSTALLATION' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Assign Mechanical Workshop (DIFM):
                  </label>
                  <select
                    className="form-input"
                    value={shops.find((s) => s.name === selectedOrder.difmShop)?.id || ''}
                    onChange={(e) => handleAssignDifm(selectedOrder.id, e.target.value)}
                  >
                    <option value="">-- Select Certified Workshop --</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city || 'Metro'}) • Commission: {s.commissionRate || 12}%
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
