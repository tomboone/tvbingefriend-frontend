import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getApiUrl } from '../utils/api'

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `📅 ${date.toLocaleDateString()}`
}

// Helper function to format dates without emoji
const formatDateNoEmoji = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function ShowDetail() {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [seasonsLoading, setSeasonsLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seasonsError, setSeasonsError] = useState(null)
  const [recommendationsError, setRecommendationsError] = useState(null)
  const [activeView, setActiveView] = useState('seasons') // 'seasons' or 'recommendations'

  useEffect(() => {
    // Reset to seasons view when show ID changes
    setActiveView('seasons')

    const fetchShow = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl(`/api/shows/${id}`))

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
        const response = await fetch(getApiUrl(`/api/shows/${id}/seasons`))

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

    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true)
        setRecommendationsError(null)
        const response = await fetch(getApiUrl(`/api/shows/${id}/recommendations`))

        if (!response.ok) {
          if (response.status === 404) {
            // No recommendations found is not an error, just empty array
            setRecommendations([])
            return
          }
          throw new Error('Failed to fetch recommendations')
        }

        const recommendationsData = await response.json()
        const recommendationsList = recommendationsData.recommendations || []

        if (recommendationsList.length === 0) {
          setRecommendations([])
          return
        }

        // Sort by similarity score (highest first) and take top 10
        const topRecommendations = recommendationsList
          .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
          .slice(0, 10)

        // Extract show IDs and fetch full show data using bulk endpoint
        const showIds = topRecommendations.map(rec => rec.show_id).join(',')
        const bulkResponse = await fetch(getApiUrl(`/api/get_shows_bulk?show_ids=${showIds}`))

        if (!bulkResponse.ok) {
          throw new Error('Failed to fetch show details')
        }

        const bulkData = await bulkResponse.json()

        // Merge show data with similarity scores and maintain sort order
        const enrichedRecommendations = topRecommendations.map(recData => {
          const show = bulkData.shows.find(s => s.id === recData.show_id)
          return {
            ...show,
            similarity_score: recData?.similarity_score,
            genre_score: recData?.genre_score,
            text_score: recData?.text_score,
            metadata_score: recData?.metadata_score
          }
        }).filter(show => show.id) // Remove any shows that weren't found

        setRecommendations(enrichedRecommendations)
      } catch (err) {
        setRecommendationsError(err.message)
        setRecommendations([])
      } finally {
        setRecommendationsLoading(false)
      }
    }

    if (id) {
      fetchShow()
      fetchSeasons()
      fetchRecommendations()
    }
  }, [id])

  // Update page title when show data changes
  useEffect(() => {
    if (show) {
      document.title = `${show.name} - TV Binge Friend`;
    }
  }, [show])

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
        <h1 className="display-5 fw-bold text-dark mb-2">
          {show.name}
          {show.premiered && (
            <span className="text-muted"> ({new Date(show.premiered).getFullYear()})</span>
          )}
        </h1>
      </div>

      <div className="col-md-4 text-center">
        {show.image && show.image.medium && (
          <img
            src={show.image.medium}
            alt={show.name}
            className="img-fluid rounded shadow-sm w-100"
            style={{maxWidth: '350px'}}
          />
        )}
      </div>

      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              {show.rating && show.rating.average && (
                <div className="col-12 mb-2">
                  <span className="badge bg-warning text-dark fs-5 px-3 py-2">
                    ⭐ {show.rating.average}/10
                  </span>
                </div>
              )}

              {show.premiered && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">Premiered:</small><span className="fw-semibold">{formatDateNoEmoji(show.premiered)}</span></p>
                </div>
              )}

              {show.ended && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">Ended:</small><span className="fw-semibold">{formatDateNoEmoji(show.ended)}</span></p>
                </div>
              )}

              {show.genres && show.genres.length > 0 && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">Genres:</small>
                    {show.genres.map((genre, index) => (
                      <span key={index} className="badge bg-secondary me-1">{genre}</span>
                    ))}
                  </p>
                </div>
              )}

              {show.status && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">Status:</small>
                    <span className={`badge ${show.status === 'Running' ? 'bg-success' : 'bg-secondary'}`}>
                      {show.status}
                    </span>
                  </p>
                </div>
              )}

              {(show.network?.name || show.webchannel?.name) && (
                <div className="col-12">
                  <p className="mb-0">
                    <small className="text-muted me-2">
                      {show.network?.name ? '📺' : '💻'}
                    </small>
                    <span className="fw-semibold">
                      {show.network?.name ?
                        `${show.network.name}${show.network.country?.name ? ` (${show.network.country.name})` : ''}` :
                        `${show.webchannel.name}${show.webchannel.country?.name ? ` (${show.webchannel.country.name})` : ''}`
                      }
                    </span>
                  </p>
                </div>
              )}

              {show.runtime && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">⏱️</small><span className="fw-semibold">{show.runtime} minutes</span></p>
                </div>
              )}

              <div className="col-12">
                <p className="mb-0"><small className="text-muted me-2">Type:</small><span className="fw-semibold">{show.type}</span></p>
              </div>

              {show.language && (
                <div className="col-12">
                  <p className="mb-0"><small className="text-muted me-2">Language:</small><span className="fw-semibold">{show.language}</span></p>
                </div>
              )}

              {show.summary && (
                <div className="col-12">
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                    <div
                      className="show-summary-content"
                      dangerouslySetInnerHTML={{ __html: show.summary }}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Seasons and Recommendations Section */}
        <div className="col-12 mt-3">
          <div className="card">
            <div className="card-header">
              <div className="d-flex gap-3">
                <button
                  className={`btn ${activeView === 'seasons' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveView('seasons')}
                  style={{ cursor: 'pointer' }}
                >
                  Seasons{seasons.length > 0 && ` (${seasons.length})`}
                </button>
                <button
                  className={`btn ${activeView === 'recommendations' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveView('recommendations')}
                  style={{ cursor: 'pointer' }}
                >
                  Similar Shows
                </button>
              </div>
            </div>
            <div className="card-body">
              {activeView === 'seasons' ? (
                // Seasons View
                seasonsLoading ? (
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
                                ) : show.image && show.image.medium ? (
                                  <img
                                    src={show.image.medium}
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
                                <div className="card-body p-3" style={{ maxHeight: '180px', overflow: 'hidden' }}>
                                  <div className="flex-grow-1">
                                    <h6 className="card-title mb-2 pb-2" style={{ borderBottom: '1px solid #dee2e6' }}>
                                      Season {season.number}
                                      {season.name && season.name !== `Season ${season.number}` && (
                                        <small className="text-muted ms-2">- {season.name}</small>
                                      )}
                                    </h6>

                                    {season.episodeOrder && (
                                      <div className="small text-muted mb-1">
                                        Episodes: {season.episodeOrder}
                                      </div>
                                    )}
                                    {(season.premiereDate || season.endDate) && (
                                      <div className="small text-muted mb-2 mt-2">
                                        📅 {season.premiereDate && formatDateNoEmoji(season.premiereDate)}
                                        {season.premiereDate && season.endDate && ' - '}
                                        {season.endDate && formatDateNoEmoji(season.endDate)}
                                      </div>
                                    )}

                                    {season.network && season.network.name && (
                                      <div className="small text-muted mb-1">
                                        📺 {season.network.name}
                                      </div>
                                    )}
                                    {season.webChannel && season.webChannel.name && (
                                      <div className="small text-muted mb-1">
                                        💻 {season.webChannel.name}
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
                )
              ) : (
                // Recommendations View
                recommendationsLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading recommendations...
                  </div>
                ) : recommendationsError ? (
                  <div className="alert alert-warning mb-0">
                    <small>Unable to load recommendations: {recommendationsError}</small>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-muted">
                    <small>No recommendations available</small>
                  </div>
                ) : (
                  <div className="row g-3">
                    {recommendations.map((recommendation) => (
                      <div key={recommendation.id} className="col-12">
                        <Link
                          to={`/shows/${recommendation.id}`}
                          className="text-decoration-none"
                        >
                          <div className="card border-light h-100" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease-in-out' }}>
                            <div className="row g-0">
                              {/* Show Image or Placeholder */}
                              <div className="col-auto">
                                {recommendation.image && recommendation.image.medium ? (
                                  <img
                                    src={recommendation.image.medium}
                                    alt={recommendation.name}
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

                              {/* Show Content */}
                              <div className="col">
                                <div className="card-body p-3" style={{ maxHeight: '180px', overflow: 'hidden' }}>
                                  <div className="flex-grow-1">
                                    <h6 className="card-title mb-2 pb-2" style={{ borderBottom: '1px solid #dee2e6' }}>
                                      {recommendation.name}
                                      {recommendation.premiered && (
                                        <small className="text-muted ms-2">({new Date(recommendation.premiered).getFullYear()})</small>
                                      )}
                                      {recommendation.rating && recommendation.rating.average && (
                                        <span className="badge bg-warning text-dark ms-2">
                                          ⭐ {recommendation.rating.average}/10
                                        </span>
                                      )}
                                    </h6>

                                    {recommendation.genres && recommendation.genres.length > 0 && (
                                      <div className="small text-muted mb-1">
                                        {recommendation.genres.slice(0, 3).join(', ')}
                                      </div>
                                    )}

                                    {recommendation.summary && (
                                      <div
                                        className="small text-muted mt-2"
                                        style={{
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: recommendation.summary }}
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
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowDetail