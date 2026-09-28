import React from 'react';

export default function SupplierComparisonModal({ isOpen, onClose, selectedItem, onSelectSupplierOption }) {
  if (!isOpen || !selectedItem) return null;

  const currentOption = selectedItem;
  const comparableOptions = selectedItem.comparableOptions || [];
  const allOptions = [currentOption, ...comparableOptions];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '850px',
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
              <span style={{ fontSize: '1.3rem' }}>⚖️</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Supplier Comparison Matrix
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Comparing suppliers offering compatible parts for <strong>{selectedItem.vehicleMakeName} {selectedItem.vehicleModelName}</strong> ({selectedItem.categoryName})
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

        {/* Content Table */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            ℹ️ Objective market comparison based on verified catalog pricing, Minimum Order Quantity (MOQ), warehouse stock, and dispatch lead times.
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Supplier / Entity</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Part Name & Brand</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bulk Price</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>MOQ</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Time</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stock</th>
                  <th style={{ padding: '0.75rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allOptions.map((opt, idx) => {
                  const isCurrent = opt.id === currentOption.id;
                  const supplierName = opt.supplier?.name || 'Supplier';

                  return (
                    <tr
                      key={opt.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isCurrent ? 'var(--color-primary-bg, rgba(2, 132, 199, 0.05))' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{supplierName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {opt.supplier?.supplierType || 'DISTRIBUTOR'} • {opt.supplier?.city || 'India'}
                        </div>
                        {isCurrent && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: 'var(--admin-blue)',
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '0.2rem',
                            }}
                          >
                            Currently Selected
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{opt.partName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Brand: <strong>{opt.brandName}</strong> • {opt.partNumber}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        ₹{Number(opt.unitPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 800, color: 'var(--color-success)', fontSize: '0.92rem' }}>
                        ₹{Number(opt.bulkPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem' }}>
                        <strong>{opt.moq}</strong> units
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        ⏱️ {opt.leadTime || `${opt.leadTimeDays} days`}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.85rem' }}>
                        <span style={{ color: opt.stockQuantity > 50 ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                          {opt.stockQuantity}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            onSelectSupplierOption(opt);
                            onClose();
                          }}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            backgroundColor: isCurrent ? 'var(--admin-blue)' : 'var(--bg-tertiary)',
                            color: isCurrent ? '#FFFFFF' : 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isCurrent ? 'Select' : 'Choose'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
