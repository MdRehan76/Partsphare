import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './RazorpayModal.css';

/**
 * Computes the client-side sandbox HMAC-SHA256 signature matching backend verification:
 * HMAC_SHA256(orderId + "|" + paymentId, secret)
 */
async function computeSandboxHmac(orderId, paymentId, customSecret) {
  const secret = customSecret || 'partsphere_rzp_secret_key_demo_32chars';
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
  } catch (err) {
    console.error('HMAC computation failed:', err);
    return `sig_sandbox_${Date.now()}`;
  }
}

/**
 * Native Web Audio API payment success chime (D5 -> A5 ascending harmonious chime)
 */
function playPaymentChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First note (D5 - 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.32);

    // Second note (A5 - 880Hz, celebratory)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.16, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch {
    // Audio optional, silent fallback
  }
}

const RazorpayModal = ({ isOpen, paymentData, onSuccess, onFailure, onCancel }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [testCardPreset, setTestCardPreset] = useState('success'); // 'success' or 'decline'
  const [upiId, setUpiId] = useState('demo@upi');

  // Animation States: 'idle' | 'processing' | 'success' | 'declined'
  const [animState, setAnimState] = useState('idle');
  const [processingStage, setProcessingStage] = useState(1); // 1: Connecting, 2: Authorizing
  const [completedPaymentId, setCompletedPaymentId] = useState('');

  const isProcessing = animState !== 'idle';

  useEffect(() => {
    if (!isOpen) return;
    setAnimState('idle');
    setProcessingStage(1);
    setCompletedPaymentId('');

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && animState === 'idle') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !paymentData) return null;

  const {
    orderId,
    orderNumber,
    razorpayOrderId,
    amount,
    amountInRupees,
    amountInPaise,
    currency = 'INR',
    customer,
    demoSecretKey,
  } = paymentData;

  // Resolve display amount in Rupees:
  // Handles cases where amount is passed in Rupees (e.g. 3530) or in paise (e.g. 353000).
  const displayAmount = (() => {
    if (typeof amountInRupees === 'number' && !isNaN(amountInRupees)) {
      return amountInRupees;
    }
    const numAmount = Number(amount || 0);
    const numPaise = Number(amountInPaise || 0);
    // If amount equals amountInPaise, it was passed in paise -> convert to rupees
    if (numPaise > 0 && numAmount === numPaise) {
      return numAmount / 100;
    }
    return numAmount;
  })();

  const handleSimulateSuccess = async () => {
    if (activeTab === 'card' && testCardPreset === 'decline') {
      handleSimulateDecline();
      return;
    }

    setAnimState('processing');
    setProcessingStage(1);

    try {
      const paymentId = `pay_rzp_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const signature = await computeSandboxHmac(razorpayOrderId, paymentId, demoSecretKey);

      // Stage 1 -> Stage 2 (Authorizing Bank) after 850ms
      setTimeout(() => {
        setProcessingStage(2);
      }, 850);

      // Stage 2 -> Stage 3 (Success Celebration Animation + Chime) after 1800ms
      setTimeout(() => {
        setCompletedPaymentId(paymentId);
        setAnimState('success');
        playPaymentChime();

        // Allow user to view and enjoy the success animation before completing
        setTimeout(() => {
          onSuccess({
            orderId,
            razorpayOrderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          });
          setAnimState('idle');
        }, 2200);
      }, 1800);
    } catch (err) {
      console.error('Payment simulation error:', err);
      setAnimState('idle');
    }
  };

  const handleSimulateDecline = () => {
    setAnimState('processing');
    setProcessingStage(1);

    setTimeout(() => {
      setAnimState('declined');
    }, 1200);
  };

  const handleConfirmDecline = () => {
    setAnimState('idle');
    onFailure({
      orderId,
      razorpayOrderId,
      errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
      errorDescription: 'Transaction was declined by the simulated bank gateway (Sandbox Test Mode).',
      errorReason: 'Transaction declined by simulated bank gateway',
      reason: 'Bank decline simulation',
    });
  };

  const handleCancel = () => {
    if (isProcessing) return;
    onCancel({
      orderId,
      razorpayOrderId,
      errorCode: 'PAYMENT_CANCELLED_BY_USER',
      errorDescription: 'Customer closed the Razorpay sandbox payment dialog.',
      errorReason: 'Payment cancelled by customer in modal',
      reason: 'Customer closed the Razorpay sandbox payment dialog.',
    });
  };

  const modalNode = (
    <div className="rzp-modal-overlay" onClick={handleCancel}>
      <div className="rzp-modal-container" onClick={(e) => e.stopPropagation()} id="razorpay-sandbox-modal">
        {/* Top Header */}
        <div className="rzp-header">
          <div className="rzp-header-top">
            <div className="rzp-brand-info">
              <span className="rzp-logo-badge">⚡ Razorpay</span>
              <span className="rzp-demomode-tag">DEMO PAYMENT MODE</span>
              <span className="rzp-testmode-tag">SANDBOX</span>
            </div>
            {animState === 'idle' && (
              <button
                className="rzp-close-btn"
                onClick={handleCancel}
                id="rzp-close-button"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          <div className="rzp-amount-row">
            <div>
              <div className="rzp-merchant-name">PartSphere Technologies</div>
              <div className="rzp-order-ref">
                Order #{orderNumber} · ID: <code>{razorpayOrderId}</code>
              </div>
            </div>
            <div className="rzp-amount-display" id="rzp-modal-amount">
              ₹{Number(displayAmount || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. ANIMATED VIEW: PROCESSING STATE                             */}
        {/* ------------------------------------------------------------- */}
        {animState === 'processing' && (
          <div className="rzp-anim-view rzp-processing-view animate-fade-in">
            <div className="rzp-radar-wrapper">
              <div className="rzp-radar-pulse" />
              <div className="rzp-radar-pulse outer" />
              <div className="rzp-gateway-icon">
                <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#0284c7" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>

            <h3 className="rzp-anim-title">
              {processingStage === 1 ? 'Contacting Bank Gateway...' : 'Authorizing Secure Payment...'}
            </h3>
            <p className="rzp-anim-sub">
              {processingStage === 1
                ? 'Establishing 256-Bit SSL encrypted connection with payment processor'
                : `Verifying tokenized transaction of ₹${Number(displayAmount || 0).toLocaleString('en-IN')}`}
            </p>

            <div className="rzp-anim-progress-bar">
              <div className={`rzp-anim-progress-fill stage-${processingStage}`} />
            </div>

            <div className="rzp-anim-security-badge">
              <span className="rzp-lock-icon">🔒</span>
              <span>256-Bit End-to-End Cryptographic Handshake · Please do not close</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. ANIMATED VIEW: CELEBRATORY SUCCESS STATE                    */}
        {/* ------------------------------------------------------------- */}
        {animState === 'success' && (
          <div className="rzp-anim-view rzp-success-view animate-fade-in">
            {/* Celebratory confetti sparks */}
            <div className="rzp-confetti-container" aria-hidden="true">
              {[...Array(14)].map((_, i) => (
                <span key={i} className={`rzp-confetti-piece cp-${i + 1}`} />
              ))}
            </div>

            {/* Expanding Spring Checkmark Animation */}
            <div className="rzp-checkmark-wrapper">
              <svg className="rzp-checkmark-svg" viewBox="0 0 52 52">
                <circle className="rzp-checkmark-circle" cx="26" cy="26" r="24" fill="none" />
                <path className="rzp-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <div className="rzp-success-badge">PAYMENT CAPTURED</div>
            <h3 className="rzp-success-amount">
              ₹{Number(displayAmount || 0).toLocaleString('en-IN')}
            </h3>
            <p className="rzp-success-heading">Payment Successful!</p>
            <p className="rzp-success-sub">
              Transaction authorized and cryptographically verified
            </p>

            <div className="rzp-receipt-card">
              <div className="rzp-receipt-row">
                <span className="rzp-receipt-label">Payment ID</span>
                <code className="rzp-receipt-value">{completedPaymentId || 'pay_demo_verified'}</code>
              </div>
              <div className="rzp-receipt-row">
                <span className="rzp-receipt-label">Order Ref</span>
                <span className="rzp-receipt-value">#{orderNumber}</span>
              </div>
              <div className="rzp-receipt-row">
                <span className="rzp-receipt-label">Method</span>
                <span className="rzp-receipt-pill">
                  {activeTab === 'upi' ? '📱 UPI / QR' : activeTab === 'card' ? '💳 Card' : '🏦 NetBanking'} · 🟢 SUCCESS
                </span>
              </div>
            </div>

            <div className="rzp-redirecting-box">
              <div className="rzp-spinner-dots">
                <span />
                <span />
                <span />
              </div>
              <span>Activating & redirecting to your dashboard...</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. ANIMATED VIEW: SIMULATED DECLINE STATE                      */}
        {/* ------------------------------------------------------------- */}
        {animState === 'declined' && (
          <div className="rzp-anim-view rzp-decline-view animate-fade-in">
            <div className="rzp-decline-icon-wrap">
              <svg viewBox="0 0 52 52" className="rzp-decline-svg">
                <circle className="rzp-decline-circle" cx="26" cy="26" r="24" fill="none" />
                <path className="rzp-decline-line l1" fill="none" d="M16 16 36 36" />
                <path className="rzp-decline-line l2" fill="none" d="M36 16 16 36" />
              </svg>
            </div>

            <h3 className="rzp-decline-title">Payment Declined</h3>
            <p className="rzp-decline-sub">
              Simulated bank rejected transaction. (Test Card Preset: Decline)
            </p>

            <div className="rzp-decline-reason-card">
              <code>BAD_REQUEST_PAYMENT_DECLINED</code>
              <span>Transaction declined by simulated issuing bank</span>
            </div>

            <div className="rzp-decline-actions">
              <button
                type="button"
                className="rzp-btn rzp-btn-success"
                onClick={() => setAnimState('idle')}
                id="rzp-retry-decline-btn"
              >
                🔄 Try Again with Valid Method
              </button>
              <button
                type="button"
                className="rzp-btn rzp-btn-cancel"
                onClick={handleConfirmDecline}
                id="rzp-confirm-decline-btn"
              >
                Confirm Decline & Close
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. DEFAULT VIEW: INSTRUMENT SELECTION                         */}
        {/* ------------------------------------------------------------- */}
        {animState === 'idle' && (
          <>
            {/* Demo Mode Notice Banner */}
            <div className="rzp-demo-banner">
              <span className="rzp-demo-banner-icon">🛡️</span>
              <div className="rzp-demo-banner-text">
                <strong>DEMO PAYMENT MODE:</strong> Real cryptographic HMAC verification runs on the backend. No actual bank funds are deducted.
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
                  id="rzp-simulate-success-btn"
                >
                  🟢 Pay ₹{Number(displayAmount || 0).toLocaleString('en-IN')} (Simulate Success)
                </button>

                <div className="rzp-secondary-actions">
                  <button
                    type="button"
                    className="rzp-btn rzp-btn-danger"
                    onClick={handleSimulateDecline}
                    id="rzp-simulate-decline-btn"
                  >
                    🔴 Simulate Bank Decline / Failure
                  </button>
                  <button
                    type="button"
                    className="rzp-btn rzp-btn-cancel"
                    onClick={handleCancel}
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
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default RazorpayModal;
