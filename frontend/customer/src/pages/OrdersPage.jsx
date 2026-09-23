import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge, EmptyState, Skeleton } from '../components/ui';
import './OrdersPage.css';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    document.title = 'My Orders | PartNexa';
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersService.listOrders();
      if (res.data?.data && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="teal">Out for Delivery</Badge>;
      case 'SHIPPED':
      case 'DISPATCHED':
        return <Badge variant="primary">Dispatched</Badge>;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Badge variant="warning">Processing</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') {
      return ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DISPATCHED', 'OUT_FOR_DELIVERY'].includes(
        o.status
      );
    }
    if (activeTab === 'DELIVERED') return o.status === 'DELIVERED';
    if (activeTab === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track orders, request DIFM mechanic, and view invoices</p>
        </div>

        {/* Filter Tabs */}
        <div className="orders-tabs">
          <button
            className={`orders-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            All Orders ({orders.length})
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            Active & Transit
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'DELIVERED' ? 'active' : ''}`}
            onClick={() => setActiveTab('DELIVERED')}
          >
            Completed
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setActiveTab('CANCELLED')}
          >
            Cancelled
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="orders-list">
            <Skeleton height={140} borderRadius={16} />
            <Skeleton height={140} borderRadius={16} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No Orders Found"
            description="You have no past or active orders in this tab. Explore our verified automotive catalog to place your first order."
            actionText="Start Shopping"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card" id={`order-card-${order.id}`}>
                <div className="order-card-header">
                  <div className="order-meta-group">
                    <div className="order-meta-item">
                      Order: <strong>{order.orderNumber || `#${order.id}`}</strong>
                    </div>
                    <div className="order-meta-item">
                      Placed: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                    </div>
                    {order.difmType === 'HOME_INSTALLATION' || order.installationType === 'HOME' ? (
                      <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                        🏡 Doorstep Installation
                      </span>
                    ) : order.difmType === 'SHOP_INSTALLATION' ? (
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        🔧 Workshop Installation
                      </span>
                    ) : (
                      <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                        📦 DIY / Delivery Only
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview-list">
                    {(order.items || []).map((it) => (
                      <div key={it.id} className="order-item-row">
                        <div className="order-item-left">
                          {it.product?.images?.[0]?.url ? (
                            <img
                              src={it.product.images[0].url}
                              alt=""
                              className="order-item-thumb"
                            />
                          ) : (
                            <div className="order-item-thumb">⚙️</div>
                          )}
                          <div>
                            <div className="order-item-name">{it.product?.name || 'Automotive Part'}</div>
                            <div className="text-xs text-muted">Quantity: {it.quantity}</div>
                          </div>
                        </div>
                        <div className="order-item-price">
                          ₹{((Number(it.unitPrice || it.priceSnapshot || 0)) * it.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-total-block">
                    Total Amount:
                    <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm">
                        Track Order & Timeline →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
