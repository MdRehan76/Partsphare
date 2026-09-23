import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogService } from '../../services';
import { useVehicles } from '../../contexts/VehicleContext';
import ProductCard, { ProductCardSkeleton } from '../../components/product/ProductCard';
import VehicleCompatibilityBar from '../../components/product/VehicleCompatibilityBar';
import './ProductsPage.css';

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'GENUINE_NEW', label: '100% Genuine OEM' },
  { value: 'REFURBISHED', label: 'Certified Refurbished' },
  { value: 'USED_VERIFIED', label: 'Used & Verified' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated ★' },
  { value: 'name-asc', label: 'Name A–Z' },
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('partnexa_view_mode') || 'grid');

  const handleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('partnexa_view_mode', mode);
  };

  // Filter state synced with URL searchParams
  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const brandSlug = searchParams.get('brand') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const vehicleVariantId = searchParams.get('vehicleVariantId') || '';
  const compatibleOnly = searchParams.get('compatibleOnly') === 'true';
  const sortParam = searchParams.get('sort') || 'createdAt-desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [sortBy, sortOrder] = sortParam.split('-');

  // Local state for search and price inputs to prevent rapid URL churn
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setMinPriceInput(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceInput(maxPrice);
  }, [maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      next.set(key, String(value));
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePriceApply = () => {
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');
    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(categorySlug && { categorySlug }),
        ...(brandSlug && { brand: brandSlug }),
        ...(condition && { condition }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(vehicleVariantId && { vehicleVariantId }),
        ...(compatibleOnly && { compatibleOnly: 'true' }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      };

      const { data } = await catalogService.listProducts(params);
      setProducts(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, categorySlug, brandSlug, condition, minPrice, maxPrice, vehicleVariantId, compatibleOnly, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load categories and brands for sidebar
  useEffect(() => {
    catalogService
      .getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});

    catalogService
      .getBrands()
      .then(({ data }) => setBrands(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = search
      ? `"${search}" — Parts Search | PartNexa`
      : 'Browse Vehicle Spare Parts | PartNexa';
  }, [search]);

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = Boolean(
    search || condition || vehicleVariantId || categorySlug || brandSlug || minPrice || maxPrice || compatibleOnly
  );

  return (
    <div className="products-page">
      <div className="container products-layout">
        {/* SIDEBAR FILTERS */}
        <aside className={`products-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Filters</h3>
            {hasFilters && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                id="clear-filters-btn"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Filter Widget */}
          <div className="filter-group">
            <h4 className="filter-label">Search Keyword</h4>
            <form onSubmit={handleSearchSubmit} className="search-sidebar-form">
              <input
                type="text"
                className="form-input"
                placeholder="Part name, #, or brand..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="sidebar-search-input"
              />
              <button type="submit" className="btn btn-primary btn-sm search-submit-btn" id="sidebar-search-btn">
                🔍
              </button>
            </form>
          </div>

          {/* Condition Filter */}
          <div className="filter-group">
            <h4 className="filter-label">Part Condition</h4>
            <div className="filter-options">
              {CONDITIONS.map((c) => (
                <label key={c.value} className="filter-option">
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={condition === c.value}
                    onChange={() => updateParam('condition', c.value)}
                    id={`filter-condition-${c.value || 'all'}`}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="filter-group">
              <h4 className="filter-label">Category</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!categorySlug}
                    onChange={() => updateParam('categorySlug', '')}
                    id="filter-category-all"
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={categorySlug === cat.slug}
                      onChange={() => updateParam('categorySlug', cat.slug)}
                      id={`filter-category-${cat.slug}`}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className="filter-group">
              <h4 className="filter-label">Brand / Manufacturer</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value=""
                    checked={!brandSlug}
                    onChange={() => updateParam('brand', '')}
                    id="filter-brand-all"
                  />
                  <span>All Brands</span>
                </label>
                {brands.map((b) => (
                  <label key={b.id} className="filter-option">
                    <input
                      type="radio"
                      name="brand"
                      value={b.slug}
                      checked={brandSlug === b.slug}
                      onChange={() => updateParam('brand', b.slug)}
                      id={`filter-brand-${b.slug}`}
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-label">Price Range (₹)</h4>
            <div className="price-range">
              <input
                type="number"
                className="form-input price-input"
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                id="filter-min-price"
              />
              <span className="price-range-sep">to</span>
              <input
                type="number"
                className="form-input price-input"
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                id="filter-max-price"
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2 w-full"
              onClick={handlePriceApply}
              id="apply-price-btn"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* MAIN CATALOG DISPLAY */}
        <div className="products-main">
          {/* VEHICLE COMPATIBILITY BAR */}
          <VehicleCompatibilityBar
            selectedVariantId={vehicleVariantId}
            compatibleOnly={compatibleOnly}
            onVariantChange={(varId) => updateParam('vehicleVariantId', varId)}
            onCompatibleOnlyChange={(only) => updateParam('compatibleOnly', only ? 'true' : '')}
          />

          {/* TOOLBAR */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button
                className="btn btn-secondary btn-sm filter-toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                id="sidebar-toggle-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: 16, height: 16 }}
                >
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
                Filters
              </button>

              {meta && (
                <span className="results-count">
                  <strong>{meta.total.toLocaleString('en-IN')}</strong> part{meta.total !== 1 ? 's' : ''} found
                  {search && (
                    <> for <strong>"{search}"</strong></>
                  )}
                </span>
              )}
            </div>

            <div className="toolbar-right">
              {/* Grid / List View Toggle */}
              <div className="view-toggle-group" role="group" aria-label="View mode">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewMode('grid')}
                  title="Grid View"
                  aria-pressed={viewMode === 'grid'}
                  id="view-grid-btn"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => handleViewMode('list')}
                  title="List View"
                  aria-pressed={viewMode === 'list'}
                  id="view-list-btn"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              </div>

              <label htmlFor="sort-select" className="sort-label">Sort by:</label>
              <select
                id="sort-select"
                className="form-select sort-select"
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS */}
          {hasFilters && (
            <div className="active-filters">
              {search && (
                <span className="active-filter-tag">
                  Search: {search}
                  <button onClick={() => updateParam('search', '')} aria-label="Remove search filter">
                    ×
                  </button>
                </span>
              )}
              {condition && (
                <span className="active-filter-tag">
                  {CONDITIONS.find((c) => c.value === condition)?.label}
                  <button onClick={() => updateParam('condition', '')} aria-label="Remove condition filter">
                    ×
                  </button>
                </span>
              )}
              {categorySlug && (
                <span className="active-filter-tag">
                  Category: {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                  <button onClick={() => updateParam('categorySlug', '')} aria-label="Remove category filter">
                    ×
                  </button>
                </span>
              )}
              {brandSlug && (
                <span className="active-filter-tag">
                  Brand: {brands.find((b) => b.slug === brandSlug)?.name || brandSlug}
                  <button onClick={() => updateParam('brand', '')} aria-label="Remove brand filter">
                    ×
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="active-filter-tag">
                  Price: ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                  <button
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('minPrice');
                      next.delete('maxPrice');
                      setSearchParams(next);
                    }}
                    aria-label="Remove price filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {vehicleVariantId && (
                <span className="active-filter-tag fitment-active-tag">
                  Vehicle Filter Active
                  <button onClick={() => updateParam('vehicleVariantId', '')} aria-label="Remove vehicle filter">
                    ×
                  </button>
                </span>
              )}
              {compatibleOnly && (
                <span className="active-filter-tag compatible-only-tag">
                  ✓ Verified Fitment Only
                  <button onClick={() => updateParam('compatibleOnly', '')} aria-label="Remove compatible only filter">
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* PRODUCT GRID */}
          {loading ? (
            <div className={viewMode === 'list' ? 'list-products' : 'grid-products'}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty card">
              <div className="empty-icon">🔍</div>
              <h3>No matching parts found</h3>
              <p>
                No spare parts match your current search and vehicle compatibility filters.
              </p>
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={clearFilters} id="empty-clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'list' ? 'list-products' : 'grid-products'}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {meta && meta.totalPages > 1 && (
            <div className="pagination" id="products-pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!meta.hasPrev}
                onClick={() => handlePageChange(page - 1)}
                id="prev-page-btn"
              >
                ← Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${pageNum === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      id={`page-btn-${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!meta.hasNext}
                onClick={() => handlePageChange(page + 1)}
                id="next-page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
