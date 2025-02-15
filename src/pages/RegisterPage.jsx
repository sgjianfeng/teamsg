import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const { signup, verifyOtp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields before sending OTP
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      setLoading(true);
      setPasswordError('');
      setError('');
      await signup(email, password);
      setOtpSent(true);
      setError('A 6-digit verification code has been sent to your email.');
    } catch (error) {
      setError('Registration failed. ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={(e) => e.preventDefault()} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
            />
          </div>
          {passwordError && <div className="auth-error">{passwordError}</div>}
          
          {!otpSent ? (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || !email || !password || !confirmPassword || passwordError}
              className="auth-button"
            >
              Register
            </button>
          ) : (
            <>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code from your email"
                  maxLength={6}
                />
              </div>
              <button 
                type="button"
                onClick={async () => {
                  if (!otp) {
                    setError('Please enter verification code');
                    return;
                  }
                  try {
                    setLoading(true);
                    await verifyOtp(email, otp);
                    setOtpVerified(true);
                    setError('Registration successful! Redirecting to home...');
                    setTimeout(() => navigate('/'), 2000);
                  } catch (error) {
                    setError('Failed to verify code. ' + error.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !otp || otpVerified}
                className="auth-button"
              >
                {otpVerified ? 'Registration Complete!' : 'Complete Registration'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="resend-button"
              >
                Resend Code
              </button>
            </>
          )}
        </form>
        <div className="auth-links">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
