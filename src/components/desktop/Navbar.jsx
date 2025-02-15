import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const isFood = location.pathname.startsWith('/food');
  const { currentUser } = useAuth();

  return (
    <nav className="desktop-nav">
      <div className="nav-content">
        <div className="desktop-logo">
          <div className="vision-logo">V</div>
          <div className="title-links">
            <Link to="/">singapore vision</Link>
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
            <span className="user-email">{currentUser.email}</span>
            <Link to="/account" className="auth-link">
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
