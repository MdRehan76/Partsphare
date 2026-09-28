import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import procurementService from '../../services/procurementService';
import ProcurementCartDrawer from '../../components/admin/procurement/ProcurementCartDrawer';
import ReceiveStockModal from '../../components/admin/procurement/ReceiveStockModal';
import SupplierComparisonModal from '../../components/admin/procurement/SupplierComparisonModal';
import AddSupplierModal from '../../components/admin/procurement/AddSupplierModal';
import AddCatalogItemModal from '../../components/admin/procurement/AddCatalogItemModal';

export default function ProcurementDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | suppliers | catalog | pos | history
  const [loading, setLoading] = useState(true);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);

  // Catalog Filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState('part_name');

  // Supplier Filter
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('ALL');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [receiveModalPo, setReceiveModalPo] = useState(null);
  const [compareModalItem, setCompareModalItem] = useState(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);

  // Quantity inputs state per catalog item
  const [itemQuantities, setItemQuantities] = useState({});

  // Initial Load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [stats, sups, cat, pos, cart, vList, cList] = await Promise.all([
        procurementService.getDashboard(),
        procurementService.listSuppliers(),
        procurementService.searchCatalog(),
        procurementService.listPurchaseOrders(),
        procurementService.getCart(),
        procurementService.getVehicles(),
        procurementService.getCategories(),
      ]);

      setDashboardStats(stats);
      setSuppliers(sups || []);
      setCatalogItems(cat || []);
      setPurchaseOrders(pos || []);
      setCartData(cart);
      setVehicles(vList || []);
      setCategories(cList || []);

      // Default quantities to item MOQ
      const qMap = {};
      cat?.forEach((it) => {
        qMap[it.id] = it.moq || 10;
      });
      setItemQuantities(qMap);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Bulk Procurement data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch History on tab switch
  useEffect(() => {
    if (activeTab === 'history' && !historyData) {
      procurementService
        .getHistory()
        .then((data) => setHistoryData(data))
        .catch(() => toast.error('Failed to load procurement history.'));
    }
  }, [activeTab, historyData]);

  // Derived filtered models based on selected make
  const availableModels = useMemo(() => {
    if (selectedMake === 'ALL') return [];
    const makeObj = vehicles.find((v) => v.name === selectedMake);
    return makeObj?.models || [];
  }, [selectedMake, vehicles]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      if (selectedMake !== 'ALL' && item.vehicleMakeName !== selectedMake) return false;
      if (selectedModel !== 'ALL' && item.vehicleModelName !== selectedModel) return false;
      if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) return false;
      if (selectedSupplier !== 'ALL' && item.supplierId !== selectedSupplier) return false;
      if (selectedBrand !== 'ALL' && item.brandName !== selectedBrand) return false;

      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const match =
          item.partName.toLowerCase().includes(q) ||
          item.partNumber.toLowerCase().includes(q) ||
          item.brandName.toLowerCase().includes(q) ||
          item.vehicleMakeName.toLowerCase().includes(q) ||
          item.vehicleModelName.toLowerCase().includes(q) ||
          item.supplier?.name.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [catalogItems, selectedMake, selectedModel, selectedCategory, selectedSupplier, selectedBrand, catalogSearch]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (supplierTypeFilter !== 'ALL' && s.supplierType !== supplierTypeFilter) return false;
      if (supplierSearch.trim()) {
        const q = supplierSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          (s.city && s.city.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [suppliers, supplierTypeFilter, supplierSearch]);

  // Handle Add to Cart
  const handleAddToCart = async (catalogItem) => {
    const qty = itemQuantities[catalogItem.id] || catalogItem.moq || 10;
    if (qty < (catalogItem.moq || 1)) {
      toast.error(`Minimum Order Quantity (MOQ) for this part is ${catalogItem.moq}`);
      return;
    }

    try {
      const updated = await procurementService.addToCart(catalogItem.id, qty);
      setCartData(updated);
      toast.success(`Added ${qty} units of ${catalogItem.partName} to procurement cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  // 1-Click Procure from Low-Stock
  const handleQuickProcure = (alert) => {
    if (alert.suggestedCatalogItemId) {
      const found = catalogItems.find((c) => c.id === alert.suggestedCatalogItemId);
      if (found) {
        setCompareModalItem(found);
        return;
      }
    }
    // Switch to catalog and filter by part name
    setCatalogSearch(alert.productName.slice(0, 10));
    setActiveTab('catalog');
  };

  // Open Supplier Comparison
  const handleOpenComparison = async (item) => {
    try {
      const fullDetail = await procurementService.getCatalogItemById(item.id);
      setCompareModalItem(fullDetail);
    } catch {
      setCompareModalItem(item);
    }
  };

  // Helper for Supplier Initial Fallback Logo
  const renderSupplierLogo = (supplier) => {
    if (supplier.logoUrl) {
      return (
        <img
          src={supplier.logoUrl}
          alt={supplier.name}
          style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain', backgroundColor: '#FFFFFF', padding: '4px', border: '1px solid var(--border-color)' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    const initials = supplier.name.slice(0, 2).toUpperCase();
    return (
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284C7, #0D9488)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1rem',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  };

  // Helper for Status Badge Color
  const getStatusBadge = (status) => {
    const config = {
      DRAFT: { label: 'Draft', bg: 'rgba(148, 163, 184, 0.15)', text: 'var(--text-muted)' },
      SUBMITTED: { label: 'Submitted', bg: 'rgba(37, 99, 235, 0.15)', text: 'var(--admin-blue)' },
      SUPPLIER_CONFIRMED: { label: 'Confirmed', bg: 'rgba(6, 182, 212, 0.15)', text: 'var(--color-info)' },
      PROCESSING: { label: 'Processing', bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--color-warning)' },
      SHIPPED: { label: 'Shipped', bg: 'rgba(139, 92, 246, 0.15)', text: 'var(--color-purple)' },
      IN_TRANSIT: { label: 'In Transit', bg: 'rgba(56, 189, 248, 0.2)', text: '#0284C7' },
      PARTIALLY_RECEIVED: { label: 'Partially Received', bg: 'rgba(245, 158, 11, 0.2)', text: '#D97706' },
      RECEIVED: { label: 'Received', bg: 'rgba(16, 185, 129, 0.18)', text: 'var(--color-success)' },
      COMPLETED: { label: 'Completed', bg: 'rgba(16, 185, 129, 0.25)', text: 'var(--color-success)' },
      CANCELLED: { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-danger)' },
    };
    const c = config[status] || { label: status, bg: 'var(--bg-tertiary)', text: 'var(--text-primary)' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.72rem',
          fontWeight: 700,
          backgroundColor: c.bg,
          color: c.text,
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.text }} />
        {c.label}
      </span>
    );
  };

  if (loading && !dashboardStats) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Bulk Procurement Hub & Live PostgreSQL Inventory...
      </div>
    );
  }

  const cartCount = cartData?.itemCount || 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '2rem' }}>🏭</span>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Bulk Procurement & Inbound Supply Hub
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Purchase spare parts directly from OEMs, manufacturers & certified distributors with automated shared inventory synchronization.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>🏢</span> Register Supplier
          </button>

          <button
            onClick={() => setIsAddCatalogOpen(true)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>➕</span> Add Catalog Part
          </button>

          {/* Cart Button with Live Counter Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--admin-blue)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              position: 'relative',
            }}
          >
            <span>🛒</span>
            <span>Procurement Cart</span>
            {cartCount > 0 && (
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--admin-blue)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards (Section 2 - 7 PostgreSQL-driven metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #0284C7' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Suppliers
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {dashboardStats?.totalSuppliers || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
            {dashboardStats?.activeSuppliers || 0} Active
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Pending POs
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {dashboardStats?.pendingPurchaseOrders || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Awaiting Shipment
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            In Transit
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {dashboardStats?.ordersInTransit || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Inbound Fleet
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Received This Month
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
            {dashboardStats?.receivedThisMonth || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Stock Verified
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Procurement Spend
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            ₹{(dashboardStats?.totalProcurementSpend || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            All Active POs
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid #0D9488' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Units Purchased
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {(dashboardStats?.unitsPurchased || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Stock Added to Hub
          </div>
        </div>
      </div>

      {/* Low-Stock Procurement Trigger Banner (Section 31) */}
      {dashboardStats?.lowStockAlerts?.length > 0 && (
        <div
          style={{
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--color-danger, #EF4444)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Low Stock Critical Alerts ({dashboardStats.lowStockAlerts.length} parts below reorder threshold)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1-Click B2B Replenishment
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.65rem',
            }}
          >
            {dashboardStats.lowStockAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.inventoryId}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{alert.productName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-danger, #EF4444)', marginTop: '0.15rem' }}>
                    Stock: <strong>{alert.currentStock}</strong> / Reorder at {alert.reorderThreshold}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Supplier: {alert.suggestedSupplier}
                  </div>
                </div>
                <button
                  onClick={() => handleQuickProcure(alert)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'var(--admin-blue)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚡ Procure in Bulk
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.2rem',
        }}
      >
        {[
          { id: 'overview', label: '📊 Overview & Active POs' },
          { id: 'suppliers', label: `🏢 Supplier Directory (${suppliers.length})` },
          { id: 'catalog', label: `📦 Spare Parts Catalog (${catalogItems.length})` },
          { id: 'pos', label: `📑 Purchase Orders (${purchaseOrders.length})` },
          { id: 'history', label: '📜 Procurement History & Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--admin-blue)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid var(--admin-blue)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & ACTIVE PURCHASE ORDERS                     */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Quick Supplier Catalog Snapshot */}
            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Top Supplier Partners
                </h3>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-blue)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  View All Directory →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suppliers.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {renderSupplierLogo(s)}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {s.supplierType} • {s.city || 'India'}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-bg)',
                        color: 'var(--admin-blue)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Demo Supplier
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound Workflow Lifecycle Tracker */}
            <div className="admin-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.85rem' }}>
                Inbound Procurement Lifecycle Flow
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Standard workflow connecting purchase order authorization with shared PostgreSQL inventory.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--admin-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>1</span>
                  <span><strong>Select Part & Vehicle:</strong> Separate spare-part brand from vehicle manufacturer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--admin-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>2</span>
                  <span><strong>Apply Bulk Tier Discount:</strong> Authoritatively computed on the backend</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--admin-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>3</span>
                  <span><strong>Authorize Purchase Order:</strong> Generate unique PO-PNX-2026-XXXX reference</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-success)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>4</span>
                  <span><strong>Receive Inbound Stock:</strong> Full or partial delivery with audit logging</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>5</span>
                  <span><strong>Live Cross-Portal Sync:</strong> Customer & Workshop inventory increment immediately</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Inbound Purchase Orders Table */}
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Active Inbound Purchase Orders
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Tracking shipments and receiving stock directly into warehouse inventory
                </div>
              </div>
              <button
                onClick={() => setActiveTab('pos')}
                style={{ background: 'none', border: 'none', color: 'var(--admin-blue)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                View All POs ({purchaseOrders.length}) →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PO NUMBER</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUPPLIER</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PARTS & UNITS</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL SPEND</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIFECYCLE STATUS</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.slice(0, 6).map((po) => {
                    const totalOrdered = po.items?.reduce((sum, it) => sum + it.orderedQuantity, 0) || 0;
                    const totalReceived = po.items?.reduce((sum, it) => sum + it.receivedQuantity, 0) || 0;
                    const canReceive = !['COMPLETED', 'RECEIVED', 'CANCELLED'].includes(po.status);

                    return (
                      <tr key={po.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.9rem 0.75rem', fontWeight: 700, fontSize: '0.88rem' }}>
                          <span style={{ color: 'var(--admin-blue)' }}>{po.poNumber}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {new Date(po.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 0.75rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{po.supplier?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{po.supplier?.city || 'India'}</div>
                        </td>
                        <td style={{ padding: '0.9rem 0.75rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {po.items?.length || 0} line item(s)
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Received: <strong>{totalReceived}</strong> / {totalOrdered} units
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 0.75rem', fontWeight: 800, fontSize: '0.92rem' }}>
                          ₹{Number(po.totalCost).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.9rem 0.75rem' }}>
                          {getStatusBadge(po.status)}
                        </td>
                        <td style={{ padding: '0.9rem 0.75rem', textAlign: 'right' }}>
                          {canReceive ? (
                            <button
                              onClick={() => setReceiveModalPo(po)}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--color-success)',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              📥 Receive Stock
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Stock Intake Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SUPPLIER DIRECTORY                                    */}
      {/* ============================================================ */}
      {activeTab === 'suppliers' && (
        <div>
          {/* Supplier Filters */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search suppliers by name, city, contact person..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={supplierTypeFilter}
                onChange={(e) => setSupplierTypeFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <option value="ALL">All Supplier Types</option>
                <option value="MANUFACTURER">Manufacturers</option>
                <option value="OEM">OEM Factory</option>
                <option value="OEM_SUPPLIER">OEM Supplier</option>
                <option value="DISTRIBUTOR">Distributors</option>
              </select>
            </div>
          </div>

          {/* Supplier Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="admin-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {renderSupplierLogo(supplier)}
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                          {supplier.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {supplier.city ? `${supplier.city}, ${supplier.state}` : 'National Warehouse Hub'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-bg)',
                        color: 'var(--admin-blue)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {supplier.supplierType}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-success-bg)',
                        color: 'var(--color-success)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      ✓ Verified Catalog
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      Demo Supplier
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <div>👤 Contact: <strong>{supplier.contactPerson}</strong></div>
                    <div>📞 Phone: {supplier.phone}</div>
                    <div>✉️ Email: {supplier.email}</div>
                    {supplier.gstNumber && <div>🏛️ GSTIN: <code>{supplier.gstNumber}</code></div>}
                  </div>

                  {/* Categories Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                    {supplier.categories?.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Catalog: <strong>{supplier._count?.catalogItems || 0}</strong> parts
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier.id);
                      setActiveTab('catalog');
                    }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--admin-blue)',
                      backgroundColor: 'transparent',
                      color: 'var(--admin-blue)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    View Catalog →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SPARE PARTS CATALOG & VEHICLE COMPATIBILITY           */}
      {/* ============================================================ */}
      {activeTab === 'catalog' && (
        <div>
          {/* Advanced Multi-Tier Fitment & Vehicle Filter Bar (Section 9 & 10) */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              🚗 Vehicle Fitment & Compatibility Engine (Database-Driven)
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              {/* Vehicle Manufacturer */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  VEHICLE MANUFACTURER
                </label>
                <select
                  value={selectedMake}
                  onChange={(e) => {
                    setSelectedMake(e.target.value);
                    setSelectedModel('ALL');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Manufacturers</option>
                  <option value="Tata">Tata Motors</option>
                  <option value="Maruti Suzuki">Maruti Suzuki</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Honda 2-Wheelers">Honda 2-Wheelers</option>
                </select>
              </div>

              {/* Vehicle Model */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  VEHICLE MODEL
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={selectedMake === 'ALL'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: selectedMake === 'ALL' ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">{selectedMake === 'ALL' ? 'Select Make first' : 'All Models'}</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                  {/* Fallback models */}
                  {selectedMake === 'Tata' && <option value="Nexon">Nexon</option>}
                  {selectedMake === 'Maruti Suzuki' && <option value="Swift">Swift</option>}
                  {selectedMake === 'Hyundai' && <option value="Creta">Creta</option>}
                  {selectedMake === 'Honda 2-Wheelers' && <option value="Activa 6G">Activa 6G</option>}
                </select>
              </div>

              {/* Part Category */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  PART CATEGORY
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Spare-Part Brand */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  SPARE-PART BRAND
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Brands</option>
                  <option value="Bosch">Bosch</option>
                  <option value="Exide">Exide</option>
                  <option value="Brembo">Brembo</option>
                  <option value="Uno Minda">Uno Minda</option>
                  <option value="Lumax">Lumax</option>
                  <option value="Amaron">Amaron</option>
                  <option value="Castrol">Castrol</option>
                  <option value="ZF">ZF</option>
                  <option value="Valeo">Valeo</option>
                  <option value="Denso">Denso</option>
                  <option value="Tata Motors Genuine">Tata Motors Genuine</option>
                  <option value="Maruti Suzuki Genuine">Maruti Suzuki Genuine</option>
                </select>
              </div>

              {/* Supplier Filter */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  SUPPLIER
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Suppliers</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Search & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search part name, part number (e.g. BP-TN-204), brand, or vehicle..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />

              {(selectedMake !== 'ALL' ||
                selectedModel !== 'ALL' ||
                selectedCategory !== 'ALL' ||
                selectedSupplier !== 'ALL' ||
                selectedBrand !== 'ALL' ||
                catalogSearch) && (
                <button
                  onClick={() => {
                    setSelectedMake('ALL');
                    setSelectedModel('ALL');
                    setSelectedCategory('ALL');
                    setSelectedSupplier('ALL');
                    setSelectedBrand('ALL');
                    setCatalogSearch('');
                  }}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Showing <strong>{filteredCatalog.length}</strong> catalog items</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Brand & Vehicle relationships strictly separated
            </span>
          </div>

          {/* Catalog Item Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredCatalog.map((item) => {
              const regularPrice = Number(item.unitPrice);
              const bulkPrice = Number(item.bulkPrice);
              const unitSavings = Math.max(0, regularPrice - bulkPrice);
              const savingsPct = Math.round((unitSavings / regularPrice) * 100);
              const currentQty = itemQuantities[item.id] || item.moq || 10;

              return (
                <div
                  key={item.id}
                  className="admin-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    {/* Top Row: Brand & Category Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(2, 132, 199, 0.12)',
                          color: '#0284C7',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {item.brandName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Part Name & OEM Part Number */}
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      {item.partName}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                      Part No: <strong style={{ color: 'var(--text-primary)' }}>{item.partNumber}</strong> • Condition: {item.condition}
                    </div>

                    {/* Compatible Vehicle Display (Section 28) */}
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      🚗 Compatible with: <strong style={{ color: 'var(--text-primary)' }}>{item.vehicleMakeName} {item.vehicleModelName}</strong> ({item.variantName || 'All Variants'})
                    </div>

                    {/* Pricing Tiers Preview */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BULK PRICE</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-success)' }}>
                          ₹{bulkPrice.toLocaleString()}
                          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}> / unit</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{regularPrice.toLocaleString()} regular
                        </div>
                        {unitSavings > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700 }}>
                            Save {savingsPct}% in Bulk
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.4rem',
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <div>MOQ</div>
                        <strong>{item.moq} units</strong>
                      </div>
                      <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <div>DISPATCH</div>
                        <strong>{item.leadTime || `${item.leadTimeDays} days`}</strong>
                      </div>
                      <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <div>STOCK</div>
                        <strong style={{ color: item.stockQuantity > 50 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {item.stockQuantity}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls & Stepper */}
                  <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty:</span>
                        <input
                          type="number"
                          min={item.moq || 1}
                          value={currentQty}
                          onChange={(e) =>
                            setItemQuantities({
                              ...itemQuantities,
                              [item.id]: Math.max(item.moq || 1, Number(e.target.value)),
                            })
                          }
                          style={{
                            width: '65px',
                            textAlign: 'center',
                            padding: '0.35rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleOpenComparison(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--admin-blue)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        ⚖️ Compare Suppliers
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: 'var(--admin-blue)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      🛒 Add to Procurement Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PURCHASE ORDERS & GOODS RECEIVING                     */}
      {/* ============================================================ */}
      {activeTab === 'pos' && (
        <div>
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Purchase Order Management & Tracking
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Track supplier fulfillment lifecycle, verify carrier dispatch, and process stock intake into PostgreSQL
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {purchaseOrders.map((po) => {
                const totalOrdered = po.items?.reduce((sum, it) => sum + it.orderedQuantity, 0) || 0;
                const totalReceived = po.items?.reduce((sum, it) => sum + it.receivedQuantity, 0) || 0;
                const canReceive = !['COMPLETED', 'RECEIVED', 'CANCELLED'].includes(po.status);

                return (
                  <div
                    key={po.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-blue)' }}>
                          {po.poNumber}
                        </span>
                        {getStatusBadge(po.status)}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Payment: {po.paymentStatus}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Date: <strong>{new Date(po.createdAt).toLocaleDateString()}</strong>
                        </div>
                        {canReceive && (
                          <button
                            onClick={() => setReceiveModalPo(po)}
                            style={{
                              padding: '0.45rem 1rem',
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              backgroundColor: 'var(--color-success)',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                            }}
                          >
                            📥 Receive Stock
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>SUPPLIER</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.15rem' }}>{po.supplier?.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{po.supplier?.email} • {po.supplier?.phone}</div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>LINE ITEMS & INTAKE</div>
                        <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>
                          {po.items?.length || 0} part(s) ({totalOrdered} units)
                        </div>
                        <div style={{ color: totalReceived === totalOrdered ? 'var(--color-success)' : 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {totalReceived} of {totalOrdered} units received
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>FINANCIALS</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                          ₹{Number(po.totalCost).toLocaleString()}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          Subtotal ₹{Number(po.subtotal).toLocaleString()} • GST ₹{Number(po.tax).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>LOGISTICS / REFERENCE</div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: '0.15rem' }}>
                          {po.supplierInvoice ? `Inv: ${po.supplierInvoice}` : 'Internal PO Reference'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {po.expectedDelivery ? `ETA: ${new Date(po.expectedDelivery).toLocaleDateString()}` : 'Standard Dispatch'}
                        </div>
                      </div>
                    </div>

                    {/* Items Sub-table */}
                    <div style={{ overflowX: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)' }}>
                            <th style={{ padding: '0.35rem 0' }}>Part Name</th>
                            <th style={{ padding: '0.35rem 0' }}>Part No</th>
                            <th style={{ padding: '0.35rem 0' }}>Brand</th>
                            <th style={{ padding: '0.35rem 0' }}>Ordered</th>
                            <th style={{ padding: '0.35rem 0' }}>Received</th>
                            <th style={{ padding: '0.35rem 0', textAlign: 'right' }}>Total Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {po.items?.map((it) => (
                            <tr key={it.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                              <td style={{ padding: '0.45rem 0', fontWeight: 600 }}>{it.partName}</td>
                              <td style={{ padding: '0.45rem 0', color: 'var(--text-secondary)' }}>{it.partNumber}</td>
                              <td style={{ padding: '0.45rem 0' }}>{it.brandName}</td>
                              <td style={{ padding: '0.45rem 0' }}>{it.orderedQuantity}</td>
                              <td style={{ padding: '0.45rem 0', fontWeight: 700, color: it.receivedQuantity > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                                {it.receivedQuantity}
                              </td>
                              <td style={{ padding: '0.45rem 0', textAlign: 'right', fontWeight: 700 }}>
                                ₹{Number(it.totalCost).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: PROCUREMENT HISTORY & AUDIT TRAIL                     */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Goods Receipt Note (GRN) Inbound Log */}
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
              Goods Receipt Notes (GRN) Inbound Ledger
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Verified consignments that authoritatively increased PartNexa warehouse and platform inventory.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>RECEIPT NO</th>
                    <th style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>PO REFERENCE</th>
                    <th style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>CARRIER / WAYBILL</th>
                    <th style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>ITEMS RECEIVED</th>
                    <th style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>DATE RECEIVED</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData?.receipts?.map((grn) => (
                    <tr key={grn.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        {grn.receiptNumber}
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 600 }}>
                        {grn.purchaseOrder?.poNumber}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {grn.purchaseOrder?.supplier?.name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem' }}>
                        <div>{grn.carrier || 'Inbound Logistics'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ref: {grn.trackingNumber || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 700 }}>
                        {grn.items?.reduce((sum, it) => sum + it.quantityReceived, 0) || 0} unit(s)
                      </td>
                      <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(grn.receivedDate || grn.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!historyData?.receipts || historyData.receipts.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No goods receipts recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
              Procurement Audit Log (Governance & Traceability)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Permanent audit trail for PO generation, supplier creation, price calculations, and stock receipt.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {historyData?.auditEntries?.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor:
                          log.action === 'PROCUREMENT_STOCK_RECEIVED'
                            ? 'var(--color-success-bg)'
                            : log.action === 'PURCHASE_ORDER_CREATED'
                            ? 'var(--color-primary-bg)'
                            : 'var(--bg-tertiary)',
                        color:
                          log.action === 'PROCUREMENT_STOCK_RECEIVED'
                            ? 'var(--color-success)'
                            : log.action === 'PURCHASE_ORDER_CREATED'
                            ? 'var(--admin-blue)'
                            : 'var(--text-primary)',
                      }}
                    >
                      {log.action}
                    </span>
                    <span>
                      Entity: <strong>{log.entityType}</strong> (ID: {log.entityId?.slice(0, 8)}...)
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS & DRAWERS                                             */}
      {/* ============================================================ */}
      <ProcurementCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartData={cartData}
        onCartUpdated={(updated) => setCartData(updated)}
        onPoCreated={(newPo) => {
          setPurchaseOrders((prev) => [newPo, ...prev]);
          setActiveTab('pos');
          fetchAllData();
        }}
      />

      <ReceiveStockModal
        isOpen={Boolean(receiveModalPo)}
        onClose={() => setReceiveModalPo(null)}
        purchaseOrder={receiveModalPo}
        onStockReceived={() => {
          fetchAllData();
          setActiveTab('pos');
        }}
      />

      <SupplierComparisonModal
        isOpen={Boolean(compareModalItem)}
        onClose={() => setCompareModalItem(null)}
        selectedItem={compareModalItem}
        onSelectSupplierOption={(chosenItem) => {
          handleAddToCart(chosenItem);
        }}
      />

      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSupplierCreated={(newSup) => {
          setSuppliers((prev) => [newSup, ...prev]);
          setActiveTab('suppliers');
        }}
      />

      <AddCatalogItemModal
        isOpen={isAddCatalogOpen}
        onClose={() => setIsAddCatalogOpen(false)}
        suppliers={suppliers}
        onItemAdded={(newItem) => {
          setCatalogItems((prev) => [newItem, ...prev]);
          setActiveTab('catalog');
        }}
      />
    </div>
  );
}
