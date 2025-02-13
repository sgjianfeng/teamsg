import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isFood = location.pathname.startsWith('/food');

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
    </nav>
  );
}

export default Navbar;
