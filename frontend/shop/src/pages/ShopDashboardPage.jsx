import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../services/shopService';
import toast from 'react-hot-toast';

export const ShopDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await shopService.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load shop dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    setActionLoading(jobId);
    try {
      const res = await shopService.updateJobStatus(jobId, newStatus);
      toast.success(`Job updated to ${newStatus}`);
      if (newStatus === 'COMPLETED' && res.data?.commissionStatus?.releaseStatus === 'RELEASED') {
        toast.success('🎉 Commission RELEASED to your ledger balance! Both service completion and payment conditions met.');
      }
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReceiveDelivery = async (delId) => {
    setActionLoading(delId);
    try {
      await shopService.receiveDelivery(delId, 'Shop Counter Desk');
      toast.success('Delivery marked as received and verified.');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update delivery status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading workshop dashboard...
      </div>
    );
  }

  const { shop, jobStatusCounts, deliveries, usedPartsIntake, customerVehicleVisits, earnings, recentJobs, upcomingToday } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome & Workshop Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-elevated))',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.75rem' }}>{shop?.name}</h1>
            <span className="badge badge-success">✓ {shop?.verificationStatus}</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {shop?.address}, {shop?.city} • Operational Rate: <strong>{shop?.commissionRate}% Platform Cut</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/calendar" className="btn btn-secondary">
            📅 View Calendar
          </Link>
          <Link to="/commission" className="btn btn-primary">
            💰 Commission Ledger (₹{earnings?.releasedForPayout?.toLocaleString('en-IN') || 0} Released)
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {/* 1. Active DIFM Installation Jobs */}
        <div className="stat-card">
          <div className="stat-card-title">DIFM Active Jobs</div>
          <div className="stat-card-val" style={{ color: 'var(--color-primary)' }}>
            {(jobStatusCounts?.scheduled || 0) + (jobStatusCounts?.inProgress || 0) + (jobStatusCounts?.accepted || 0)}
          </div>
          <div className="stat-card-sub">
            <span>{jobStatusCounts?.scheduled || 0} Sched</span> • <span>{jobStatusCounts?.inProgress || 0} In Prog</span> • <span>{jobStatusCounts?.completed || 0} Done</span>
          </div>
        </div>

        {/* 2. Customer Vehicle Visits */}
        <div className="stat-card">
          <div className="stat-card-title">Customer Vehicle Visits</div>
          <div className="stat-card-val" style={{ color: 'var(--color-teal)' }}>
            {customerVehicleVisits || 0}
          </div>
          <div className="stat-card-sub">Walk-ins & shop bay bookings</div>
        </div>

        {/* 3. Incoming Product Deliveries */}
        <div className="stat-card">
          <div className="stat-card-title">Incoming Deliveries</div>
          <div className="stat-card-val" style={{ color: deliveries?.pending > 0 ? 'var(--color-orange)' : 'var(--color-text-primary)' }}>
            {deliveries?.pending || 0}
          </div>
          <div className="stat-card-sub">
            <span>{deliveries?.total || 0} Total logged parts shipments</span>
          </div>
        </div>

        {/* 4. Used-Part Intake Queue */}
        <div className="stat-card">
          <div className="stat-card-title">Used-Part Intake</div>
          <div className="stat-card-val" style={{ color: 'var(--color-warning)' }}>
            {usedPartsIntake?.total || 0}
          </div>
          <div className="stat-card-sub">
            <span>{usedPartsIntake?.pendingVerification || 0} Pending bench testing</span>
          </div>
        </div>

        {/* 5. Released Net Earnings */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-card-title">Released Earnings</div>
          <div className="stat-card-val" style={{ color: '#10B981' }}>
            ₹{earnings?.releasedForPayout?.toLocaleString('en-IN') || 0}
          </div>
          <div className="stat-card-sub">
            <span>Ready for payout settlement</span>
          </div>
        </div>

        {/* 6. Locked Pending Balance */}
        <div className="stat-card">
          <div className="stat-card-title">Locked Commission</div>
          <div className="stat-card-val" style={{ color: 'var(--color-text-muted)' }}>
            ₹{(earnings?.lockedPendingCompletion + earnings?.lockedPendingPayment)?.toLocaleString('en-IN') || 0}
          </div>
          <div className="stat-card-sub" style={{ fontSize: '0.72rem' }}>
            Pending job completion or payment
          </div>
        </div>
      </div>

      {/* Main Operational Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: DIFM Installation Requests & Active Service Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active DIFM Requests Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>DIFM Installation Requests</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Customer jobs assigned to your workshop. Update status through the service lifecycle.
                </p>
              </div>
              <Link to="/calendar" className="btn btn-outline btn-sm">
                Full Schedule ↗
              </Link>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job / Order</th>
                    <th>Customer & Vehicle</th>
                    <th>Service Type</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentJobs || []).map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{job.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{job.orderNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{job.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {job.vehicleInfo} • {job.vehicleNumber}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{job.serviceName}</div>
                        <span className={`badge ${job.locationType === 'DOORSTEP' ? 'badge-purple' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                          {job.locationType === 'DOORSTEP' ? '🏠 Doorstep Visit' : '🏢 Shop Visit'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          ₹{Number(job.totalServiceAmount || job.serviceFee || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            job.status === 'COMPLETED'
                              ? 'badge-success'
                              : job.status === 'IN_PROGRESS'
                              ? 'badge-warning'
                              : job.status === 'ACCEPTED'
                              ? 'badge-info'
                              : job.status === 'CANCELLED'
                              ? 'badge-error'
                              : 'badge-neutral'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {job.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(job.id, 'ACCEPTED')}
                              disabled={actionLoading === job.id}
                              className="btn btn-secondary btn-sm"
                            >
                              Accept
                            </button>
                          )}
                          {job.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                              disabled={actionLoading === job.id}
                              className="btn btn-primary btn-sm"
                            >
                              Start Service
                            </button>
                          )}
                          {job.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                              disabled={actionLoading === job.id}
                              className="btn btn-success btn-sm"
                            >
                              ✓ Complete
                            </button>
                          )}
                          {job.status === 'COMPLETED' && (
                            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                              ✓ Finished
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Service Schedule Highlights */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.15rem' }}>Today's Appointments</h3>
              <span className="badge badge-info">{upcomingToday?.length || 0} scheduled</span>
            </div>

            {upcomingToday?.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No remaining appointments scheduled for today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingToday.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.serviceName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {item.customerName} • {item.vehicleInfo} ({item.scheduledSlot || 'Slot TBD'})
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-neutral">{item.status}</span>
                      {item.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                          disabled={actionLoading === item.id}
                          className="btn btn-success btn-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Incoming Deliveries & Used Part Intake */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Incoming Product Deliveries */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.05rem' }}>Incoming Deliveries</h3>
              <Link to="/deliveries" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(deliveries?.recent || []).map((del) => (
                <div
                  key={del.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{del.trackingNumber}</span>
                    <span className={`badge ${del.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {del.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {del.items?.[0]?.productName || 'Auto Component Package'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ETA: {del.eta}</span>
                    {del.status !== 'DELIVERED' && (
                      <button
                        onClick={() => handleReceiveDelivery(del.id)}
                        disabled={actionLoading === del.id}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Receive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Used-Part Intake */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.05rem' }}>Used-Part Intake</h3>
              <Link to="/used-parts" className="btn btn-outline btn-sm">
                Queue ↗
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(usedPartsIntake?.recent || []).map((part) => (
                <div
                  key={part.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{part.partTitle}</span>
                    <span className={`badge ${part.technicalTestStatus === 'PASSED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {part.technicalTestStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {part.vehicleModel} • Seller: {part.sellerName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission Summary Mini-Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(13, 148, 136, 0.08))',
              border: '1px solid var(--color-primary-light)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Automated Workshop Commission
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
              Your account receives <strong>{100 - (shop?.commissionRate || 12)}%</strong> net service payout. Platform fee is <strong>{shop?.commissionRate || 12}%</strong>.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Available Now</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>
                  ₹{earnings?.releasedForPayout?.toLocaleString('en-IN') || 0}
                </div>
              </div>
              <Link to="/commission" className="btn btn-primary btn-sm">
                Open Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboardPage;
