import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogService, vehiclesService } from '../services';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import './HomePage.css';

// ---- Vehicle Search Widget ----
const VehicleSearch = () => {
  const navigate = useNavigate();
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');

  useEffect(() => {
    vehiclesService.getMakes(vehicleType)
      .then(({ data }) => setMakes(data.data))
      .catch(() => {});
    setSelectedMake(''); setSelectedModel(''); setSelectedVariant('');
    setModels([]); setVariants([]);
  }, [vehicleType]);

  const handleMakeChange = async (makeId) => {
    setSelectedMake(makeId);
    setSelectedModel(''); setSelectedVariant('');
    setVariants([]);
    if (!makeId) { setModels([]); return; }
    try {
      const { data } = await vehiclesService.getModels(makeId);
      setModels(data.data);
    } catch {}
  };

  const handleModelChange = async (modelId) => {
    setSelectedModel(modelId);
    setSelectedVariant('');
    if (!modelId) { setVariants([]); return; }
    try {
      const { data } = await vehiclesService.getVariants(modelId);
      setVariants(data.data);
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedVariant) {
      navigate(`/products?vehicleVariantId=${selectedVariant}`);
    } else if (selectedModel) {
      navigate(`/products?modelId=${selectedModel}`);
    } else if (selectedMake) {
      navigate(`/products?makeId=${selectedMake}`);
    } else {
      navigate('/products');
    }
  };

  const vehicleTypes = [
    { id: 'CAR', label: '🚗 Car', icon: '🚗' },
    { id: 'BIKE', label: '🏍️ Bike', icon: '🏍️' },
    { id: 'SCOOTER', label: '🛵 Scooter', icon: '🛵' },
  ];

  return (
    <div className="vehicle-search-widget">
      <h2 className="vehicle-search-title">Find Parts for Your Vehicle</h2>
      <div className="vehicle-type-tabs">
        {vehicleTypes.map((vt) => (
          <button
            key={vt.id}
            className={`vehicle-type-tab ${vehicleType === vt.id ? 'active' : ''}`}
            onClick={() => setVehicleType(vt.id)}
            id={`vehicle-type-${vt.id.toLowerCase()}`}
          >
            {vt.label}
          </button>
        ))}
      </div>
      <form className="vehicle-search-form" onSubmit={handleSearch}>
        <select
          id="hero-make-select"
          className="form-select"
          value={selectedMake}
          onChange={(e) => handleMakeChange(e.target.value)}
        >
          <option value="">Select Make</option>
          {makes.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          id="hero-model-select"
          className="form-select"
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!selectedMake}
        >
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          id="hero-variant-select"
          className="form-select"
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          disabled={!selectedModel}
        >
          <option value="">Select Year / Variant</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year} — {v.name} ({v.fuelType})
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-primary vehicle-search-btn" id="hero-search-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Find Parts
        </button>
      </form>
    </div>
  );
};

// ---- Category Card ----
const CategoryCard = ({ category }) => (
  <Link
    to={`/products?categorySlug=${category.slug}`}
    className="category-card card"
    id={`category-${category.slug}`}
  >
    <div className="category-icon">{getCategoryEmoji(category.slug)}</div>
    <div>
      <h3 className="category-name">{category.name}</h3>
      {category._count?.products > 0 && (
        <p className="category-count">{category._count.products} products</p>
      )}
    </div>
  </Link>
);

const getCategoryEmoji = (slug) => {
  const map = {
    'engine-components': '⚙️',
    'brakes-suspension': '🛞',
    'electrical-lighting': '💡',
    'battery': '🔋',
    'tyres-wheels': '⭕',
    'car-accessories': '✨',
    'music-systems': '🎵',
    'body-parts': '🚘',
    'transmission': '🔧',
    'cooling-system': '❄️',
  };
  return map[slug] || '🔩';
};

