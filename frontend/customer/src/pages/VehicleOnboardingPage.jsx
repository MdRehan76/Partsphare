import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../contexts/VehicleContext';
import { vehiclesService } from '../services';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';
import './VehicleOnboardingPage.css';

const STEPS = ['Type', 'Make', 'Model', 'Variant', 'Details'];

const VehicleOnboardingPage = () => {
  const navigate = useNavigate();
  const { addVehicle } = useVehicles();

  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('4_WHEELER'); // '2_WHEELER' or '4_WHEELER'
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [nickname, setNickname] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Vehicle Onboarding | PartNexa';
  }, []);

  // Fetch makes when vehicleType changes or step 2 reached
  useEffect(() => {
    if (step >= 2) {
      setLoading(true);
      vehiclesService
        .getMakes(vehicleType)
        .then(({ data }) => setMakes(data.data || []))
        .catch(() => toast.error('Failed to load vehicle makes'))
        .finally(() => setLoading(false));
    }
  }, [step, vehicleType]);

  const handleSelectMake = async (make) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedVariant(null);
    setLoading(true);
    try {
      const { data } = await vehiclesService.getModels(make.id);
      setModels(data.data || []);
      setStep(3);
    } catch {
      toast.error('Failed to load models for this make');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = async (model) => {
    setSelectedModel(model);
    setSelectedVariant(null);
    setLoading(true);
    try {
      const { data } = await vehiclesService.getVariants(model.id);
      setVariants(data.data || []);
      setStep(4);
    } catch {
      toast.error('Failed to load variants for this model');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setNickname(`${selectedMake?.name} ${selectedModel?.name}`);
    setStep(5);
  };

  const handleFinishOnboarding = async (e) => {
    e.preventDefault();
    if (!selectedVariant) {
      toast.error('Please select a vehicle variant');
      return;
    }

    setSubmitting(true);
    try {
      await addVehicle({
        variantId: selectedVariant.id,
        nickname: nickname.trim() || `${selectedMake?.name} ${selectedModel?.name}`,
        regNumber: regNumber.trim().toUpperCase(),
        isPrimary: true,
      });

      toast.success('🚗 Welcome to PartNexa! Your primary vehicle is set.');
      navigate('/vehicles');
    } catch {
      // Error toast is handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="container onboarding-container">
        {/* Header */}
        <div className="onboarding-header animate-fade-in-up">
          <div className="onboarding-badge">Step 1 of 1 · Vehicle Setup</div>
          <h1 className="onboarding-title">Let’s Add Your Primary Vehicle</h1>
          <p className="onboarding-subtitle">
            PartNexa matches 100% compatible spare parts, fluids, and maintenance schedules for your exact ride.
          </p>
        </div>

        {/* Stepper */}
        <div className="onboarding-stepper">
          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div
                key={s}
                className={`stepper-node ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
              >
                <div className="stepper-node-dot">
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className="stepper-node-label">{s}</span>
              </div>
            );
          })}
        </div>

        {/* Card Content */}
        <div className="onboarding-card animate-scale-in">
          {/* Step 1: Vehicle Type */}
          {step === 1 && (
            <div>
              <h2 className="step-heading">Select Your Vehicle Category</h2>
              <div className="type-grid">
                <div
                  className={`type-btn ${vehicleType === '4_WHEELER' ? 'selected' : ''}`}
                  onClick={() => setVehicleType('4_WHEELER')}
                  id="onboarding-type-4w"
                >
                  <span className="type-btn-icon">🚗</span>
                  <div className="type-btn-label">4 Wheeler</div>
                  <div className="type-btn-desc">Cars, Sedans, SUVs, Hatchbacks</div>
                </div>

                <div
                  className={`type-btn ${vehicleType === '2_WHEELER' ? 'selected' : ''}`}
                  onClick={() => setVehicleType('2_WHEELER')}
                  id="onboarding-type-2w"
                >
                  <span className="type-btn-icon">🏍️</span>
                  <div className="type-btn-label">2 Wheeler</div>
                  <div className="type-btn-desc">Motorcycles, Scooters, Superbikes</div>
                </div>
              </div>

              <div className="onboarding-actions" style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  id="onboarding-step1-next"
                >
                  Continue to Make →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Make Selection */}
          {step === 2 && (
            <div>
              <h2 className="step-heading">
                Select Brand / Make ({vehicleType === '4_WHEELER' ? 'Car' : '2-Wheeler'})
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <span className="spinner spinner-lg" />
                  <p className="text-muted mt-2">Loading vehicle manufacturers...</p>
                </div>
              ) : (
                <div className="selection-grid-modern">
                  {makes.map((m) => (
                    <div
                      key={m.id}
                      className={`select-box-item ${
                        selectedMake?.id === m.id ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectMake(m)}
                      id={`make-item-${m.id}`}
                    >
                      <div className="select-box-title">{m.name}</div>
                      <div className="select-box-sub">
                        {m._count?.models || 0} models available
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="onboarding-actions">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ← Back to Category
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Model Selection */}
          {step === 3 && (
            <div>
              <div className="selection-summary-badge">
                <span>Selected Brand: <strong>{selectedMake?.name}</strong></span>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Change
                </Button>
              </div>

              <h2 className="step-heading">Select Model</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <span className="spinner spinner-lg" />
                  <p className="text-muted mt-2">Loading models for {selectedMake?.name}...</p>
                </div>
              ) : (
                <div className="selection-grid-modern">
                  {models.map((m) => (
                    <div
                      key={m.id}
                      className={`select-box-item ${
                        selectedModel?.id === m.id ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectModel(m)}
                      id={`model-item-${m.id}`}
                    >
                      <div className="select-box-title">{m.name}</div>
                      <div className="select-box-sub">
                        {m._count?.variants || 0} variants
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="onboarding-actions">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  ← Back to Makes
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Year & Variant Selection */}
          {step === 4 && (
            <div>
              <div className="selection-summary-badge">
                <span>
                  Selected Model: <strong>{selectedMake?.name} {selectedModel?.name}</strong>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  Change
                </Button>
              </div>

              <h2 className="step-heading">Select Manufacturing Year & Variant</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <span className="spinner spinner-lg" />
                  <p className="text-muted mt-2">Loading variants...</p>
                </div>
              ) : (
                <div className="selection-grid-modern">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className={`select-box-item ${
                        selectedVariant?.id === v.id ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectVariant(v)}
                      id={`variant-item-${v.id}`}
                    >
                      <div className="select-box-title">
                        {v.year} — {v.name}
                      </div>
                      <div className="select-box-sub">
                        {v.fuelType} {v.engineCC ? `· ${v.engineCC}cc` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="onboarding-actions">
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  ← Back to Models
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Vehicle Details (Reg Number & Nickname) */}
          {step === 5 && (
            <form onSubmit={handleFinishOnboarding}>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '24px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Selected Vehicle:
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginTop: '2px',
                  }}
                >
                  🚗 {selectedMake?.name} {selectedModel?.name} ({selectedVariant?.year})
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-primary-600)', marginTop: '4px' }}>
                  {selectedVariant?.name} · {selectedVariant?.fuelType}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <Input
                  label="Vehicle Nickname"
                  placeholder="e.g. My Swift, Daily Ride"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />

                <Input
                  label="Registration Number (Optional)"
                  placeholder="e.g. KA01AB1234"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                />
              </div>

              <div className="onboarding-actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(4)}
                >
                  ← Back to Variants
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  id="onboarding-finish-btn"
                >
                  Save & Complete Onboarding →
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleOnboardingPage;
