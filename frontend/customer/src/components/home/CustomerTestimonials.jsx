import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_TESTIMONIALS } from '../../data/testimonialsData';
import './CustomerTestimonials.css';

/**
 * StarRating component rendering accessible SVG stars.
 */
const StarRating = ({ rating = 5 }) => (
  <div className="testimonial-stars" aria-label={`${rating} out of 5 stars`} role="img">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className="testimonial-star-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/**
 * VerifiedBadge component ensuring demo items are transparently labeled.
 */
const VerifiedBadge = ({ verified, isDemo }) => {
  if (verified) {
    return (
      <span className="testimonial-verified-badge" title="Genuine customer with verified purchase">
        <svg
          className="testimonial-verified-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Verified Customer</span>
      </span>
    );
  }

  return (
    <span
      className="testimonial-verified-badge is-demo"
      title="Sample review demonstrating verified vehicle-owner workflow"
    >
      <svg
        className="testimonial-verified-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>Customer Story {isDemo ? '(Demo)' : ''}</span>
    </span>
  );
};

/**
 * TrustSummaryStrip component presenting supported PartNexa platform capabilities.
 */
const TrustSummaryStrip = () => {
  const trustFeatures = [
    {
      icon: '🛡️',
      title: 'Verified Parts',
      desc: '100% OEM & certified genuine',
    },
    {
      icon: '🎯',
      title: 'Easy Compatibility',
      desc: 'Exact fitment by make, model & year',
    },
    {
      icon: '🔧',
      title: 'Home Installation',
      desc: 'Certified DIFM mechanics at doorstep',
    },
    {
      icon: '🔒',
      title: 'Secure Checkout',
      desc: 'Protected payments & cash on delivery',
    },
    {
      icon: '♻️',
      title: 'Used-Part Resale',
      desc: 'Inspected circular parts with buyback',
    },
  ];

  return (
    <div className="testimonials-trust-strip" aria-label="PartNexa Platform Guarantees">
      <div className="testimonials-trust-strip-items">
        {trustFeatures.map((item, index) => (
          <React.Fragment key={item.title}>
            <div className="testimonials-trust-strip-item">
              <div className="testimonials-trust-strip-icon-box" aria-hidden="true">
                {item.icon}
              </div>
              <div className="testimonials-trust-strip-text">
                <span className="testimonials-trust-strip-title">{item.title}</span>
                <span className="testimonials-trust-strip-desc">{item.desc}</span>
              </div>
            </div>
            {index < trustFeatures.length - 1 && (
              <div className="testimonials-trust-strip-divider" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * CustomerTestimonials — Main Customer Feedback Section for PartNexa.
 */
export const CustomerTestimonials = ({ items = INITIAL_TESTIMONIALS }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Responsive cards-per-view calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCards(1);
      } else if (width < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - visibleCards);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  // Touch & Swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 45;
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Step percentage per slide based on visible cards
  const slideOffset = (100 / visibleCards) * currentIndex;

  return (
    <section
      className="section customer-testimonials-section"
      aria-labelledby="customer-feedback-title"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
    >
      {/* Decorative ambient background glows */}
      <div className="testimonials-backdrop-glow" aria-hidden="true" />
      <div className="testimonials-backdrop-glow-secondary" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <div className="testimonials-header-row">
          <div className="testimonials-header-content">
            <div className="testimonials-trust-label">
              <span className="testimonials-trust-label-icon">💬</span>
              <span>CUSTOMER STORIES</span>
            </div>
            <h2 id="customer-feedback-title" className="section-title">
              What Our Customers Say
            </h2>
            <p className="section-subtitle">
              Real experiences from people making vehicle repairs simpler with PartNexa.
            </p>
          </div>

          {/* Previous / Next Controls */}
          {totalItems > visibleCards && (
            <div className="testimonials-controls" role="group" aria-label="Testimonial carousel controls">
              <button
                type="button"
                className="testimonials-nav-btn"
                onClick={handlePrev}
                aria-label="Previous testimonials"
                id="testimonial-prev-btn"
              >
                <svg
                  className="testimonials-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="testimonials-nav-btn"
                onClick={handleNext}
                aria-label="Next testimonials"
                id="testimonial-next-btn"
              >
                <svg
                  className="testimonials-nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div
          className="testimonials-carousel-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonials-track"
            style={{
              transform: `translateX(-${slideOffset}%)`,
            }}
          >
            {items.map((item) => (
              <div key={item.id} className="testimonials-slide">
                <article className="testimonial-card">
                  {/* Top gradient accent line */}
                  <div className="testimonial-card-accent-bar" aria-hidden="true" />

                  {/* Watermark Quote Icon */}
                  <div className="testimonial-watermark-quote" aria-hidden="true">
                    “
                  </div>

                  {/* Top Rating & Verification */}
                  <div className="testimonial-card-top">
                    <StarRating rating={item.rating} />
                    <VerifiedBadge verified={item.verified} isDemo={item.isDemo} />
                  </div>

                  {/* Review Text Body */}
                  <div className="testimonial-card-body">
                    {item.serviceType && (
                      <span className="testimonial-service-tag">{item.serviceType}</span>
                    )}
                    {item.title && <h3 className="testimonial-review-title">{item.title}</h3>}
                    <p className="testimonial-review-text">“{item.review}”</p>
                  </div>

                  {/* Author Meta */}
                  <div className="testimonial-author-row">
                    <div
                      className="testimonial-avatar"
                      style={{ background: item.avatarColor || 'var(--color-primary)' }}
                      aria-hidden="true"
                    >
                      {item.avatarInitials || item.name.charAt(0)}
                    </div>
                    <div className="testimonial-author-meta">
                      <div className="testimonial-author-name">{item.name}</div>
                      <div className="testimonial-author-role">
                        {item.role} {item.location ? `• ${item.location}` : ''}
                      </div>
                      {item.vehicle && (
                        <div className="testimonial-vehicle-badge">
                          <span className="testimonial-vehicle-icon">
                            {item.vehicle.toLowerCase().includes('bike') ||
                            item.vehicle.toLowerCase().includes('enfield')
                              ? '🏍️'
                              : '🚗'}
                          </span>
                          <span>{item.vehicle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots (especially useful on mobile/tablet) */}
        {totalItems > visibleCards && (
          <div
            className="testimonials-pagination-dots"
            role="tablist"
            aria-label="Testimonial slide navigation"
          >
            {[...Array(maxIndex + 1)].map((_, index) => (
              <button
                key={index}
                type="button"
                className={`testimonials-dot ${currentIndex === index ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentIndex === index ? 'true' : 'false'}
              />
            ))}
          </div>
        )}

        {/* Compact Trust Summary Strip */}
        <TrustSummaryStrip />
      </div>
    </section>
  );
};

export default CustomerTestimonials;
