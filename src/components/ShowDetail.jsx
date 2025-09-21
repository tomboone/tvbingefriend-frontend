import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function ShowDetail() {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [seasonsLoading, setSeasonsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seasonsError, setSeasonsError] = useState(null)

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/shows/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Show not found')
          }
          throw new Error('Failed to fetch show')
        }

        const showData = await response.json()
        setShow(showData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchSeasons = async () => {
      try {
        setSeasonsLoading(true)
        setSeasonsError(null)
        const response = await fetch(`/api/seasons/${id}/seasons`)

        if (!response.ok) {
          if (response.status === 404) {
            // No seasons found is not an error, just empty array
            setSeasons([])
            return
          }
          throw new Error('Failed to fetch seasons')
        }

        const seasonsData = await response.json()
        setSeasons(seasonsData)
      } catch (err) {
        setSeasonsError(err.message)
        setSeasons([])
      } finally {
        setSeasonsLoading(false)
      }
    }

    if (id) {
      fetchShow()
      fetchSeasons()
    }
  }, [id])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading show details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p className="mb-0">{error}</p>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        <h4 className="alert-heading">Not Found</h4>
        <p className="mb-0">Show not found</p>
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <h1 className="display-5 fw-bold text-primary mb-4">{show.name}</h1>
      </div>

      <div className="col-md-4">
        {show.image && show.image.medium && (
          <img
            src={show.image.medium}
            alt={show.name}
            className="img-fluid rounded shadow-sm w-100"
            style={{maxWidth: '300px'}}
          />
        )}
      </div>

      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Show Information</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <small className="text-muted">Type</small>
                <p className="mb-0 fw-semibold">{show.type}</p>
              </div>

              {show.language && (
                <div className="col-sm-6">
                  <small className="text-muted">Language</small>
                  <p className="mb-0 fw-semibold">{show.language}</p>
                </div>
              )}

              {show.genres && show.genres.length > 0 && (
                <div className="col-12">
                  <small className="text-muted">Genres</small>
                  <div className="mt-1">
                    {show.genres.map((genre, index) => (
                      <span key={index} className="badge bg-secondary me-1">{genre}</span>
                    ))}
                  </div>
                </div>
              )}

              {show.status && (
                <div className="col-sm-6">
                  <small className="text-muted">Status</small>
                  <p className="mb-0 fw-semibold">
                    <span className={`badge ${show.status === 'Running' ? 'bg-success' : 'bg-secondary'}`}>
                      {show.status}
                    </span>
                  </p>
                </div>
              )}

              {show.runtime && (
                <div className="col-sm-6">
                  <small className="text-muted">Runtime</small>
                  <p className="mb-0 fw-semibold">{show.runtime} minutes</p>
                </div>
              )}

              {show.premiered && (
                <div className="col-sm-6">
                  <small className="text-muted">Premiered</small>
                  <p className="mb-0 fw-semibold">{show.premiered}</p>
                </div>
              )}

              {show.ended && (
                <div className="col-sm-6">
                  <small className="text-muted">Ended</small>
                  <p className="mb-0 fw-semibold">{show.ended}</p>
                </div>
              )}

              {show.network && show.network.name && (
                <div className="col-sm-6">
                  <small className="text-muted">Network</small>
                  <p className="mb-0 fw-semibold">{show.network.name}</p>
                </div>
              )}

              {show.webchannel && show.webchannel.name && (
                <div className="col-sm-6">
                  <small className="text-muted">Web Channel</small>
                  <p className="mb-0 fw-semibold">{show.webchannel.name}</p>
                </div>
              )}

              {show.rating && show.rating.average && (
                <div className="col-sm-6">
                  <small className="text-muted">Rating</small>
                  <p className="mb-0 fw-semibold">
                    <span className="badge bg-warning text-dark">
                      ⭐ {show.rating.average}/10
                    </span>
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {show.summary && (
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Summary</h5>
            </div>
            <div className="card-body">
              <div
                className="show-summary-content"
                dangerouslySetInnerHTML={{ __html: show.summary }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Seasons Section */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Seasons</h5>
          </div>
          <div className="card-body">
            {seasonsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading seasons...
              </div>
            ) : seasonsError ? (
              <div className="alert alert-warning mb-0">
                <small>Unable to load seasons: {seasonsError}</small>
              </div>
            ) : seasons.length === 0 ? (
              <div className="text-muted">
                <small>No seasons available</small>
              </div>
            ) : (
              <div className="row g-3">
                {seasons.map((season) => (
                  <div key={season.id} className="col-12">
                    <Link
                      to={`/shows/${id}/seasons/${season.number}`}
                      className="text-decoration-none"
                    >
                      <div className="card border-light h-100" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease-in-out' }}>
                        <div className="row g-0">
                          {/* Season Image or Placeholder */}
                          <div className="col-auto">
                            {season.image && season.image.medium ? (
                              <img
                                src={season.image.medium}
                                alt={`Season ${season.number}`}
                                className="img-fluid rounded-start"
                                style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center rounded-start"
                                style={{ width: '120px', height: '180px' }}
                              >
                                <i className="bi bi-tv text-muted" style={{ fontSize: '2rem' }}></i>
                              </div>
                            )}
                          </div>

                          {/* Season Content */}
                          <div className="col">
                            <div className="card-body p-3">
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1">
                                  Season {season.number}
                                  {season.name && season.name !== `Season ${season.number}` && (
                                    <small className="text-muted d-block">{season.name}</small>
                                  )}
                                </h6>

                                <div className="small text-muted mb-2">
                                  {season.episodeOrder && (
                                    <span className="me-3">Episodes: {season.episodeOrder}</span>
                                  )}
                                  {season.premiereDate && (
                                    <span className="me-3">Premiered: {season.premiereDate}</span>
                                  )}
                                  {season.endDate && (
                                    <span className="me-3">Ended: {season.endDate}</span>
                                  )}
                                </div>

                                {season.network && season.network.name && (
                                  <div className="small text-muted mb-1">
                                    Network: {season.network.name}
                                  </div>
                                )}
                                {season.webChannel && season.webChannel.name && (
                                  <div className="small text-muted mb-1">
                                    Web Channel: {season.webChannel.name}
                                  </div>
                                )}

                                {season.summary && (
                                  <div className="mt-2">
                                    <div
                                      className="small text-muted"
                                      dangerouslySetInnerHTML={{
                                        __html: season.summary.length > 200
                                          ? season.summary.substring(0, 200) + '...'
                                          : season.summary
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowDetail