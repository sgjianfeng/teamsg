import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="logo">
          <div className="sg-logo">
            <div className="logo-crescent"></div>
            <div className="logo-stars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <span>Team Singapore</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/food" className="nav-link">Food</Link>
      </div>
    </nav>
  )
}

export default Navbar
