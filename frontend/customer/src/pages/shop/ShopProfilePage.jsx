import React, { useState, useEffect } from 'react';
import { useShopAuth } from '../../contexts/ShopAuthContext';
import shopService from '../../services/shopService';
import toast from 'react-hot-toast';

const AVAILABLE_SERVICES = [
  'Brake Fitment & Polish',
  'Battery Replacement & Diagnostics',
  'Engine Diagnostics & Tuning',
  'Doorstep Mechanic Visit',
  'Periodic Maintenance & Oil Change',
  'Electrical & Lighting Systems',
  'Suspension & Shock Absorbers',
  'Used Part Testing & Installation',
];

export const ShopProfilePage = () => {
  const { shop, refreshProfile } = useShopAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    operatingHours: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 12.9716,
    longitude: 77.5946,
    commissionRate: 12,
  });

  const [services, setServices] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await shopService.getProfile();
        const p = res.data;
        setProfile(p);
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          operatingHours: p.operatingHours || '08:30 AM - 08:30 PM',
          address: p.address || p.addressLine1 || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          latitude: p.latitude || 12.9716,
          longitude: p.longitude || 77.5946,
          commissionRate: p.commissionRate || 12,
        });
        setServices(p.servicesOffered || []);
        setVehicleCategories(p.vehicleCategories || ['CAR', 'BIKE']);
      } catch (err) {
        toast.error('Failed to load workshop profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggleService = (svc) => {
    setServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  };

  const toggleCategory = (cat) => {
    setVehicleCategories((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await shopService.updateProfile({
        ...formData,
        servicesOffered: services,
        vehicleCategories,
        commissionRate: Number(formData.commissionRate),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success('Workshop settings saved successfully!');
      refreshProfile();
    } catch (err) {
      toast.error('Failed to update workshop profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading workshop profile...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 840 }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Workshop Profile & Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Manage your mechanical workshop details, service offerings, vehicle categories, and geolocation.
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
        {/* Basic Shop Info */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Workshop Identification</h3>
            <span className="badge badge-success">✓ {profile?.verificationStatus || 'VERIFIED'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Operating Hours</label>
            <input
              type="text"
              className="form-input"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
            />
          </div>
        </div>

        {/* Address & Geolocation */}
        <div style={{ marginBottom: '1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Physical Address & Geolocation</h3>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-input"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Categories & Services */}
        <div style={{ marginBottom: '1.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Vehicle Types & Mechanical Services</h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Vehicle Categories Serviced</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { id: 'CAR', label: '🚗 4-Wheelers (Cars)' },
                { id: 'BIKE', label: '🏍️ 2-Wheelers (Bikes)' },
                { id: 'SCOOTER', label: '🛵 Scooters & EVs' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className="btn"
                  style={{
                    background: vehicleCategories.includes(c.id) ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                    color: vehicleCategories.includes(c.id) ? '#FFFFFF' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {c.label} {vehicleCategories.includes(c.id) && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Services Offered</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {AVAILABLE_SERVICES.map((s) => {
                const isSelected = services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-teal)' : 'var(--color-border)',
                      background: isSelected ? 'var(--color-teal-glow)' : 'var(--color-bg-card)',
                      color: isSelected ? 'var(--color-teal-dark)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Commission Configuration */}
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Configured Platform Commission Rate</h4>
            <span className="badge badge-info">{formData.commissionRate}% Rate</span>
          </div>
          <input
            type="range"
            min="10"
            max="15"
            step="1"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            <span>10% (Discount Rate)</span>
            <span>12% (Standard)</span>
            <span>15% (Tier 1 Support)</span>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          {saving ? 'Saving Changes...' : 'Save Workshop Profile Settings'}
        </button>
      </form>
    </div>
  );
};

export default ShopProfilePage;
