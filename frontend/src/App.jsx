import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layout
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes — will be replaced phase by phase */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">📅 Events — Coming in Phase 4</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">📋 Bookings — Coming in Phase 5</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">🏪 Marketplace — Coming in Phase 3</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">🏪 Vendor Dashboard — Coming in Phase 3</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/bookings"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">📋 Vendor Bookings — Coming in Phase 5</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/invitations"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">💌 Invitations — Coming in Phase 4</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div className="p-8 text-xl font-semibold text-gray-700">🛡️ Admin Panel — Coming in Phase 9</div>
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-red-500">403</h1>
                <p className="text-gray-500 mt-2">You are not authorized to view this page</p>
              </div>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;