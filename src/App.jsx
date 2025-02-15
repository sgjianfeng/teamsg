import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './layouts/Layout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const FoodPage = lazy(() => import('./pages/FoodPage'))
const MeowBBQPage = lazy(() => import('./pages/MeowBBQPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const auth = useAuth();
  return auth.currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <Layout>
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/food/meowbbq" element={<MeowBBQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
