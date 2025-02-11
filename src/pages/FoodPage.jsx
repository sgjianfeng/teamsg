import { Link } from 'react-router-dom'

function FoodPage() {
  return (
    <div className="food-page">
      <div className="hero">
        <h1>Singapore Food Scene</h1>
        <p>Where Flavors Meet Tradition</p>
      </div>
      <div className="content">
        <div className="restaurants-section">
          <h2>Featured Restaurants</h2>
          <div className="restaurant-cards">
            <Link to="/food/meowbbq" className="restaurant-card">
              <div className="card-content">
                <h3>Meow BBQ</h3>
                <p>Experience authentic Chinese BBQ</p>
                <div className="tags">
                  <span>BBQ</span>
                  <span>Chinese Cuisine</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="cuisine-section">
          <h2>Popular Cuisines</h2>
          <div className="cuisine-types">
            <div className="cuisine">Chinese</div>
            <div className="cuisine">Malay</div>
            <div className="cuisine">Indian</div>
            <div className="cuisine">Peranakan</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodPage
