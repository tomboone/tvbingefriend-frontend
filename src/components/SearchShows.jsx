import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const SearchShows = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setHasSearched(true);

        const response = await fetch(
          `/api/shows/search?q=${encodeURIComponent(searchQuery.trim())}&limit=20`
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms delay
    []
  );

  // Trigger search when query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const formatGenres = (genres) => {
    if (!genres || !Array.isArray(genres)) return '';
    return genres.slice(0, 3).join(', ');
  };

  const formatYear = (premiered) => {
    if (!premiered) return '';
    return premiered.split('-')[0];
  };

  const stripHTML = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="container-fluid py-3">
      {/* Search Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 mb-3">Search TV Shows</h1>

          {/* Search Input */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Start typing to search for TV shows..."
              value={query}
              onChange={handleInputChange}
              autoFocus
            />
            <span className="input-group-text">
              {loading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Searching...</span>
                </div>
              ) : (
                <i className="bi bi-search"></i>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="row">
        <div className="col-12">
          {error && (
            <div className="alert alert-danger" role="alert">
              Error: {error}
            </div>
          )}

          {hasSearched && !loading && results.length === 0 && !error && (
            <div className="alert alert-info" role="alert">
              No shows found for "{query}". Try a different search term.
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="text-muted mb-3">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>

              <div className="row g-3">
                {results.map((show) => (
                  <div key={show.id} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="row g-0 h-100">
                        {/* Show Image */}
                        <div className="col-4 col-sm-3">
                          {show.image?.medium ? (
                            <img
                              src={show.image.medium}
                              alt={show.name}
                              className="img-fluid rounded-start h-100"
                              style={{ objectFit: 'cover', minHeight: '120px' }}
                            />
                          ) : (
                            <div
                              className="bg-light d-flex align-items-center justify-content-center rounded-start h-100"
                              style={{ minHeight: '120px' }}
                            >
                              <i className="bi bi-tv text-muted" style={{ fontSize: '2rem' }}></i>
                            </div>
                          )}
                        </div>

                        {/* Show Info */}
                        <div className="col-8 col-sm-9">
                          <div className="card-body p-3 d-flex flex-column h-100">
                            <div className="flex-grow-1">
                              <h5 className="card-title mb-1">
                                <Link
                                  to={`/shows/${show.id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  {show.name}
                                </Link>
                              </h5>

                              <div className="text-muted small mb-2">
                                {show.type && <span className="me-2">{show.type}</span>}
                                {formatYear(show.premiered) && (
                                  <span className="me-2">({formatYear(show.premiered)})</span>
                                )}
                                {show.status && (
                                  <span className={`badge ${
                                    show.status === 'Running' ? 'bg-success' :
                                    show.status === 'Ended' ? 'bg-secondary' : 'bg-warning'
                                  } ms-1`}>
                                    {show.status}
                                  </span>
                                )}
                              </div>

                              {formatGenres(show.genres) && (
                                <p className="card-text small text-muted mb-2">
                                  <strong>Genres:</strong> {formatGenres(show.genres)}
                                </p>
                              )}

                              {show.summary && (
                                <p className="card-text small">
                                  {stripHTML(show.summary)}
                                </p>
                              )}
                            </div>

                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center">
                                <Link
                                  to={`/shows/${show.id}`}
                                  className="btn btn-primary btn-sm"
                                >
                                  View Details
                                </Link>
                                {show.rating?.average && (
                                  <small className="text-muted">
                                    ⭐ {show.rating.average}/10
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!hasSearched && !loading && (
            <div className="text-center py-5">
              <i className="bi bi-search text-muted" style={{ fontSize: '4rem' }}></i>
              <h3 className="text-muted mt-3">Start typing to search for TV shows</h3>
              <p className="text-muted">
                Search results will appear instantly as you type
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchShows;