import React from 'react';
import PortalSwitcher from '../common/PortalSwitcher';
import './UnifiedHeader.css';

/**
 * UnifiedHeader System
 * Stacks PortalSwitcher (Row 1) and the active portal's Navbar (Row 2)
 * in standard document flow inside a single sticky container.
 * Eliminates overlapping, clipping, and z-index collisions across portals.
 */
export const UnifiedHeader = ({ children }) => {
  return (
    <header className="unified-header-system" id="partnexa-unified-header">
      <div className="unified-header-portal-row">
        <PortalSwitcher />
      </div>
      <div className="unified-header-navbar-row">
        {children}
      </div>
    </header>
  );
};

export default UnifiedHeader;
