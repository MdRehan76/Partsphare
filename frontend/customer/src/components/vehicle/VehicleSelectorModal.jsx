import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { vehiclesService } from '../../services';
import { useVehicles } from '../../contexts/VehicleContext';
import { BrandLogo } from './BrandLogos';
import toast from 'react-hot-toast';
import './VehicleSelectorModal.css';

const STEPS = [
  { id: 1, label: 'Type', title: 'Vehicle Category' },
  { id: 2, label: 'Brand', title: 'Manufacturer / Make' },
  { id: 3, label: 'Model', title: 'Vehicle Model' },
  { id: 4, label: 'Variant', title: 'Year & Variant' },
  { id: 5, label: 'Details', title: 'Fitment & Details' },
];

export const VehicleSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  initialType = '4_WHEELER',
  initialVariantId = null,
  title = 'Select Vehicle for Part Fitment',
}) => {
  const { vehicles, addVehicle, selectVehicleForFitment } = useVehicles();

  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState(initialType);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const [nickname, setNickname] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [saveToGarage, setSaveToGarage] = useState(true);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Recently selected vehicles from localStorage
  const [recentVehicles, setRecentVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('partnexa_recent_vehicles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reset or initialize when modal opens, lock background scroll, handle Escape key
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      setBrandSearch('');
      setModelSearch('');
      if (initialVariantId) {
        // If an initial variant is specified, we can remain at step 1 or load its cascade
      } else {
        setStep(1);
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, initialVariantId, onClose]);

  // Fetch makes whenever vehicleType changes or step 2 is active
  useEffect(() => {
    if (isOpen && (step === 1 || step === 2)) {
      setLoadingMakes(true);
      vehiclesService
        .getMakes(vehicleType)
        .then(({ data }) => {
          setMakes(data.data || []);
        })
        .catch((err) => {
          console.error('Failed to load vehicle makes:', err);
          toast.error('Unable to fetch vehicle makes.');
        })
        .finally(() => setLoadingMakes(false));
    }
  }, [vehicleType, isOpen, step]);

  // Load models when make is selected
  const handleSelectMake = async (make) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedVariant(null);
    setModelSearch('');
    setLoadingModels(true);
    setStep(3);
    try {
      const { data } = await vehiclesService.getModels(make.id);
      setModels(data.data || []);
    } catch (err) {
      console.error('Failed to load models:', err);
      toast.error('Unable to load models for ' + make.name);
    } finally {
      setLoadingModels(false);
    }
  };

  // Load variants when model is selected
  const handleSelectModel = async (model) => {
    setSelectedModel(model);
    setSelectedVariant(null);
    setLoadingVariants(true);
    setStep(4);
    try {
      const { data } = await vehiclesService.getVariants(model.id);
      setVariants(data.data || []);
    } catch (err) {
      console.error('Failed to load variants:', err);
      toast.error('Unable to load variants for ' + model.name);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Select variant and advance to details
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setNickname(`${selectedMake?.name || ''} ${selectedModel?.name || ''}`.trim());
    setStep(5);
  };

  // Save selected vehicle to recents
  const saveVehicleToRecents = (vehiclePayload) => {
    try {
      const existing = [...recentVehicles];
      const filtered = existing.filter(
        (v) => (v.variantId || v.variant?.id) !== vehiclePayload.variant.id
      );
      const updated = [
        {
          id: `recent_${Date.now()}`,
          makeName: vehiclePayload.make.name,
          modelName: vehiclePayload.model.name,
          variantName: vehiclePayload.variant.name,
          year: vehiclePayload.variant.year,
          fuelType: vehiclePayload.variant.fuelType,
          variantId: vehiclePayload.variant.id,
          type: vehiclePayload.make.type,
          variant: vehiclePayload.variant,
        },
        ...filtered,
      ].slice(0, 4);

      setRecentVehicles(updated);
      localStorage.setItem('partnexa_recent_vehicles', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent vehicle:', e);
    }
  };

  // Quick select a recently selected vehicle or garage vehicle
  const handleQuickSelectRecent = (recent) => {
    const varId = recent.variantId || recent.variant?.id;
    const makeObj = { name: recent.makeName || recent.variant?.model?.make?.name, type: recent.type };
    const modelObj = { name: recent.modelName || recent.variant?.model?.name };
    const variantObj = recent.variant || { id: varId, name: recent.variantName, year: recent.year, fuelType: recent.fuelType };

    setSelectedMake(makeObj);
    setSelectedModel(modelObj);
    setSelectedVariant(variantObj);

    if (onSelect) {
      onSelect({
        variantId: varId,
        variant: variantObj,
        model: modelObj,
        make: makeObj,
      });
    }

    if (selectVehicleForFitment) {
      selectVehicleForFitment({
        id: `fitment_${varId}`,
        variantId: varId,
        variant: {
          ...variantObj,
          model: {
            ...modelObj,
            make: makeObj,
          },
        },
      });
    }

    toast.success(`Active vehicle set to ${makeObj.name} ${modelObj.name}! 🚗`);
    onClose();
  };

  // Complete selection on Details step
  const handleConfirmVehicle = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVariant || !selectedModel || !selectedMake) return;

    setSubmitting(true);
    try {
      const payload = {
        variantId: selectedVariant.id,
        nickname: nickname.trim() || `${selectedMake.name} ${selectedModel.name}`,
        regNumber: regNumber.trim().toUpperCase(),
        isPrimary: true,
        variant: {
          ...selectedVariant,
          model: {
            ...selectedModel,
            make: selectedMake,
          },
        },
        model: selectedModel,
        make: selectedMake,
      };

      // Save to recents
      saveVehicleToRecents(payload);

      // Save to user garage if requested
      if (saveToGarage && addVehicle) {
        try {
          await addVehicle({
            variantId: selectedVariant.id,
            nickname: payload.nickname,
            regNumber: payload.regNumber,
            isPrimary: true,
          });
        } catch (err) {
          // Handled inside context or guest fallback
        }
      }

      // Apply active fitment filter
      if (selectVehicleForFitment) {
        selectVehicleForFitment({
          id: `fitment_${selectedVariant.id}`,
          variantId: selectedVariant.id,
          nickname: payload.nickname,
          regNumber: payload.regNumber,
          variant: payload.variant,
        });
      }

      if (onSelect) {
        onSelect(payload);
      }

      toast.success(`Fitment active for ${selectedMake.name} ${selectedModel.name} ${selectedVariant.name}!`);
      onClose();
    } catch (err) {
      console.error('Error confirming vehicle:', err);
      toast.error('Failed to set vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter makes by search
  const filteredMakes = useMemo(() => {
    if (!brandSearch.trim()) return makes;
    const q = brandSearch.toLowerCase().trim();
    return makes.filter((m) => m.name.toLowerCase().includes(q));
  }, [makes, brandSearch]);

  // Filter models by search
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return models;
    const q = modelSearch.toLowerCase().trim();
    return models.filter((m) => m.name.toLowerCase().includes(q));
  }, [models, modelSearch]);

  if (!isOpen) return null;

  const modalNode = (
    <div className="vsm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="vsm-modal-title">
      <div className="vsm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vsm-header">
          <div className="vsm-header-text">
            <h2 id="vsm-modal-title" className="vsm-title">{title}</h2>
            <p className="vsm-subtitle">Guaranteed 100% exact part fitment and maintenance compatibility</p>
          </div>
          <button
            type="button"
            className="vsm-close-btn"
            onClick={onClose}
            aria-label="Close vehicle selector"
            id="vsm-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Breadcrumb / Step Progress Indicator */}
        <div className="vsm-progress-bar" role="navigation" aria-label="Selection progress">
          {STEPS.map((s, idx) => {
            const stepNum = s.id;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div
                key={s.id}
                className={`vsm-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isCompleted) setStep(stepNum);
                }}
                role="button"
                tabIndex={isCompleted ? 0 : -1}
                title={isCompleted ? `Go back to ${s.label}` : s.label}
              >
                <div className="vsm-step-icon">
                  {isCompleted ? '✓' : stepNum}
                </div>
                <div className="vsm-step-info">
                  <span className="vsm-step-tag">Step {stepNum}</span>
                  <span className="vsm-step-name">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && <div className="vsm-step-connector" />}
              </div>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="vsm-body">
          {/* STEP 1: VEHICLE TYPE */}
          {step === 1 && (
            <div className="vsm-step-pane animate-fade-in" id="vsm-step-1">
              <div className="vsm-pane-header">
                <h3>Select Vehicle Category</h3>
                <p>Choose whether you are shopping for a four-wheeler car/SUV or a two-wheeler motorcycle/scooter</p>
              </div>

              <div className="vsm-type-grid">
                <div
                  className={`vsm-type-card ${vehicleType === '4_WHEELER' ? 'selected' : ''}`}
                  onClick={() => {
                    setVehicleType('4_WHEELER');
                    setStep(2);
                  }}
                  id="vsm-type-4w-card"
                  role="button"
                  tabIndex={0}
                >
                  <div className="vsm-type-icon-wrapper">
                    <span className="vsm-type-emoji">🚗</span>
                  </div>
                  <div className="vsm-type-content">
                    <h4>4 Wheeler (Cars & SUVs)</h4>
                    <p>Sedans, Hatchbacks, SUVs, MUVs, Compacts & EVs</p>
                    <div className="vsm-type-badge">
                      <span>20 Manufacturers Available</span>
                    </div>
                  </div>
                  <div className="vsm-type-arrow">→</div>
                </div>

                <div
                  className={`vsm-type-card ${vehicleType === '2_WHEELER' ? 'selected' : ''}`}
                  onClick={() => {
                    setVehicleType('2_WHEELER');
                    setStep(2);
                  }}
                  id="vsm-type-2w-card"
                  role="button"
                  tabIndex={0}
                >
                  <div className="vsm-type-icon-wrapper">
                    <span className="vsm-type-emoji">🏍️</span>
                  </div>
                  <div className="vsm-type-content">
                    <h4>2 Wheeler (Bikes & Scooters)</h4>
                    <p>Motorcycles, Scooters, Cruisers & Electric 2-Wheelers</p>
                    <div className="vsm-type-badge">
                      <span>9 Major Brands Available</span>
                    </div>
                  </div>
                  <div className="vsm-type-arrow">→</div>
                </div>
              </div>

              {/* Quick Select from Recently Selected if any */}
              {recentVehicles.length > 0 && (
                <div className="vsm-recents-section">
                  <div className="vsm-recents-title">
                    <span>⚡ Recently Selected Vehicles:</span>
                  </div>
                  <div className="vsm-recents-chips">
                    {recentVehicles.map((rv) => (
                      <button
                        key={rv.id}
                        type="button"
                        className="vsm-recent-chip"
                        onClick={() => handleQuickSelectRecent(rv)}
                        id={`recent-chip-${rv.variantId}`}
                      >
                        <span className="recent-chip-icon">
                          {rv.type === 'CAR' ? '🚗' : '🏍️'}
                        </span>
                        <span className="recent-chip-text">
                          {rv.year} {rv.makeName} {rv.modelName} ({rv.variantName})
                        </span>
                        <span className="recent-chip-action">Use Fitment ↵</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BRAND / MANUFACTURER */}
          {step === 2 && (
            <div className="vsm-step-pane animate-fade-in" id="vsm-step-2">
              <div className="vsm-pane-header flex-header">
                <div>
                  <h3>Select {vehicleType === '4_WHEELER' ? 'Car' : '2-Wheeler'} Manufacturer</h3>
                  <p>Displaying authentic database-verified brands with live model catalogs</p>
                </div>
                <div className="vsm-active-tag">
                  {vehicleType === '4_WHEELER' ? '🚗 4-Wheeler' : '🏍️ 2-Wheeler'}
                  <button type="button" className="vsm-tag-change" onClick={() => setStep(1)}>
                    Change
                  </button>
                </div>
              </div>

              {/* Recently Selected Bar */}
              {recentVehicles.length > 0 && (
                <div className="vsm-recents-mini-bar">
                  <span className="mini-bar-label">⚡ Recent:</span>
                  <div className="mini-chips-scroll">
                    {recentVehicles.map((rv) => (
                      <button
                        key={rv.id}
                        type="button"
                        className="vsm-mini-chip"
                        onClick={() => handleQuickSelectRecent(rv)}
                        title="Click to instantly select this vehicle"
                      >
                        {rv.makeName} {rv.modelName} ({rv.year})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Search Bar */}
              <div className="vsm-search-bar">
                <span className="vsm-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search brand (e.g. Maruti, Hyundai, Tata, BMW, Mercedes)..."
                  className="vsm-search-input"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  id="vsm-brand-search-input"
                  autoFocus
                />
                {brandSearch && (
                  <button
                    type="button"
                    className="vsm-search-clear"
                    onClick={() => setBrandSearch('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <span className="vsm-search-count">
                  {filteredMakes.length} {filteredMakes.length === 1 ? 'brand' : 'brands'}
                </span>
              </div>

              {/* Brand Grid */}
              {loadingMakes ? (
                <div className="vsm-loading-container">
                  <div className="vsm-spinner" />
                  <p>Loading vehicle manufacturers...</p>
                </div>
              ) : filteredMakes.length === 0 ? (
                <div className="vsm-empty-state">
                  <span>🚗</span>
                  <h4>No manufacturers found for "{brandSearch}"</h4>
                  <p>Try searching with another name or clear your search query.</p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-3"
                    onClick={() => setBrandSearch('')}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="vsm-brand-grid">
                  {filteredMakes.map((make) => (
                    <div
                      key={make.id}
                      className={`vsm-brand-card ${selectedMake?.id === make.id ? 'active' : ''}`}
                      onClick={() => handleSelectMake(make)}
                      id={`vsm-make-${make.id}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="vsm-brand-logo-wrap">
                        <BrandLogo brandId={make.id} brandName={make.name} size={48} />
                      </div>
                      <div className="vsm-brand-details">
                        <span className="vsm-brand-name">{make.name}</span>
                        <span className="vsm-brand-model-count">
                          {make._count?.models || 0} {make._count?.models === 1 ? 'model' : 'models'} available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MODEL SELECTION */}
          {step === 3 && (
            <div className="vsm-step-pane animate-fade-in" id="vsm-step-3">
              <div className="vsm-pane-header flex-header">
                <div>
                  <h3>Select {selectedMake?.name} Model</h3>
                  <p>Choose the model series from {selectedMake?.name}'s authentic lineup</p>
                </div>
                <div className="vsm-selected-crumb">
                  <BrandLogo brandId={selectedMake?.id} brandName={selectedMake?.name} size={24} />
                  <span>{selectedMake?.name}</span>
                  <button type="button" className="vsm-crumb-edit" onClick={() => setStep(2)}>
                    Change Brand
                  </button>
                </div>
              </div>

              {/* Model Search Bar */}
              <div className="vsm-search-bar">
                <span className="vsm-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${selectedMake?.name} models (e.g. ${selectedMake?.name === 'Maruti Suzuki' ? 'Swift, Baleno, Brezza, Fronx' : 'Model name'})...`}
                  className="vsm-search-input"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  id="vsm-model-search-input"
                  autoFocus
                />
                {modelSearch && (
                  <button
                    type="button"
                    className="vsm-search-clear"
                    onClick={() => setModelSearch('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <span className="vsm-search-count">
                  {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
                </span>
              </div>

              {/* Model Grid */}
              {loadingModels ? (
                <div className="vsm-loading-container">
                  <div className="vsm-spinner" />
                  <p>Loading models for {selectedMake?.name}...</p>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="vsm-empty-state">
                  <span>🚘</span>
                  <h4>No models found matching "{modelSearch}"</h4>
                  <p>Check the spelling or clear the search filter.</p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-3"
                    onClick={() => setModelSearch('')}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="vsm-model-grid">
                  {filteredModels.map((model) => (
                    <div
                      key={model.id}
                      className={`vsm-model-card ${selectedModel?.id === model.id ? 'active' : ''}`}
                      onClick={() => handleSelectModel(model)}
                      id={`vsm-model-${model.id}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="vsm-model-card-top">
                        <span className="vsm-model-type-tag">
                          {model.type === 'CAR' ? 'Passenger Car' : 'Two-Wheeler'}
                        </span>
                        <span className="vsm-model-variant-count">
                          {model._count?.variants || 0} Variants
                        </span>
                      </div>
                      <h4 className="vsm-model-name">{model.name}</h4>
                      <div className="vsm-model-card-footer">
                        <span>Select Variants →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: VARIANT & YEAR */}
          {step === 4 && (
            <div className="vsm-step-pane animate-fade-in" id="vsm-step-4">
              <div className="vsm-pane-header flex-header">
                <div>
                  <h3>Select Year & Variant</h3>
                  <p>Filter by manufacturing year, powertrain, transmission and trim level</p>
                </div>
                <div className="vsm-selected-crumb">
                  <BrandLogo brandId={selectedMake?.id} brandName={selectedMake?.name} size={24} />
                  <span>{selectedMake?.name} {selectedModel?.name}</span>
                  <button type="button" className="vsm-crumb-edit" onClick={() => setStep(3)}>
                    Change Model
                  </button>
                </div>
              </div>

              {/* Variant Grid */}
              {loadingVariants ? (
                <div className="vsm-loading-container">
                  <div className="vsm-spinner" />
                  <p>Loading variants for {selectedModel?.name}...</p>
                </div>
              ) : variants.length === 0 ? (
                <div className="vsm-empty-state">
                  <span>⚙️</span>
                  <h4>No variants found for this model</h4>
                  <p>Please select another model or brand.</p>
                  <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setStep(3)}>
                    ← Back to Models
                  </button>
                </div>
              ) : (
                <div className="vsm-variant-grid">
                  {variants.map((v) => {
                    const fuelColor =
                      v.fuelType === 'PETROL'
                        ? 'fuel-petrol'
                        : v.fuelType === 'DIESEL'
                        ? 'fuel-diesel'
                        : v.fuelType === 'CNG'
                        ? 'fuel-cng'
                        : v.fuelType === 'ELECTRIC'
                        ? 'fuel-electric'
                        : 'fuel-hybrid';

                    return (
                      <div
                        key={v.id}
                        className={`vsm-variant-card ${selectedVariant?.id === v.id ? 'active' : ''}`}
                        onClick={() => handleSelectVariant(v)}
                        id={`vsm-variant-${v.id}`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="vsm-variant-top">
                          <span className="vsm-variant-year-badge">{v.year}</span>
                          <span className={`vsm-fuel-pill ${fuelColor}`}>{v.fuelType}</span>
                        </div>
                        <h4 className="vsm-variant-name">{v.name}</h4>
                        <div className="vsm-variant-specs">
                          {v.engineCC ? <span>⚙️ {v.engineCC} cc</span> : null}
                          {v.transmission ? <span>🕹️ {v.transmission}</span> : null}
                        </div>
                        <div className="vsm-variant-action">
                          <span>Confirm Fitment →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: DETAILS & CONFIRMATION */}
          {step === 5 && (
            <form onSubmit={handleConfirmVehicle} className="vsm-step-pane animate-fade-in" id="vsm-step-5">
              <div className="vsm-pane-header">
                <h3>Fitment Details & Confirmation</h3>
                <p>Review vehicle specifications and set active fitment for guaranteed OEM compatibility</p>
              </div>

              {/* Vehicle Hero Summary Card */}
              <div className="vsm-summary-hero card">
                <div className="vsm-hero-top">
                  <div className="vsm-hero-brand">
                    <BrandLogo brandId={selectedMake?.id} brandName={selectedMake?.name} size={54} />
                    <div className="vsm-hero-names">
                      <span className="vsm-hero-make">{selectedMake?.name}</span>
                      <h3 className="vsm-hero-title">
                        {selectedModel?.name} ({selectedVariant?.year})
                      </h3>
                      <span className="vsm-hero-variant-badge">
                        Trim: {selectedVariant?.name}
                      </span>
                    </div>
                  </div>
                  <div className="vsm-hero-guarantee">
                    <span className="guarantee-shield">🛡️</span>
                    <div>
                      <strong>100% Fitment Guarantee</strong>
                      <p>All catalog parts are filtered for this exact vehicle configuration</p>
                    </div>
                  </div>
                </div>

                <div className="vsm-hero-specs-row">
                  <div className="spec-pill">
                    <span className="spec-label">Year</span>
                    <span className="spec-val">{selectedVariant?.year}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-val">{selectedVariant?.fuelType}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-val">{selectedVariant?.transmission || 'Standard'}</span>
                  </div>
                  {selectedVariant?.engineCC ? (
                    <div className="spec-pill">
                      <span className="spec-label">Engine CC</span>
                      <span className="spec-val">{selectedVariant.engineCC} cc</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Optional Customization Fields */}
              <div className="vsm-inputs-row">
                <div className="vsm-input-group">
                  <label htmlFor="vsm-nickname-input" className="vsm-label">
                    Vehicle Nickname (Optional)
                  </label>
                  <input
                    id="vsm-nickname-input"
                    type="text"
                    className="vsm-input"
                    placeholder="e.g. My Daily Swift, Office Commuter"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <span className="vsm-help-text">Display name used in your garage and notifications</span>
                </div>

                <div className="vsm-input-group">
                  <label htmlFor="vsm-regnum-input" className="vsm-label">
                    Registration Number (Optional)
                  </label>
                  <div className="vsm-ind-plate-wrap">
                    <span className="ind-badge">IND</span>
                    <input
                      id="vsm-regnum-input"
                      type="text"
                      className="vsm-input plate-input"
                      placeholder="e.g. MH 02 CB 1234"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                      maxLength={14}
                    />
                  </div>
                  <span className="vsm-help-text">Helps workshops & delivery partners identify your vehicle</span>
                </div>
              </div>

              {/* Garage Option */}
              <div className="vsm-checkbox-row">
                <label className="vsm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveToGarage}
                    onChange={(e) => setSaveToGarage(e.target.checked)}
                    id="vsm-save-to-garage-chk"
                  />
                  <span>Save this vehicle to <strong>My Garage</strong> for fast 1-click access across PartNexa</span>
                </label>
              </div>

              {/* Bottom Actions for Step 5 */}
              <div className="vsm-actions-bar">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(4)}
                  id="vsm-back-step4-btn"
                >
                  ← Back to Variants
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  id="vsm-confirm-fitment-btn"
                >
                  {submitting ? 'Applying Fitment...' : '✓ Set as Active Vehicle & View Parts'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Global Footer Navigation (Steps 1–4) */}
        {step < 5 && (
          <div className="vsm-footer">
            <div className="vsm-footer-left">
              {step > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost vsm-back-btn"
                  onClick={() => setStep(step - 1)}
                  id="vsm-global-back-btn"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="vsm-footer-right">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                id="vsm-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default VehicleSelectorModal;
