import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-box ${circle ? 'skeleton-circle' : ''} ${className}`}
      style={{ width, height, ...style }}
    />
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="product-skeleton-card">
      <Skeleton height="170px" className="product-skeleton-image" />
      <Skeleton width="40%" height="0.85rem" />
      <Skeleton width="90%" height="1.1rem" />
      <Skeleton width="60%" height="0.9rem" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <Skeleton width="35%" height="1.4rem" />
        <Skeleton width="30%" height="2rem" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 4 }) => {
  return (
    <div style={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="table-skeleton-row">
          <Skeleton width="25%" height="1.2rem" />
          <Skeleton width="40%" height="1.2rem" />
          <Skeleton width="20%" height="1.2rem" />
          <Skeleton width="15%" height="1.2rem" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
