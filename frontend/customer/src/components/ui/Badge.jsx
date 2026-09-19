import React from 'react';

export const Badge = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};

export const Input = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`form-input ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  id,
  options = [],
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`form-select ${error ? 'border-error' : ''} ${className}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default Badge;
