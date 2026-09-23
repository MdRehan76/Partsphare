import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

const conditionLabel = {
  GENUINE_NEW: '100% Genuine OEM',
  REFURBISHED: 'Certified Refurbished',
  USED_VERIFIED: 'Used & Inspected',
};

const conditionClass = {
  GENUINE_NEW: 'badge-primary',
  REFURBISHED: 'badge-teal',
  USED_VERIFIED: 'badge-orange',
};

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const {
    id,
    slug,
    name,
    brand,
    partNumber,
    condition,
    primaryImage,
    mrp,
    lowestPrice,
    basePrice,
    rating,
    reviewCount,
    category,
    isAvailable = true,
    stockQuantity,
    warranty,
    isCompatible,
    description,
  } = product;

  const displayPrice = lowestPrice || basePrice || 0;
  const discount =
    mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product, null, 1);
  };

  return (
    <div
      className={`product-card card card-hoverable ${!isAvailable ? 'product-out-of-stock' : ''}`}
      id={`product-${slug || id}`}
    >
      <Link to={`/products/${slug || id}`} className="product-card-link-wrapper">
        {/* Image & Badges */}
        <div className="product-card-image-wrapper">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={name}
              className="product-card-image"
              loading="lazy"
            />
          ) : (
            <div className="product-card-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>
          )}

          {/* Condition Badge */}
          <span className={`product-condition-badge badge ${conditionClass[condition] || 'badge-primary'}`}>
            {conditionLabel[condition] || condition}
          </span>

          {/* Discount Badge */}
          {discount > 0 && isAvailable && (
            <span className="product-discount-badge badge badge-success">
              -{discount}% OFF
            </span>
          )}

          {/* Out of Stock Overlay Badge */}
          {!isAvailable && (
            <div className="out-of-stock-overlay">
              <span className="badge badge-danger text-xs font-bold">OUT OF STOCK</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-card-info">
          {/* Brand & Part Number */}
          <div className="product-card-meta-row">
            {brand && <span className="product-card-brand">{brand}</span>}
            {partNumber && (
              <span className="product-card-partnum" title={`Part Number: ${partNumber}`}>
                Part #{partNumber}
              </span>
            )}
          </div>

          <h3 className="product-card-name line-clamp-2">{name}</h3>

          {description && (
            <p className="product-card-description line-clamp-2">{description}</p>
          )}

          {/* Compatibility Status Badge */}
          <div className="product-card-compatibility-row">
            {isCompatible === true && (
              <span className="fitment-badge fitment-compatible" id={`fitment-ok-${id}`}>
                <span className="fitment-dot">●</span> Guaranteed Fit
              </span>
            )}
            {isCompatible === false && (
              <span className="fitment-badge fitment-incompatible" id={`fitment-no-${id}`}>
                <span className="fitment-dot">✕</span> Does Not Fit
              </span>
            )}
            {isCompatible === null && (
              <span className="fitment-badge fitment-unselected">
                <span>🔍</span> Check Fitment
              </span>
            )}
          </div>

          {/* Warranty & Availability Chips */}
          <div className="product-card-tags-row">
            {warranty && (
              <span className="product-tag-chip warranty-chip" title="Warranty">
                🛡️ {warranty}
              </span>
            )}
            {isAvailable && stockQuantity > 0 ? (
              <span className="product-tag-chip in-stock-chip">
                ✓ In Stock ({stockQuantity})
              </span>
            ) : (
              <span className="product-tag-chip oos-chip">
                ✕ Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="product-card-price">
            <span className="price-current">
              ₹{displayPrice?.toLocaleString('en-IN') || '—'}
            </span>
            {mrp > displayPrice && (
              <span className="price-mrp">₹{mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Footer */}
      <div className="product-card-action-footer">
        <div className="product-card-reviews">
          <span className="stars" style={{ color: 'var(--color-gold)' }}>★</span>
          <span className="rating-value">{rating?.toFixed(1) || '4.5'}</span>
          <span className="review-count">({reviewCount || 0})</span>
        </div>

        <button
          className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'} quick-add-btn`}
          onClick={handleQuickAdd}
          disabled={!isAvailable}
          title={isAvailable ? 'Add to Cart' : 'Currently Out of Stock'}
          aria-label={isAvailable ? `Add ${name} to cart` : 'Out of Stock'}
        >
          {isAvailable ? (
            <>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="product-card" style={{ padding: '16px' }}>
    <div className="skeleton" style={{ height: '170px', borderRadius: '12px', marginBottom: '12px' }} />
    <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '8px' }} />
    <div className="skeleton" style={{ height: '20px', width: '85%', marginBottom: '8px' }} />
    <div className="skeleton" style={{ height: '16px', width: '50%', marginBottom: '14px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ height: '24px', width: '35%' }} />
      <div className="skeleton" style={{ height: '32px', width: '30%', borderRadius: '6px' }} />
    </div>
  </div>
);

export default ProductCard;
