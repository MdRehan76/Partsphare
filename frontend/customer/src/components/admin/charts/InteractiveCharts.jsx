import React from 'react';

// 1. Monthly Sales Line/Area Chart
export function MonthlySalesChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const width = 580;
  const height = 220;
  const padding = 35;

  const maxVal = Math.max(...data.map((d) => d.sales), 300000);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((d.sales - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((factor, idx) => {
          const y = height - padding - factor * (height - 2 * padding);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area & Path */}
        <path d={areaD} fill="url(#salesGrad)" />
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

        {/* Data points & labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#3B82F6" stroke="var(--bg-card)" strokeWidth="2" />
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="11"
              fontWeight="600"
            >
              {p.month.split(' ')[0]}
            </text>
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="10.5"
              fontWeight="700"
            >
              ₹{(p.sales / 1000).toFixed(0)}k
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// 2. Regional / City Performance Bars
export function RegionalPerformanceChart({ data = [] }) {
  if (!data || data.length === 0) return null;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map((item, idx) => {
        const percent = Math.round((item.revenue / maxRevenue) * 100);
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.city}</span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.orders} Orders</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{(item.revenue / 1000).toFixed(0)}k</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700 }}>{item.growth}</span>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. Platform Revenue Breakdown Donut
export function RevenueBreakdownChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="3.8" />
          
          {/* Segments */}
          {(() => {
            let cumulativePercent = 0;
            return data.map((d, i) => {
              const strokeDasharray = `${d.percentage} ${100 - d.percentage}`;
              const strokeDashoffset = -cumulativePercent;
              cumulativePercent += d.percentage;
              return (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="3.8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            });
          })()}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</span>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d.source}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(d.amount / 1000).toFixed(0)}k</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>{d.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Order Status Distribution Chart
export function OrderStatusDistributionChart({ data = [] }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Multi-segment Progress Bar */}
      <div
        style={{
          display: 'flex',
          height: '14px',
          width: '100%',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        {data.map((d, i) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div
              key={i}
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: d.color,
                transition: 'width 0.4s ease',
              }}
              title={`${d.label}: ${d.count} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Grid of status tags */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
        {data.map((d, i) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div
              key={i}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                <span>{d.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{d.count}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
