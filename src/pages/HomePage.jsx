import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to Team Singapore</h1>
        <p>Discover the Lion City's Finest</p>
      </div>
      <div className="content">
        <div className="featured-section">
          <h2>Explore Singapore</h2>
          <div className="featured-cards">
            <Link to="/food" className="card">
              <h3>Food Paradise</h3>
              <p>Discover local cuisine and dining spots</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
