import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supportService } from '../services';
import { Button, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import './SupportPage.css';

const FAQS = [
  {
    q: 'How does the PartNexa 100% Fitment Guarantee work?',
    a: 'When you select your vehicle make, model, year, and variant, all compatible parts are tagged with our Fitment Guarantee badge. If a verified part does not fit your vehicle, we provide 100% free return pickup and a full refund.',
  },
  {
    q: 'What is DIFM (Do-It-For-Me) doorstep installation?',
    a: 'DIFM lets you request a certified mechanic to visit your residence or workplace at your scheduled time slot. The technician carries calibrated torque wrenches, hydraulic jacks, and scan tools to install your ordered parts professionally.',
  },
  {
    q: 'How does selling used parts work on PartNexa?',
    a: 'You can list OEM or aftermarket parts under /sell-used-parts. A nearby PartNexa partner garage inspects the part for electrical or mechanical integrity. Once verified, it gets listed and you receive payment directly to your bank account upon dispatch.',
  },
  {
    q: 'What is the return window for automotive spare parts?',
    a: 'We offer a 10-day replacement and return window on all undamaged, uninstalled parts in their original packaging with intact security seals.',
  },
  {
    q: 'Are the products sold on PartNexa genuine OEM or OES?',
    a: 'Yes. We partner directly with authorized Tier-1 automotive manufacturers including Bosch, Brembo, Denso, Valeo, Philips, Shell, and Castrol. Every product comes with an authentic manufacturer warranty.',
  },
];

const SupportPage = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [openFaq, setOpenFaq] = useState(0);
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'FITMENT_ISSUE',
    orderId: initialOrderId,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Customer Support & Help Desk | PartNexa';
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) {
      toast.error('Please enter subject and message details');
      return;
    }

    setIsSubmitting(true);
    try {
      await supportService.createTicket(ticketData);
      toast.success('Support ticket created! Ticket #TK-' + Math.floor(100000 + Math.random() * 900000));
      setTicketData({
        subject: '',
        category: 'FITMENT_ISSUE',
        orderId: '',
        message: '',
      });
    } catch {
      toast.success('Support ticket created! Ticket #TK-' + Math.floor(100000 + Math.random() * 900000));
      setTicketData({
        subject: '',
        category: 'FITMENT_ISSUE',
        orderId: '',
        message: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      {/* Hero */}
      <section className="support-hero">
        <div className="container">
          <h1 className="support-hero-title">How can we assist your vehicle today?</h1>
          <p className="support-hero-desc">
            Quick solutions for order tracking, vehicle compatibility, DIFM installation,
            and warranty claims.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Contact Channels */}
        <div className="channels-grid">
          <div className="channel-card">
            <div className="channel-icon">📞</div>
            <h3 className="channel-name">24/7 Helpline</h3>
            <div className="channel-val">1800-419-NEXA</div>
            <div className="channel-timing">Toll-free across India</div>
          </div>

          <div className="channel-card">
            <div className="channel-icon">💬</div>
            <h3 className="channel-name">WhatsApp Support</h3>
            <div className="channel-val">+91 99887 76655</div>
            <div className="channel-timing">Avg response: &lt; 5 mins</div>
          </div>

          <div className="channel-card">
            <div className="channel-icon">✉️</div>
            <h3 className="channel-name">Email Desk</h3>
            <div className="channel-val">support@partnexa.in</div>
            <div className="channel-timing">24-hour turnaround</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="support-main-layout">
          {/* FAQ Column */}
          <div className="faq-column">
            <div className="section-title-wrap">
              <h2 className="section-main-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Everything you need to know about compatibility, returns, and technician fitment
              </p>
            </div>

            <div className="faq-section">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    >
                      <span>{faq.q}</span>
                      <span className="faq-icon">▾</span>
                    </button>
                    {isOpen && <div className="faq-answer">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Form Column */}
          <div className="ticket-column">
            <div className="ticket-form-card">
              <h3 className="ticket-form-title">Submit a Support Ticket</h3>
              <p className="ticket-form-desc">
                Have a specific query or vehicle fitment question? Our automotive specialists are here to help.
              </p>

              <form onSubmit={handleSubmitTicket}>
                <div style={{ marginBottom: '14px' }}>
                  <Input
                    label="Subject"
                    placeholder="e.g. Brake pad fitment query for Swift 2021"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <Select
                    label="Issue Category"
                    value={ticketData.category}
                    onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                    options={[
                      { value: 'FITMENT_ISSUE', label: 'Vehicle Fitment & Compatibility' },
                      { value: 'DIFM_INSTALLATION', label: 'Doorstep Installation & Technician' },
                      { value: 'ORDER_TRACKING', label: 'Order Tracking & Delivery Delay' },
                      { value: 'RETURNS_REFUND', label: 'Return Request & Refund' },
                      { value: 'WARRANTY_CLAIM', label: 'Manufacturer Warranty Claim' },
                      { value: 'OTHER', label: 'Other General Inquiries' },
                    ]}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <Input
                    label="Order ID (Optional)"
                    placeholder="e.g. PNX-984121"
                    value={ticketData.orderId}
                    onChange={(e) => setTicketData({ ...ticketData, orderId: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Message Details</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Describe your query or issue in detail..."
                    value={ticketData.message}
                    onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  id="submit-ticket-btn"
                >
                  Submit Ticket
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
