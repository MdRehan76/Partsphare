import React, { useState } from 'react';
import toast from 'react-hot-toast';
import procurementService from '../../../services/procurementService';

export default function ProcurementCartDrawer({ isOpen, onClose, cartData, onCartUpdated, onPoCreated }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('DEMO_PAYMENT');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const items = cartData?.items || [];
  const summary = cartData?.financialSummary || {
    subtotal: 0,
    bulkDiscount: 0,
    netProcurementCost: 0,
    tax: 0,
    shipping: 0,
    handling: 0,
    grandTotal: 0,
  };

  const handleUpdateQty = async (itemId, newQty, moq) => {
    if (newQty < moq) {
      toast.error(`Minimum Order Quantity (MOQ) for this part is ${moq}`);
      return;
    }
    try {
      const updated = await procurementService.updateCartItemQuantity(itemId, newQty);
      onCartUpdated(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const updated = await procurementService.removeFromCart(itemId);
      toast.success('Item removed from procurement cart.');
      onCartUpdated(updated);
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from procurement cart?')) return;
    try {
      const updated = await procurementService.clearCart();
      toast.success('Procurement cart cleared.');
      onCartUpdated(updated);
    } catch (err) {
      toast.error('Failed to clear cart.');
    }
  };

  const handleCreatePO = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const po = await procurementService.createPurchaseOrder({
        paymentMethod,
        notes: notes || 'Admin Procurement Order',
      });
      toast.success(`Purchase Order created successfully!`);
      onPoCreated(po);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🛒</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Procurement Cart
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Admin Inbound Order • {items.length} item(s) selected
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {items.length > 0 && (
              <button
                onClick={handleClear}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-danger, #EF4444)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                Clear Cart
              </button>
            )}
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
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Procurement Cart is Empty
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Browse the supplier catalog, select spare parts, and add bulk quantities to create a Purchase Order.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => {
                const cItem = item.catalogItem;
                const moq = cItem.moq || 1;
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-blue)', textTransform: 'uppercase' }}>
                          {cItem.supplier?.name || 'Approved Supplier'}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.15rem' }}>
                          {cItem.partName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Part No: <strong>{cItem.partNumber}</strong> • Brand: <strong>{cItem.brandName}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Compatibility: <strong>{cItem.vehicleMakeName} {cItem.vehicleModelName} ({cItem.variantName || 'All'})</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger, #EF4444)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.25rem',
                        }}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Pricing & Quantity Controls */}
                    <div
                      style={{
                        marginTop: '0.85rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px dashed var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      {/* Quantity Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty:</span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity - 5, moq)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={moq}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQty(item.id, Number(e.target.value), moq)}
                            style={{
                              width: '55px',
                              textAlign: 'center',
                              border: 'none',
                              padding: '0.3rem',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          />
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity + 5, moq)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(MOQ: {moq})</span>
                      </div>

                      {/* Item Total & Tier Discount */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ₹{(item.itemTotal || item.subtotal || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-success)' }}>
                          @ ₹{item.effectiveUnitPrice || item.unitPrice} each
                          {item.itemDiscount > 0 && ` (Saved ₹${item.itemDiscount.toLocaleString()})`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer & Order Placement */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {/* Financial Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal (Regular Price):</span>
                <span>₹{summary.subtotal.toLocaleString()}</span>
              </div>
              {summary.bulkDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                  <span>Bulk Tier Savings:</span>
                  <span>-₹{summary.bulkDiscount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Net Part Cost:</span>
                <span>₹{summary.netProcurementCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>GST (18% Inbound Tax):</span>
                <span>₹{summary.tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Freight / Logistics:</span>
                <span>{summary.shipping === 0 ? 'FREE (Orders > ₹50,000)' : `₹${summary.shipping.toLocaleString()}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--admin-blue)' }}>₹{summary.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  PAYMENT TERMS
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="DEMO_PAYMENT">Demo Payment</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI Institutional</option>
                  <option value="CREDIT_TERMS">Net-30 Credit Terms</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  PURCHASE ORDER NOTES
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Inbound Hub Stock"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
            </div>

            {/* Submit PO Button */}
            <button
              onClick={handleCreatePO}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--admin-blue)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? 'Creating Purchase Order...' : '📑 Create Purchase Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
