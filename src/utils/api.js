// API utility functions for handling URLs in different environments

export const getApiUrl = (endpoint) => {
  // In development, use relative URLs (proxy will handle routing)
  if (import.meta.env.DEV) {
    return endpoint;
  }

  // In production, route to the appropriate service based on what data is being requested

  // Show-related requests (search, show details)
  if (endpoint.includes('/search') || endpoint.match(/^\/api\/shows\/\d+$/)) {
    const baseUrl = import.meta.env.VITE_SHOW_SERVICE_URL;
    return endpoint.replace('/api/shows', `${baseUrl}/api/shows`);
  }

  // Season-related requests (season lists, season details)
  if (endpoint.includes('/seasons')) {
    const baseUrl = import.meta.env.VITE_SEASON_SERVICE_URL;
    return `${baseUrl}${endpoint}`;
  }

  // Episode-related requests
  if (endpoint.includes('/episodes')) {
    const baseUrl = import.meta.env.VITE_EPISODE_SERVICE_URL;
    return `${baseUrl}${endpoint}`;
  }

  // Fallback to show service for any other /api/shows requests
  if (endpoint.startsWith('/api/shows')) {
    const baseUrl = import.meta.env.VITE_SHOW_SERVICE_URL;
    return endpoint.replace('/api/shows', `${baseUrl}/api/shows`);
  }

  // Fallback to original endpoint
  return endpoint;
};