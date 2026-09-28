import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import procurementService from '../../services/procurementService';
import ProcurementCartDrawer from '../../components/admin/procurement/ProcurementCartDrawer';

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sup, cart] = await Promise.all([
          procurementService.getSupplierById(id),
          procurementService.getCart(),
        ]);
        setSupplier(sup);
        setCartData(cart);

        const qMap = {};
        sup?.catalogItems?.forEach((item) => {
          qMap[item.id] = item.moq || 10;
        });
        setQuantities(qMap);
      } catch (err) {
        toast.error('Failed to load supplier details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async (item) => {
    const qty = quantities[item.id] || item.moq || 10;
    if (qty < (item.moq || 1)) {
      toast.error(`Minimum Order Quantity (MOQ) for this part is ${item.moq}`);
      return;
    }

    try {
      const updated = await procurementService.addToCart(item.id, qty);
      setCartData(updated);
      toast.success(`Added ${qty} units of ${item.partName} to procurement cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Supplier Profile & Catalog...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Supplier Not Found</h3>
        <button
          onClick={() => navigate('/admin/procurement')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--admin-blue)',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          Back to Procurement
        </button>
      </div>
    );
  }

  const initials = supplier.name.slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/procurement')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--admin-blue)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginBottom: '1rem',
        }}
      >
        ← Back to Bulk Procurement Hub
      </button>

      {/* Supplier Profile Header Card (Section 6) */}
      <div
        className="admin-card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {supplier.logoUrl ? (
              <img
                src={supplier.logoUrl}
                alt={supplier.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  backgroundColor: '#FFFFFF',
                  padding: '6px',
                  border: '1px solid var(--border-color)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                  {supplier.name}
                </h1>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-success-bg)',
                    color: 'var(--color-success)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  ✓ {supplier.verificationStatus || 'VERIFIED'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
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

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                📍 {supplier.address || 'Industrial Hub'}, {supplier.city}, {supplier.state} • Type: <strong>{supplier.supplierType}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--admin-blue)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            🛒 View Cart ({cartData?.itemCount || 0})
          </button>
        </div>

        {/* Contact & Meta Badges */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            fontSize: '0.82rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)' }}>CONTACT PERSON</div>
            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>{supplier.contactPerson}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{supplier.email}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{supplier.phone}</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>SUPPORTED VEHICLES</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
              {supplier.supportedVehicles?.map((v, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>SUPPLIED CATEGORIES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
              {supplier.categories?.map((c, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary-bg)',
                    color: 'var(--admin-blue)',
                    fontWeight: 600,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>FULFILLMENT METRICS</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-success)', marginTop: '0.15rem' }}>
              98.4% On-Time Delivery
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {supplier.stats?.totalPurchaseOrders || 0} lifetime POs completed
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Catalog Table (Section 7) */}
      <div className="admin-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Supplier Parts Catalog ({supplier.catalogItems?.length || 0} parts)
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Direct procurement catalog with tiered bulk pricing and vehicle fitment verification
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>PART DETAILS</th>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>COMPATIBLE VEHICLE</th>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>REGULAR PRICE</th>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>BULK TIER PRICE</th>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>MOQ & STOCK</th>
                <th style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {supplier.catalogItems?.map((item) => {
                const regularPrice = Number(item.unitPrice);
                const bulkPrice = Number(item.bulkPrice);
                const currentQty = quantities[item.id] || item.moq || 10;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.partName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Part No: <strong>{item.partNumber}</strong> • Brand: <strong>{item.brandName}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-blue)', marginTop: '0.15rem' }}>
                        Category: {item.categoryName} • Warranty: {item.warranty}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.vehicleMakeName} {item.vehicleModelName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.variantName || 'All Variants'} ({item.year || '2023'})
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      ₹{regularPrice.toLocaleString()}
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1rem' }}>
                        ₹{bulkPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Tier discount applied
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div>MOQ: <strong>{item.moq}</strong> units</div>
                      <div style={{ fontSize: '0.72rem', color: item.stockQuantity > 50 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {item.stockQuantity} in stock • Dispatch in {item.leadTime || '3-5 days'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min={item.moq || 1}
                          value={currentQty}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [item.id]: Math.max(item.moq || 1, Number(e.target.value)),
                            })
                          }
                          style={{
                            width: '60px',
                            textAlign: 'center',
                            padding: '0.35rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          onClick={() => handleAddToCart(item)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            backgroundColor: 'var(--admin-blue)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProcurementCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartData={cartData}
        onCartUpdated={(u) => setCartData(u)}
        onPoCreated={() => {
          navigate('/admin/procurement');
        }}
      />
    </div>
  );
}
