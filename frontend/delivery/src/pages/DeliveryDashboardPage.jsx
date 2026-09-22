import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeliveryAuth } from '../contexts/DeliveryAuthContext';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const DeliveryDashboardPage = () => {
  const { partner, toggleDuty } = useDeliveryAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await deliveryService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load rider dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAcceptJob = async (jobId) => {
    try {
      await deliveryService.acceptJob(jobId);
      toast.success('Job accepted! Added to your active delivery trips.');
      await fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept job.');
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await deliveryService.updateJobStatus(jobId, newStatus);
      toast.success(`Trip updated to ${newStatus.replace('_', ' ')}!`);
      await fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCollectCod = async (jobId, amount) => {
    try {
      await deliveryService.recordCod(jobId, amount);
      toast.success(`Collected COD cash ₹${amount}! Order marked PAID.`);
      await fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'COD collection recording failed.');
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛵</div>
        <div>Loading Delivery Partner Dashboard...</div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const activeTrips = dashboardData?.activeTrips || [];
  const availableJobs = dashboardData?.availableJobs || [];

  return (
    <div className="delivery-container">
      {/* Header with Greeting & Duty Toggle */}
      <div
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Rider Operations Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Live trips dispatch, GPS navigation telemetry, doorstep used-part inspection, and cash collection.
          </p>
        </div>

        {/* Duty Status Quick Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => toggleDuty(!partner?.isOnline)}
            className={`duty-switch-btn ${partner?.isOnline ? 'online' : 'offline'}`}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            <span className={`beacon-dot ${partner?.isOnline ? 'beacon-online' : 'beacon-offline'}`} />
            <span>{partner?.isOnline ? 'ON DUTY (ACCEPTING JOBS)' : 'OFF DUTY'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Available Jobs */}
        <div className="delivery-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Available Jobs
            </span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {metrics.availableJobsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Unassigned in your delivery zone
          </div>
        </div>

        {/* Active In-Transit */}
        <div className="delivery-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Active Trips
            </span>
            <span style={{ fontSize: '1.25rem' }}>🛵</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-amber)' }}>
            {metrics.activeTripsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            In pickup / transit status
          </div>
        </div>

        {/* COD Cash in Hand */}
        <div className="delivery-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              COD Cash in Hand
            </span>
            <span style={{ fontSize: '1.25rem' }}>💵</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#EA580C' }}>
            ₹{(metrics.pendingCashInHand || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {metrics.unreconciledCodJobsCount || 0} orders awaiting hub deposit
          </div>
        </div>

        {/* Used-Part Pickups */}
        <div className="delivery-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Used-Part Pickups
            </span>
            <span style={{ fontSize: '1.25rem' }}>🔍</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#9333EA' }}>
            {metrics.usedPartPickupsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Doorstep condition inspections
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="delivery-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total Delivered
            </span>
            <span style={{ fontSize: '1.25rem' }}>🏁</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
            {metrics.completedTripsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Earned: ₹{(metrics.totalTripEarnings || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Deliveries In Progress */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            🛵 Active Trips In Progress ({activeTrips.length})
          </h2>
          <Link to="/jobs/my" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            View All Trips →
          </Link>
        </div>

        {activeTrips.length === 0 ? (
          <div className="delivery-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>No Active Trips Right Now</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Check the available jobs below and claim an order to start delivering!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeTrips.map((trip) => (
              <div key={trip.id} className="delivery-card" style={{ borderLeft: '5px solid var(--color-amber)' }}>
                {/* Top Bar: Order & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {trip.orderNumber || trip.id}
                    </span>
                    <span className={`delivery-badge ${trip.type === 'USED_PART_PICKUP' ? 'badge-usedpart' : 'badge-transit'}`}>
                      {trip.type === 'USED_PART_PICKUP' ? 'USED-PART PICKUP' : 'PACKAGE DELIVERY'}
                    </span>
                    {trip.paymentMethod === 'CASH_ON_DELIVERY' && (
                      <span className="delivery-badge badge-cod">
                        COD: ₹{trip.codAmountToCollect}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="delivery-badge badge-transit">{trip.status}</span>
                    <Link to={`/jobs/${trip.id}`} className="btn btn-secondary btn-sm">
                      View Navigation & Map →
                    </Link>
                  </div>
                </div>

                {/* Pickup and Drop Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Pickup */}
                  <div style={{ padding: '0.85rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      📍 Pickup Location
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trip.pickupLocation?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{trip.pickupLocation?.address}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 600 }}>
                      Contact: {trip.pickupLocation?.contactPerson} ({trip.pickupLocation?.phone})
                    </div>
                  </div>

                  {/* Drop */}
                  <div style={{ padding: '0.85rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      🎯 Drop Destination
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trip.dropLocation?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{trip.dropLocation?.address}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 600 }}>
                      Contact: {trip.dropLocation?.contactPerson} ({trip.dropLocation?.phone})
                    </div>
                  </div>
                </div>

                {/* Items & Live Navigation info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.825rem' }}>
                    <strong>Items:</strong> {trip.items?.map((it) => `${it.title} (x${it.quantity || 1})`).join(', ') || 'Package Items'}
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    🧭 {trip.navigationInfo?.currentDistance || '2.4 km'} • {trip.navigationInfo?.etaMinutes || 8} min ETA
                  </div>
                </div>

                {/* Quick Status Action Controls */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
                  {trip.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'PICKED_UP')}
                      className="btn btn-primary btn-sm"
                    >
                      📦 Confirm Package Picked Up
                    </button>
                  )}

                  {trip.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'IN_TRANSIT')}
                      className="btn btn-amber btn-sm"
                    >
                      🛵 Start Transit to Drop Location
                    </button>
                  )}

                  {trip.status === 'IN_TRANSIT' && trip.type !== 'USED_PART_PICKUP' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'DELIVERED')}
                      className="btn btn-emerald btn-sm"
                    >
                      🏁 Confirm Delivered to Customer
                    </button>
                  )}

                  {/* COD Collection Button */}
                  {trip.paymentMethod === 'CASH_ON_DELIVERY' && trip.codStatus !== 'COLLECTED' && (
                    <button
                      onClick={() => handleCollectCod(trip.id, trip.codAmountToCollect)}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#EA580C' }}
                    >
                      💵 Collect COD Cash (₹{trip.codAmountToCollect})
                    </button>
                  )}

                  {/* Used-Part Doorstep Inspection Button */}
                  {trip.type === 'USED_PART_PICKUP' && (
                    <Link
                      to={`/jobs/${trip.id}/inspect`}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#9333EA' }}
                    >
                      🔍 Conduct Doorstep Inspection Checklist →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Available Open Jobs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            📦 Available Jobs Feed ({availableJobs.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Real-time open broadcast
          </span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="delivery-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📭</div>
            <div style={{ fontWeight: 600 }}>No unassigned jobs currently in this radius.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {availableJobs.map((job) => (
              <div key={job.id} className="delivery-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800 }}>{job.orderNumber || job.id}</span>
                    <span className="delivery-badge badge-assigned">₹{job.deliveryFee} FEE</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <div><strong>Pickup:</strong> {job.pickupLocation?.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.775rem' }}>{job.pickupLocation?.address}</div>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <div><strong>Drop:</strong> {job.dropLocation?.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.775rem' }}>{job.dropLocation?.address}</div>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Distance: ~{job.distanceKm || 5.0} km • {job.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD Required' : 'Prepaid'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    className="btn btn-primary btn-sm btn-block"
                  >
                    Accept & Claim Job
                  </button>
                  <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
