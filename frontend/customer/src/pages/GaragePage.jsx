import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../contexts/VehicleContext';
import { vehiclesService } from '../services';
import { Button, Modal, Input } from '../components/ui';
import toast from 'react-hot-toast';
import './GaragePage.css';

import VehicleSelectorModal from '../components/vehicle/VehicleSelectorModal';
import { BrandLogo } from '../components/vehicle/BrandLogos';

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
        <div className="vehicle-icon">
          {make?.name ? (
            <BrandLogo brandName={make.name} size={38} />
          ) : (
            is2Wheeler ? '🏍️' : '🚗'
          )}
        </div>
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
          to={`/products?vehicleVariantId=${variant?.id}&compatibleOnly=true`}
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

      {/* Redesigned 5-Step Vehicle Selector Modal */}
      <VehicleSelectorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Vehicle to Your Garage"
      />

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
