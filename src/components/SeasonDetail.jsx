import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function SeasonDetail() {
  const { showId, seasonNumber } = useParams()
  const [season, setSeason] = useState(null)
  const [show, setShow] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [episodesError, setEpisodesError] = useState(null)

  const fetchEpisodes = async () => {
    if (!season) return

    try {
      setEpisodesLoading(true)
      setEpisodesError(null)

      const episodesResponse = await fetch(`/api/episodes/${showId}/${season.number}/episodes`)
      if (!episodesResponse.ok) {
        if (episodesResponse.status === 404) {
          // No episodes found is not an error, just empty array
          setEpisodes([])
          return
        }
        throw new Error('Failed to fetch episodes')
      }

      const episodesData = await episodesResponse.json()
      setEpisodes(episodesData)
    } catch (err) {
      setEpisodesError(err.message)
      setEpisodes([])
    } finally {
      setEpisodesLoading(false)
    }
  }

  useEffect(() => {
    const fetchSeasonAndShow = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the specific season directly using efficient endpoint
        const seasonResponse = await fetch(`/api/seasons/${showId}/${seasonNumber}`)
        if (!seasonResponse.ok) {
          if (seasonResponse.status === 404) {
            throw new Error('Season not found')
          }
          throw new Error('Failed to fetch season')
        }
        const seasonData = await seasonResponse.json()
        setSeason(seasonData)

        // Fetch show information for context
        const showResponse = await fetch(`/api/shows/${showId}`)
        if (showResponse.ok) {
          const showData = await showResponse.json()
          setShow(showData)
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (showId && seasonNumber) {
      fetchSeasonAndShow()
    }
  }, [showId, seasonNumber])

  // Fetch episodes when season is loaded
  useEffect(() => {
    if (season) {
      fetchEpisodes()
    }
  }, [season, showId])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading season details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p className="mb-3">{error}</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        <h4 className="alert-heading">Not Found</h4>
        <p className="mb-3">Season not found</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="row g-4">
      {/* Header with breadcrumb navigation */}
      <div className="col-12">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            {show && (
              <li className="breadcrumb-item">
                <Link to={`/shows/${showId}`} className="text-decoration-none">
                  {show.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              Season {season.number}
            </li>
          </ol>
        </nav>

        <div className="d-flex flex-column flex-md-row align-items-start gap-3 mb-4">
          <div className="flex-grow-1">
            <h1 className="display-6 fw-bold text-primary mb-2">
              {show ? show.name : 'TV Show'} - Season {season.number}
            </h1>
            {season.name && season.name !== `Season ${season.number}` && (
              <h2 className="h4 text-muted mb-0">{season.name}</h2>
            )}
          </div>
          <Link
            to={`/shows/${showId}`}
            className="btn btn-outline-primary btn-sm"
          >
            ← Back to Show
          </Link>
        </div>
      </div>

      {/* Season Image */}
      {season.image && season.image.medium && (
        <div className="col-md-4 col-lg-3">
          <img
            src={season.image.medium}
            alt={`Season ${season.number}`}
            className="img-fluid rounded shadow-sm w-100"
            style={{maxWidth: '300px'}}
          />
        </div>
      )}

      {/* Season Information */}
      <div className={season.image && season.image.medium ? "col-md-8 col-lg-9" : "col-12"}>
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Season Information</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <small className="text-muted">Season Number</small>
                <p className="mb-0 fw-semibold fs-5">{season.number}</p>
              </div>

              {season.episodeOrder && (
                <div className="col-sm-6">
                  <small className="text-muted">Episodes</small>
                  <p className="mb-0 fw-semibold fs-5">{season.episodeOrder}</p>
                </div>
              )}

              {season.premiereDate && (
                <div className="col-sm-6">
                  <small className="text-muted">Premiere Date</small>
                  <p className="mb-0 fw-semibold">{season.premiereDate}</p>
                </div>
              )}

              {season.endDate && (
                <div className="col-sm-6">
                  <small className="text-muted">End Date</small>
                  <p className="mb-0 fw-semibold">{season.endDate}</p>
                </div>
              )}

              {season.network && season.network.name && (
                <div className="col-sm-6">
                  <small className="text-muted">Network</small>
                  <p className="mb-0 fw-semibold">{season.network.name}</p>
                  {season.network.country && (
                    <small className="text-muted d-block">
                      {season.network.country.name}
                    </small>
                  )}
                </div>
              )}

              {season.webChannel && season.webChannel.name && (
                <div className="col-sm-6">
                  <small className="text-muted">Web Channel</small>
                  <p className="mb-0 fw-semibold">{season.webChannel.name}</p>
                  {season.webChannel.country && (
                    <small className="text-muted d-block">
                      {season.webChannel.country.name}
                    </small>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Season Summary */}
      {season.summary && (
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Season Summary</h5>
            </div>
            <div className="card-body">
              <div
                className="season-summary-content"
                dangerouslySetInnerHTML={{ __html: season.summary }}
              />
            </div>
          </div>
        </div>
      )}


      {/* Episodes Section */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Episodes</h5>
          </div>
          <div className="card-body">
            {episodesLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading episodes...
              </div>
            ) : episodesError ? (
              <div className="alert alert-warning mb-0">
                <small>Unable to load episodes: {episodesError}</small>
              </div>
            ) : episodes.length === 0 ? (
              <div className="text-muted">
                <small>No episodes available</small>
              </div>
            ) : (
              <div className="row g-3">
                {episodes.map((episode) => (
                  <div key={episode.id} className="col-12">
                    <Link
                      to={`/shows/${showId}/seasons/${season.number}/episodes/${episode.number}`}
                      className="text-decoration-none"
                    >
                      <div className="card border-light h-100" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease-in-out' }}>
                        <div className="card-body p-3">
                          <div className="row g-3">
                            {/* Episode Image */}
                            <div className="col-auto">
                              {episode.image && episode.image.medium ? (
                                <img
                                  src={episode.image.medium}
                                  alt={episode.name || `Episode ${episode.number}`}
                                  className="rounded"
                                  style={{width: '80px', height: '60px', objectFit: 'cover'}}
                                />
                              ) : (
                                <div
                                  className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
                                  style={{width: '80px', height: '60px'}}
                                >
                                  <small>E{episode.number}</small>
                                </div>
                              )}
                            </div>

                            {/* Episode Info */}
                            <div className="col">
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1">
                                  <span className="badge bg-primary me-2">Episode {episode.number}</span>
                                  {episode.name || 'Untitled Episode'}
                                </h6>

                                <div className="small text-muted mb-2">
                                  {episode.airdate && (
                                    <span className="me-3">
                                      📅 {new Date(episode.airdate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {episode.runtime && (
                                    <span className="me-3">⏱️ {episode.runtime} min</span>
                                  )}
                                  {episode.rating && episode.rating.average && (
                                    <span className="badge bg-warning text-dark">
                                      ⭐ {episode.rating.average}/10
                                    </span>
                                  )}
                                </div>

                                {episode.summary && (
                                  <div
                                    className="small text-muted"
                                    dangerouslySetInnerHTML={{
                                      __html: episode.summary.length > 200
                                        ? episode.summary.substring(0, 200) + '...'
                                        : episode.summary
                                    }}
                                  />
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

export default SeasonDetail