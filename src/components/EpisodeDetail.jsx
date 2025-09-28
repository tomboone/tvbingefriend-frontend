import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EpisodeDetail = () => {
  const { showId, seasonNumber, episodeNumber } = useParams();
  const [episode, setEpisode] = useState(null);
  const [show, setShow] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch episodes for the season to find the specific episode
        const episodesResponse = await fetch(`/api/episodes/${showId}/${seasonNumber}/episodes`);
        if (!episodesResponse.ok) {
          throw new Error('Episodes not found');
        }
        const episodes = await episodesResponse.json();
        const foundEpisode = episodes.find(ep => ep.number === parseInt(episodeNumber));

        if (!foundEpisode) {
          throw new Error('Episode not found');
        }
        setEpisode(foundEpisode);
        setAllEpisodes(episodes);

        // Fetch show details for context
        const showResponse = await fetch(`/api/shows/${showId}`);
        if (showResponse.ok) {
          const showData = await showResponse.json();
          setShow(showData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [episodeNumber, showId, seasonNumber]);

  if (loading) {
    return (
      <div className="container-fluid py-3">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-3">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="container-fluid py-3">
        <div className="alert alert-warning" role="alert">
          Episode not found
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return `📅 ${date.toLocaleDateString()}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Unknown';
    // Parse 24-hour format and convert to 12-hour AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `⏰ ${displayHour}:${minutes} ${ampm}`;
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return 'Unknown';
    return `${runtime} minutes`;
  };

  const stripHTML = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="container-fluid py-3">
      {/* Navigation Actions */}
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-2">
          <Link
            to={`/shows/${showId}/seasons/${seasonNumber}`}
            className="btn btn-secondary"
          >
            ← Back to Season {seasonNumber}
          </Link>
          {show && (
            <Link
              to={`/shows/${showId}`}
              className="btn btn-outline-secondary"
            >
              Back to {show.name}
            </Link>
          )}
        </div>
      </div>

      {/* Episode Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 mb-2">
            Episode {episode.number}: {episode.name || 'Untitled'}
          </h1>
          {show && (
            <p className="text-muted mb-1">
              <strong>{show.name}</strong> - Season {episode.season}
            </p>
          )}
        </div>
      </div>

      {/* Episode Details */}
      <div className="row">
        {/* Show episode info in sidebar only if there's an image, otherwise show inline */}
        {episode.image?.medium && (
          <div className="col-lg-4 col-md-5 mb-4">
            {/* Episode Image */}
            <div className="mb-3 text-center">
              <img
                src={episode.image.medium}
                alt={episode.name || 'Episode image'}
                className="img-fluid rounded"
                style={{ width: '100%', maxWidth: '300px' }}
              />

              {/* Episode Navigation */}
              {allEpisodes.length > 1 && (
                <div className="mt-3 d-flex justify-content-center gap-2">
                  {allEpisodes.find(ep => ep.number === episode.number - 1) && (
                    <Link
                      to={`/shows/${showId}/seasons/${seasonNumber}/episodes/${episode.number - 1}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      ← Previous Episode
                    </Link>
                  )}
                  {allEpisodes.find(ep => ep.number === episode.number + 1) && (
                    <Link
                      to={`/shows/${showId}/seasons/${seasonNumber}/episodes/${episode.number + 1}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Next Episode →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Episode Info Card */}
            <div className="card">
              <div className="card-body">
                {episode.rating?.average && (
                  <div className="mb-3">
                    <span className="badge bg-warning text-dark fs-5 px-3 py-2">
                      ⭐ {episode.rating.average}/10
                    </span>
                  </div>
                )}

                <div className="mb-2">
                  <p className="mb-0"><span className="text-muted">{formatDate(episode.airdate)}</span></p>
                </div>

                {episode.airtime && (
                  <div className="mb-2">
                    <p className="mb-0"><span className="text-muted">{formatTime(episode.airtime)}</span></p>
                  </div>
                )}

                <div className="mb-2">
                  <p className="mb-0"><strong className="me-2">⏱️</strong><span className="text-muted">{formatRuntime(episode.runtime)}</span></p>
                </div>

                {show?.network?.name && (
                  <div className="mb-2">
                    <p className="mb-0"><strong className="me-2">📺</strong><span className="text-muted">{show.network.name}{show.network.country?.name && ` (${show.network.country.name})`}</span></p>
                  </div>
                )}

                {show?.webchannel?.name && (
                  <div className="mb-2">
                    <p className="mb-0"><strong className="me-2">💻</strong><span className="text-muted">{show.webchannel.name}{show.webchannel.country?.name && ` (${show.webchannel.country.name})`}</span></p>
                  </div>
                )}

                {episode.summary && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                    <p className="mb-0">{stripHTML(episode.summary)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={episode.image?.medium ? "col-lg-8 col-md-7" : "col-12"}>
          {/* Episode Navigation when no image */}
          {!episode.image?.medium && allEpisodes.length > 1 && (
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center gap-2">
                {allEpisodes.find(ep => ep.number === episode.number - 1) && (
                  <Link
                    to={`/shows/${showId}/seasons/${seasonNumber}/episodes/${episode.number - 1}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    ← Previous Episode
                  </Link>
                )}
                {allEpisodes.find(ep => ep.number === episode.number + 1) && (
                  <Link
                    to={`/shows/${showId}/seasons/${seasonNumber}/episodes/${episode.number + 1}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Next Episode →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Episode Info when no image */}
          {!episode.image?.medium && (
            <div className="card mb-4">
              <div className="card-body">
                {episode.rating?.average && (
                  <div className="mb-3">
                    <span className="badge bg-warning text-dark fs-5 px-3 py-2">
                      ⭐ {episode.rating.average}/10
                    </span>
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-sm-6 col-md-4">
                    <p className="mb-0"><span className="text-muted">{formatDate(episode.airdate)}</span></p>
                  </div>

                  {episode.airtime && (
                    <div className="col-sm-6 col-md-4">
                      <p className="mb-0"><span className="text-muted">{formatTime(episode.airtime)}</span></p>
                    </div>
                  )}

                  <div className="col-sm-6 col-md-4">
                    <p className="mb-0"><strong className="me-2">⏱️</strong><span className="text-muted">{formatRuntime(episode.runtime)}</span></p>
                  </div>

                  {show?.network?.name && (
                    <div className="col-sm-6 col-md-4">
                      <p className="mb-0"><strong className="me-2">📺</strong><span className="text-muted">{show.network.name}{show.network.country?.name && ` (${show.network.country.name})`}</span></p>
                    </div>
                  )}

                  {show?.webchannel?.name && (
                    <div className="col-sm-6 col-md-4">
                      <p className="mb-0"><strong className="me-2">💻</strong><span className="text-muted">{show.webchannel.name}{show.webchannel.country?.name && ` (${show.webchannel.country.name})`}</span></p>
                    </div>
                  )}
                </div>

                {episode.summary && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                    <p className="mb-0">{stripHTML(episode.summary)}</p>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      </div>

    </div>
  );
};

export default EpisodeDetail;