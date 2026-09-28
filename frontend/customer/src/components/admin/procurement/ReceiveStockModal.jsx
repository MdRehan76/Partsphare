import React, { useState } from 'react';
import toast from 'react-hot-toast';
import procurementService from '../../../services/procurementService';

export default function ReceiveStockModal({ isOpen, onClose, purchaseOrder, onStockReceived }) {
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState('PartNexa Central Logistics Hub Fleet');
  const [trackingNumber, setTrackingNumber] = useState(`INB-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');

  if (!isOpen || !purchaseOrder) return null;

  // Initialize quantities to receive with remaining quantities
  const [receiveQuantities, setReceiveQuantities] = useState(() => {
    const initial = {};
    purchaseOrder.items?.forEach((item) => {
      const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      initial[item.id] = remaining;
    });
    return initial;
  });

  const handleQtyChange = (itemId, val, maxAllowed) => {
    const parsed = Math.max(0, Math.min(maxAllowed, Number(val)));
    setReceiveQuantities((prev) => ({
      ...prev,
      [itemId]: parsed,
    }));
  };

  const handleReceiveStock = async () => {
    const payloadItems = Object.entries(receiveQuantities)
      .map(([poItemId, qty]) => ({
        poItemId,
        quantityToReceive: Number(qty),
      }))
      .filter((i) => i.quantityToReceive > 0);

    if (payloadItems.length === 0) {
      toast.error('Please enter at least 1 unit to receive.');
      return;
    }

    setLoading(true);
    try {
      const result = await procurementService.receiveStock(purchaseOrder.id, {
        items: payloadItems,
        carrier,
        trackingNumber,
        notes: notes || `Goods received for ${purchaseOrder.poNumber}`,
      });

      toast.success(
        `✅ Goods Received! ${result.goodsReceipt?.receiptNumber} recorded. Shared Inventory increased by +${payloadItems.reduce(
          (sum, i) => sum + i.quantityToReceive,
          0
        )} units.`
      );

      if (onStockReceived) onStockReceived(result);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record goods receipt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>📥</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Receive Inbound Stock
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              PO #{purchaseOrder.poNumber} • Supplier: <strong>{purchaseOrder.supplier?.name}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-bg, rgba(2, 132, 199, 0.08))',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            ⚡ <strong>Shared Database Stock Intake:</strong> Upon confirming receipt, the received quantities will immediately update the shared PostgreSQL catalog inventory, generate an auditable <code>StockMovement</code> record, and become live for customer and workshop orders.
          </div>

          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Items in Purchase Order
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {purchaseOrder.items?.map((item) => {
              const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
              const isFullyReceived = remaining === 0;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      {item.partName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Part No: {item.partNumber} • Brand: {item.brandName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Compatibility: {item.vehicleCompatibility || 'Standard'}
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', gap: '0.85rem' }}>
                      <span>Ordered: <strong>{item.orderedQuantity}</strong></span>
                      <span>Previously Received: <strong style={{ color: 'var(--color-success)' }}>{item.receivedQuantity}</strong></span>
                      <span>Remaining: <strong style={{ color: remaining > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>{remaining}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      RECEIVE NOW
                    </label>
                    {isFullyReceived ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--color-success)',
                          backgroundColor: 'var(--color-success-bg)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        ✓ Completed
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={receiveQuantities[item.id] !== undefined ? receiveQuantities[item.id] : remaining}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, remaining)}
                        style={{
                          width: '90px',
                          textAlign: 'center',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '2px solid var(--admin-blue)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inbound Shipment Tracking Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                INBOUND CARRIER / VEHICLE
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Supplier Inbound Truck"
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                WAYBILL / TRACKING REF
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. AWB-998821"
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              RECEIVING INSPECTION NOTES
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Packaging intact, seal unbroken, passed preliminary quality check"
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleReceiveStock}
            disabled={loading}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--color-success)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            }}
          >
            {loading ? 'Receiving Stock...' : '✓ Confirm Stock Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}
