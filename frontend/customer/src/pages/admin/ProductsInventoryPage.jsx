import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

export default function ProductsInventoryPage() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'inventory' | 'categories' | 'brands'
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    basePrice: '',
    mrp: '',
    sku: '',
    partNumber: '',
    brand: 'Bosch',
    requiresDIFM: true,
    installationDifficulty: 'MODERATE',
    baseServiceFee: 299,
    stockQuantity: 20,
  });

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '🔧' });

  // Brand Modal
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', country: 'India' });

  // Stock Edit Modal
  const [stockEditItem, setStockEditItem] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'catalog') {
        const data = await adminService.listProducts({ search: search || undefined });
        setProducts(data);
      } else if (activeTab === 'inventory') {
        const data = await adminService.listInventory({ lowStock: lowStockFilter });
        setInventory(data);
      } else if (activeTab === 'categories') {
        const data = await adminService.listCategories();
        setCategories(data);
      } else if (activeTab === 'brands') {
        const data = await adminService.listBrands();
        setBrands(data);
      }
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, lowStockFilter]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return toast.error('Category name is required.');
    try {
      await adminService.createCategory(newCategory);
      toast.success(`Category "${newCategory.name}" created successfully.`);
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '', icon: '🔧' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.name.trim()) return toast.error('Brand name is required.');
    try {
      await adminService.createBrand(newBrand);
      toast.success(`Brand "${newBrand.name}" registered.`);
      setShowBrandModal(false);
      setNewBrand({ name: '', country: 'India' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create brand.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.basePrice) {
      return toast.error('Product title and price are required.');
    }

    try {
      await adminService.createProduct({
        ...newProduct,
        basePrice: Number(newProduct.basePrice),
        mrp: Number(newProduct.mrp || Number(newProduct.basePrice) * 1.25),
        baseServiceFee: Number(newProduct.baseServiceFee),
        stockQuantity: Number(newProduct.stockQuantity),
      });
      toast.success('Product added to catalog and inventory initialized.');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        basePrice: '',
        mrp: '',
        sku: '',
        partNumber: '',
        brand: 'Bosch',
        requiresDIFM: true,
        installationDifficulty: 'MODERATE',
        baseServiceFee: 299,
        stockQuantity: 20,
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to add product.');
    }
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateInventoryStock(stockEditItem.id, {
        quantity: Number(newStockQty),
      });
      toast.success('Inventory stock level updated.');
      setStockEditItem(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update stock.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Products, Categories, Brands & Inventory
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Configure spare part listings, brand partnerships, catalog taxonomy, and warehouse stock.
          </p>
        </div>
        <div>
          {activeTab === 'catalog' && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              + Add New Product
            </button>
          )}
          {activeTab === 'categories' && (
            <button onClick={() => setShowCategoryModal(true)} className="btn btn-primary">
              + Add Category
            </button>
          )}
          {activeTab === 'brands' && (
            <button onClick={() => setShowBrandModal(true)} className="btn btn-primary">
              + Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'catalog' ? 'var(--color-primary-bg)' : 'transparent',
            color: activeTab === 'catalog' ? 'var(--color-primary)' : 'var(--text-secondary)',
            border: activeTab === 'catalog' ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
        >
          Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'categories' ? 'var(--color-primary-bg)' : 'transparent',
            color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--text-secondary)',
            border: activeTab === 'categories' ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'brands' ? 'var(--color-primary-bg)' : 'transparent',
            color: activeTab === 'brands' ? 'var(--color-primary)' : 'var(--text-secondary)',
            border: activeTab === 'brands' ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
        >
          Brands ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'inventory' ? 'var(--color-primary-bg)' : 'transparent',
            color: activeTab === 'inventory' ? 'var(--color-primary)' : 'var(--text-secondary)',
            border: activeTab === 'inventory' ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
        >
          Inventory Stock Levels ({inventory.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {activeTab === 'catalog' ? (
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search product title, part number, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
              />
              Show Low Stock Warnings Only
            </label>
          </div>
        )}
      </div>

      {/* Catalog Table */}
      {activeTab === 'catalog' && (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Part No / SKU</th>
                  <th>Base Price / MRP</th>
                  <th>DIFM Rules</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Loading catalog...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Brand: {p.brand} • Category: {p.category?.name || p.categoryId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.partNumber || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{Number(p.basePrice).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{Number(p.mrp || p.basePrice * 1.2).toLocaleString('en-IN')}</div>
                      </td>
                      <td>
                        {p.requiresDIFM ? (
                          <div>
                            <span className="badge badge-warning">DIFM REQUIRED</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Base Fee: ₹{p.baseServiceFee || 299} ({p.installationDifficulty})
                            </div>
                          </div>
                        ) : (
                          <span className="badge badge-secondary">Optional DIFM</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {p.condition}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Warehouse / Shop Hub</th>
                  <th>Quantity In Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Loading inventory levels...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                          {inv.product?.name || `Product #${inv.productId}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Selling Price: ₹{inv.sellingPrice}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {inv.shop?.name || 'Central Bengaluru Logistics Hub'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.shop?.city || 'Bengaluru'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: inv.quantity <= 5 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {inv.quantity} units
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            inv.quantity === 0
                              ? 'badge-danger'
                              : inv.quantity <= (inv.lowStockThreshold || 5)
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {inv.quantity === 0 ? 'OUT OF STOCK' : inv.quantity <= 5 ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => { setStockEditItem(inv); setNewStockQty(inv.quantity); }}
                          className="btn btn-sm btn-primary"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Icon</th>
                  <th>Slug / Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Loading categories taxonomy...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No categories registered yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {cat.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {cat.description || 'Core automotive replacement category'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.25rem' }}>{cat.icon || '📦'}</span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                          {cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-success">ACTIVE</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brands Table */}
      {activeTab === 'brands' && (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Origin / Country</th>
                  <th>OEM Tier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Loading verified brands...
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {b.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {b.country || 'Global'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">TIER-1 OEM / OES</span>
                      </td>
                      <td>
                        <span className="badge badge-success">VERIFIED</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add New Product Category</h3>
              <button onClick={() => setShowCategoryModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g. Braking Systems"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="e.g. Brake pads, discs, calipers, and hydraulic fluids"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showBrandModal && (
        <div className="modal-overlay" onClick={() => setShowBrandModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Register Verified Brand</h3>
              <button onClick={() => setShowBrandModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateBrand}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Brand Name</label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                    placeholder="e.g. Brembo / Denso"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Country of Origin</label>
                  <input
                    type="text"
                    value={newBrand.country}
                    onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })}
                    placeholder="e.g. Germany / Japan / India"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowBrandModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Register Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add New Product to Catalog</h3>
              <button onClick={() => setShowAddModal(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Product Title</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Brembo Ceramic Front Brake Pads"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Base Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.basePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                      placeholder="1850"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>MRP (₹)</label>
                    <input
                      type="number"
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                      placeholder="2200"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Brand</label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Initial Stock Qty</label>
                    <input
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="requiresDIFM"
                    checked={newProduct.requiresDIFM}
                    onChange={(e) => setNewProduct({ ...newProduct, requiresDIFM: e.target.checked })}
                  />
                  <label htmlFor="requiresDIFM" style={{ fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
                    Requires DIFM Professional Installation
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {stockEditItem && (
        <div className="modal-overlay" onClick={() => setStockEditItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Adjust Inventory Stock
              </h3>
              <button onClick={() => setStockEditItem(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSaveStock}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Update warehouse inventory for <strong>{stockEditItem.product?.name}</strong>.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Available Stock Count (Units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(e.target.value)}
                    style={{ width: '100%', fontSize: '1.2rem', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setStockEditItem(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Stock Level</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
