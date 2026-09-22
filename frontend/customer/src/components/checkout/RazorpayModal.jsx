import { useState, useEffect } from 'react';
import './RazorpayModal.css';

/**
 * Computes the client-side sandbox HMAC-SHA256 signature matching backend verification:
 * HMAC_SHA256(orderId + "|" + paymentId, secret)
 */
async function computeSandboxHmac(orderId, paymentId) {
  const secret = 'partsphere_rzp_secret_key_demo_32chars';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(`${orderId}|${paymentId}`);

  try {
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback deterministic hex hash
    return `sig_sandbox_${Date.now()}`;
  }
}

const RazorpayModal = ({ isOpen, paymentData, onSuccess, onFailure, onCancel }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [testCardPreset, setTestCardPreset] = useState('success'); // 'success' or 'decline'
  const [upiId, setUpiId] = useState('demo@upi');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing]);

  if (!isOpen || !paymentData) return null;

  const {
    orderId,
    orderNumber,
    razorpayOrderId,
    amount,
    currency = 'INR',
    customer,
  } = paymentData;

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      const paymentId = `pay_rzp_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const signature = await computeSandboxHmac(razorpayOrderId, paymentId);

      // Brief simulated gateway latency ~400ms
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        });
      }, 400);
    } catch {
      setIsProcessing(false);
    }
  };

  const handleSimulateDecline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onFailure({
        orderId,
        razorpayOrderId,
        errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
        errorDescription: 'Transaction was declined by the simulated bank gateway (Sandbox Test Mode).',
        reason: 'Bank decline simulation',
      });
    }, 400);
  };

  const handleCancel = () => {
    if (isProcessing) return;
    onCancel({
      orderId,
      razorpayOrderId,
      errorCode: 'PAYMENT_CANCELLED_BY_USER',
      reason: 'Customer closed the Razorpay sandbox payment dialog.',
    });
  };

  return (
    <div className="rzp-modal-overlay" onClick={handleCancel}>
      <div className="rzp-modal-container" onClick={(e) => e.stopPropagation()} id="razorpay-sandbox-modal">
        {/* Top Header */}
        <div className="rzp-header">
          <div className="rzp-header-top">
            <div className="rzp-brand-info">
              <span className="rzp-logo-badge">⚡ Razorpay</span>
              <span className="rzp-testmode-tag">SANDBOX TEST MODE</span>
            </div>
            <button
              className="rzp-close-btn"
              onClick={handleCancel}
              disabled={isProcessing}
              id="rzp-close-button"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="rzp-amount-row">
            <div>
              <div className="rzp-merchant-name">PartSphere Technologies</div>
              <div className="rzp-order-ref">
                Order #{orderNumber} · ID: <code>{razorpayOrderId}</code>
              </div>
            </div>
            <div className="rzp-amount-display" id="rzp-modal-amount">
              ₹{Number(amount || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Payment Instrument Tabs */}
        <div className="rzp-body">
          <div className="rzp-tabs">
            <button
              className={`rzp-tab ${activeTab === 'upi' ? 'active' : ''}`}
              onClick={() => setActiveTab('upi')}
              id="rzp-tab-upi"
            >
              📱 UPI / QR
            </button>
            <button
              className={`rzp-tab ${activeTab === 'card' ? 'active' : ''}`}
              onClick={() => setActiveTab('card')}
              id="rzp-tab-card"
            >
              💳 Cards (Demo)
            </button>
            <button
              className={`rzp-tab ${activeTab === 'netbanking' ? 'active' : ''}`}
              onClick={() => setActiveTab('netbanking')}
              id="rzp-tab-netbanking"
            >
              🏦 Net Banking
            </button>
          </div>

          {/* Tab 1: UPI */}
          {activeTab === 'upi' && (
            <div className="rzp-tab-content">
              <div className="rzp-qr-box">
                <div className="rzp-qr-mock">
                  <div className="rzp-qr-pattern">
                    <span className="qr-box top-left" />
                    <span className="qr-box top-right" />
                    <span className="qr-box bottom-left" />
                    <div className="qr-center-icon">₹</div>
                  </div>
                </div>
                <div className="rzp-qr-desc">
                  <strong>Scan with any UPI App</strong>
                  <span>GPay · PhonePe · Paytm · BHIM</span>
                </div>
              </div>

              <div className="rzp-upi-input-wrap">
                <label className="rzp-label">Or enter UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="rzp-input"
                  placeholder="name@upi"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Cards */}
          {activeTab === 'card' && (
            <div className="rzp-tab-content">
              <div className="rzp-card-presets">
                <label className="rzp-label">Select Simulated Card Test Scenario:</label>
                <div className="rzp-preset-cards">
                  <div
                    className={`rzp-preset-card ${testCardPreset === 'success' ? 'selected' : ''}`}
                    onClick={() => setTestCardPreset('success')}
                    id="rzp-card-success-preset"
                  >
                    <div className="preset-card-title">✅ Test Success Card</div>
                    <div className="preset-card-num">4111 1111 1111 1111</div>
                    <div className="preset-card-sub">Simulates immediate 3D-Secure success</div>
                  </div>
                  <div
                    className={`rzp-preset-card ${testCardPreset === 'decline' ? 'selected' : ''}`}
                    onClick={() => setTestCardPreset('decline')}
                    id="rzp-card-decline-preset"
                  >
                    <div className="preset-card-title">❌ Test Decline Card</div>
                    <div className="preset-card-num">4000 0000 0000 0002</div>
                    <div className="preset-card-sub">Simulates bank decline / failure</div>
                  </div>
                </div>
              </div>

              <div className="rzp-notice-safe">
                🛡️ <strong>Sandbox Safety:</strong> Zero raw card numbers are stored or transmitted.
              </div>
            </div>
          )}

          {/* Tab 3: Net Banking */}
          {activeTab === 'netbanking' && (
            <div className="rzp-tab-content">
              <label className="rzp-label">Popular Simulated Banks:</label>
              <div className="rzp-bank-grid">
                <div className="rzp-bank-pill active">🏦 HDFC Bank</div>
                <div className="rzp-bank-pill">🏦 ICICI Bank</div>
                <div className="rzp-bank-pill">🏦 State Bank of India</div>
                <div className="rzp-bank-pill">🏦 Axis Bank</div>
              </div>
            </div>
          )}

          {/* Simulation Action Triggers */}
          <div className="rzp-actions-zone">
            <div className="rzp-zone-title">GATEWAY SIMULATION CONTROLS (TEST ENVIRONMENT)</div>

            <button
              type="button"
              className="rzp-btn rzp-btn-success"
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              id="rzp-simulate-success-btn"
            >
              {isProcessing ? (
                <span className="rzp-spinner">Processing payment...</span>
              ) : (
                `🟢 Pay ₹${Number(amount || 0).toLocaleString('en-IN')} (Simulate Success)`
              )}
            </button>

            <div className="rzp-secondary-actions">
              <button
                type="button"
                className="rzp-btn rzp-btn-danger"
                onClick={handleSimulateDecline}
                disabled={isProcessing}
                id="rzp-simulate-decline-btn"
              >
                🔴 Simulate Bank Decline / Failure
              </button>
              <button
                type="button"
                className="rzp-btn rzp-btn-cancel"
                onClick={handleCancel}
                disabled={isProcessing}
                id="rzp-simulate-cancel-btn"
              >
                ✕ Cancel Payment
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="rzp-footer">
          <span>🔒 256-Bit Razorpay Sandbox Encryption</span>
          <span>·</span>
          <span>Customer: {customer?.name || 'Customer'}</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
