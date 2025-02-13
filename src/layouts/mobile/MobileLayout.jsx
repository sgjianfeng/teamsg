import { Link, useLocation } from 'react-router-dom';
import './MobileLayout.css';

const MobileLayout = ({ children }) => {
  const location = useLocation();
  const isFood = location.pathname.startsWith('/food');
  return (
    <div className="mobile-layout">
      <header className="mobile-header">
        <div className="mobile-logo">
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
      </header>

      <main className="mobile-main">
        {children}
      </main>

      <footer className="mobile-footer">
        <p>© 2025 Vision Singapore</p>
      </footer>
    </div>
  );
};

export default MobileLayout;
