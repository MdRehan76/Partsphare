import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon,
  title = 'No items found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'var(--color-bg-card)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '1rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {icon || '📦'}
      </div>
      <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: actionLabel ? '1.5rem' : '0', fontSize: 'var(--font-size-sm)' }}>
        {description}
      </p>
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`error-state ${className}`}
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-error)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'var(--color-error)',
          marginBottom: '1rem',
        }}
      >
        ⚠️
      </div>
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: onRetry ? '1.5rem' : '0', fontSize: 'var(--font-size-sm)' }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
