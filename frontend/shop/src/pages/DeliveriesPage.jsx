import React, { useState, useEffect } from 'react';
import shopService from '../services/shopService';
import toast from 'react-hot-toast';

export const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivingId, setReceivingId] = useState(null);
  const [receivedBy, setReceivedBy] = useState('Shop Storekeeper');

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await shopService.getDeliveries();
      setDeliveries(res.data || []);
    } catch (err) {
      toast.error('Failed to load incoming deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleReceive = async (delId) => {
    setReceivingId(delId);
    try {
      await shopService.receiveDelivery(delId, receivedBy);
      toast.success('Parts package verified and accepted into workshop inventory.');
      fetchDeliveries();
    } catch (err) {
      toast.error('Failed to confirm delivery receipt.');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Incoming Product Deliveries</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Parts dispatched from PartsNexa logistics hubs directly to your workshop for customer DIFM jobs.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading delivery manifests...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>No Active Deliveries</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            All incoming shipments have been received and verified.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deliveries.map((del) => {
            const isDelivered = del.status === 'DELIVERED';
            return (
              <div
                key={del.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderLeft: `4px solid ${isDelivered ? '#10B981' : '#F59E0B'}`,
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: isDelivered ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                      color: isDelivered ? '#10B981' : '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      flexShrink: 0,
                    }}
                  >
                    {isDelivered ? '📦' : '🚚'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{del.trackingNumber}</span>
                      <span className={`badge ${isDelivered ? 'badge-success' : 'badge-warning'}`}>
                        {del.status}
                      </span>
                      {del.relatedJobId && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          Linked to Job {del.relatedJobId}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {(del.items || []).map((it) => `${it.productName || it.name} (Qty: ${it.quantity})`).join(', ') || 'Assorted Automotive Components'}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      Carrier: <strong>{del.carrier}</strong> • Order Ref: <strong>{del.orderNumber || 'PN-Direct'}</strong>
                      {isDelivered && del.receivedBy && ` • Received by: ${del.receivedBy}`}
                    </div>
                  </div>
                </div>

                <div>
                  {isDelivered ? (
                    <div style={{ fontSize: '0.825rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      ✓ Received & In Workshop
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimated Arrival</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{del.eta}</div>
                      </div>
                      <button
                        onClick={() => handleReceive(del.id)}
                        disabled={receivingId === del.id}
                        className="btn btn-primary btn-sm"
                      >
                        {receivingId === del.id ? 'Verifying...' : 'Confirm Receipt ✓'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
