import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopAuth } from '../contexts/ShopAuthContext';
import toast from 'react-hot-toast';

export const ShopLoginPage = () => {
  const [email, setEmail] = useState('apex.auto@partsphare.test');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);

  const { login, theme, toggleTheme } = useShopAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to PartSphere Partner Console!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('apex.auto@partsphare.test');
    setPassword('Password@123');
    toast.success('Pre-filled demo credentials for Apex Auto Care');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      {/* Theme toggle in top-right */}
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
          maxWidth: 440,
          width: '100%',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Brand Header */}
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
            ⚙️
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Partner Workshop Login</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Access incoming DIFM jobs, service calendar, and commission ledger.
          </p>
        </div>

        {/* 1-Click Demo Account Banner */}
        <div
          style={{
            background: 'var(--color-info-bg)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Demo Partner Account
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Apex Auto Care & Spares (Bengaluru)
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Autofill Demo
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Shop Owner Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. apex.auto@partsphare.test"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Don't have a partner account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register Your Workshop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopLoginPage;
