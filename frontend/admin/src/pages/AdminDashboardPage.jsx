import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import {
  MonthlySalesChart,
  RegionalPerformanceChart,
  RevenueBreakdownChart,
  OrderStatusDistributionChart,
} from '../components/charts/InteractiveCharts';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [kpiData, setKpiData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpis, charts] = await Promise.all([
          adminService.getKPIs(),
          adminService.getCharts(),
        ]);
        setKpiData(kpis);
        setChartsData(charts);
      } catch (err) {
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading executive dashboard & analytics...
      </div>
    );
  }

  const { kpis, counts } = kpiData || {};

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Executive Operations & Governance
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Real-time metrics across circular parts catalog, mechanical workshops, and last-mile delivery fleet.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        {/* Monthly Sales */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
            📈
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Monthly Sales</div>
            <div className="kpi-value">₹{(kpis?.monthlySales || 0).toLocaleString('en-IN')}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-success)' }}>
              <span>↑ 18.4%</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* GMV */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--color-purple-bg)', color: 'var(--color-purple)' }}>
            💰
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Gross Merchandise Value</div>
            <div className="kpi-value">₹{(kpis?.gmv || 0).toLocaleString('en-IN')}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-purple)' }}>
              <span>Cumulative Marketplace Vol.</span>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            ⚡
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Platform Net Revenue</div>
            <div className="kpi-value">₹{(kpis?.platformRevenue || 0).toLocaleString('en-IN')}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-success)' }}>
              <span>Margins + Subscriptions + Cuts</span>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            📦
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Active In-Flight Orders</div>
            <div className="kpi-value">{kpis?.activeOrders || 0}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-info)' }}>
              <span>Processing / Transit / Out</span>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            ⭐
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Club Subscriptions</div>
            <div className="kpi-value">{kpis?.activeSubscriptions || 0}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-warning)' }}>
              <span>Active club recurring tiers</span>
            </div>
          </div>
        </div>

        {/* Used-Part Transactions */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            🔄
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Used-Part Listings</div>
            <div className="kpi-value">{kpis?.usedPartTransactions || 0}</div>
            <div className="kpi-trend" style={{ color: 'var(--color-success)' }}>
              <span>{kpis?.verifiedUsedParts || 0} inspected & verified</span>
            </div>
          </div>
        </div>

        {/* Shop Commissions */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            🔧
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Shop Commissions Cut</div>
            <div className="kpi-value">₹{(kpis?.shopCommissions || 0).toLocaleString('en-IN')}</div>
            <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
              <span>₹{(kpis?.releasedShopPayouts || 0).toLocaleString('en-IN')} released</span>
            </div>
          </div>
        </div>

        {/* Delivery Activity */}
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            🛵
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Fleet & Cash in Hand</div>
            <div className="kpi-value">{kpis?.deliveryActivity?.onlinePartners || 0} / {kpis?.deliveryActivity?.totalPartners || 0} Online</div>
            <div className="kpi-trend" style={{ color: 'var(--color-warning)' }}>
              <span>₹{(kpis?.deliveryActivity?.totalCashInHand || 0).toLocaleString('en-IN')} COD Cash Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Monthly Sales Trend */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Monthly Sales & GMV Trajectory
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                6-Month historical billing cycle performance
              </p>
            </div>
            <span className="badge badge-success">Growth: +18.4%</span>
          </div>
          <MonthlySalesChart data={chartsData?.monthlySales} />
        </div>

        {/* Chart 2: Regional & City Performance */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Regional Hub Performance
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Orders volume, revenue, and active workshop presence by metro city
              </p>
            </div>
            <span className="badge badge-info">5 Metro Hubs</span>
          </div>
          <RegionalPerformanceChart data={chartsData?.regionalPerformance} />
        </div>

        {/* Chart 3: Revenue Breakdown */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Platform Revenue Sources
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Diversified circular margin breakdown
              </p>
            </div>
            <span className="badge badge-purple">4 Revenue Streams</span>
          </div>
          <RevenueBreakdownChart data={chartsData?.revenueBreakdown} />
        </div>

        {/* Chart 4: Order Status Distribution */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Fulfillment Order Distribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Real-time delivery fulfillment pipeline states
              </p>
            </div>
            <span className="badge badge-primary">209 Total Orders</span>
          </div>
          <OrderStatusDistributionChart data={chartsData?.orderStatusDistribution} />
        </div>
      </div>
    </div>
  );
}
