import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../services';
import { useCart } from '../contexts/CartContext';
import { useVehicles } from '../contexts/VehicleContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const conditionLabel = {
  GENUINE_NEW: '100% Genuine OEM Part',
  REFURBISHED: 'Certified Refurbished (Factory Tested)',
  USED_VERIFIED: 'Used & Technician Inspected',
};

const conditionBadgeClass = {
  GENUINE_NEW: 'badge-primary',
  REFURBISHED: 'badge-teal',
  USED_VERIFIED: 'badge-orange',
};

export const ProductDetailPage = () => {
  const { slug, id } = useParams();
  const productKey = slug || id;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { activeVehicle, primaryVehicle } = useVehicles();

  // Effective vehicle variant to check fitment against
  const variantIdFromQuery = searchParams.get('variantId');
  const currentVehicleVariantId =
    variantIdFromQuery || activeVehicle?.variantId || activeVehicle?.variant?.id || primaryVehicle?.variantId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShop, setSelectedShop] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specifications');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    catalogService
      .getProduct(productKey, currentVehicleVariantId)
      .then(({ data }) => {
        setProduct(data.data);
        if (data.data.inventories?.length) {
          // Select first available shop or first shop
          const availableShop = data.data.inventories.find((inv) => inv.quantity > 0) || data.data.inventories[0];
          setSelectedShop(availableShop);
        }
        document.title = `${data.data.name} | PartNexa`;
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
        setError(err.response?.status === 404 ? 'Product not found' : 'Failed to load product details');
      })
      .finally(() => setLoading(false));
  }, [productKey, currentVehicleVariantId]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container product-detail-skeleton">
          <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 20, width: '30%' }} />
            <div className="skeleton" style={{ height: 36, width: '85%' }} />
            <div className="skeleton" style={{ height: 28, width: '40%' }} />
            <div className="skeleton" style={{ height: 80, width: '100%', borderRadius: 12 }} />
            <div className="skeleton" style={{ height: 48, width: '50%', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  // Error / 404 State
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container product-error-state card">
          <div className="error-icon">🔩</div>
          <h2>Product Not Found</h2>
          <p>
            The automotive part or component you are looking for does not exist or has been removed from our catalog.
          </p>
          <div className="error-actions">
            <Link to="/products" className="btn btn-primary">
              Browse All Spare Parts
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryPrice = selectedShop?.sellingPrice || product.lowestPrice || product.basePrice;
  const discount =
    product.mrp > primaryPrice
      ? Math.round(((product.mrp - primaryPrice) / product.mrp) * 100)
      : 0;

  const activeStock = selectedShop ? Number(selectedShop.quantity ?? 0) : Number(product.stockQuantity ?? 0);
  const isOutOfStock = !product.isAvailable || activeStock <= 0 || (selectedShop && selectedShop.quantity <= 0);

  const handleAddToCart = async () => {
    if (isOutOfStock || activeStock <= 0) {
      toast.error('This item is currently out of stock.');
      return;
    }
    if (quantity > activeStock) {
      toast.error(`Cannot add ${quantity} units. Only ${activeStock} available in stock.`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product, selectedShop?.shopId, quantity);
      toast.success(`Added ${quantity}x ${product.name} to your cart! 🛒`);
    } catch {
      toast.error('Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || activeStock <= 0) {
      toast.error('This item is currently out of stock.');
      return;
    }
    if (quantity > activeStock) {
      toast.error(`Cannot order ${quantity} units. Only ${activeStock} available in stock.`);
      return;
    }
    try {
      await addToCart(product, selectedShop?.shopId, quantity);
      navigate('/checkout');
    } catch {
      toast.error('Failed to process order.');
    }
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* BREADCRUMB */}
        <nav className="breadcrumb animate-fade-in" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Parts</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?categorySlug=${product.category.slug}`}>{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* VEHICLE COMPATIBILITY HERO BANNER */}
        {currentVehicleVariantId && product.isCompatible !== null && (
          <div
            className={`fitment-banner ${
              product.isCompatible ? 'fitment-banner-success' : 'fitment-banner-warning'
            }`}
            id="fitment-banner"
          >
            <div className="fitment-banner-icon">
              {product.isCompatible ? '✅' : '⚠️'}
            </div>
            <div className="fitment-banner-text">
              <div className="fitment-banner-title">
                {product.isCompatible
                  ? 'Guaranteed Compatibility Match'
                  : 'Incompatible Vehicle Warning'}
              </div>
              <p className="fitment-banner-desc">
                {product.isCompatible
                  ? `This ${product.brand} component is verified by PartNexa engineering rules to fit your selected vehicle (${
                      activeVehicle?.variant?.model?.name || 'Selected Model'
                    }).`
                  : `This part does NOT fit your currently active vehicle. Please verify compatible models in the table below before purchasing.`}
              </p>
            </div>
          </div>
        )}

        {/* MAIN PRODUCT GRID */}
        <div className="product-detail-grid">
          {/* LEFT: IMAGE GALLERY */}
          <div className="product-images-gallery">
            <div className="product-main-image card">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url || product.primaryImage}
                  alt={product.images[selectedImage]?.altText || product.name}
                  className="product-main-img"
                  id="main-product-image"
                />
              ) : (
                <div className="product-no-image">
                  <span>🔩</span>
                  <p>No high-res image available</p>
                </div>
              )}

              {/* Condition Floating Pill */}
              <span className={`detail-condition-pill badge ${conditionBadgeClass[product.condition] || 'badge-primary'}`}>
                {conditionLabel[product.condition] || product.condition}
              </span>

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="detail-oos-overlay">
                  <span className="badge badge-danger text-sm font-bold">CURRENTLY OUT OF STOCK</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={img.id || i}
                    type="button"
                    className={`product-thumb ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                    id={`thumb-btn-${i}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img.url} alt={img.altText || product.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="product-info-column">
            {/* Brand & Part Number Row */}
            <div className="product-meta-header">
              <div className="brand-group">
                {product.brandLogo && (
                  <img src={product.brandLogo} alt={product.brand} className="brand-logo-small" />
                )}
                <span className="product-brand-text">{product.brand}</span>
              </div>
              {product.partNumber && (
                <div className="part-number-tag" title="Manufacturer Part Number">
                  Part Number: <strong>{product.partNumber}</strong>
                </div>
              )}
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            {/* Ratings & Reviews summary */}
            <div className="product-rating-row">
              <div className="stars-rating">
                <span style={{ color: 'var(--color-gold)', fontSize: '16px' }}>★</span>
                <span className="rating-num">{product.rating?.toFixed(1) || '4.5'}</span>
              </div>
              <span className="rating-divider">·</span>
              <button
                type="button"
                className="reviews-link-btn"
                onClick={() => setActiveTab('reviews')}
              >
                {product.reviewCount || 0} customer review{product.reviewCount !== 1 ? 's' : ''}
              </button>
              <span className="rating-divider">·</span>
              <span className="verified-badge">🛡️ Verified OEM Spec</span>
            </div>

            {/* Price Section */}
            <div className="product-price-box card">
              <div className="price-row">
                <span className="price-big">₹{primaryPrice?.toLocaleString('en-IN')}</span>
                {product.mrp > primaryPrice && (
                  <span className="price-strikethrough">₹{product.mrp.toLocaleString('en-IN')}</span>
                )}
                {discount > 0 && (
                  <span className="badge badge-success discount-pill">Save {discount}%</span>
                )}
              </div>
              <p className="price-taxes">Inclusive of all GST. Free doorstep shipping over ₹999.</p>

              {/* Warranty Notice */}
              {product.warranty && (
                <div className="warranty-banner">
                  <span className="warranty-icon">🛡️</span>
                  <span><strong>Warranty:</strong> {product.warranty}</span>
                </div>
              )}
            </div>

            {/* Availability & Stock Status */}
            <div className="stock-status-row">
              {isOutOfStock ? (
                <div className="stock-badge stock-out">
                  <span className="stock-dot">✕</span>
                  <span>Out of Stock — Check back soon</span>
                </div>
              ) : (
                <div className="stock-badge stock-in">
                  <span className="stock-dot">●</span>
                  <span>In Stock — Ships within 24 Hours ({activeStock} unit{activeStock === 1 ? '' : 's'} available)</span>
                </div>
              )}
            </div>

            {/* SELLER / MULTI-SHOP INVENTORY */}
            {product.inventories?.length > 0 && (
              <div className="seller-inventory-section">
                <h4 className="seller-section-title">
                  Available from {product.inventories.length} verified supplier{product.inventories.length !== 1 ? 's' : ''}:
                </h4>
                <div className="seller-options-list">
                  {product.inventories.map((inv) => (
                    <label
                      key={inv.id || inv.shopId}
                      className={`seller-option-card ${
                        selectedShop?.shopId === inv.shopId ? 'selected' : ''
                      } ${inv.quantity <= 0 ? 'disabled' : ''}`}
                    >
                      <input
                        type="radio"
                        name="supplierShop"
                        checked={selectedShop?.shopId === inv.shopId}
                        onChange={() => setSelectedShop(inv)}
                        disabled={inv.quantity <= 0}
                        id={`shop-${inv.shopId}`}
                      />
                      <div className="seller-info">
                        <div className="seller-name-row">
                          <span className="seller-name">{inv.shop?.name || 'Verified Partner Shop'}</span>
                          {inv.shop?.isVerified && (
                            <span className="badge badge-teal text-xs">Verified Workshop</span>
                          )}
                        </div>
                        <div className="seller-meta">
                          📍 {inv.shop?.city || 'Regional Hub'} · ★ {inv.shop?.rating?.toFixed(1) || '4.8'}
                          {inv.quantity > 0 ? (
                            <span className="text-success"> · {inv.quantity} in stock</span>
                          ) : (
                            <span className="text-danger"> · Out of Stock</span>
                          )}
                        </div>
                      </div>
                      <div className="seller-price">
                        ₹{Number(inv.sellingPrice).toLocaleString('en-IN')}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-row">
              <label htmlFor="qty-input" className="qty-label">Quantity:</label>
              <div className="qty-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  id="qty-minus-btn"
                >
                  −
                </button>
                <span className="qty-number" id="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => (activeStock > 0 ? Math.min(activeStock, q + 1) : 1))}
                  disabled={isOutOfStock || quantity >= activeStock}
                  id="qty-plus-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Actions: Add to Cart & Buy Now */}
            <div className="detail-action-buttons">
              <button
                type="button"
                className="btn btn-primary btn-lg add-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                id="add-to-cart-button"
              >
                🛒 {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                type="button"
                className="btn btn-teal btn-lg buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                id="buy-now-button"
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* DIFM Installation Banner */}
            <div className="difm-doorstep-card card">
              <span className="difm-icon">🔧</span>
              <div>
                <div className="difm-title">Do-It-For-Me (DIFM) Doorstep Fitting</div>
                <div className="difm-desc">
                  Select certified mechanic home visit or partner shop fitting at checkout.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION: SPECS, COMPATIBILITY, REVIEWS, DESCRIPTION */}
        <div className="product-tabs-container">
          <div className="product-tabs-header" role="tablist">
            <button
              type="button"
              className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
              id="tab-specs"
              role="tab"
            >
              Technical Specifications
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'compatibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('compatibility')}
              id="tab-compat"
              role="tab"
            >
              Compatible Vehicles ({product.compatibleVehicles?.length || 0})
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
              id="tab-reviews"
              role="tab"
            >
              Reviews ({product.reviewCount || 0})
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
              id="tab-desc"
              role="tab"
            >
              Full Description
            </button>
          </div>

          <div className="product-tabs-body card">
            {/* SPECIFICATIONS TAB */}
            {activeTab === 'specifications' && (
              <div className="tab-pane animate-fade-in" id="pane-specs">
                <h3 className="tab-pane-title">Technical Specifications</h3>
                <div className="specs-table-wrapper">
                  <table className="specs-table">
                    <tbody>
                      {product.partNumber && (
                        <tr>
                          <th>Part Number</th>
                          <td><strong>{product.partNumber}</strong></td>
                        </tr>
                      )}
                      {product.sku && (
                        <tr>
                          <th>SKU Reference</th>
                          <td>{product.sku}</td>
                        </tr>
                      )}
                      {product.brand && (
                        <tr>
                          <th>Manufacturer</th>
                          <td>{product.brand}</td>
                        </tr>
                      )}
                      {product.condition && (
                        <tr>
                          <th>Part Condition</th>
                          <td>{conditionLabel[product.condition] || product.condition}</td>
                        </tr>
                      )}
                      {product.weight && (
                        <tr>
                          <th>Item Weight</th>
                          <td>{product.weight} kg</td>
                        </tr>
                      )}
                      {product.dimensions && (
                        <tr>
                          <th>Dimensions</th>
                          <td>{product.dimensions}</td>
                        </tr>
                      )}
                      {product.specifications?.map((spec, idx) => (
                        <tr key={idx}>
                          <th>{spec.key}</th>
                          <td>
                            {spec.value} {spec.unit ? spec.unit : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPATIBILITY TAB */}
            {activeTab === 'compatibility' && (
              <div className="tab-pane animate-fade-in" id="pane-compat">
                <h3 className="tab-pane-title">Compatible Vehicle Makes & Models</h3>
                <p className="tab-pane-subtitle">
                  This component is guaranteed to fit the following vehicle models and variants:
                </p>

                {product.compatibleVehicles?.length === 0 ? (
                  <div className="empty-tab-state">
                    <p>Universal fitment or compatibility information not specified.</p>
                  </div>
                ) : (
                  <div className="compatibility-vehicles-grid">
                    {product.compatibleVehicles.map((v, i) => (
                      <div key={v.id || i} className="compat-vehicle-card">
                        <div className="compat-veh-icon">
                          {v.make?.toLowerCase().includes('hero') ||
                          v.make?.toLowerCase().includes('bajaj') ||
                          v.make?.toLowerCase().includes('tvs')
                            ? '🏍️'
                            : '🚗'}
                        </div>
                        <div className="compat-veh-info">
                          <div className="compat-veh-make">{v.make}</div>
                          <div className="compat-veh-model">
                            {v.model} — {v.variant}
                          </div>
                          <div className="compat-veh-year">
                            Year: {v.year} · Fuel: {v.fuelType}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="tab-pane animate-fade-in" id="pane-reviews">
                <div className="reviews-tab-layout">
                  <div className="reviews-summary-card">
                    <div className="big-rating-number">{product.rating?.toFixed(1) || '4.5'}</div>
                    <div className="big-stars">
                      {'★'.repeat(Math.round(product.rating || 4.5))}
                      {'☆'.repeat(5 - Math.round(product.rating || 4.5))}
                    </div>
                    <div className="reviews-count-text">
                      Based on {product.reviewCount || 0} verified customer reviews
                    </div>
                  </div>

                  <div className="reviews-feed">
                    {product.reviews?.length === 0 ? (
                      <div className="empty-reviews">
                        <p>No customer reviews yet. Be the first to share your experience!</p>
                      </div>
                    ) : (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="customer-review-item">
                          <div className="review-top-row">
                            <div className="review-author">
                              <span className="author-avatar">
                                {rev.user?.firstName?.[0] || 'U'}
                                {rev.user?.lastName?.[0] || ''}
                              </span>
                              <div>
                                <div className="author-name">
                                  {rev.user?.firstName} {rev.user?.lastName}
                                </div>
                                {rev.isVerifiedPurchase && (
                                  <span className="badge badge-success text-xs">
                                    ✓ Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="review-stars-display" style={{ color: 'var(--color-gold)' }}>
                              {'★'.repeat(rev.rating)}
                              {'☆'.repeat(5 - rev.rating)}
                            </div>
                          </div>
                          {rev.title && <h5 className="review-headline">{rev.title}</h5>}
                          <p className="review-content">{rev.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DESCRIPTION TAB */}
            {activeTab === 'description' && (
              <div className="tab-pane animate-fade-in" id="pane-desc">
                <h3 className="tab-pane-title">Product Description</h3>
                <div className="description-text">
                  <p>{product.description || 'No extended description available.'}</p>
                </div>

                {product.tags?.length > 0 && (
                  <div className="product-tags-section">
                    <h4>Tags & Keywords</h4>
                    <div className="tag-chips-list">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="tag-chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
