import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import toast from 'react-hot-toast';

export default function CustomerCareHubPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('ALL'); // 'ALL' | 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER'
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Active Ticket Drawer / Thread Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Resolution Modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { user } = useAdminAuth();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await adminService.listTickets({
        role: activeRole !== 'ALL' ? activeRole : undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      });
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeRole, statusFilter, priorityFilter]);

  const handleOpenTicket = async (ticket) => {
    try {
      const fullTicket = await adminService.getTicketById(ticket.id);
      setSelectedTicket(fullTicket);
    } catch (err) {
      setSelectedTicket(ticket);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await adminService.assignTicket(selectedTicket.id);
      toast.success('Ticket assigned to you.');
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to assign ticket.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const updated = await adminService.addTicketMessage(selectedTicket.id, replyMessage.trim());
      toast.success('Reply dispatched to ticket thread.');
      setSelectedTicket(updated);
      setReplyMessage('');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    try {
      const updated = await adminService.resolveTicket(selectedTicket.id, resolutionNotes || 'Resolved by Support Desk');
      toast.success('Ticket marked as resolved.');
      setSelectedTicket(updated);
      setShowResolveModal(false);
      setResolutionNotes('');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to resolve ticket.');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'badge-danger';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'CUSTOMER': return 'badge-primary';
      case 'SHOP_OWNER': return 'badge-purple';
      case 'DELIVERY_PARTNER': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Customer Care & Multi-Role Ticketing Hub
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Unified support engine resolving inquiries across Customers, Mechanical Shops, and Delivery Partners with SLA tracking.
        </p>
      </div>

      {/* Role Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'ALL', label: 'All Inquiries' },
          { key: 'CUSTOMER', label: '👤 Customers' },
          { key: 'SHOP_OWNER', label: '🔧 Workshops' },
          { key: 'DELIVERY_PARTNER', label: '🛵 Delivery Fleet' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveRole(tab.key)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.92rem',
              backgroundColor: activeRole === tab.key ? 'var(--color-primary-bg)' : 'transparent',
              color: activeRole === tab.key ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: activeRole === tab.key ? '1px solid var(--color-primary)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); fetchTickets(); }} className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search ticket number, subject, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent (2h SLA)</option>
            <option value="HIGH">High (6h SLA)</option>
            <option value="MEDIUM">Medium (24h SLA)</option>
            <option value="LOW">Low (48h SLA)</option>
          </select>

          <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); fetchTickets(); }} className="btn btn-secondary btn-sm">
            Reset
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Role Tag</th>
                <th>Subject & Category</th>
                <th>Requester</th>
                <th>Priority / SLA</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading ticketing queue...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No support tickets matching criteria.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{t.ticketNumber}</span>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(t.userRole)}`}>
                        {t.userRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{t.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {t.category}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.userEmail}</div>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(t.priority)}`}>
                        {t.priority} ({t.slaHours || 24}h SLA)
                      </span>
                    </td>
                    <td>
                      {t.assignedAdminName ? (
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.assignedAdminName}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === 'RESOLVED'
                            ? 'badge-success'
                            : t.status === 'IN_PROGRESS'
                            ? 'badge-info'
                            : t.status === 'CLOSED'
                            ? 'badge-secondary'
                            : 'badge-warning'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleOpenTicket(t)} className="btn btn-sm btn-primary">
                        Open Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Conversation Thread Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className={`badge ${getRoleBadgeClass(selectedTicket.userRole)}`}>
                    {selectedTicket.userRole}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedTicket.subject}
                </h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Assignment Toolbar */}
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Assigned Agent: <strong>{selectedTicket.assignedAdminName || 'None'}</strong> • Status: <strong>{selectedTicket.status}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!selectedTicket.assignedAdminId && (
                  <button onClick={handleAssignToMe} className="btn btn-sm btn-secondary">
                    Assign to Me
                  </button>
                )}
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button onClick={() => setShowResolveModal(true)} className="btn btn-sm btn-success">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Messages Thread */}
            <div className="modal-body" style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedTicket.resolutionNotes && (
                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-success)', marginBottom: '0.2rem' }}>
                    Resolution Summary
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {selectedTicket.resolutionNotes}
                  </div>
                </div>
              )}

              {selectedTicket.messages?.map((msg, i) => {
                const isAdmin = msg.senderRole === 'ADMIN';
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '0.85rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isAdmin ? 'var(--color-primary-bg)' : 'var(--bg-tertiary)',
                      border: `1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: isAdmin ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                        {msg.senderName} ({msg.senderRole})
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            {selectedTicket.status !== 'CLOSED' && (
              <form onSubmit={handleSendReply} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Type an official admin response to user..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" disabled={isSendingReply} className="btn btn-primary">
                  {isSendingReply ? 'Sending...' : 'Reply'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Resolve Ticket: {selectedTicket?.ticketNumber}
              </h3>
              <button onClick={() => setShowResolveModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmResolve}>
              <div className="modal-body">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Resolution Notes & Findings
                </label>
                <textarea
                  rows="4"
                  placeholder="Summarize the action taken, refund references, fitment advice, or tracking information..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowResolveModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Mark Ticket Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
