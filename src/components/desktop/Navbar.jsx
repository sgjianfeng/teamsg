import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFood = location.pathname.startsWith('/food');
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="desktop-nav">
      <div className="nav-content">
        <div className="desktop-logo">
          <div className="vision-logo">V</div>
          <div className="title-links">
            <Link to="/">VisionSG</Link>
            {isFood && (
              <>
                <span className="separator"> - </span>
                <Link to="/food">food</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="nav-auth">
        {currentUser ? (
          <div className="auth-user">
            <Link to="/account" className="user-email">{currentUser.email}</Link>
            <button onClick={handleLogout} className="logout-button">
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <Link to="/login" className="auth-link">
            <svg 
              viewBox="0 0 24 24" 
              width="24" 
              height="24" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