// ---- Trust Banner ----
const TrustBanner = () => {
  const items = [
    { icon: '✅', title: 'Verified Parts', desc: 'Every part authenticity-checked' },
    { icon: '🔧', title: 'Home Installation', desc: 'Expert mechanic at your doorstep' },
    { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free returns' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Pan-India in 2-5 business days' },
    { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay-powered checkout' },
  ];

  return (
    <div className="trust-banner">
      <div className="container">
        <div className="trust-items">
          {items.map((item, i) => (
            <div key={i} className="trust-item-card">
              <span className="trust-item-icon">{item.icon}</span>
              <div>
                <div className="trust-item-title">{item.title}</div>
                <div className="trust-item-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Main Page ----
const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    document.title = 'PartNexa — Automotive Spare Parts & Services';

    catalogService.getCategories()
      .then(({ data }) => setCategories(data.data?.slice(0, 10) || []))
      .catch(() => {});

    catalogService.listProducts({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(({ data }) => setFeaturedProducts(data.data || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <div className="hero-tag badge badge-primary">🇮🇳 India's #1 Parts Marketplace</div>
            <h1 className="hero-title font-display">
              Your Vehicle Deserves
              <br />
              <span className="gradient-text">The Best Parts.</span>
            </h1>
            <p className="hero-subtitle">
              Shop genuine, refurbished & verified used spare parts for your car, bike or scooter.
              Get expert home installation. Nationwide delivery.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg" id="hero-browse-btn">
                Browse All Parts
              </Link>
              <Link to="/products?condition=USED_VERIFIED" className="btn btn-secondary btn-lg" id="hero-used-btn">
                View Used & Verified
              </Link>
            </div>
          </div>

          {/* Vehicle Search Widget */}
          <div className="hero-search-widget animate-fade-in" style={{ animationDelay: '200ms' }}>
            <VehicleSearch />
          </div>
        </div>

        {/* Stats */}
        <div className="container">
          <div className="hero-stats animate-fade-in" style={{ animationDelay: '400ms' }}>
            {[
              { value: '50,000+', label: 'Parts Listed' },
              { value: '1,200+', label: 'Verified Shops' },
              { value: '4.8★', label: 'Avg. Rating' },
              { value: '2.5L+', label: 'Happy Customers' },
            ].map((stat, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value gradient-text">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <TrustBanner />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find parts by what you need</p>
            </div>
            <div className="categories-grid stagger">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Parts</h2>
              <p className="section-subtitle">Top-selling parts on PartNexa</p>
            </div>
            <Link to="/products" className="btn btn-outline" id="view-all-products-btn">
              View All →
            </Link>
          </div>

          <div className="grid-products">
            {loadingProducts
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>

          {!loadingProducts && featuredProducts.length === 0 && (
            <div className="empty-products">
              <p>No products listed yet. Seed the database to see products here.</p>
              <Link to="/products" className="btn btn-primary mt-4">Browse Catalog</Link>
            </div>
          )}
        </div>
      </section>

      {/* DIFM CTA Banner */}
      <section className="difm-banner">
        <div className="container">
          <div className="difm-content">
            <div className="difm-text">
              <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>NEW — Do It For Me</div>
              <h2 className="section-title">Don't Want to Install It Yourself?</h2>
              <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>
                Order any part and select "Home Installation" at checkout. Our certified mechanics will install it at your doorstep.
              </p>
              <div className="difm-features">
                {['Certified Mechanics', 'Same-day Booking', 'Warranty on Work', 'Upfront Pricing'].map((f) => (
                  <div key={f} className="difm-feature">
                    <span className="text-success">✓</span> {f}
                  </div>
                ))}
              </div>
              <Link to="/products" className="btn btn-primary btn-lg mt-6" id="difm-cta-btn">
                Shop with Installation
              </Link>
            </div>
            <div className="difm-visual">
              <div className="difm-card-stack">
                {['🔧 Engine Oil Filter', '🔋 Battery Replacement', '💡 Headlight Bulb', '🛞 Brake Pads'].map((item, i) => (
                  <div
                    key={i}
                    className="difm-card"
                    style={{ transform: `rotate(${(i - 1.5) * 3}deg) translateY(${i * -4}px)` }}
                  >
                    <span>{item}</span>
                    <span className="text-success text-sm">✓ Install Available</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
