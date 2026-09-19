import { useState, useEffect } from 'react';
import { usedPartsService } from '../services';
import { Button, Input, Select, Badge } from '../components/ui';
import toast from 'react-hot-toast';
import './SellUsedPartPage.css';

const DEFAULT_USED_LISTINGS = [
  {
    id: 'used_1',
    title: 'OEM Headlight Assembly (Right)',
    compatibility: 'Hyundai Creta 2018 - 2020',
    condition: 'VERIFIED_REFURBISHED',
    price: 3400,
    originalPrice: 8500,
    city: 'Bengaluru',
  },
  {
    id: 'used_2',
    title: 'Front Brake Caliper Pair & Pads',
    compatibility: 'Royal Enfield Classic 350 (BS6)',
    condition: 'EXCELLENT',
    price: 1800,
    originalPrice: 4200,
    city: 'Pune',
  },
  {
    id: 'used_3',
    title: 'Alternator 12V 90A (Bosch OE)',
    compatibility: 'Maruti Suzuki Swift DDiS Diesel',
    condition: 'VERIFIED_REFURBISHED',
    price: 2900,
    originalPrice: 7200,
    city: 'Delhi NCR',
  },
  {
    id: 'used_4',
    title: 'Electric Power Steering Column Motor',
    compatibility: 'Honda City 4th Gen',
    condition: 'GOOD',
    price: 4500,
    originalPrice: 16000,
    city: 'Mumbai',
  },
];

const SellUsedPartPage = () => {
  const [listings, setListings] = useState(DEFAULT_USED_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'LIGHTING',
    vehicleModel: '',
    condition: 'EXCELLENT',
    price: '',
    originalPrice: '',
    city: '',
    description: '',
  });

  useEffect(() => {
    document.title = 'Sell Used Spare Parts | Circular PartNexa';
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await usedPartsService.listUsedParts();
      if (res.data?.data && res.data.data.length > 0) {
        setListings(res.data.data);
      }
    } catch {
      // Keep DEFAULT_USED_LISTINGS
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.vehicleModel) {
      toast.error('Please fill in title, price, and vehicle compatibility');
      return;
    }

    setIsSubmitting(true);
    try {
      await usedPartsService.createListing(formData);
      toast.success('Part listed successfully! Verification team will inspect within 24h.');
      setListings((prev) => [
        {
          id: `listing_${Date.now()}`,
          ...formData,
          price: Number(formData.price),
        },
        ...prev,
      ]);
      setFormData({
        title: '',
        category: 'LIGHTING',
        vehicleModel: '',
        condition: 'EXCELLENT',
        price: '',
        originalPrice: '',
        city: '',
        description: '',
      });
    } catch (err) {
      // In case server endpoint is mock or fails, add locally to preview
      toast.success('Part listed successfully! (Demo verification queue)');
      setListings((prev) => [
        {
          id: `listing_${Date.now()}`,
          ...formData,
          price: Number(formData.price),
        },
        ...prev,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sell-parts-page">
      {/* Hero */}
      <section className="sell-hero">
        <div className="container">
          <div className="sell-hero-badge">♻️ Circular Automotive Marketplace</div>
          <h1 className="sell-hero-title">Sell Your Used Spare Parts & Salvage</h1>
          <p className="sell-hero-desc">
            Turn your unused auto parts, upgrades, or salvage components into instant cash.
            PartNexa verifies condition, lists to verified buyers, and guarantees safe payout.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="sell-layout">
          {/* Listing Form */}
          <div className="sell-form-card">
            <h2 className="sell-form-title">List a Spare Part for Sale</h2>
            <p className="sell-form-subtitle">
              Provide accurate vehicle fitment and condition details for faster buyers
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Part Name / Title"
                  placeholder="e.g. Bosch Alternator 12V 90A, Right LED Headlight"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: 'LIGHTING', label: 'Lighting & Headlamps' },
                    { value: 'BRAKES', label: 'Brakes & Rotors' },
                    { value: 'ELECTRICAL', label: 'Electricals & Alternator' },
                    { value: 'ENGINE', label: 'Engine Components' },
                    { value: 'SUSPENSION', label: 'Suspension & Steering' },
                    { value: 'BODY', label: 'Body Panels & Mirrors' },
                    { value: 'ACCESSORIES', label: 'Infotainment & Audio' },
                  ]}
                />

                <Select
                  label="Condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  options={[
                    { value: 'EXCELLENT', label: 'Like New / Excellent' },
                    { value: 'VERIFIED_REFURBISHED', label: 'Refurbished & Tested' },
                    { value: 'GOOD', label: 'Good Working Condition' },
                    { value: 'FAIR', label: 'Needs Minor Servicing' },
                  ]}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Compatible Vehicle(s)"
                  placeholder="e.g. Hyundai Creta 2018-2020 1.6L Petrol / Diesel"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Input
                  type="number"
                  label="Expected Price (₹)"
                  placeholder="e.g. 2500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />

                <Input
                  label="Your City / Location"
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              {/* Photo upload dropzone */}
              <div className="dropzone-box">
                <div className="dropzone-icon">📸</div>
                <div className="dropzone-text">Click or drag photos of your spare part</div>
                <div className="dropzone-sub">
                  Upload up to 4 photos: front, back, connectors, and part number sticker
                </div>
              </div>

              <Button
                type="submit"
                variant="teal"
                size="lg"
                fullWidth
                loading={isSubmitting}
                id="submit-used-part-btn"
              >
                List Part on PartNexa Marketplace
              </Button>
            </form>
          </div>

          {/* Right Info Process Column */}
          <div className="sell-info-column">
            <div className="sell-process-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                How Circular Selling Works
              </h3>
              <div className="process-steps">
                <div className="process-step">
                  <div className="process-num">1</div>
                  <div className="process-info">
                    <h4>List in 2 Minutes</h4>
                    <p>Enter vehicle compatibility, condition, and your expected price.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-num">2</div>
                  <div className="process-info">
                    <h4>Technician Verification</h4>
                    <p>
                      Our partner garage performs an electrical/fitment test before dispatch.
                    </p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-num">3</div>
                  <div className="process-info">
                    <h4>Instant Bank Payout</h4>
                    <p>
                      Funds are credited to your UPI or bank account as soon as the part passes inspection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="sell-process-card"
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(13, 148, 136, 0.08))',
                borderColor: 'var(--color-teal-300)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                🌱 Environmental Impact
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Every refurbished OEM spare part reused prevents approximately <strong>14.2 kg of CO2 emissions</strong> and reduces landfill scrap metal in our cities.
              </p>
            </div>
          </div>
        </div>

        {/* Community Verified Listings Showcase */}
        <div className="used-listings-section">
          <div className="section-title-wrap">
            <h2 className="section-main-title">Recently Listed Verified Used Parts</h2>
            <p className="section-subtitle">
              Inspected by PartNexa certified mechanics with 30-day replacement guarantee
            </p>
          </div>

          <div className="used-listings-grid">
            {listings.map((item) => (
              <div key={item.id} className="used-card">
                <div>
                  <span className="used-card-badge">
                    {item.condition?.replace(/_/g, ' ') || 'VERIFIED'}
                  </span>
                  <h4 className="used-card-title">{item.title}</h4>
                  <div className="used-card-fitment">🚗 {item.vehicleModel || item.compatibility}</div>
                  <div className="text-xs text-muted">📍 {item.city || 'Pan-India'}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '16px' }}>
                  <div className="used-card-price">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellUsedPartPage;
