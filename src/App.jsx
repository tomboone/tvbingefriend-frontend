import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ShowDetail from './components/ShowDetail'
import SeasonDetail from './components/SeasonDetail'
import EpisodeDetail from './components/EpisodeDetail'
import SearchShows from './components/SearchShows'
import './App.css'

function App() {
  return (
    <Router>
      <div className="d-flex flex-column" style={{ minHeight: '100vh', width: '100%' }}>
        {/* Full-width header with centered content */}
        <nav className="navbar navbar-dark bg-primary py-3" style={{ width: '100%' }}>
          <div className="container-fluid" style={{ maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
            <Link to="/" className="navbar-brand fs-2 mb-0 text-decoration-none">
              📺 TV Binge Friend
            </Link>
            <div className="d-flex">
              <Link to="/search" className="btn btn-outline-light">
                🔍 Search Shows
              </Link>
            </div>
          </div>
        </nav>

        {/* Full-width main content area with centered content */}
        <main className="bg-light py-4 flex-grow-1" style={{ width: '100%' }}>
          <div className="container-fluid" style={{ maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="text-center py-5">
                    <h2 className="mb-4">Welcome to TV Binge Friend</h2>
                    <p className="lead text-muted mb-4">Discover your next favorite TV show</p>
                    <Link to="/search" className="btn btn-primary btn-lg">
                      🔍 Start Searching
                    </Link>
                  </div>
                }
              />
              <Route path="/search" element={<SearchShows />} />
              <Route path="/shows/:id" element={<ShowDetail />} />
              <Route path="/shows/:showId/seasons/:seasonNumber" element={<SeasonDetail />} />
              <Route path="/shows/:showId/seasons/:seasonNumber/episodes/:episodeNumber" element={<EpisodeDetail />} />
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
    </Router>
  )
}

export default App
