import React, { useState, useEffect } from 'react';
import { vehiclesService } from '../../services';
import { useVehicles } from '../../contexts/VehicleContext';
import VehicleSelectorModal from '../vehicle/VehicleSelectorModal';
import { BrandLogo } from '../vehicle/BrandLogos';
import './VehicleCompatibilityBar.css';

export const VehicleCompatibilityBar = ({
  selectedVariantId,
  compatibleOnly,
  onVariantChange,
  onCompatibleOnlyChange,
}) => {
  const { vehicles, activeVehicle, selectVehicleForFitment } = useVehicles();
  const [isOpen, setIsOpen] = useState(false);
  const [activeVehicleDetails, setActiveVehicleDetails] = useState(null);

  // Resolve details of active selectedVariantId
  useEffect(() => {
    if (!selectedVariantId) {
      setActiveVehicleDetails(null);
      return;
    }

    // 1. Check in user garage vehicles first
    const garageMatch = vehicles.find(
      (v) => v.variantId === selectedVariantId || v.variant?.id === selectedVariantId
    );
    if (garageMatch && garageMatch.variant) {
      setActiveVehicleDetails({
        make: garageMatch.variant.model?.make?.name,
        makeId: garageMatch.variant.model?.make?.id,
        model: garageMatch.variant.model?.name,
        variant: garageMatch.variant.name,
        year: garageMatch.variant.year,
        fuelType: garageMatch.variant.fuelType,
        isGarage: true,
        nickname: garageMatch.nickname,
        type: garageMatch.variant.model?.type || garageMatch.variant.model?.make?.type,
      });
      return;
    }

    // 2. Check in activeVehicle context
    if (activeVehicle && (activeVehicle.variantId === selectedVariantId || activeVehicle.variant?.id === selectedVariantId)) {
      setActiveVehicleDetails({
        make: activeVehicle.variant?.model?.make?.name,
        makeId: activeVehicle.variant?.model?.make?.id,
        model: activeVehicle.variant?.model?.name,
        variant: activeVehicle.variant?.name,
        year: activeVehicle.variant?.year,
        fuelType: activeVehicle.variant?.fuelType,
        isGarage: Boolean(activeVehicle.isPrimary || activeVehicle.nickname),
        nickname: activeVehicle.nickname,
        type: activeVehicle.variant?.model?.type || activeVehicle.variant?.model?.make?.type,
      });
      return;
    }

    // 3. Fallback to recents in localStorage
    try {
      const recents = JSON.parse(localStorage.getItem('partnexa_recent_vehicles') || '[]');
      const found = recents.find((r) => r.variantId === selectedVariantId || r.variant?.id === selectedVariantId);
      if (found) {
        setActiveVehicleDetails({
          make: found.makeName || found.variant?.model?.make?.name,
          makeId: found.variant?.model?.make?.id,
          model: found.modelName || found.variant?.model?.name,
          variant: found.variantName || found.variant?.name,
          year: found.year || found.variant?.year,
          fuelType: found.fuelType || found.variant?.fuelType,
          isGarage: false,
          type: found.type,
        });
        return;
      }
    } catch (e) {
      // Ignore
    }

    // 4. Default fallback metadata based on variantId pattern
    if (selectedVariantId.includes('swift')) {
      setActiveVehicleDetails({
        make: 'Maruti Suzuki',
        model: 'Swift',
        variant: selectedVariantId.includes('plus') ? 'ZXi Plus AMT' : 'VXi',
        year: 2024,
        fuelType: 'Petrol',
        isGarage: false,
        type: 'CAR',
      });
    } else if (selectedVariantId.includes('creta')) {
      setActiveVehicleDetails({
        make: 'Hyundai',
        model: 'Creta',
        variant: 'SX (O) Turbo',
        year: 2023,
        fuelType: 'Petrol',
        isGarage: false,
        type: 'CAR',
      });
    } else if (selectedVariantId.includes('pulsar')) {
      setActiveVehicleDetails({
        make: 'Bajaj',
        model: 'Pulsar 150',
        variant: 'Twin Disc BS6',
        year: 2023,
        fuelType: 'Petrol',
        isGarage: false,
        type: 'BIKE',
      });
    } else {
      setActiveVehicleDetails({
        make: 'Selected Vehicle',
        model: 'Vehicle',
        variant: 'Active Fitment',
        year: '',
        fuelType: '',
        isGarage: false,
      });
    }
  }, [selectedVariantId, vehicles, activeVehicle]);

  const handleVehicleSelected = (payload) => {
    if (payload && payload.variantId) {
      onVariantChange(payload.variantId);
      onCompatibleOnlyChange(true);
      setActiveVehicleDetails({
        make: payload.make?.name,
        makeId: payload.make?.id,
        model: payload.model?.name,
        variant: payload.variant?.name,
        year: payload.variant?.year,
        fuelType: payload.variant?.fuelType,
        isGarage: Boolean(payload.nickname),
        nickname: payload.nickname,
        type: payload.make?.type,
      });
    }
  };

  const handleClearVehicle = () => {
    onVariantChange('');
    onCompatibleOnlyChange(false);
    setActiveVehicleDetails(null);
  };

  const isTwoWheeler =
    activeVehicleDetails?.type === 'BIKE' ||
    activeVehicleDetails?.type === 'SCOOTER' ||
    activeVehicleDetails?.make?.toLowerCase().includes('hero') ||
    activeVehicleDetails?.make?.toLowerCase().includes('bajaj') ||
    activeVehicleDetails?.make?.toLowerCase().includes('tvs') ||
    activeVehicleDetails?.make?.toLowerCase().includes('enfield') ||
    activeVehicleDetails?.make?.toLowerCase().includes('ktm');

  return (
    <div className="compatibility-bar-container" id="compatibility-bar">
      <div className="compatibility-bar card">
        <div className="compatibility-left">
          <div className="compatibility-icon-wrapper">
            {activeVehicleDetails?.make ? (
              <BrandLogo brandName={activeVehicleDetails.make} size={36} />
            ) : (
              <span className="compatibility-icon">
                {isTwoWheeler ? '🏍️' : '🚗'}
              </span>
            )}
          </div>

          <div className="compatibility-info">
            {activeVehicleDetails ? (
              <>
                <div className="compatibility-heading">
                  <span className="fitment-label">Verified Fitment For:</span>
                  <span className="vehicle-name-highlight">
                    {activeVehicleDetails.year ? `${activeVehicleDetails.year} ` : ''}
                    {activeVehicleDetails.make} {activeVehicleDetails.model}
                    {activeVehicleDetails.variant ? ` (${activeVehicleDetails.variant})` : ''}
                  </span>
                  {activeVehicleDetails.isGarage && (
                    <span className="badge badge-teal text-xs">Garage Vehicle</span>
                  )}
                </div>
                <p className="compatibility-subtext">
                  Parts catalog is strictly matching this vehicle configuration for 100% mechanical fit.
                </p>
              </>
            ) : (
              <>
                <div className="compatibility-heading">
                  <span>Select your vehicle to see 100% verified compatible parts</span>
                </div>
                <p className="compatibility-subtext">
                  Choose from 20+ Car & 9+ Two-Wheeler manufacturers to eliminate wrong-part returns.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="compatibility-right">
          {activeVehicleDetails && (
            <label className="compatible-only-switch" title="Show only verified compatible parts">
              <input
                type="checkbox"
                id="compatible-only-checkbox"
                checked={Boolean(compatibleOnly)}
                onChange={(e) => onCompatibleOnlyChange(e.target.checked)}
              />
              <span className="switch-text">Only Compatible Parts</span>
            </label>
          )}

          {activeVehicleDetails ? (
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsOpen(true)}
                id="change-vehicle-btn"
              >
                Change Vehicle
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearVehicle}
                id="clear-vehicle-btn"
                title="Clear selected vehicle"
              >
                ✕ Clear
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsOpen(true)}
              id="select-vehicle-btn"
            >
              + Select Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Redesigned 5-Step Vehicle Selector Modal */}
      <VehicleSelectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleVehicleSelected}
        initialVariantId={selectedVariantId}
        title="Select Vehicle for Part Fitment"
      />
    </div>
  );
};

export default VehicleCompatibilityBar;
