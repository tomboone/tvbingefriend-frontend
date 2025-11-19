import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ShowDetail from './components/ShowDetail'
import SeasonDetail from './components/SeasonDetail'
import EpisodeDetail from './components/EpisodeDetail'
import SearchShows from './components/SearchShows'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import VerifyEmail from './components/VerifyEmail'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import logo from './assets/tvbf-white.svg'
import './App.css'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-dark bg-primary py-3" style={{ width: '100%' }}>
      <div className="container-fluid" style={{ maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
        <Link to="/" className="navbar-brand mb-0 text-decoration-none d-flex align-items-center gap-2">
          <img src={logo} alt="TV BingeFriend" style={{ height: '50px' }} />
          <span className="fs-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>TV BingeFriend</span>
        </Link>
        <div className="d-flex gap-2 align-items-center">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn btn-outline-light">
                {user?.username || 'Profile'}
              </Link>
              <button onClick={logout} className="btn btn-outline-light">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light">
                Login
              </Link>
              <Link to="/register" className="btn btn-light">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column" style={{ minHeight: '100vh', width: '100%' }}>
          {/* Full-width header with centered content */}
          <Navbar />

        {/* Full-width main content area with centered content */}
        <main className="bg-light py-4 flex-grow-1" style={{ width: '100%' }}>
          <div className="container-fluid" style={{ maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes - all require authentication */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <SearchShows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchShows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shows/:id"
                element={
                  <ProtectedRoute>
                    <ShowDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shows/:showId/seasons/:seasonNumber"
                element={
                  <ProtectedRoute>
                    <SeasonDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shows/:showId/seasons/:seasonNumber/episodes/:episodeNumber"
                element={
                  <ProtectedRoute>
                    <EpisodeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>

        {/* Full-width footer with centered content */}
        <footer className="bg-dark text-light py-3 mt-auto" style={{ width: '100%' }}>
          <div className="container-fluid" style={{ maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
            <div className="row">
              <div className="col-12 text-center">
                  <p className="mb-0">
                      &copy; Copyright 2025 TV BingeFriend.
                  </p>
                <p className="mb-0">
                  <small>
                    TV show images and data provided by{' '}
                    <a
                      href="https://www.tvmaze.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-light"
                    >
                      TV Maze.
                    </a>
                  </small>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
      </AuthProvider>
    </Router>
  )
}

export default App
