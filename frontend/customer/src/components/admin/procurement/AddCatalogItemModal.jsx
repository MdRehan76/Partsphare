import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import procurementService from '../../../services/procurementService';

export default function AddCatalogItemModal({ isOpen, onClose, suppliers, onItemAdded }) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: suppliers?.[0]?.id || '',
    partName: '',
    partNumber: '',
    categoryName: 'Brake System',
    brandName: 'Bosch',
    vehicleMakeName: 'Tata',
    vehicleModelName: 'Nexon',
    variantName: 'XZ 1.2 Petrol',
    year: 2023,
    unitPrice: 2000,
    bulkPrice: 1600,
    moq: 10,
    stockQuantity: 500,
    warranty: '12 Months Manufacturer Warranty',
    leadTime: '3–5 days',
    leadTimeDays: 3,
  });

  useEffect(() => {
    if (suppliers?.length > 0 && !formData.supplierId) {
      setFormData((prev) => ({ ...prev, supplierId: suppliers[0].id }));
    }
  }, [suppliers]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const v = await procurementService.getVehicles();
        setVehicles(v || []);
      } catch {
        // Fallback
      }
    };
    if (isOpen) fetchVehicles();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partName || !formData.partNumber || !formData.supplierId) {
      toast.error('Please enter Part Name, Part Number and select Supplier.');
      return;
    }

    setLoading(true);
    try {
      const tiers = [
        { minQuantity: 1, maxQuantity: Number(formData.moq) - 1, unitPrice: Number(formData.unitPrice) },
        { minQuantity: Number(formData.moq), maxQuantity: null, unitPrice: Number(formData.bulkPrice) },
      ];

      const item = await procurementService.addCatalogItem({
        ...formData,
        bulkPriceTiers: tiers,
      });

      toast.success(`Catalog item '${item.partName}' added successfully!`);
      if (onItemAdded) onItemAdded(item);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add catalog item.');
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
          maxWidth: '650px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
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
              <span style={{ fontSize: '1.3rem' }}>📦</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Add Part to Supplier Catalog
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Define spare part with separate brand & vehicle manufacturer relationships (Section 28)
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              SUPPLIER *
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.supplierType} • {s.city || 'India'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                PART NAME *
              </label>
              <input
                type="text"
                required
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                placeholder="e.g. Ceramic Front Brake Pad Set"
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
                PART NUMBER *
              </label>
              <input
                type="text"
                required
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="e.g. BP-TN-204"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                SPARE-PART BRAND *
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Bosch / Brembo / Exide"
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
                PART CATEGORY *
              </label>
              <select
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="Brake System">Brake System</option>
                <option value="Engine Components">Engine Components</option>
                <option value="Battery">Battery</option>
                <option value="Electrical">Electrical</option>
                <option value="Lighting">Lighting</option>
                <option value="Suspension">Suspension</option>
                <option value="Steering">Steering</option>
                <option value="Filters">Filters</option>
                <option value="Lubricants">Lubricants</option>
                <option value="Cooling System">Cooling System</option>
                <option value="Sensors">Sensors</option>
                <option value="Clutch & Transmission">Clutch & Transmission</option>
                <option value="Body Parts">Body Parts</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Vehicle Compatibility */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              🚗 Vehicle Fitment (Separate from Brand)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>MANUFACTURER</label>
                <input
                  type="text"
                  value={formData.vehicleMakeName}
                  onChange={(e) => setFormData({ ...formData, vehicleMakeName: e.target.value })}
                  placeholder="Tata"
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>MODEL</label>
                <input
                  type="text"
                  value={formData.vehicleModelName}
                  onChange={(e) => setFormData({ ...formData, vehicleModelName: e.target.value })}
                  placeholder="Nexon"
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>VARIANT</label>
                <input
                  type="text"
                  value={formData.variantName}
                  onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                  placeholder="XZ 1.2 Petrol"
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>UNIT PRICE (₹)</label>
              <input
                type="number"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>BULK PRICE (₹)</label>
              <input
                type="number"
                required
                value={formData.bulkPrice}
                onChange={(e) => setFormData({ ...formData, bulkPrice: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>MOQ</label>
              <input
                type="number"
                min="1"
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>STOCK</label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
          </div>

          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={loading}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--admin-blue)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Adding...' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
