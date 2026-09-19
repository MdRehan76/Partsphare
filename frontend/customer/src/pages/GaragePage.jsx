import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../contexts/VehicleContext';
import { vehiclesService } from '../services';
import { Button, Modal, Input } from '../components/ui';
import toast from 'react-hot-toast';
import './GaragePage.css';

const VehicleCard = ({ vehicle, onEdit, onRemove, onSetPrimary }) => {
  const { variant } = vehicle;
  const make = variant?.model?.make;
  const model = variant?.model;
  const is2Wheeler =
    make?.type === 'BIKE' || make?.type === 'SCOOTER';

  return (
    <div
      className={`vehicle-card card ${vehicle.isPrimary ? 'primary' : ''}`}
      id={`garage-vehicle-${vehicle.id}`}
    >
      {vehicle.isPrimary && (
        <div className="primary-badge badge badge-primary">
          ⭐ Primary Vehicle
        </div>
      )}
      <div className="vehicle-card-body">
        <div className="vehicle-icon">{is2Wheeler ? '🏍️' : '🚗'}</div>
        <div className="vehicle-info">
          <div className="vehicle-name">
            {vehicle.nickname || `${make?.name} ${model?.name}`}
          </div>
          <div className="vehicle-details">
            <span>{make?.name} {model?.name}</span>
            <span className="dot">·</span>
            <span>{variant?.year}</span>
            <span className="dot">·</span>
            <span>{variant?.name}</span>
            <span className="dot">·</span>
            <span>{variant?.fuelType}</span>
          </div>
          {vehicle.regNumber && (
            <div className="vehicle-reg">{vehicle.regNumber}</div>
          )}
        </div>
      </div>

      <div className="vehicle-card-actions">
        <Link
          to={`/products?vehicleVariantId=${variant?.id}`}
          className="btn btn-primary btn-sm"
          id={`find-parts-${vehicle.id}`}
        >
          🔍 Find Parts
        </Link>
        {!vehicle.isPrimary && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onSetPrimary(vehicle.id)}
            id={`set-primary-${vehicle.id}`}
          >
            Set Primary
          </button>
        )}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(vehicle)}
          id={`edit-vehicle-${vehicle.id}`}
          title="Edit vehicle details"
          aria-label={`Edit ${vehicle.nickname || model?.name}`}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-ghost btn-sm danger-btn"
          onClick={() => onRemove(vehicle)}
          id={`remove-vehicle-${vehicle.id}`}
          title="Delete vehicle"
          aria-label={`Remove ${vehicle.nickname || model?.name}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

const AddVehicleModal = ({ onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('4_WHEELER');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [nickname, setNickname] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      vehiclesService
        .getMakes(vehicleType)
        .then(({ data }) => setMakes(data.data || []))
        .catch(() => toast.error('Failed to load makes'))
        .finally(() => setLoading(false));
    }
  }, [step, vehicleType]);

  const selectMake = async (make) => {
    setSelectedMake(make);
    setLoading(true);
    try {
      const { data } = await vehiclesService.getModels(make.id);
      setModels(data.data || []);
      setStep(3);
    } catch {
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const selectModel = async (model) => {
    setSelectedModel(model);
    setLoading(true);
    try {
      const { data } = await vehiclesService.getVariants(model.id);
      setVariants(data.data || []);
      setStep(4);
    } catch {
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  };

  const selectVariant = (variant) => {
    setSelectedVariant(variant);
    setNickname(`${selectedMake?.name} ${selectedModel?.name}`);
    setStep(5);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedVariant) return;
    setLoading(true);
    try {
      await onAdd({
        variantId: selectedVariant.id,
        nickname: nickname.trim(),
        regNumber: regNumber.trim().toUpperCase(),
      });
      onClose();
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Vehicle to Garage</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            id="modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="modal-steps">
          {['Type', 'Make', 'Model', 'Variant', 'Details'].map((s, i) => (
            <div
              key={s}
              className={`modal-step ${
                step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''
              }`}
            >
              <div className="step-dot">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="modal-step-content animate-fade-in-up">
              <h3 className="step-title">Select Vehicle Category</h3>
              <div className="type-options">
                <button
                  type="button"
                  className={`type-option ${vehicleType === '4_WHEELER' ? 'selected' : ''}`}
                  onClick={() => setVehicleType('4_WHEELER')}
                  id="garage-type-car"
                >
                  <span className="type-emoji">🚗</span>
                  <span>4 Wheeler (Car)</span>
                </button>
                <button
                  type="button"
                  className={`type-option ${vehicleType === '2_WHEELER' ? 'selected' : ''}`}
                  onClick={() => setVehicleType('2_WHEELER')}
                  id="garage-type-bike"
                >
                  <span className="type-emoji">🏍️</span>
                  <span>2 Wheeler (Bike/Scooter)</span>
                </button>
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-6"
                onClick={() => setStep(2)}
                id="garage-step1-next"
              >
                Next: Select Make →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step-content animate-fade-in-up">
              <h3 className="step-title">Select Brand / Make</h3>
              {loading ? (
                <p className="text-muted text-center py-4">Loading makes...</p>
              ) : (
                <div className="selection-grid">
                  {makes.map((make) => (
                    <button
                      key={make.id}
                      type="button"
                      className="selection-item"
                      onClick={() => selectMake(make)}
                      id={`garage-make-${make.id}`}
                    >
                      {make.name}
                      <span className="text-muted text-xs">
                        {make._count?.models || 0} models
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(1)}>
                ← Back
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="modal-step-content animate-fade-in-up">
              <h3 className="step-title">{selectedMake?.name} — Select Model</h3>
              {loading ? (
                <p className="text-muted text-center py-4">Loading models...</p>
              ) : (
                <div className="selection-grid">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      className="selection-item"
                      onClick={() => selectModel(model)}
                      id={`garage-model-${model.id}`}
                    >
                      {model.name}
                      <span className="text-muted text-xs">
                        {model._count?.variants || 0} variants
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(2)}>
                ← Back
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="modal-step-content animate-fade-in-up">
              <h3 className="step-title">{selectedModel?.name} — Select Year & Variant</h3>
              {loading ? (
                <p className="text-muted text-center py-4">Loading variants...</p>
              ) : (
                <div className="selection-grid">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className="selection-item"
                      onClick={() => selectVariant(variant)}
                      id={`garage-variant-${variant.id}`}
                    >
                      <span>{variant.year} — {variant.name}</span>
                      <span className="text-muted text-xs">
                        {variant.fuelType} {variant.engineCC ? `· ${variant.engineCC}cc` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep(3)}>
                ← Back
              </Button>
            </div>
          )}

          {step === 5 && (
            <form onSubmit={handleAdd} className="modal-step-content animate-fade-in-up">
              <h3 className="step-title">Vehicle Details</h3>
              <div className="selected-vehicle-summary">
                🚗 <strong>{selectedMake?.name} {selectedModel?.name}</strong>
                — {selectedVariant?.year} {selectedVariant?.name} ({selectedVariant?.fuelType})
              </div>

              <div className="form-group mt-4">
                <label className="form-label" htmlFor="garage-nickname">
                  Vehicle Nickname
                </label>
                <input
                  id="garage-nickname"
                  type="text"
                  className="form-input"
                  placeholder="e.g., My Swift, Daily Bike"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="garage-regnum">
                  Registration Number (Optional)
                </label>
                <input
                  id="garage-regnum"
                  type="text"
                  className="form-input"
                  placeholder="e.g., MH12AB1234"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                />
              </div>

              <div className="modal-actions">
                <Button type="button" variant="ghost" onClick={() => setStep(4)}>
                  ← Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  id="garage-add-confirm-btn"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const EditVehicleModal = ({ vehicle, onClose, onSave }) => {
  const [nickname, setNickname] = useState(vehicle.nickname || '');
  const [regNumber, setRegNumber] = useState(vehicle.regNumber || '');
  const [isPrimary, setIsPrimary] = useState(Boolean(vehicle.isPrimary));
  const [loading, setLoading] = useState(false);

  const make = vehicle.variant?.model?.make?.name;
  const model = vehicle.variant?.model?.name;
  const variant = vehicle.variant?.name;
  const year = vehicle.variant?.year;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(vehicle.id, {
        nickname: nickname.trim(),
        regNumber: regNumber.trim().toUpperCase(),
        isPrimary,
      });
      onClose();
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Vehicle Details" size="md">
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            🚗 {make} {model} ({year})
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Variant: {variant} · {vehicle.variant?.fuelType}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Input
            label="Nickname"
            placeholder="e.g. My Commuter Swift"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Input
            label="Registration Number"
            placeholder="e.g. KA01AB1234"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              id="edit-primary-checkbox"
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Set as my primary vehicle
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} id="edit-vehicle-save-btn">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteVehicleModal = ({ vehicle, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const name =
    vehicle.nickname ||
    `${vehicle.variant?.model?.make?.name} ${vehicle.variant?.model?.name}`;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(vehicle.id);
      onClose();
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Remove Vehicle from Garage" size="sm">
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
        Are you sure you want to remove <strong>{name}</strong> from your garage? This will also remove any active part fitment filters linked to this vehicle.
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={loading}
          onClick={handleDelete}
          id="confirm-delete-vehicle-btn"
        >
          Yes, Remove Vehicle
        </Button>
      </div>
    </Modal>
  );
};

const GaragePage = () => {
  const {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimaryVehicle,
  } = useVehicles();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  useEffect(() => {
    document.title = 'My Vehicles & Garage | PartNexa';
  }, []);

  return (
    <div className="garage-page">
      <div className="container">
        {/* Header */}
        <div className="garage-header animate-fade-in-up">
          <div>
            <h1 className="garage-title">My Vehicles & Garage</h1>
            <p className="garage-subtitle">
              Manage your registered cars & two-wheelers for guaranteed 100% part fitment
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            id="add-vehicle-btn"
          >
            + Add Vehicle
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="garage-loading">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="garage-empty animate-fade-in-up">
            <div className="garage-empty-icon">🚗</div>
            <h2>Your Garage is Empty</h2>
            <p>Add your car, motorcycle, or scooter to get personalized part fitment recommendations.</p>
            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onClick={() => setShowAddModal(true)}
              id="garage-empty-add-btn"
            >
              + Add Your First Vehicle
            </Button>
          </div>
        ) : (
          <div className="vehicles-grid stagger">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={(v) => setEditingVehicle(v)}
                onRemove={(v) => setDeletingVehicle(v)}
                onSetPrimary={(id) => setPrimaryVehicle(id)}
              />
            ))}

            {/* Add More Card */}
            <button
              type="button"
              className="add-vehicle-card"
              onClick={() => setShowAddModal(true)}
              id="add-more-vehicle-btn"
            >
              <div className="add-vehicle-icon">+</div>
              <div className="add-vehicle-text">Add Another Vehicle</div>
            </button>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onAdd={addVehicle}
        />
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={updateVehicle}
        />
      )}

      {/* Delete Vehicle Confirmation */}
      {deletingVehicle && (
        <DeleteVehicleModal
          vehicle={deletingVehicle}
          onClose={() => setDeletingVehicle(null)}
          onConfirm={deleteVehicle}
        />
      )}
    </div>
  );
};

export default GaragePage;
