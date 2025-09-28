// API utility functions for handling URLs in different environments

export const getApiUrl = (endpoint) => {
  // In development, use relative URLs (proxy will handle routing)
  if (import.meta.env.DEV) {
    return endpoint;
  }

  // In production, use environment variables for absolute URLs
  if (endpoint.startsWith('/api/shows')) {
    const baseUrl = import.meta.env.VITE_SHOW_SERVICE_URL;
    return endpoint.replace('/api/shows', baseUrl);
  }

  if (endpoint.startsWith('/api/seasons')) {
    const baseUrl = import.meta.env.VITE_SEASON_SERVICE_URL;
    return endpoint.replace('/api/seasons', baseUrl);
  }

  if (endpoint.startsWith('/api/episodes')) {
    const baseUrl = import.meta.env.VITE_EPISODE_SERVICE_URL;
    return endpoint.replace('/api/episodes', baseUrl);
  }

  // Fallback to original endpoint
  return endpoint;
};