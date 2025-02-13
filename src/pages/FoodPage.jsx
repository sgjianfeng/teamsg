import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FoodPage.css';

function FoodPage() {
  useEffect(() => {
    document.title = 'food';
  }, []);

  const [currentHighlightPage, setCurrentHighlightPage] = useState(0);

  const highlights = [
    {
      id: 1,
      image: "/images/food/chili-crab.jpg",
      title: "Chili Crab",
      description: "Singapore's iconic seafood dish"
    },
    {
      id: 2,
      image: "/images/food/chicken-rice.jpg",
      title: "Hainanese Chicken Rice",
      description: "National dish of Singapore"
    },
    {
      id: 3,
      image: "/images/food/laksa.jpg",
      title: "Laksa",
      description: "Spicy coconut noodle soup"
    },
    {
      id: 4,
      image: "/images/food/satay.jpg",
      title: "Satay",
      description: "Grilled skewered meat with peanut sauce"
    },
    {
      id: 5,
      image: "/images/food/roti-prata.jpg",
      title: "Roti Prata",
      description: "Crispy flatbread with curry"
    },
    // More highlights for next page
    {
      id: 6,
      image: "/images/food/kaya-toast.jpg",
      title: "Kaya Toast",
      description: "Traditional breakfast set"
    },
    {
      id: 7,
      image: "/images/food/hokkien-mee.jpg",
      title: "Hokkien Mee",
      description: "Stir-fried noodles with seafood"
    }
  ];

  const foodCompanies = [
    {
      id: 1,
      logo: "/images/companies/meowbbq-logo.svg",
      name: "Meow BBQ",
      images: [
        "/images/food/meowbbq-beef.jpg",
        "/images/food/meowbbq-platter.jpg",
        "/images/food/meowbbq-skewers.jpg"
      ],
      description: "Premium Chinese BBQ restaurant"
    }
  ];

  const itemsPerPage = 5;
  const totalPages = Math.ceil(highlights.length / itemsPerPage);
  const currentHighlights = highlights.slice(
    currentHighlightPage * itemsPerPage,
    (currentHighlightPage + 1) * itemsPerPage
  );

  return (
    <div className="food-page">
      <section className="food-highlights">
        <h2>Singapore Food Highlights</h2>
        <div className="highlights-container">
          <div className="highlights-grid">
            {currentHighlights.map(highlight => (
              <div key={highlight.id} className="highlight-card">
                <div className="highlight-image">
                  <img src={highlight.image} alt={highlight.title} />
                </div>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`page-dot ${index === currentHighlightPage ? 'active' : ''}`}
                  onClick={() => setCurrentHighlightPage(index)}
                >
                  •
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="food-companies">
        <h2>Featured Restaurants</h2>
        {foodCompanies.map(company => (
          <div key={company.id} className="company-row">
            <div className="company-info">
              <img src={company.logo} alt={company.name} className="company-logo" />
              <h3><Link to={`/food/meowbbq`}>{company.name}</Link></h3>
              <p>{company.description}</p>
            </div>
            <div className="company-images">
              {company.images.map((image, index) => (
                <div key={index} className="food-image">
                  <img src={image} alt={`${company.name} food ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default FoodPage;
