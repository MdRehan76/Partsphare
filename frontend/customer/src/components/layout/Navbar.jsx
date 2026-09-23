import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useVehicles } from '../../contexts/VehicleContext';
import VehicleSelectorModal from '../vehicle/VehicleSelectorModal';
import toast from 'react-hot-toast';
import './Navbar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <form className="navbar-search" onSubmit={handleSearch}>
      <svg
        className="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        id="navbar-search-input"
        className="form-input navbar-search-input"
        placeholder="Search 10,000+ spare parts, brands, OEM numbers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search parts"
      />
    </form>
  );
};

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        id="user-menu-btn"
        className="user-avatar-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="user-avatar">
          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
        </div>
        <span className="user-name-label">{user.firstName}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu" role="menu">
          <div style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {user.email}
            </div>
          </div>
          <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </Link>
          <Link to="/orders" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            My Orders
          </Link>
          <Link to="/customer/my-subscriptions" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem" id="nav-my-subscriptions-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            My Subscriptions
          </Link>
          <Link to="/vehicles" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            My Vehicles
          </Link>
          <Link to="/support" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help & Support
          </Link>
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" onClick={onLogout} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { primaryVehicle } = useVehicles();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false);

  // Theme state: support light & dark across all unified portals
  const [theme, setTheme] = useState(() => localStorage.getItem('partnexa_theme') || localStorage.getItem('partsphere_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partnexa_theme', theme);
    const handleThemeChange = (e) => {
      if (e.detail) setTheme(e.detail);
    };
    window.addEventListener('theme:change', handleThemeChange);
    return () => window.removeEventListener('theme:change', handleThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.dispatchEvent(new CustomEvent('theme:change', { detail: next }));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#brandGrad)" />
              <path d="M10 24L18 10L26 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 19H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="20" r="2.5" fill="#0D9488" />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284C7" />
                  <stop offset="1" stopColor="#0D9488" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">
            Part<span className="text-primary">Nexa</span>
          </span>
        </Link>

        {/* Global Search (Desktop) */}
        <div className="navbar-search-wrapper">
          <SearchBar />
        </div>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link
            to="/products"
            className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
          >
            Browse Parts
          </Link>
          <Link
            to="/services"
            className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            DIFM Services
          </Link>
          <Link
            to="/subscriptions"
            className={`nav-link ${location.pathname === '/subscriptions' ? 'active' : ''}`}
          >
            Subscriptions
          </Link>
          <Link
            to="/sell-used-parts"
            className={`nav-link ${location.pathname === '/sell-used-parts' ? 'active' : ''}`}
          >
            Sell Used Part
          </Link>
          <Link
            to="/vehicles"
            className={`nav-link ${location.pathname === '/vehicles' || location.pathname === '/garage' ? 'active' : ''}`}
          >
            My Vehicles
          </Link>
        </div>

        {/* Actions (Theme Toggle, Cart, Auth) */}
        <div className="navbar-actions">
          {/* Prominent Primary / Active Vehicle Indicator */}
          {primaryVehicle ? (
            <div className="navbar-vehicle-indicator">
              <button
                type="button"
                className="vehicle-pill"
                id="navbar-primary-vehicle-pill"
                onClick={() => setVehicleSelectorOpen(true)}
                title="Active Vehicle (Click to change)"
              >
                <span className="vehicle-pill-icon">
                  {primaryVehicle.variant?.model?.make?.type === 'BIKE' ||
                  primaryVehicle.variant?.model?.make?.type === 'SCOOTER'
                    ? '🏍️'
                    : '🚗'}
                </span>
                <div className="vehicle-pill-info">
                  <span className="vehicle-pill-name">
                    {primaryVehicle.nickname ||
                      `${primaryVehicle.variant?.model?.make?.name || ''} ${
                        primaryVehicle.variant?.model?.name || ''
                      }`}
                  </span>
                  <span className="vehicle-pill-sub">
                    {primaryVehicle.variant?.year} · {primaryVehicle.variant?.name}
                  </span>
                </div>
                <span className="vehicle-pill-badge">Active</span>
              </button>
            </div>
          ) : (
            <div className="navbar-vehicle-indicator">
              <button
                type="button"
                className="vehicle-pill"
                id="navbar-add-vehicle-pill"
                style={{ borderStyle: 'dashed' }}
                onClick={() => setVehicleSelectorOpen(true)}
                title="Select your vehicle for guaranteed fitment"
              >
                <span className="vehicle-pill-icon">➕</span>
                <div className="vehicle-pill-info">
                  <span className="vehicle-pill-name">Select Vehicle</span>
                </div>
              </button>
            </div>
          )}

          {/* Visible Theme Switcher */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Cart Button */}
          <Link to="/cart" className="navbar-cart-btn" id="navbar-cart-btn" aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* Auth State */}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="navbar-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="navbar-register-btn">
                Register
              </Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            id="mobile-menu-btn"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade-in">
          <SearchBar />
          <div className="mobile-links">
            <Link to="/products" className="mobile-link">
              <span>Browse Parts</span>
              <span>→</span>
            </Link>
            <Link to="/services" className="mobile-link">
              <span>DIFM Installation & Services</span>
              <span>→</span>
            </Link>
            <Link to="/subscriptions" className="mobile-link">
              <span>Maintenance Subscriptions</span>
              <span>→</span>
            </Link>
            <Link to="/sell-used-parts" className="mobile-link">
              <span>Sell Used Part</span>
              <span>→</span>
            </Link>
            <Link to="/vehicles" className="mobile-link">
              <span>My Vehicles</span>
              <span>→</span>
            </Link>
            {user && (
              <>
                <Link to="/orders" className="mobile-link">
                  <span>My Orders</span>
                  <span>→</span>
                </Link>
                <Link to="/customer/my-subscriptions" className="mobile-link">
                  <span>My Subscriptions</span>
                  <span>→</span>
                </Link>
                <Link to="/profile" className="mobile-link">
                  <span>Profile Settings</span>
                  <span>→</span>
                </Link>
              </>
            )}
            <Link to="/support" className="mobile-link">
              <span>Customer Support</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal
        isOpen={vehicleSelectorOpen}
        onClose={() => setVehicleSelectorOpen(false)}
        title="Select Vehicle for Part Fitment"
      />
    </nav>
  );
};

export default Navbar;
