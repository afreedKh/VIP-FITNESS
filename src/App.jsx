import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MediaProvider } from './context/MediaContext'

import HomePage    from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import AdminLogin  from './pages/AdminLogin'
import AdminPanel  from './pages/AdminPanel'

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <MediaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/gallery"      element={<GalleryPage />} />
            <Route path="/admin/login"  element={<AdminLogin />} />
            <Route path="/admin"        element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MediaProvider>
    </AuthProvider>
  )
}
