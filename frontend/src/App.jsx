import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Gallery from './components/Gallery'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

