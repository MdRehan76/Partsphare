import React, { useState, useEffect } from 'react';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';

export const KycUploadPage = () => {
  const { user, partner, refreshProfile } = useDeliveryAuth();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [panNumber, setPanNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');

  const docTypes = [
    { type: 'DRIVING_LICENSE', label: 'Driving License (DL)', required: true, icon: '🪪' },
    { type: 'PAN_CARD', label: 'PAN Card', required: true, icon: '💳' },
    { type: 'AADHAAR_CARD', label: 'Aadhaar Card', required: true, icon: '🆔' },
    { type: 'VEHICLE_RC', label: 'Vehicle Registration Certificate (RC)', required: true, icon: '📜' },
  ];

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getKyc();
      setKycData(data);
      if (data?.panNumber) setPanNumber(data.panNumber);
      if (data?.aadharNumber) setAadharNumber(data.aadharNumber);
    } catch (err) {
      toast.error('Failed to load KYC status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const handleSimulateUpload = async (docType) => {
    try {
      const sampleUrls = {
        DRIVING_LICENSE: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        PAN_CARD: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        AADHAAR_CARD: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        VEHICLE_RC: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      };

      await deliveryService.uploadKycDoc({
        documentType: docType,
        fileUrl: sampleUrls[docType],
        mimeType: 'image/jpeg',
        panNumber: panNumber || undefined,
        aadharNumber: aadharNumber || undefined,
      });

      toast.success(`${docType.replace('_', ' ')} uploaded successfully!`);
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setSubmitting(true);
      await deliveryService.submitKyc();
      toast.success('KYC documents submitted for Admin review!');
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit KYC documents.');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin Verification Simulator for testing the complete lifecycle
  const handleAdminVerify = async (status, reason) => {
    try {
      await deliveryService.adminVerifyKyc(status, reason, user?.id);
      toast.success(`Admin verification simulation: ${status}!`);
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      toast.error('Admin verification simulation failed.');
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
        <div>Loading KYC Verification status...</div>
      </div>
    );
  }

  const status = kycData?.status || 'NOT_SUBMITTED';
  const docs = kycData?.documents || [];

  return (
    <div className="delivery-container">
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Rider KYC & Document Verification
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Upload identity and vehicle compliance documents for administrative background verification and duty activation.
        </p>
      </div>

      {/* Status Banner */}
      <div
        className="delivery-card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: `5px solid ${
            status === 'APPROVED' ? 'var(--color-emerald)' : status === 'PENDING' ? 'var(--color-amber)' : 'var(--color-primary)'
          }`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Verification Status:
            </span>
            <span
              className={`delivery-badge ${
                status === 'APPROVED' ? 'badge-delivered' : status === 'PENDING' ? 'badge-transit' : 'badge-assigned'
              }`}
            >
              {status}
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {status === 'APPROVED' && '✅ All documents verified! Your delivery account is fully ACTIVE.'}
            {status === 'PENDING' && '⏳ Documents submitted. Administrative verification in progress.'}
            {status === 'NOT_SUBMITTED' && '⚠️ Please upload required identity and vehicle documents below.'}
            {status === 'REJECTED' && `❌ Verification rejected: ${kycData?.rejectionReason || 'Document clarity issue'}`}
          </div>
        </div>

        {/* Status Call to Action */}
        <div>
          {status === 'NOT_SUBMITTED' && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting || docs.length === 0}
              className="btn btn-primary"
            >
              Submit for Admin Review
            </button>
          )}
          {status === 'APPROVED' && (
            <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
              Ready for Deliveries ✨
            </span>
          )}
        </div>
      </div>

      {/* Admin Fast Simulation Controls (For Test & Evaluation) */}
      <div
        className="delivery-card"
        style={{
          marginBottom: '2rem',
          background: 'var(--color-bg-elevated)',
          border: '1px dashed var(--color-border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              ⚙️ Admin Verification Simulation Controller
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Test the end-to-end activation workflow as required in PRD testing specifications.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleAdminVerify('APPROVED')}
              className="btn btn-emerald btn-sm"
            >
              Simulate Admin Approval & Activate
            </button>
            <button
              onClick={() => handleAdminVerify('REJECTED', 'DL copy is blurry, please re-upload clear photo')}
              className="btn btn-danger btn-sm"
            >
              Simulate Admin Rejection
            </button>
          </div>
        </div>
      </div>

      {/* Document Upload Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {docTypes.map((dt) => {
          const uploadedDoc = docs.find((d) => d.documentType === dt.type);
          const isUploaded = Boolean(uploadedDoc);

          return (
            <div
              key={dt.type}
              className="delivery-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '2rem' }}>{dt.icon}</span>
                  <span
                    className={`delivery-badge ${
                      isUploaded ? (status === 'APPROVED' ? 'badge-delivered' : 'badge-transit') : 'badge-offline'
                    }`}
                  >
                    {isUploaded ? (status === 'APPROVED' ? 'APPROVED' : 'UPLOADED') : 'NOT UPLOADED'}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                  {dt.label} {dt.required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Valid government-issued PDF or clear photographic image (JPG/PNG).
                </div>

                {isUploaded && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      marginBottom: '1rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    <div><strong>File:</strong> {uploadedDoc.objectKey.split('/').pop()}</div>
                    <div><strong>Uploaded:</strong> {new Date(uploadedDoc.createdAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload(dt.type)}
                  className="btn btn-secondary btn-sm btn-block"
                >
                  {isUploaded ? 'Re-upload Document' : 'Upload Document'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KycUploadPage;
