import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function AccountPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Account</h2>
        <div className="account-info">
          <p><strong>Name:</strong> {currentUser?.displayName}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
        </div>
        <button onClick={handleLogout} className="auth-button">
          Log Out
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
