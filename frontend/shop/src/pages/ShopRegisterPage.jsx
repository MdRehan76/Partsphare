import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopAuth } from '../contexts/ShopAuthContext';
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

export const ShopRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    operatingHours: '08:30 AM - 08:30 PM',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    password: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    commissionRate: 12,
  });

  const [selectedServices, setSelectedServices] = useState([
    'Brake Fitment & Polish',
    'Battery Replacement & Diagnostics',
    'Doorstep Mechanic Visit',
  ]);

  const [vehicleCategories, setVehicleCategories] = useState(['CAR', 'BIKE']);
  const [loading, setLoading] = useState(false);

  const { register, theme, toggleTheme } = useShopAuth();
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (svc) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const toggleCategory = (cat) => {
    setVehicleCategories((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const handlePreFillCityCoords = (city) => {
    if (city === 'Bengaluru') {
      setFormData((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka', pincode: '560038', latitude: 12.9716, longitude: 77.5946 }));
    } else if (city === 'Mumbai') {
      setFormData((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1363, longitude: 72.8277 }));
    } else if (city === 'Delhi') {
      setFormData((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6315, longitude: 77.2167 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      toast.error('Please fill in all mandatory shop and owner details.');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error('Please select at least one mechanical service.');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        servicesOffered: selectedServices,
        vehicleCategories,
        commissionRate: Number(formData.commissionRate),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success('Workshop registered and verified successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        className="btn btn-secondary btn-sm"
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
      >
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <div
        className="card"
        style={{
          maxWidth: 780,
          width: '100%',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.5rem',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            }}
          >
            🏢
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Partner Workshop Onboarding</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Join the PartSphere network to receive DIFM orders, vehicle visits, and automated commission payouts.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Workshop Information */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>1.</span> Workshop Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder="e.g. Metro Auto Precision Works"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Workshop Contact Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleTextChange}
                  placeholder="+91 98450 00000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Operating Hours</label>
                <input
                  type="text"
                  name="operatingHours"
                  className="form-input"
                  value={formData.operatingHours}
                  onChange={handleTextChange}
                  placeholder="08:30 AM - 08:30 PM"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner Credentials */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>2.</span> Owner Account Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Owner First Name *</label>
                <input
                  type="text"
                  name="ownerFirstName"
                  className="form-input"
                  value={formData.ownerFirstName}
                  onChange={handleTextChange}
                  placeholder="e.g. Ramesh"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Last Name</label>
                <input
                  type="text"
                  name="ownerLastName"
                  className="form-input"
                  value={formData.ownerLastName}
                  onChange={handleTextChange}
                  placeholder="e.g. Patel"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Email (Login) *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleTextChange}
                  placeholder="ramesh@metroauto.test"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleTextChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address & Geolocation */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>3.</span> Address & Geolocation
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Quick Fill:</span>
                <button type="button" onClick={() => handlePreFillCityCoords('Bengaluru')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem' }}>Bengaluru</button>
                <button type="button" onClick={() => handlePreFillCityCoords('Mumbai')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem' }}>Mumbai</button>
                <button type="button" onClick={() => handlePreFillCityCoords('Delhi')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem' }}>Delhi</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleTextChange}
                  placeholder="e.g. 45, 100 Feet Road, Near Metro Pillar 140"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleTextChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleTextChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  value={formData.pincode}
                  onChange={handleTextChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="form-input"
                  value={formData.latitude}
                  onChange={handleTextChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="form-input"
                  value={formData.longitude}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Vehicle Categories & Services Offered */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>4.</span> Vehicle Categories & Services Offered
            </h3>

            {/* Vehicle Categories Pills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Supported Vehicle Categories (select at least one):</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'CAR', label: '🚗 4-Wheelers (Cars/SUVs)' },
                  { id: 'BIKE', label: '🏍️ 2-Wheelers (Motorcycles)' },
                  { id: 'SCOOTER', label: '🛵 Scooters & EVs' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="btn"
                    style={{
                      background: vehicleCategories.includes(cat.id) ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                      color: vehicleCategories.includes(cat.id) ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                    }}
                  >
                    {cat.label} {vehicleCategories.includes(cat.id) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Offered Chips */}
            <div>
              <label className="form-label">Services Offered (select all applicable):</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {AVAILABLE_SERVICES.map((svc) => {
                  const isSelected = selectedServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--color-teal)' : 'var(--color-border)',
                        background: isSelected ? 'var(--color-teal-glow)' : 'var(--color-bg-card)',
                        color: isSelected ? 'var(--color-teal-dark)' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Commission & Verification Status */}
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Automated Commission Rate</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Platform commission rate for DIFM service installation jobs (10% to 15%).
                </p>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                {formData.commissionRate}% Configured
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="15"
              step="1"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleTextChange}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              <span>10% (High Volume Discount)</span>
              <span>12% (Standard Partner Rate)</span>
              <span>15% (Premium Multi-Location)</span>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Verification Status:{' '}
                <span className="badge badge-success">VERIFIED ON SUBMISSION</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Instant Activation for Authorized Mechanical Workshops
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            {loading ? 'Registering Workshop...' : 'Complete Registration & Open Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have a partner account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopRegisterPage;
