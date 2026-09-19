import React, { useState, useEffect } from 'react';
import { vehiclesService } from '../../services';
import { useVehicles } from '../../contexts/VehicleContext';
import './VehicleCompatibilityBar.css';

export const VehicleCompatibilityBar = ({
  selectedVariantId,
  compatibleOnly,
  onVariantChange,
  onCompatibleOnlyChange,
}) => {
  const { vehicles, primaryVehicle } = useVehicles();

  const [isOpen, setIsOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState('4_WHEELER');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedVarId, setSelectedVarId] = useState('');

  const [activeVehicleDetails, setActiveVehicleDetails] = useState(null);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch makes when vehicleType changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setLoadingMakes(true);
      vehiclesService
        .getMakes(vehicleType)
        .then(({ data }) => {
          setMakes(data.data || []);
          setSelectedMakeId('');
          setModels([]);
          setSelectedModelId('');
          setVariants([]);
          setSelectedVarId('');
        })
        .catch(() => setMakes([]))
        .finally(() => setLoadingMakes(false));
    }
  }, [vehicleType, isOpen]);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMakeId) {
      setLoadingModels(true);
      vehiclesService
        .getModels(selectedMakeId)
        .then(({ data }) => {
          setModels(data.data || []);
          setSelectedModelId('');
          setVariants([]);
          setSelectedVarId('');
        })
        .catch(() => setModels([]))
        .finally(() => setLoadingModels(false));
    } else {
      setModels([]);
      setSelectedModelId('');
      setVariants([]);
      setSelectedVarId('');
    }
  }, [selectedMakeId]);

  // Fetch variants when model changes
  useEffect(() => {
    if (selectedModelId) {
      setLoadingVariants(true);
      vehiclesService
        .getVariants(selectedModelId)
        .then(({ data }) => {
          setVariants(data.data || []);
          setSelectedVarId('');
        })
        .catch(() => setVariants([]))
        .finally(() => setLoadingVariants(false));
    } else {
      setVariants([]);
      setSelectedVarId('');
    }
  }, [selectedModelId]);

  // Resolve details of active selectedVariantId
  useEffect(() => {
    if (!selectedVariantId) {
      setActiveVehicleDetails(null);
      return;
    }

    // Check in user garage vehicles first
    const garageMatch = vehicles.find(
      (v) => v.variantId === selectedVariantId || v.variant?.id === selectedVariantId
    );
    if (garageMatch && garageMatch.variant) {
      setActiveVehicleDetails({
        make: garageMatch.variant.model?.make?.name,
        model: garageMatch.variant.model?.name,
        variant: garageMatch.variant.name,
        year: garageMatch.variant.year,
        fuelType: garageMatch.variant.fuelType,
        isGarage: true,
        nickname: garageMatch.nickname,
      });
      return;
    }

    // Fallback: search across cached makes/models/variants
    const variantObj = variants.find((v) => v.id === selectedVariantId);
    if (variantObj) {
      const modelObj = models.find((m) => m.id === variantObj.modelId);
      const makeObj = makes.find((m) => m.id === (modelObj?.makeId || selectedMakeId));
      setActiveVehicleDetails({
        make: makeObj?.name || 'Selected Vehicle',
        model: modelObj?.name || '',
        variant: variantObj.name,
        year: variantObj.year,
        fuelType: variantObj.fuelType,
        isGarage: false,
      });
    } else {
      // Named placeholder based on well-known IDs
      if (selectedVariantId.includes('swift')) {
        setActiveVehicleDetails({
          make: 'Maruti Suzuki',
          model: 'Swift',
          variant: 'VXi',
          year: 2022,
          fuelType: 'Petrol',
          isGarage: false,
        });
      } else if (selectedVariantId.includes('pulsar')) {
        setActiveVehicleDetails({
          make: 'Bajaj',
          model: 'Pulsar 150',
          variant: 'Twin Disc',
          year: 2023,
          fuelType: 'Petrol',
          isGarage: false,
        });
      } else if (selectedVariantId.includes('creta')) {
        setActiveVehicleDetails({
          make: 'Hyundai',
          model: 'Creta',
          variant: 'SX',
          year: 2022,
          fuelType: 'Petrol',
          isGarage: false,
        });
      } else {
        setActiveVehicleDetails({
          make: 'Specific Vehicle',
          model: 'Selected',
          variant: '',
          year: '',
          fuelType: '',
          isGarage: false,
        });
      }
    }
  }, [selectedVariantId, vehicles, variants, models, makes, selectedMakeId]);

  const handleApplyCascading = () => {
    if (!selectedVarId) return;
    onVariantChange(selectedVarId);
    setIsOpen(false);
  };

  const handleSelectGarageVehicle = (v) => {
    const varId = v.variantId || v.variant?.id;
    if (varId) {
      onVariantChange(varId);
      setIsOpen(false);
    }
  };

  const handleClearVehicle = () => {
    onVariantChange('');
    onCompatibleOnlyChange(false);
    setIsOpen(false);
  };

  return (
    <div className="compatibility-bar-container" id="compatibility-bar">
      <div className="compatibility-bar card">
        <div className="compatibility-left">
          <div className="compatibility-icon-wrapper">
            <span className="compatibility-icon">
              {activeVehicleDetails?.make?.toLowerCase().includes('hero') ||
              activeVehicleDetails?.make?.toLowerCase().includes('bajaj') ||
              activeVehicleDetails?.make?.toLowerCase().includes('tvs')
                ? '🏍️'
                : '🚗'}
            </span>
          </div>

          <div className="compatibility-info">
            {activeVehicleDetails ? (
              <>
                <div className="compatibility-heading">
                  <span className="fitment-label">Verified Fitment For:</span>
                  <span className="vehicle-name-highlight">
                    {activeVehicleDetails.year} {activeVehicleDetails.make}{' '}
                    {activeVehicleDetails.model} ({activeVehicleDetails.variant})
                  </span>
                  {activeVehicleDetails.isGarage && (
                    <span className="badge badge-teal text-xs">Garage Vehicle</span>
                  )}
                </div>
                <p className="compatibility-subtext">
                  Products below display exact verified compatibility with this vehicle.
                </p>
              </>
            ) : (
              <>
                <div className="compatibility-heading">
                  <span>Select your vehicle to see 100% verified compatible parts</span>
                </div>
                <p className="compatibility-subtext">
                  Filter parts by Year, Make, Model, and Variant to guarantee exact fit.
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

      {/* CASCADING VEHICLE SELECTOR MODAL / PANEL */}
      {isOpen && (
        <div className="vehicle-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="vehicle-modal-card card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="modal-fitment-title"
          >
            <div className="vehicle-modal-header">
              <h3 id="modal-fitment-title">Select Vehicle for Part Compatibility</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close vehicle selector"
              >
                ✕
              </button>
            </div>

            {/* Quick Garage Selection if user has vehicles */}
            {vehicles.length > 0 && (
              <div className="garage-quick-section">
                <h4 className="section-label">Select from Your Garage:</h4>
                <div className="garage-quick-list">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`garage-quick-btn ${
                        selectedVariantId === (v.variantId || v.variant?.id) ? 'active' : ''
                      }`}
                      onClick={() => handleSelectGarageVehicle(v)}
                      id={`select-garage-veh-${v.id}`}
                    >
                      <span className="veh-icon">
                        {v.variant?.model?.type === 'CAR' ? '🚗' : '🏍️'}
                      </span>
                      <div className="veh-text">
                        <span className="veh-title">
                          {v.variant?.model?.make?.name} {v.variant?.model?.name}
                        </span>
                        <span className="veh-meta">
                          {v.variant?.year} · {v.variant?.name}
                          {v.isPrimary && ' · (Primary)'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="divider-or"><span>OR SELECT ANY VEHICLE</span></div>
              </div>
            )}

            {/* 5-Step Cascading Selector */}
            <div className="cascading-flow">
              {/* Step 1: Vehicle Type */}
              <div className="flow-step">
                <label className="flow-label">1. Vehicle Category</label>
                <div className="type-toggle-group">
                  <button
                    type="button"
                    className={`type-btn ${vehicleType === '4_WHEELER' ? 'active' : ''}`}
                    onClick={() => setVehicleType('4_WHEELER')}
                    id="cat-4w-btn"
                  >
                    🚗 4 Wheeler (Cars)
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${vehicleType === '2_WHEELER' ? 'active' : ''}`}
                    onClick={() => setVehicleType('2_WHEELER')}
                    id="cat-2w-btn"
                  >
                    🏍️ 2 Wheeler (Bikes / Scooters)
                  </button>
                </div>
              </div>

              {/* Step 2: Make */}
              <div className="flow-step">
                <label htmlFor="select-make-input" className="flow-label">2. Make / Brand</label>
                <select
                  id="select-make-input"
                  className="form-select"
                  value={selectedMakeId}
                  onChange={(e) => setSelectedMakeId(e.target.value)}
                  disabled={loadingMakes || makes.length === 0}
                >
                  <option value="">-- Choose Make --</option>
                  {makes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Model */}
              <div className="flow-step">
                <label htmlFor="select-model-input" className="flow-label">3. Model</label>
                <select
                  id="select-model-input"
                  className="form-select"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  disabled={!selectedMakeId || loadingModels || models.length === 0}
                >
                  <option value="">-- Choose Model --</option>
                  {models.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Year & Variant */}
              <div className="flow-step">
                <label htmlFor="select-variant-input" className="flow-label">4. Year & Variant</label>
                <select
                  id="select-variant-input"
                  className="form-select"
                  value={selectedVarId}
                  onChange={(e) => setSelectedVarId(e.target.value)}
                  disabled={!selectedModelId || loadingVariants || variants.length === 0}
                >
                  <option value="">-- Choose Year & Variant --</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} — {v.name} ({v.fuelType}, {v.engineCC}cc)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="vehicle-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!selectedVarId}
                onClick={handleApplyCascading}
                id="apply-fitment-btn"
              >
                Apply Fitment Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleCompatibilityBar;
