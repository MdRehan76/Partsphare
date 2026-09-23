import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export const ROLE_OPTIONS = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    icon: '🛒',
    portal: 'Customer Marketplace',
    route: '/customer',
    seedEmail: 'demo@partsphere.in',
    seedPassword: 'Demo@1234',
    badgeColor: '#0284C7',
    desc: 'Browse auto parts, DIFM services, vehicles & garage',
  },
  {
    id: 'SHOP_OWNER',
    label: 'Mechanical Shop',
    icon: '🔧',
    portal: 'Workshop Management',
    route: '/shop',
    seedEmail: 'apex.shop@partsphere.in',
    seedPassword: 'Shop@1234',
    badgeColor: '#0D9488',
    desc: 'Service calendar, job intake, commissions & deliveries',
  },
  {
    id: 'DELIVERY_PARTNER',
    label: 'Delivery Partner',
    icon: '🛵',
    portal: 'Delivery Operations',
    route: '/delivery',
    seedEmail: 'rider.rajesh@partsphere.in',
    seedPassword: 'Rider@1234',
    badgeColor: '#F59E0B',
    desc: 'Dispatch queue, job navigation, COD & inspections',
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    icon: '🛡️',
    portal: 'Executive Console',
    route: '/admin',
    seedEmail: 'admin@partsphere.in',
    seedPassword: 'Admin@1234',
    badgeColor: '#EF4444',
    desc: 'Catalog oversight, partner approvals & system KPIs',
  },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Role choice state — default to CUSTOMER unless redirect parameter suggests otherwise
  const [selectedRole, setSelectedRole] = useState(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect') || '';
    if (redirect.startsWith('/admin')) return 'ADMIN';
    if (redirect.startsWith('/shop')) return 'SHOP_OWNER';
    if (redirect.startsWith('/delivery')) return 'DELIVERY_PARTNER';
    return 'CUSTOMER';
  });

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('partnexa_theme') || 'light');

  // Pre-fill seed credentials for default selected role
  useEffect(() => {
    const roleConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole);
    if (roleConfig) {
      setForm({ email: roleConfig.seedEmail, password: roleConfig.seedPassword });
      setAuthError(null);
      setErrors({});
    }
  }, [selectedRole]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partnexa_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('theme:change', { detail: nextTheme }));
  };

  const currentRoleConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setAuthError(null);
  };

  const handleFillSeed = () => {
    setForm({
      email: currentRoleConfig.seedEmail,
      password: currentRoleConfig.seedPassword,
    });
    setAuthError(null);
    setErrors({});
    toast.success(`Loaded official seed credentials for ${currentRoleConfig.label}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) setAuthError(null);
  };

  const redirectByRole = (user) => {
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect');

    if (redirectUrl && !redirectUrl.startsWith('/login') && !redirectUrl.startsWith('/unauthorized')) {
      navigate(redirectUrl, { replace: true });
      return;
    }

    switch (user.role) {
      case 'SHOP_OWNER':
        navigate('/shop', { replace: true });
        break;
      case 'DELIVERY_PARTNER':
        navigate('/delivery', { replace: true });
        break;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'CUSTOMER':
      default:
        navigate('/customer', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrors({});
    setAuthError(null);

    try {
      // Authoritative backend check: passing selectedRole enforces role validation
      const authenticatedUser = await login(form, selectedRole);
      toast.success(`Authenticated as ${authenticatedUser.firstName || authenticatedUser.email} (${authenticatedUser.role})`);
      redirectByRole(authenticatedUser);
    } catch (err) {
      console.error('Login error:', err);
      const data = err.response?.data;
      const message = data?.message || err.message || 'Login failed. Please check credentials.';

      if (data?.errors) {
        const fieldErrors = {};
        data.errors.forEach(({ field, msg }) => {
          fieldErrors[field] = msg;
        });
        setErrors(fieldErrors);
      } else {
        setAuthError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test trigger for demonstrating wrong-role access rejection
  const triggerWrongRoleTest = async () => {
    // Intentionally keep current selectedRole (e.g. ADMIN), but fill Customer credentials
    const customerSeed = ROLE_OPTIONS.find((r) => r.id === 'CUSTOMER');
    setForm({ email: customerSeed.seedEmail, password: customerSeed.seedPassword });
    setSelectedRole('ADMIN');
    setAuthError(null);

    // Give state a tick to update before submitting
    setTimeout(() => {
      handleSubmit();
    }, 50);
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Ambience */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* Theme Toggle in top-right */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
        <button
          type="button"
          onClick={toggleTheme}
          id="theme-toggle-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
            background: 'var(--color-bg-card, #1e293b)',
            color: 'var(--color-text-primary, #ffffff)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div
        className="auth-card card-glass animate-scale-in"
        style={{
          maxWidth: '540px',
          width: '100%',
          margin: '1.5rem auto',
          padding: '2rem 2.25rem',
          backgroundColor: 'var(--color-bg-card, #1e293b)',
          borderRadius: '18px',
          border: '1px solid var(--color-border, rgba(255,255,255,0.12))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/customer"
            className="auth-logo"
            style={{
              textDecoration: 'none',
              fontSize: '1.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display, sans-serif)',
              color: 'var(--color-text-primary, #ffffff)',
              display: 'inline-block',
              letterSpacing: '-0.03em',
            }}
          >
            Part<span style={{ color: 'var(--color-primary, #0284c7)' }}>Nexa</span>
          </Link>
          <h1
            className="auth-title"
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              margin: '0.4rem 0 0.2rem',
              color: 'var(--color-text-primary, #ffffff)',
            }}
          >
            Unified Portal Login
          </h1>
          <p
            className="auth-subtitle"
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted, #94a3b8)',
              margin: 0,
            }}
          >
            One common authentication service across all four PartNexa portals
          </p>
        </div>

        {/* Step 1: Role Choices */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted, #94a3b8)',
              }}
            >
              Select Your Role:
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: currentRoleConfig.badgeColor,
                fontWeight: 700,
              }}
            >
              Authoritative Portal: {currentRoleConfig.route}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}
            id="role-selection-group"
          >
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  id={`role-btn-${role.id.toLowerCase()}`}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.65rem 0.25rem',
                    borderRadius: '10px',
                    border: isSelected
                      ? `2px solid ${role.badgeColor}`
                      : '1px solid var(--color-border, rgba(255,255,255,0.1))',
                    backgroundColor: isSelected
                      ? 'var(--color-bg-elevated, rgba(255,255,255,0.06))'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 12px ${role.badgeColor}33` : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{role.icon}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? role.badgeColor : 'var(--color-text-primary, #ffffff)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seed Credentials Banner & 1-Click Fill */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'var(--color-bg-elevated, rgba(0,0,0,0.18))',
            border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--color-text-muted, #94a3b8)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Authoritative Database Seed:
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                color: 'var(--color-text-primary, #ffffff)',
                marginTop: '0.15rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <strong style={{ color: currentRoleConfig.badgeColor }}>{currentRoleConfig.seedEmail}</strong> / {currentRoleConfig.seedPassword}
            </div>
          </div>

          <button
            type="button"
            id="fill-seed-btn"
            onClick={handleFillSeed}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: `${currentRoleConfig.badgeColor}22`,
              border: `1px solid ${currentRoleConfig.badgeColor}66`,
              color: currentRoleConfig.badgeColor,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Auto Fill
          </button>
        </div>

        {/* Rejection Alert Banner (e.g. Wrong Role Selected) */}
        {authError && (
          <div
            id="auth-error-banner"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⛔</span>
            <div>
              <strong>Access Denied:</strong> {authError}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label
              className="form-label"
              htmlFor="login-email"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-text-primary, #ffffff)',
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="name@partsphere.in"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                border: errors.email
                  ? '1px solid #ef4444'
                  : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                backgroundColor: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text-primary, #ffffff)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label
                className="form-label"
                htmlFor="login-password"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #ffffff)',
                }}
              >
                Password
              </label>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted, #94a3b8)',
                }}
              >
                Role: <strong>{currentRoleConfig.label}</strong>
              </span>
            </div>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 2.5rem 0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: errors.password
                    ? '1px solid #ef4444'
                    : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'var(--color-bg, #0f172a)',
                  color: 'var(--color-text-primary, #ffffff)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                id="login-toggle-password"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted, #94a3b8)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.2rem',
                }}
              >
                {showPass ? '👁️' : '🔒'}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="login-submit-btn"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: currentRoleConfig.badgeColor,
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span> Authenticating...
              </>
            ) : (
              `Sign In as ${currentRoleConfig.label}`
            )}
          </button>
        </form>

        {/* Verification Utilities: Fast wrong-role test */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px dashed var(--color-border, rgba(255,255,255,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted, #94a3b8)' }}>Security Validation:</span>
          <button
            type="button"
            id="test-wrong-role-btn"
            onClick={triggerWrongRoleTest}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
            title="Attempts to log in as ADMIN using Customer credentials to verify backend role authority rejection"
          >
            Test Wrong-Role Rejection (Customer as Admin)
          </button>
        </div>

        {/* Registration Links */}
        <div
          className="auth-footer"
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary, #94a3b8)',
          }}
        >
          <span>Need an account? </span>
          <Link
            to="/register"
            id="register-link"
            style={{ color: 'var(--color-primary, #0284c7)', fontWeight: 600, textDecoration: 'none' }}
          >
            Register as Customer
          </Link>
          <span style={{ margin: '0 0.4rem' }}>•</span>
          <Link
            to="/shop/register"
            id="shop-register-link"
            style={{ color: 'var(--color-primary, #0284c7)', fontWeight: 600, textDecoration: 'none' }}
          >
            Workshop Partner
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
