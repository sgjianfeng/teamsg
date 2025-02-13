import { Link, useLocation } from 'react-router-dom';
import './TabletLayout.css';

const TabletLayout = ({ children }) => {
  const location = useLocation();
  const isFood = location.pathname.startsWith('/food');
  return (
    <div className="tablet-layout">
      <header className="tablet-header">
        <div className="tablet-logo">
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

      <main className="tablet-main">
        {children}
      </main>

      <footer className="tablet-footer">
        <p>© 2025 Vision Singapore</p>
      </footer>
    </div>
  );
};

export default TabletLayout;
