import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await auth.login(form.email, form.password);
      if (data.success) {
        auth.setTokens(data.data.accessToken, data.data.refreshToken);
        auth.setUser(data.data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="brand-icon">🗝️</div>
          <h1 className="brand-name">Golden Key Realty</h1>
          <p className="brand-tagline">
            Malta's premier real estate CRM — manage properties, owners, and agents with elegance.
          </p>
          <div className="brand-features">
            <div className="feature-item">
              <span>🏠</span> Property Portfolio Management
            </div>
            <div className="feature-item">
              <span>👤</span> Owner & Client Database
            </div>
            <div className="feature-item">
              <span>📊</span> Analytics & Reporting
            </div>
            <div className="feature-item">
              <span>🔒</span> Secure & Private
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="agent@goldenkeyrealty.mt"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            🗝️ Golden Key Realty Malta &mdash; Private Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
