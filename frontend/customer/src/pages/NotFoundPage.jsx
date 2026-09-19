import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔩</div>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
      404
    </h1>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
      Part Not Found
    </h2>
    <p style={{ color: 'var(--color-text-muted)', maxWidth: 400, marginBottom: '2rem' }}>
      Looks like this page went for a test drive and never came back. Let's get you back on track.
    </p>
    <Link to="/" className="btn btn-primary btn-lg" id="not-found-home-btn">
      ← Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
