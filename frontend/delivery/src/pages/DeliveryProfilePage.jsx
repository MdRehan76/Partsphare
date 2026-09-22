import React, { useState } from 'react';
import { useDeliveryAuth } from '../contexts/DeliveryAuthContext';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const DeliveryProfilePage = () => {
  const { user, partner, refreshProfile, logout } = useDeliveryAuth();

  const [formData, setFormData] = useState({
    vehicleType: partner?.vehicleType || '',
    vehicleNum: partner?.vehicleNum || '',
    licenseNumber: partner?.licenseNumber || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await deliveryService.updateProfile(formData);
      toast.success('Vehicle and rider details updated successfully!');
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="delivery-container">
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Rider Profile & Fleet Vehicle
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Manage your registered delivery vehicle specifications and view fleet rating metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="delivery-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-amber))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                color: '#FFFFFF',
                fontWeight: 800,
              }}
            >
              {user?.firstName ? user.firstName[0].toUpperCase() : 'R'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                Phone: {user?.phone || 'Not provided'}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Verification Status:</span>
              <span className="delivery-badge badge-delivered">{partner?.verificationStatus || 'APPROVED'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Fleet Rating:</span>
              <strong style={{ color: 'var(--color-amber)' }}>★ {partner?.rating || 4.9} / 5.0</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Completed Deliveries:</span>
              <strong>{partner?.totalDeliveries || 0} trips</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>On-Duty Duty State:</span>
              <strong style={{ color: partner?.isOnline ? 'var(--color-emerald)' : 'var(--color-text-muted)' }}>
                {partner?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </strong>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-block"
            style={{ marginTop: '1.5rem', color: 'var(--color-error)' }}
          >
            Sign Out of Rider Console
          </button>
        </div>

        {/* Edit Vehicle Info */}
        <div className="delivery-card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            🛵 Registered Vehicle Details
          </h2>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Vehicle Type & Model</label>
              <input
                type="text"
                name="vehicleType"
                className="form-input"
                value={formData.vehicleType}
                onChange={handleChange}
                placeholder="e.g. TVS Ntorq 125, Honda Activa 6G"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Registration Number</label>
              <input
                type="text"
                name="vehicleNum"
                className="form-input"
                value={formData.vehicleNum}
                onChange={handleChange}
                placeholder="e.g. KA-01-EQ-9124"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Driving License Number</label>
              <input
                type="text"
                name="licenseNumber"
                className="form-input"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="e.g. DL-KA01-2021004921"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-block"
              style={{ marginTop: '1rem' }}
            >
              {saving ? 'Saving...' : 'Save Vehicle Updates'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfilePage;
