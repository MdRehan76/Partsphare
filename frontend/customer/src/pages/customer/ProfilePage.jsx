import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usersService, subscriptionsService } from '../../services';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => {
    fetchActiveSubscription();
  }, []);

  const fetchActiveSubscription = async () => {
    setLoadingSub(true);
    try {
      const res = await subscriptionsService.getMySubscription();
      setActiveSubscription(res.data?.data || null);
    } catch (e) {
      // no-op
    } finally {
      setLoadingSub(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await usersService.updateProfile(form);
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await usersService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed! Please log in again on other devices.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="profile-avatar-lg">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} />
              ) : (
                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              )}
            </div>
            <div className="profile-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="profile-user-email">{user?.email}</div>
            <div className="profile-user-role badge badge-accent">{user?.role}</div>
          </div>

          <nav className="profile-nav">
            {[
              { id: 'profile', label: '👤 My Profile' },
              { id: 'subscriptions', label: '⭐ Subscriptions' },
              { id: 'security', label: '🔒 Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                id={`profile-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section animate-fade-in-up">
              {activeSubscription && (
                <div className="profile-membership-banner">
                  <div className="banner-left">
                    <div className="banner-pill-row">
                      <span className="live-dot" />
                      <span className="banner-tag">PartNexa Care Active</span>
                    </div>
                    <h3 className="banner-plan-title">{activeSubscription.plan?.name}</h3>
                    <p className="banner-plan-meta">
                      Valid until {new Date(activeSubscription.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })} · Auto-renew {activeSubscription.autoRenew ? 'ON' : 'OFF'}
                    </p>
                  </div>
                  <Link to="/my-subscriptions" className="banner-link-btn" id="manage-sub-from-profile-btn">
                    Manage Membership →
                  </Link>
                </div>
              )}

              <h2 className="profile-section-title">Personal Information</h2>
              <form onSubmit={handleProfileUpdate} id="profile-form">
                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-firstName">First Name</label>
                    <input
                      id="profile-firstName"
                      className="form-input"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-lastName">Last Name</label>
                    <input
                      id="profile-lastName"
                      className="form-input"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={user?.email} disabled />
                  <p className="form-hint">Email address cannot be changed</p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="profile-save-btn"
                >
                  {loading ? <><span className="spinner spinner-sm" />Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="profile-section animate-fade-in-up" id="profile-subscriptions-section">
              <h2 className="profile-section-title">PartNexa Care Maintenance Subscriptions</h2>
              {loadingSub ? (
                <div style={{ padding: '20px 0' }}>Checking subscription status...</div>
              ) : activeSubscription ? (
                <div className="profile-sub-details-card">
                  <div className="profile-sub-top">
                    <div>
                      <span className={`status-pill ${activeSubscription.status.toLowerCase()}`}>
                        {activeSubscription.status === 'ACTIVE' ? '🟢 Active Member' : activeSubscription.status}
                      </span>
                      <h3 className="profile-sub-plan">{activeSubscription.plan?.name}</h3>
                      <p className="profile-sub-veh">
                        🚗 {activeSubscription.vehicle?.variant
                          ? `${activeSubscription.vehicle.variant?.model?.make?.name} ${activeSubscription.vehicle.variant?.model?.name}`
                          : 'Covered Vehicle'}
                        {activeSubscription.vehicleReg && ` (${activeSubscription.vehicleReg})`}
                      </p>
                    </div>
                    <div className="profile-sub-cycle-badge">
                      {activeSubscription.billingCycle} Cycle
                    </div>
                  </div>

                  <div className="profile-sub-meta-grid">
                    <div>
                      <span className="meta-k">Started</span>
                      <span className="meta-v">
                        {new Date(activeSubscription.startDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="meta-k">Valid Until</span>
                      <span className="meta-v">
                        {new Date(activeSubscription.endDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="meta-k">Next Renewal</span>
                      <span className="meta-v">
                        {new Date(activeSubscription.renewalDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="meta-k">Auto-Renew</span>
                      <span className="meta-v">{activeSubscription.autoRenew ? 'Enabled (ON)' : 'Paused (OFF)'}</span>
                    </div>
                  </div>

                  {activeSubscription.entitlements && activeSubscription.entitlements.length > 0 && (
                    <div className="profile-entitlements-preview">
                      <h4 className="preview-heading">Available Entitlements</h4>
                      <div className="preview-tags">
                        {activeSubscription.entitlements.map((ent, i) => (
                          <span key={i} className="preview-ent-tag">
                            {ent.name}: <strong>{ent.isUnlimited ? 'Unlimited' : `${ent.remainingCount ?? ent.quotaLimit} left`}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="profile-sub-actions">
                    <Link to="/my-subscriptions" className="btn btn-primary" id="manage-full-sub-btn">
                      Manage Membership & Quotas →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="profile-no-sub-box">
                  <p>You do not currently have an active maintenance subscription.</p>
                  <p className="text-muted">
                    Subscribe to PartNexa Care for complimentary roadside assistance, doorstep servicing, and member discounts.
                  </p>
                  <Link to="/subscriptions" className="btn btn-primary" style={{ marginTop: '14px', display: 'inline-block' }}>
                    View Subscription Plans →
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="profile-section animate-fade-in-up">
              <h2 className="profile-section-title">Change Password</h2>
              <form onSubmit={handlePasswordChange} id="password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    className="form-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="change-password-btn"
                >
                  {loading ? <><span className="spinner spinner-sm" />Changing...</> : '🔒 Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
