import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';

export const UsedPartsListPage = () => {
  const [usedPartJobs, setUsedPartJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getMyJobs({ type: 'USED_PART_PICKUP' });
      setUsedPartJobs(data);
    } catch (err) {
      toast.error('Failed to load used-part pickup assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <div>Loading doorstep used-part pickup tasks...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Doorstep Used-Part Inspection & Pickups ({usedPartJobs.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Circular economy pickup flow: Inspect part condition at seller address, assign Grade (A+ to D), trigger automated payout, and drop off at partner shop hub.
        </p>
      </div>

      {usedPartJobs.length === 0 ? (
        <div className="delivery-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Used-Part Pickups Assigned</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            When customers submit used spare parts for sale, pickup assignments will appear here.
          </div>
          <Link to="/jobs/available" className="btn btn-primary btn-sm">
            Check Available Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {usedPartJobs.map((job) => (
            <div key={job.id} className="delivery-card" style={{ borderLeft: '5px solid #9333EA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    {job.orderNumber || job.id}
                  </span>
                  <span className="delivery-badge badge-usedpart">
                    USED-PART PICKUP
                  </span>
                  <span className="delivery-badge badge-transit">
                    {job.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: '#9333EA' }}>
                    Fee: ₹{job.deliveryFee}
                  </span>
                  <Link to={`/jobs/${job.id}/inspect`} className="btn btn-primary btn-sm" style={{ background: '#9333EA' }}>
                    {job.verificationResult ? 'View Inspection Audit' : 'Launch Inspection Checklist →'}
                  </Link>
                </div>
              </div>

              {/* Component Info */}
              <div style={{ padding: '0.85rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {job.items?.[0]?.title || 'Used Vehicle Part'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Expected Seller Valuation: <strong>₹{job.items?.[0]?.expectedPrice || 2600}</strong> • Distance: ~{job.distanceKm || 11.5} km
                </div>
                {job.conditionGrade && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-emerald)' }}>
                    ✓ Verified Condition: Grade {job.conditionGrade} ({job.verificationResult})
                  </div>
                )}
              </div>

              {/* Pickup vs Hub Drop */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    📍 Seller Doorstep Pickup
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{job.pickupLocation?.name}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{job.pickupLocation?.address}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Phone: {job.pickupLocation?.phone}</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase' }}>
                    🎯 Mechanical Hub Drop Destination
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{job.dropLocation?.name}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{job.dropLocation?.address}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Intake Desk: {job.dropLocation?.contactPerson}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsedPartsListPage;
