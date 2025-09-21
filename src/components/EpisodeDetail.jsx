import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EpisodeDetail = () => {
  const { showId, seasonNumber, episodeNumber } = useParams();
  const [episode, setEpisode] = useState(null);
  const [show, setShow] = useState(null);
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Unknown';
    return timeString;
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
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
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
          <li className="breadcrumb-item">
            <Link to={`/shows/${showId}/seasons/${seasonNumber}`} className="text-decoration-none">
              Season {seasonNumber}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Episode {episode.number}: {episode.name}
          </li>
        </ol>
      </nav>

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
            <div className="mb-3">
              <img
                src={episode.image.medium}
                alt={episode.name || 'Episode image'}
                className="img-fluid rounded"
                style={{ width: '100%', maxWidth: '300px' }}
              />
            </div>

            {/* Episode Info Card */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Episode Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Air Date:</strong><br />
                  <span className="text-muted">{formatDate(episode.airdate)}</span>
                </div>

                {episode.airtime && (
                  <div className="mb-2">
                    <strong>Air Time:</strong><br />
                    <span className="text-muted">{formatTime(episode.airtime)}</span>
                  </div>
                )}

                <div className="mb-2">
                  <strong>Runtime:</strong><br />
                  <span className="text-muted">{formatRuntime(episode.runtime)}</span>
                </div>

                {episode.type && (
                  <div className="mb-2">
                    <strong>Type:</strong><br />
                    <span className="text-muted">{episode.type}</span>
                  </div>
                )}

                {episode.rating?.average && (
                  <div className="mb-2">
                    <strong>Rating:</strong><br />
                    <span className="text-muted">{episode.rating.average}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={episode.image?.medium ? "col-lg-8 col-md-7" : "col-12"}>
          {/* Episode Info when no image */}
          {!episode.image?.medium && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Episode Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-sm-6 col-md-4">
                    <strong>Air Date:</strong><br />
                    <span className="text-muted">{formatDate(episode.airdate)}</span>
                  </div>

                  {episode.airtime && (
                    <div className="col-sm-6 col-md-4">
                      <strong>Air Time:</strong><br />
                      <span className="text-muted">{formatTime(episode.airtime)}</span>
                    </div>
                  )}

                  <div className="col-sm-6 col-md-4">
                    <strong>Runtime:</strong><br />
                    <span className="text-muted">{formatRuntime(episode.runtime)}</span>
                  </div>

                  {episode.type && (
                    <div className="col-sm-6 col-md-4">
                      <strong>Type:</strong><br />
                      <span className="text-muted">{episode.type}</span>
                    </div>
                  )}

                  {episode.rating?.average && (
                    <div className="col-sm-6 col-md-4">
                      <strong>Rating:</strong><br />
                      <span className="text-muted">{episode.rating.average}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Episode Summary */}
          {episode.summary && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Summary</h5>
              </div>
              <div className="card-body">
                <p className="card-text">{stripHTML(episode.summary)}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Navigation Actions */}
      <div className="row mt-4">
        <div className="col-12">
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
      </div>
    </div>
  );
};

export default EpisodeDetail;