import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getJobById(id);
      setJob(data);
      if (data?.notes) setNotes(data.notes);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Forbidden: You do not have permission to access another partner\'s job.');
        navigate('/jobs/my');
      } else {
        toast.error('Failed to load delivery job details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleAccept = async () => {
    try {
      setUpdating(true);
      await deliveryService.acceptJob(id);
      toast.success('Job accepted! You are assigned to this delivery.');
      await fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept job.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      setUpdating(true);
      await deliveryService.updateJobStatus(id, status, notes);
      toast.success(`Delivery status updated to ${status}!`);
      await fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCollectCod = async () => {
    try {
      setUpdating(true);
      await deliveryService.recordCod(id, job?.codAmountToCollect);
      toast.success(`Collected COD cash ₹${job?.codAmountToCollect}! Payment cleared.`);
      await fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record COD cash.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛵</div>
        <div>Loading delivery navigation telemetry...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Job Not Found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const steps = ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(job.status);

  return (
    <div className="delivery-container">
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Title & Status */}
      <div
        className="delivery-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800 }}>
              {job.orderNumber || job.id}
            </h1>
            <span className={`delivery-badge ${job.type === 'USED_PART_PICKUP' ? 'badge-usedpart' : 'badge-transit'}`}>
              {job.type}
            </span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Delivery Fee: <strong style={{ color: 'var(--color-text-primary)' }}>₹{job.deliveryFee}</strong> • Distance: ~{job.distanceKm || 5.0} km
          </div>
        </div>

        <div>
          <span className="delivery-badge badge-transit" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
            STATUS: {job.status}
          </span>
        </div>
      </div>

      {/* Delivery Progression Stepper */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Delivery Status Progression
        </div>
        <div className="delivery-steps">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIdx > idx || job.status === 'DELIVERED';
            const isActive = currentStepIdx === idx;
            return (
              <div key={step} className={`step-node ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="step-label">
                  {step.replace('_', ' ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Navigation & Map Simulator Card */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            🧭 Live GPS Telemetry & Route Guidance
          </div>
          <span className="delivery-badge badge-online">GPS ACTIVE • 38 KM/H</span>
        </div>

        <div className="map-canvas-sim">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
                Current Navigation Route
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {job.navigationInfo?.routeSummary || 'Via Indiranagar 100ft Rd to Outer Ring Rd'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24' }}>
                {job.navigationInfo?.etaMinutes || 8} MIN
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {job.navigationInfo?.currentDistance || '2.4 km remaining'}
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Instruction Banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div style={{ fontSize: '1.6rem' }}>↰</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Turn left onto Marathahalli - Sarjapur Outer Ring Road in 350 meters
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Destination {job.dropLocation?.name} will be on the left
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations: Pickup vs Drop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Pickup Card */}
        <div className="delivery-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📍</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
              PICKUP LOCATION
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
            {job.pickupLocation?.name}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {job.pickupLocation?.address}
          </div>
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div><strong>Contact:</strong> {job.pickupLocation?.contactPerson}</div>
            <div><strong>Phone:</strong> {job.pickupLocation?.phone}</div>
          </div>
        </div>

        {/* Drop Card */}
        <div className="delivery-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-emerald)' }}>
              DROP LOCATION
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
            {job.dropLocation?.name}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {job.dropLocation?.address}
          </div>
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div><strong>Contact:</strong> {job.dropLocation?.contactPerson}</div>
            <div><strong>Phone:</strong> {job.dropLocation?.phone}</div>
          </div>
        </div>
      </div>

      {/* COD Payment & Used Part Inspection Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Payment & COD Card */}
        <div className="delivery-card">
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>
            💳 Payment & COD Collection
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Method: <strong>{job.paymentMethod || 'PREPAID / RAZORPAY'}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Status: <strong style={{ color: job.codStatus === 'COLLECTED' || job.paymentStatus === 'PAID' ? 'var(--color-emerald)' : '#EA580C' }}>
              {job.codStatus === 'COLLECTED' ? 'CASH COLLECTED BY RIDER' : job.paymentStatus || 'PENDING'}
            </strong>
          </div>

          {job.paymentMethod === 'CASH_ON_DELIVERY' && (
            <div style={{ padding: '0.85rem', background: 'rgba(234, 88, 12, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amount to Collect:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EA580C' }}>
                  ₹{job.codAmountToCollect}
                </span>
              </div>
              {job.codStatus !== 'COLLECTED' ? (
                <button
                  onClick={handleCollectCod}
                  disabled={updating}
                  className="btn btn-primary btn-block"
                  style={{ background: '#EA580C' }}
                >
                  💵 Confirm Cash Received (₹{job.codAmountToCollect})
                </button>
              ) : (
                <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-emerald)', fontSize: '0.85rem' }}>
                  ✓ ₹{job.codAmountCollected} Collected (Pending Hub Deposit)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Used Part Inspection Trigger Card */}
        {job.type === 'USED_PART_PICKUP' && (
          <div className="delivery-card" style={{ borderLeft: '5px solid #9333EA' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9333EA', marginBottom: '0.5rem' }}>
              🔍 Used-Part Doorstep Verification
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Verify component condition with the seller at pickup. Complete checklist, condition grading (A+ to D), and trigger automated valuation payout.
            </p>
            {job.verificationResult ? (
              <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div>Result: <strong>{job.verificationResult}</strong></div>
                <div>Condition Grade: <strong>Grade {job.conditionGrade}</strong></div>
              </div>
            ) : (
              <Link
                to={`/jobs/${job.id}/inspect`}
                className="btn btn-primary btn-block"
                style={{ background: '#9333EA' }}
              >
                Launch Doorstep Inspection Form →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Action Controls Bar */}
      <div className="delivery-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {job.status === 'ASSIGNED' && (
          <button
            onClick={handleAccept}
            disabled={updating}
            className="btn btn-primary"
          >
            Accept & Claim Delivery Job
          </button>
        )}

        {job.status === 'ACCEPTED' && (
          <button
            onClick={() => handleUpdateStatus('PICKED_UP')}
            disabled={updating}
            className="btn btn-primary"
          >
            📦 Confirm Package Picked Up
          </button>
        )}

        {job.status === 'PICKED_UP' && (
          <button
            onClick={() => handleUpdateStatus('IN_TRANSIT')}
            disabled={updating}
            className="btn btn-amber"
          >
            🛵 Start Transit to Drop Address
          </button>
        )}

        {job.status === 'IN_TRANSIT' && (
          <button
            onClick={() => handleUpdateStatus('DELIVERED')}
            disabled={updating}
            className="btn btn-emerald"
          >
            🏁 Confirm Delivered to Customer
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
