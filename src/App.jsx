import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FoodPage from './pages/FoodPage'
import MeowBBQPage from './pages/MeowBBQPage'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <Router basename="/">
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/food/meowbbq" element={<MeowBBQPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
