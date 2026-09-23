import { useState, useEffect } from 'react';
import { servicesService } from '../../services';
import { Button, Modal, Input, Badge, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const SERVICES_CATALOG = [
  {
    id: 'brakes',
    title: 'Brake Pad & Rotor Replacement',
    icon: '🛑',
    eta: '45 - 60 mins',
    price: 499,
    description: 'Precision caliper cleaning, high-temp lubricant application, and OE brake pad installation.',
    features: ['OE-spec pad fitment', 'Disc rotor resurfacing check', 'Road test validation'],
  },
  {
    id: 'battery',
    title: 'Battery Health Scan & Fitting',
    icon: '🔋',
    eta: '20 - 30 mins',
    price: 199,
    description: 'Complete alternator load test, terminal de-oxidation, and zero-downtime battery installation.',
    features: ['CCA diagnostic report', 'Terminal grease application', 'Old battery disposal credit'],
  },
  {
    id: 'obd',
    title: 'Engine Diagnostics & OBD2 Scan',
    icon: '💻',
    eta: '30 mins',
    price: 399,
    description: 'Comprehensive digital ECU scan for error trouble codes (DTC), sensor calibration, and clear check-engine.',
    features: ['32-point electronic sweep', 'PDF diagnostic report', 'Error code reset'],
  },
  {
    id: 'suspension',
    title: 'Suspension & Shock Absorber Service',
    icon: '🚗',
    eta: '90 - 120 mins',
    price: 699,
    description: 'Strut mounting, bushing inspection, hydraulic damping tests, and steering alignment check.',
    features: ['Hydraulic shock testing', 'Ball joint grease packing', 'Ride height inspection'],
  },
  {
    id: 'oil',
    title: 'Periodic Maintenance & Oil Change',
    icon: '🛢️',
    eta: '60 mins',
    price: 349,
    description: 'Fully synthetic oil drain and flush, genuine OEM oil filter swap, and 24-point vehicle inspection.',
    features: ['OEM filter included', 'Sump plug washer replacement', 'Fluid top-ups (coolant, washer)'],
  },
  {
    id: 'ac',
    title: 'AC Gas Charge & Cabin Filtration',
    icon: '❄️',
    eta: '45 mins',
    price: 599,
    description: 'R134a refrigerant leak testing, vacuum leak detection, compressor oil top-up, and PM2.5 filter swap.',
    features: ['High/low pressure gauge test', 'Anti-bacterial duct steam', 'OEM cabin filter install'],
  },
];

const ServicesPage = () => {
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    vehicleModel: '',
    preferredDate: '',
    serviceMode: 'DOORSTEP',
  });

  const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad'];

  useEffect(() => {
    document.title = 'Installation & Repair Services | PartNexa';
    fetchShops(selectedCity);
  }, [selectedCity]);

  const fetchShops = async (city) => {
    setLoadingShops(true);
    try {
      const res = await servicesService.getShops(city);
      setShops(res.data?.data || []);
    } catch {
      // Fallback partner shops
      setShops([
        {
          id: 'shop_1',
          name: 'PartNexa SuperCenter Koramangala',
          city: 'Bengaluru',
          address: '80 Feet Road, 4th Block, Koramangala',
          rating: 4.9,
          activeBays: 6,
          technicians: 8,
          specialization: 'Four-Wheelers & Hybrid Diagnostics',
        },
        {
          id: 'shop_2',
          name: 'AutoTech Precision Garage Indiranagar',
          city: 'Bengaluru',
          address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
          rating: 4.8,
          activeBays: 4,
          technicians: 5,
          specialization: 'Brakes, Suspension & Engine Overhaul',
        },
        {
          id: 'shop_3',
          name: 'Two-Wheeler Velocity Hub Whitefield',
          city: 'Bengaluru',
          address: 'ITPL Main Road, Hope Farm, Whitefield',
          rating: 4.7,
          activeBays: 5,
          technicians: 6,
          specialization: 'Bikes, Superbikes & EV Scooters',
        },
      ]);
    } finally {
      setLoadingShops(false);
    }
  };

  const handleOpenBooking = (service) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingData.name || !bookingData.phone || !bookingData.preferredDate) {
      toast.error('Please fill all required booking fields');
      return;
    }
    toast.success(
      `Appointment booked for ${selectedService?.title || 'Service'}! Our technician will reach you.`
    );
    setBookingModalOpen(false);
    setBookingData({
      name: '',
      phone: '',
      vehicleModel: '',
      preferredDate: '',
      serviceMode: 'DOORSTEP',
    });
  };

  return (
    <div className="services-page">
      {/* Hero Banner */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content animate-fade-in-up">
            <div className="services-hero-badge">
              <span>🔧</span> Do-It-For-Me (DIFM) Certified Repair Network
            </div>
            <h1 className="services-hero-title">
              Professional Vehicle Fitment & Mechanical Services
            </h1>
            <p className="services-hero-desc">
              Don’t want to install parts yourself? Book certified PartNexa mechanics for
              doorstep installation or visit our verified partner workshops with dedicated service bays.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="teal"
                size="lg"
                onClick={() => handleOpenBooking(SERVICES_CATALOG[0])}
              >
                📅 Book Doorstep Mechanic
              </Button>
              <a href="#partner-workshops" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg">
                  🏬 Find Partner Workshop
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Service Catalog */}
        <section className="section-title-wrap">
          <h2 className="section-main-title">Popular Mechanical Services</h2>
          <p className="section-subtitle">
            Flat-rate transparent labor pricing with PartNexa fitment warranty
          </p>
        </section>

        <div className="services-catalog-grid">
          {SERVICES_CATALOG.map((svc) => (
            <div key={svc.id} className="service-card" id={`service-card-${svc.id}`}>
              <div>
                <div className="service-card-top">
                  <div className="service-icon-wrap">{svc.icon}</div>
                  <div>
                    <h3 className="service-card-title">{svc.title}</h3>
                    <span className="service-card-eta">⏱️ Est. Time: {svc.eta}</span>
                  </div>
                </div>
                <p className="service-card-desc">{svc.description}</p>
                <ul className="service-card-features">
                  {svc.features.map((feat, i) => (
                    <li key={i} className="service-feature-item">
                      <span className="text-teal font-bold">✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-card-footer">
                <div className="service-price-wrap">
                  <span className="service-price-label">Starting labor</span>
                  <span className="service-price-val">₹{svc.price}</span>
                </div>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => handleOpenBooking(svc)}
                >
                  Book Service
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Workshops Section */}
        <section id="partner-workshops" className="section-title-wrap">
          <div className="shops-filter-bar">
            <div>
              <h2 className="section-main-title">Verified Partner Workshops</h2>
              <p className="section-subtitle">
                Authorized multi-brand garages with specialized tools and guaranteed turnaround
              </p>
            </div>
            <div className="city-pill-group">
              {cities.map((city) => (
                <button
                  key={city}
                  className={`city-pill ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>

          <div className="shops-grid">
            {shops.map((shop) => (
              <div key={shop.id} className="shop-card">
                <div>
                  <div className="shop-card-header">
                    <div>
                      <h3 className="shop-name">{shop.name}</h3>
                      <div className="shop-location">📍 {shop.address}</div>
                    </div>
                    <div className="shop-rating-pill">⭐ {shop.rating}</div>
                  </div>

                  <div className="shop-card-stats">
                    <div className="shop-stat">
                      Active Bays: <strong>{shop.activeBays || 4} Bays</strong>
                    </div>
                    <div className="shop-stat">
                      Technicians: <strong>{shop.technicians || 6} Certified</strong>
                    </div>
                  </div>

                  <div className="text-xs text-muted" style={{ marginBottom: '16px' }}>
                    Specialization: <strong>{shop.specialization}</strong>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedService({ title: `Slot at ${shop.name}` });
                    setBookingModalOpen(true);
                  }}
                >
                  Reserve Bay Slot
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <Modal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          title={`Book Service: ${selectedService?.title || 'Vehicle Service'}`}
          size="md"
        >
          <form onSubmit={handleConfirmBooking}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Service Type</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  className={`btn ${
                    bookingData.serviceMode === 'DOORSTEP' ? 'btn-teal' : 'btn-outline'
                  } btn-sm`}
                  onClick={() => setBookingData({ ...bookingData, serviceMode: 'DOORSTEP' })}
                >
                  🏡 Doorstep Service
                </button>
                <button
                  type="button"
                  className={`btn ${
                    bookingData.serviceMode === 'WORKSHOP' ? 'btn-teal' : 'btn-outline'
                  } btn-sm`}
                  onClick={() => setBookingData({ ...bookingData, serviceMode: 'WORKSHOP' })}
                >
                  🏬 Partner Workshop
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Anand Menon"
                value={bookingData.name}
                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                value={bookingData.phone}
                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Input
                label="Vehicle Make & Model"
                placeholder="e.g. Maruti Suzuki Swift VXi 2021"
                value={bookingData.vehicleModel}
                onChange={(e) => setBookingData({ ...bookingData, vehicleModel: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Input
                type="date"
                label="Preferred Date"
                value={bookingData.preferredDate}
                onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="teal">
                Confirm Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServicesPage;
