import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';
import toast from 'react-hot-toast';

const TICKET_CATEGORIES = [
  { id: 'COMMISSION_PAYOUT', label: 'Commission & Payout Inquiries' },
  { id: 'PARTS_DELIVERY', label: 'Incoming Parts Delivery Issues' },
  { id: 'JOB_DISPUTE', label: 'Customer / Job Dispute' },
  { id: 'TECHNICAL_SUPPORT', label: 'Technical Platform Support' },
  { id: 'GENERAL', label: 'General Workshop Query' },
];

export const ShopTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // New Ticket Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'COMMISSION_PAYOUT',
    subject: '',
    priority: 'MEDIUM',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Reply message
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await shopService.getTickets();
      const list = res.data || [];
      setTickets(list);
      if (selectedTicket) {
        const refreshed = list.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      } else if (list.length > 0) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      toast.error('Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Subject and message are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await shopService.createTicket(formData);
      toast.success('Support ticket created successfully!');
      setShowNewModal(false);
      setFormData({ category: 'COMMISSION_PAYOUT', subject: '', priority: 'MEDIUM', message: '' });
      await fetchTickets();
      if (res.data) setSelectedTicket(res.data);
    } catch (err) {
      toast.error('Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await shopService.addTicketMessage(selectedTicket.id, replyMessage);
      setReplyMessage('');
      toast.success('Reply sent.');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Workshop Support Tickets</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Direct assistance channel with PartSphere operations, logistics, and finance teams.
          </p>
        </div>

        <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
          + Open Support Ticket
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎫</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>No Support Tickets</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            You have no active support cases. Open a ticket if you need help with orders, payouts, or deliveries.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', minHeight: 520 }}>
          {/* Left: Ticket List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    padding: '1rem 1.25rem',
                    borderLeft: `4px solid ${
                      t.status === 'RESOLVED'
                        ? '#10B981'
                        : t.status === 'IN_PROGRESS'
                        ? '#0284C7'
                        : '#F59E0B'
                    }`,
                    background: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-card)',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {t.ticketNumber || t.id}
                    </span>
                    <span
                      className={`badge ${
                        t.status === 'RESOLVED'
                          ? 'badge-success'
                          : t.status === 'IN_PROGRESS'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem', marginBottom: '0.25rem' }}>{t.subject}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Category: {t.category?.replace('_', ' ')}</span>
                    <span>Priority: {t.priority}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Ticket Conversation Thread */}
          {selectedTicket && (
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="badge badge-info">{selectedTicket.category?.replace('_', ' ')}</span>
                    <span
                      className={`badge ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'badge-success'
                          : selectedTicket.status === 'IN_PROGRESS'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      Status: {selectedTicket.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem' }}>{selectedTicket.subject}</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Ticket: <strong>{selectedTicket.ticketNumber || selectedTicket.id}</strong> • Priority: <strong>{selectedTicket.priority}</strong>
                  </div>
                </div>

                {/* Message Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 340, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {(selectedTicket.messages || []).map((msg, idx) => {
                    const isOwner = msg.senderRole === 'SHOP_OWNER';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isOwner ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          background: isOwner ? 'var(--color-primary-glow)' : 'var(--color-bg-elevated)',
                          border: '1px solid',
                          borderColor: isOwner ? 'rgba(2, 132, 199, 0.3)' : 'var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '0.85rem 1.15rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.75rem', fontWeight: 600, color: isOwner ? 'var(--color-primary-dark)' : 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                          <span>{msg.senderName} ({msg.senderRole})</span>
                          <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.45 }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type reply to PartSphere team..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={replying}
                />
                <button type="submit" disabled={replying || !replyMessage.trim()} className="btn btn-primary">
                  {replying ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Open Support Ticket</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Submit an operational, payout, or delivery inquiry to PartSphere helpdesk.
            </p>

            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Question on August payout settlement UTR"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message Details *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the issue, include order numbers or tracking IDs if applicable..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTicketsPage;
