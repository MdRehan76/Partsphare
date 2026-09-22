import React, { useState, useEffect } from 'react';
import shopService from '../services/shopService';
import toast from 'react-hot-toast';

export const UsedPartIntakePage = () => {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Intake Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    partTitle: '',
    sellerName: '',
    vehicleModel: '',
    physicalCondition: 'GOOD',
    technicalTestStatus: 'PASSED',
    technicianNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchIntakes = async () => {
    setLoading(true);
    try {
      const res = await shopService.getUsedParts();
      setIntakes(res.data || []);
    } catch (err) {
      toast.error('Failed to load used part intakes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    if (!formData.partTitle || !formData.technicianNotes) {
      toast.error('Please provide part title and bench test inspection notes.');
      return;
    }
    setSubmitting(true);
    try {
      await shopService.recordUsedPart(formData);
      toast.success('Used-part inspection recorded successfully!');
      setShowAddModal(false);
      setFormData({
        partTitle: '',
        sellerName: '',
        vehicleModel: '',
        physicalCondition: 'GOOD',
        technicalTestStatus: 'PASSED',
        technicianNotes: '',
      });
      fetchIntakes();
    } catch (err) {
      toast.error('Failed to record used-part intake.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Used-Part Intake & Verification</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Inspect, bench test, and grade pre-owned components dropped off by customers or delivery couriers.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          + Record Used Part Intake
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading used part intake queue...
        </div>
      ) : intakes.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>No Parts in Intake Queue</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            When customers drop off used parts for physical verification, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {intakes.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{item.id}</span>
                  <span
                    className={`badge ${
                      item.technicalTestStatus === 'PASSED'
                        ? 'badge-success'
                        : item.technicalTestStatus === 'NEEDS_TESTING'
                        ? 'badge-warning'
                        : 'badge-error'
                    }`}
                  >
                    {item.technicalTestStatus}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{item.partTitle}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Compatible with: <strong>{item.vehicleModel}</strong> • Seller: <strong>{item.sellerName}</strong>
                </div>

                <div
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Condition:</strong> <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{item.physicalCondition}</span>
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Technician Notes:</strong> {item.technicianNotes}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Intake: {new Date(item.intakeDate || item.createdAt).toLocaleDateString('en-IN')}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Intake Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Record Used-Part Intake & Inspection</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Perform bench testing, evaluate cosmetic & mechanical wear, and record technician notes.
            </p>

            <form onSubmit={handleSubmitIntake}>
              <div className="form-group">
                <label className="form-label">Part Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.partTitle}
                  onChange={(e) => setFormData({ ...formData, partTitle: e.target.value })}
                  placeholder="e.g. OEM Maruti Swift Starter Motor 12V"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="e.g. Swift 2018 Diesel"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Seller / Courier Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    placeholder="Customer drop-off"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Physical Condition Grade</label>
                  <select
                    className="form-select"
                    value={formData.physicalCondition}
                    onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
                  >
                    <option value="LIKE_NEW">Like New (A+)</option>
                    <option value="EXCELLENT">Excellent (A)</option>
                    <option value="GOOD">Good (B)</option>
                    <option value="FAIR">Fair (C)</option>
                    <option value="SALVAGE">Salvage (D)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bench Test Result</label>
                  <select
                    className="form-select"
                    value={formData.technicalTestStatus}
                    onChange={(e) => setFormData({ ...formData, technicalTestStatus: e.target.value })}
                  >
                    <option value="PASSED">Passed Electrical / Mechanical Test</option>
                    <option value="NEEDS_TESTING">Needs Further Component Testing</option>
                    <option value="DEFECTIVE">Defective / Failed Rig Test</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inspection & Technician Notes *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.technicianNotes}
                  onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
                  placeholder="Record voltage output, bearing play, gear mesh, leaks, or defects..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Submit Verification Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedPartIntakePage;
