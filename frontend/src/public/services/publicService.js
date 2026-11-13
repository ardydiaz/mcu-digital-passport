import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../services/apiEndpoints';

// Endpoints for public (unauthenticated) pages
export const getPublicActivities = () => apiClient(API_ENDPOINTS.PUBLIC_ACTIVITIES);
export const getPublicActivity = (id) => apiClient(`${API_ENDPOINTS.PUBLIC_ACTIVITIES}/${id}`);
export const getLeaderboard = () => apiClient(API_ENDPOINTS.PUBLIC_LEADERBOARD);
export const getPublicStatistics = () => apiClient(API_ENDPOINTS.PUBLIC_STATISTICS);
