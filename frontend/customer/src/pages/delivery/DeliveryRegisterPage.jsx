import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import toast from 'react-hot-toast';

export const DeliveryRegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'Scooter (125cc)',
    vehicleNum: '',
    licenseNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { register, theme, toggleTheme } = useDeliveryAuth();
  const navigate = useNavigate();

  const handleFillSample = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setFormData({
      firstName: 'Karan',
      lastName: 'Verma',
      email: `rider.karan${randomId}@partsphare.test`,
      password: 'Password@123',
      phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      vehicleType: 'Motorcycle (Hero Splendor Plus)',
      vehicleNum: `KA-04-AB-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseNumber: `DL-KA04-2022${Math.floor(100000 + Math.random() * 900000)}`,
    });
    toast.success('Sample rider information populated!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await register(formData);
      navigate('/kyc');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check form details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}
    >
      {/* Top right theme switch */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: 'var(--color-text-primary)',
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div
        className="delivery-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-xl)',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-emerald), var(--color-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              color: '#FFFFFF',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            🛵
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Join PartSphere Delivery Fleet
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Earn competitive per-trip payouts with transparent doorstep verification
          </p>
        </div>

        {/* Quick Autofill Action */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Want to test quickly with sample rider info?
          </span>
          <button
            type="button"
            onClick={handleFillSample}
            className="btn btn-secondary btn-sm"
          >
            Autofill Sample Rider
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Vikram"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Singh"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="rider@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98451 00000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <div style={{ margin: '1.25rem 0 0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
            Vehicle & Driving Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select
                name="vehicleType"
                className="form-select"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option value="Scooter (125cc)">Scooter (125cc)</option>
                <option value="Motorcycle (150cc+)">Motorcycle (150cc+)</option>
                <option value="Electric Two-Wheeler (EV)">Electric Two-Wheeler (EV)</option>
                <option value="Cargo Van / Mini-Truck">Cargo Van / Mini-Truck</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Reg. Number</label>
              <input
                type="text"
                name="vehicleNum"
                className="form-input"
                value={formData.vehicleNum}
                onChange={handleChange}
                placeholder="KA-01-EQ-9124"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Driving License Number</label>
            <input
              type="text"
              name="licenseNumber"
              className="form-input"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="DL-042021004921"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ marginTop: '1.5rem', padding: '0.85rem' }}
          >
            {submitting ? 'Registering Fleet Account...' : 'Continue to KYC Document Upload →'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          Already have an approved rider account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegisterPage;
