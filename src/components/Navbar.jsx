import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="logo">
          <div className="vision-logo">V</div>
          <span>Vision Singapore</span>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
