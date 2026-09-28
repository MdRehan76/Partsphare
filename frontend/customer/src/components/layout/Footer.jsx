import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Footer.css';

/**
 * Centralized Social Media Configuration
 * Replace '#' with official company URLs when accounts go live.
 */
export const socialLinks = {
  instagram: '#',
  youtube: '#',
  twitter: '#',
  facebook: '#',
  linkedin: '#',
};

const socialPlatforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    ariaLabel: 'Instagram',
    url: socialLinks.instagram,
    colorClass: 'social-btn-instagram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    ariaLabel: 'YouTube',
    url: socialLinks.youtube,
    colorClass: 'social-btn-youtube',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    ariaLabel: 'X / Twitter',
    url: socialLinks.twitter,
    colorClass: 'social-btn-x',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    ariaLabel: 'Facebook',
    url: socialLinks.facebook,
    colorClass: 'social-btn-facebook',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    ariaLabel: 'LinkedIn',
    url: socialLinks.linkedin,
    colorClass: 'social-btn-linkedin',
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  const handleSocialClick = (e, platform) => {
    if (!platform.url || platform.url === '#') {
      e.preventDefault();
      toast(`PartNexa on ${platform.name} is launching soon! Follow us for updates.`, {
        icon: '📢',
        style: {
          borderRadius: '10px',
          background: 'var(--color-bg-card, #1e293b)',
          color: 'var(--color-text-primary, #ffffff)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        },
      });
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        {/* Main Navigation Grid */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="36" rx="10" fill="url(#fBrandGrad)" />
                  <path
                    d="M10 24L18 10L26 24"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M13 19H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="18" cy="20" r="2.5" fill="#0D9488" />
                  <defs>
                    <linearGradient
                      id="fBrandGrad"
                      x1="0"
                      y1="0"
                      x2="36"
                      y2="36"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#0284C7" />
                      <stop offset="1" stopColor="#0D9488" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="footer-logo-text">
                Part<span className="text-primary">Nexa</span>
              </span>
            </Link>

            <p className="footer-slogan">Buy. Install. Resell. Drive Smarter.</p>

            <p className="footer-tagline">
              India's premier circular automotive marketplace. Connecting vehicle owners with
              certified OEM components, expert doorstep & workshop installation, and verified used parts.
            </p>

            <div className="footer-badges">
              <span className="badge badge-teal">✓ 100% Genuine Guarantee</span>
              <span className="badge badge-primary">🔧 Certified DIFM Technicians</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Spare Parts Catalog</Link>
              </li>
              <li>
                <Link to="/services">Installation Services</Link>
              </li>
              <li>
                <Link to="/subscriptions">Maintenance Plans</Link>
              </li>
              <li>
                <Link to="/sell-used-parts">Sell Used Spares</Link>
              </li>
              <li>
                <Link to="/vehicles">My Garage & Fitment</Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links">
              <li>
                <Link to="/products?categorySlug=engine-parts">Engine & Ignition</Link>
              </li>
              <li>
                <Link to="/products?categorySlug=braking-system">Braking System</Link>
              </li>
              <li>
                <Link to="/products?categorySlug=batteries-power">Batteries & Power</Link>
              </li>
              <li>
                <Link to="/products?categorySlug=electrical-lighting">Lighting & Electricals</Link>
              </li>
              <li>
                <Link to="/products?categorySlug=oils-lubricants">Oils & Synthetic Fluids</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Support</h4>
            <ul className="footer-links">
              <li>
                <Link to="/support">Help & FAQ Center</Link>
              </li>
              <li>
                <Link to="/orders">Order Status & Tracking</Link>
              </li>
              <li>
                <a href="mailto:support@partnexa.in">support@partnexa.in</a>
              </li>
              <li>
                <a href="tel:18001239876">1800-123-9876 (Toll Free)</a>
              </li>
            </ul>
            <div className="footer-trust">
              <div className="trust-item">
                <span>🛡️</span>
                <span>Razorpay Demo Sandbox Secure</span>
              </div>
              <div className="trust-item">
                <span>🚚</span>
                <span>Cash on Delivery (COD) Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section: Follow PartNexa */}
        <div className="footer-social-section" id="footer-social-section">
          <div className="footer-social-wrapper">
            <div className="footer-social-info">
              <div className="footer-social-badge">
                <span className="social-badge-dot" />
                <span>CONNECT WITH US</span>
              </div>
              <h3 className="footer-social-title">Follow PartNexa</h3>
              <p className="footer-social-sub">
                Stay connected with PartNexa for automotive tips, new parts, offers, updates, and repair insights.
              </p>
            </div>

            <div
              className="footer-social-links"
              role="list"
              aria-label="PartNexa Social Media Channels"
            >
              {socialPlatforms.map((platform) => {
                const isPlaceholder = !platform.url || platform.url === '#';
                return (
                  <a
                    key={platform.id}
                    href={platform.url || '#'}
                    onClick={(e) => handleSocialClick(e, platform)}
                    target={isPlaceholder ? undefined : '_blank'}
                    rel={isPlaceholder ? undefined : 'noopener noreferrer'}
                    className={`footer-social-btn ${platform.colorClass}`}
                    aria-label={platform.ariaLabel}
                    title={
                      isPlaceholder
                        ? `${platform.name} (Coming Soon)`
                        : `Follow PartNexa on ${platform.name}`
                    }
                    role="listitem"
                    id={`footer-social-${platform.id}`}
                  >
                    <span className="social-icon-box">{platform.icon}</span>
                    <span className="social-tooltip-text">{platform.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legal & Copyright Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {year} PartNexa Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <Link to="/support">Contact Us</Link>
            <a href="#">Warranty Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
