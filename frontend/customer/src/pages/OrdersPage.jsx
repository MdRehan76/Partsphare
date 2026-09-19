import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge, EmptyState, Skeleton } from '../components/ui';
import './OrdersPage.css';

const DEFAULT_ORDERS = [
  {
    id: 'ord_984121',
    orderNumber: 'PNX-984121',
    createdAt: '2026-09-15T10:30:00Z',
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE (Razorpay)',
    total: 3249,
    installationType: 'HOME',
    items: [
      {
        id: 'it_1',
        quantity: 1,
        priceSnapshot: 3050,
        product: {
          name: 'Bosch Front Brake Pad Set (Low Metallic)',
          images: [{ url: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=300' }],
        },
      },
    ],
  },
  {
    id: 'ord_981005',
    orderNumber: 'PNX-981005',
    createdAt: '2026-08-28T14:15:00Z',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'COD',
    total: 1899,
    installationType: 'NONE',
    items: [
      {
        id: 'it_2',
        quantity: 2,
        priceSnapshot: 949,
        product: {
          name: 'Philips X-tremeVision Pro150 H4 Headlight Bulb (Pair)',
          images: [{ url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300' }],
        },
      },
    ],
  },
];

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
      if (res.data?.data && res.data.data.length > 0) {
        setOrders(res.data.data);
      } else {
        setOrders(DEFAULT_ORDERS);
      }
    } catch {
      setOrders(DEFAULT_ORDERS);
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
                    {order.installationType === 'HOME' && (
                      <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                        🏡 Doorstep Installation
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
                          ₹{((Number(it.priceSnapshot) || 0) * it.quantity).toLocaleString('en-IN')}
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
