import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const AvailableJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getAvailableJobs();
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load available jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (jobId) => {
    try {
      await deliveryService.acceptJob(jobId);
      toast.success('Job successfully accepted! Added to your active delivery trips.');
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept job.');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterType === 'ALL') return true;
    return j.type === filterType;
  });

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
        <div>Loading open broadcast jobs...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Available Delivery Jobs ({filteredJobs.length})
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Unassigned orders and doorstep used-part pickups ready for dispatch.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'CUSTOMER_DELIVERY', 'USED_PART_PICKUP'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
            >
              {type === 'ALL' ? 'All Jobs' : type === 'CUSTOMER_DELIVERY' ? 'Package Deliveries' : 'Used-Part Pickups'}
            </button>
          ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="delivery-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Available Jobs Right Now</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            All available orders have been claimed by the fleet. Stay online to receive instant dispatch notifications.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="delivery-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${job.type === 'USED_PART_PICKUP' ? '#9333EA' : 'var(--color-primary)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {job.orderNumber || job.id}
                    </span>
                    <span
                      className={`delivery-badge ${job.type === 'USED_PART_PICKUP' ? 'badge-usedpart' : 'badge-assigned'}`}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      {job.type === 'USED_PART_PICKUP' ? 'USED PART' : 'ORDER'}
                    </span>
                  </div>
                  <span className="delivery-badge badge-delivered" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    ₹{job.deliveryFee} FEE
                  </span>
                </div>

                {/* Pickup & Drop Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.65rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      📍 Pickup
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{job.pickupLocation?.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{job.pickupLocation?.address}</div>
                  </div>

                  <div style={{ padding: '0.65rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase' }}>
                      🎯 Drop
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{job.dropLocation?.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{job.dropLocation?.address}</div>
                  </div>
                </div>

                {/* Route telemetry preview */}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  Distance: ~{job.distanceKm || 5.0} km • {job.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Collect COD' : '💳 Prepaid'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleAcceptJob(job.id)}
                  className="btn btn-primary btn-block"
                >
                  Accept & Claim Job
                </button>
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableJobsPage;
