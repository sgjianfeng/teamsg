import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './layouts/Layout'
import './App.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const FoodPage = lazy(() => import('./pages/FoodPage'))
const MeowBBQPage = lazy(() => import('./pages/MeowBBQPage'))

function App() {
  return (
    <Router basename="/">
      <Layout>
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/food/meowbbq" element={<MeowBBQPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App
