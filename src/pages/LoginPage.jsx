import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/account');
    } catch (error) {
      console.error('Login error details:', error);
      setError(`Login failed: ${error.message || 'Please check your credentials.'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} type="submit" className="auth-button">
            Login
          </button>
        </form>
        <div className="auth-links">
          Need an account? <Link to="/register">Register</Link>
          <br />
          <button 
            className="link-button"
            onClick={async () => {
              if (!email) {
                setError('Please enter your email first');
                return;
              }
              try {
                setLoading(true);
                await resetPassword(email);
                setResetSent(true);
                setError('Password reset email has been sent to your email.');
              } catch (error) {
                setError('Failed to send reset email: ' + error.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || resetSent}
          >
            {resetSent ? 'Reset email sent!' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
