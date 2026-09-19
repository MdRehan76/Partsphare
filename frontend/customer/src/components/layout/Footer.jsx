import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="36" rx="10" fill="url(#fBrandGrad)" />
                  <path d="M10 24L18 10L26 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 19H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="18" cy="20" r="2.5" fill="#0D9488" />
                  <defs>
                    <linearGradient id="fBrandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
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
            <p className="footer-tagline">
              India's premier circular automotive marketplace. Connecting car & bike owners with certified OEM components, expert doorstep mechanical installation, and verified used parts.
            </p>
            <div className="footer-badges">
              <span className="badge badge-teal">✓ 100% Genuine Guarantee</span>
              <span className="badge badge-primary">🔧 Certified DIFM Technicians</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Marketplace</h4>
            <ul className="footer-links">
              <li><Link to="/products">Browse All Spare Parts</Link></li>
              <li><Link to="/services">DIFM Installation Services</Link></li>
              <li><Link to="/subscriptions">Maintenance Subscriptions</Link></li>
              <li><Link to="/sell-used-parts">Sell Used Spares</Link></li>
              <li><Link to="/vehicles">My Garage & Fitment</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?categorySlug=engine-parts">Engine & Ignition</Link></li>
              <li><Link to="/products?categorySlug=braking-system">Braking System</Link></li>
              <li><Link to="/products?categorySlug=batteries-power">Batteries & Power</Link></li>
              <li><Link to="/products?categorySlug=electrical-lighting">Lighting & Electricals</Link></li>
              <li><Link to="/products?categorySlug=oils-lubricants">Oils & Synthetic Fluids</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Support</h4>
            <ul className="footer-links">
              <li><Link to="/support">Help & FAQ Center</Link></li>
              <li><Link to="/orders">Order Status & Tracking</Link></li>
              <li><a href="mailto:support@partnexa.in">support@partnexa.in</a></li>
              <li><a href="tel:18001239876">1800-123-9876 (Toll Free)</a></li>
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

        <div className="footer-bottom">
          <p>&copy; {year} PartNexa Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Warranty Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
