import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    if (score <= 2) return { level: 'weak', label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { level: 'fair', label: 'Fair', color: '#F59E0B' };
    return { level: 'strong', label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validations
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Valid email address is required';
    }
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the registration form.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      toast.success('Account created! Let’s set up your vehicle 🚗');
      navigate('/onboarding/vehicle');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fieldErrors = {};
        data.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setForm({
      name: 'Rohan Verma',
      email: `rohan.${randomSuffix}@partnexa.in`,
      mobileNumber: '9876543210',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card card-glass animate-scale-in">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Part<span className="text-primary">Nexa</span>
          </Link>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">
            Join thousands of car & two-wheeler owners for verified spare parts
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="rahul@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-mobile">
              Mobile Number
            </label>
            <input
              id="reg-mobile"
              name="mobileNumber"
              type="tel"
              className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
              placeholder="10-digit mobile number (e.g. 9876543210)"
              value={form.mobileNumber}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
            {errors.mobileNumber && <p className="form-error">{errors.mobileNumber}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                id="toggle-password-visibility"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && strength && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width:
                        strength.level === 'weak'
                          ? '33%'
                          : strength.level === 'fair'
                          ? '66%'
                          : '100%',
                      background: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color, fontSize: '12px' }}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showConfirmPass ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                id="toggle-confirm-password-visibility"
              >
                {showConfirmPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="form-error">Passwords do not match</p>
            )}
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                Creating Account...
              </>
            ) : (
              'Create Account & Add Vehicle →'
            )}
          </button>

          {/* Demo fill helper */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-xs"
              onClick={handleFillDemo}
              id="fill-demo-register-btn"
            >
              ⚡ Fill Sample Registration Details
            </button>
          </div>

          <p className="auth-terms">
            By creating an account, you agree to PartNexa's{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
