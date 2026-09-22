import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const UsedPartInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Inspection Checklist
  const [checklist, setChecklist] = useState({
    structureIntegrity: true,
    mountingTabsIntact: true,
    partNumberMatches: true,
    connectorPinsNormal: true,
    cleanlinessAcceptable: true,
  });

  // Condition Grading (A+, A, B, C, D)
  const [conditionGrade, setConditionGrade] = useState('A');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
  ]);

  const [inspectionCompleted, setInspectionCompleted] = useState(false);
  const [inspectionResultData, setInspectionResultData] = useState(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getJobById(id);
      setJob(data);
      if (data?.verificationResult) {
        setInspectionCompleted(true);
        setInspectionResultData({
          result: data.verificationResult,
          conditionGrade: data.conditionGrade,
        });
      }
    } catch (err) {
      toast.error('Failed to load job for used-part verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleChecklistToggle = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const gradeMultipliers = {
    'A+': 0.90,
    'A': 0.80,
    'B': 0.70,
    'C': 0.55,
    'D': 0.00,
  };

  const expectedPrice = Number(job?.items?.[0]?.expectedPrice || 2600);
  const calculatedValuation = Math.round(expectedPrice * (gradeMultipliers[conditionGrade] || 0.75));

  const handleCompleteVerification = async (result) => {
    try {
      setSubmitting(true);
      const res = await deliveryService.verifyUsedPart(id, {
        conditionGrade,
        inspectionChecklist: checklist,
        photos,
        result,
        notes: notes || (result === 'APPROVED' ? `Doorstep inspection verified Grade ${conditionGrade}.` : 'Doorstep inspection failed quality threshold.'),
        calculatedValuation,
      });

      setInspectionCompleted(true);
      setInspectionResultData(res);
      if (result === 'APPROVED') {
        toast.success(`Doorstep inspection APPROVED! Seller payout of ₹${calculatedValuation} triggered.`);
      } else {
        toast.error('Part rejected based on doorstep inspection.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification recording failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <div>Loading doorstep inspection checklist...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={`/jobs/${id}`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
          ← Back to Trip Navigation
        </Link>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Used-Part Doorstep Physical Verification
          </h1>
          <span className="delivery-badge badge-usedpart">INSPECTION CONSOLE</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Perform technical condition grading, photo audit, and payout trigger at seller doorstep.
        </p>
      </div>

      {/* Item Summary Card */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem', borderLeft: '5px solid #9333EA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Component Under Verification
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {job?.items?.[0]?.title || 'Used Vehicle Component'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Seller: <strong>{job?.pickupLocation?.name}</strong> • Seller Asking: <strong>₹{expectedPrice}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Estimated Valuation
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#9333EA' }}>
              ₹{calculatedValuation}
            </div>
          </div>
        </div>
      </div>

      {/* If Completed Banner */}
      {inspectionCompleted && (
        <div
          className="delivery-card"
          style={{
            marginBottom: '1.75rem',
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>🎉</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-emerald)' }}>
                Doorstep Verification Completed: {inspectionResultData?.verificationResult || 'APPROVED'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Condition Grade: <strong>Grade {inspectionResultData?.conditionGrade || conditionGrade}</strong> • Seller Payout Triggered: <strong>₹{calculatedValuation}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Destination Shop Manifest created for Apex Auto Care intake.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Inspection Checklist */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
          1. Physical Inspection Checklist
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { key: 'structureIntegrity', label: 'Structural Integrity', desc: 'No cracks, deep fractures, bent mounting flanges, or collision deformities.' },
            { key: 'mountingTabsIntact', label: 'Mounting Tabs & Clips', desc: 'Factory clips, fastener holes, and alignment tabs are completely intact.' },
            { key: 'partNumberMatches', label: 'OEM Serial Number & Part ID', desc: 'Stamped OEM part number and model designation match listing description.' },
            { key: 'connectorPinsNormal', label: 'Connectors & Electrical Pins', desc: 'Harness plugs, pins, and wiring connectors are clean with no burns or pin bends.' },
            { key: 'cleanlinessAcceptable', label: 'Cleanliness & Leak Check', desc: 'Part is drained of corrosive residue and wiped clean of heavy road grease.' },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: checklist[item.key] ? 'var(--color-surface)' : 'transparent',
                border: `1px solid ${checklist[item.key] ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => handleChecklistToggle(item.key)}
                style={{ width: '18px', height: '18px', marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: Condition Grading */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          2. Doorstep Condition Grading
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Select the verified physical condition grade to calculate final seller payout:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {[
            { grade: 'A+', label: 'Grade A+ (Mint)', mult: '90%' },
            { grade: 'A', label: 'Grade A (Very Good)', mult: '80%' },
            { grade: 'B', label: 'Grade B (Good)', mult: '70%' },
            { grade: 'C', label: 'Grade C (Fair)', mult: '55%' },
            { grade: 'D', label: 'Grade D (Defective)', mult: '0%' },
          ].map((item) => (
            <button
              key={item.grade}
              type="button"
              onClick={() => setConditionGrade(item.grade)}
              className={`grade-pill ${conditionGrade === item.grade ? 'selected' : ''}`}
            >
              <div style={{ fontSize: '1.1rem' }}>{item.grade}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{item.mult} Value</div>
            </button>
          ))}
        </div>

        <div style={{ padding: '0.85rem 1rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          Selected: <strong>Grade {conditionGrade}</strong> • Payout Multiplier: <strong>{gradeMultipliers[conditionGrade] * 100}%</strong> • Final Seller Payout: <strong style={{ color: '#9333EA', fontSize: '1.05rem' }}>₹{calculatedValuation}</strong>
        </div>
      </div>

      {/* Step 3: Photographic Proof Audit */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          3. Photographic Evidence
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {photos.map((url, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img
                src={url}
                alt={`Proof ${i + 1}`}
                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              />
              <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-surface)' }}>
                {i === 0 ? 'Front / Lens Angle' : 'Mount Tabs & Serial Tag'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Notes */}
      <div className="delivery-card" style={{ marginBottom: '2rem' }}>
        <label className="form-label">Inspection Notes & Physical Remarks</label>
        <textarea
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Tab clips in pristine state, zero lens scuffing. Verified with seller Aarav Sharma."
        />
      </div>

      {/* Submit Decision Actions */}
      {!inspectionCompleted ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCompleteVerification('APPROVED')}
            disabled={submitting}
            className="btn btn-primary"
            style={{ background: '#9333EA', padding: '0.85rem 1.75rem' }}
          >
            {submitting ? 'Processing Payout...' : `✓ Approve Inspection & Trigger ₹${calculatedValuation} Payout`}
          </button>
          <button
            onClick={() => handleCompleteVerification('REJECTED')}
            disabled={submitting}
            className="btn btn-danger"
            style={{ padding: '0.85rem 1.5rem' }}
          >
            ✕ Reject Part at Doorstep
          </button>
        </div>
      ) : (
        <Link to={`/jobs/${id}`} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
          Return to Navigation & Transport to Hub →
        </Link>
      )}
    </div>
  );
};

export default UsedPartInspectionPage;
