import axiosClient from '../api/axiosClient';

export interface StudioStatCard {
  value: number;
  change: string;
  isPositive: boolean;
}

export interface StudioChartData {
  name: string;
  views: number;
}

export interface StudioTopMovie {
  id: number;
  title: string;
  views: number;
  rating: number;
}

export interface StudioDashboardStats {
  totalMovies: StudioStatCard;
  totalViews: StudioStatCard;
  avgRating: StudioStatCard;
  chartData: StudioChartData[];
  topMovies: StudioTopMovie[];
}

export interface StudioMovieListItem {
  id: number;
  title: string;
  coverImg: string | null;
  movieType: string;
  episodeCount: number;
  views: number;
  isPremium: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface CreateStudioMoviePayload {
  title: string;
  description: string;
  releaseDate: string; // ISO date string (YYYY-MM-DD)
  type: number; // 1 = Phim Lẻ, 2 = Phim Bộ
  coverImg: string | null;
  isPremium: boolean;
  genreIds: number[];
  cast: { personId: number; roleName: string }[];
}

const studioService = {
  getDashboardStats: async () => {
    const response = await axiosClient.get('/api/studio/dashboard/stats');
    return response.data as StudioDashboardStats;
  },

  getMovies: async () => {
    const response = await axiosClient.get('/api/studio/movies');
    return response.data as StudioMovieListItem[];
  },

  getComments: async () => {
    const response = await axiosClient.get('/api/studio/comments');
    return response.data;
  },

  updateSettings: async (payload: { studioName: string; country: string }) => {
    const response = await axiosClient.put('/api/studio/settings', payload);
    return response.data;
  },

  createMovie: async (payload: CreateStudioMoviePayload) => {
    const response = await axiosClient.post('/api/studio/movies', payload);
    return response.data;
  },

  getMovieById: async (movieId: number) => {
    const response = await axiosClient.get(`/api/studio/movies/${movieId}`);
    return response.data as CreateStudioMoviePayload & { id: number };
  },

  updateMovie: async (movieId: number, payload: CreateStudioMoviePayload) => {
    const response = await axiosClient.put(`/api/studio/movies/${movieId}`, payload);
    return response.data;
  },

  getEpisodes: async (movieId: number) => {
    const response = await axiosClient.get(`/api/studio/movies/${movieId}/episodes`);
    return response.data as import('./episodeService').Episode[];
  },

  createEpisode: async (movieId: number, payload: Omit<import('./episodeService').CreateEpisodePayload, 'movieId'>) => {
    const response = await axiosClient.post(`/api/studio/movies/${movieId}/episodes`, payload);
    return response.data;
  },

  updateEpisode: async (episodeId: number, payload: Omit<import('./episodeService').CreateEpisodePayload, 'movieId'>) => {
    const response = await axiosClient.put(`/api/studio/episodes/${episodeId}`, payload);
    return response.data;
  },

  deleteEpisode: async (episodeId: number) => {
    const response = await axiosClient.delete(`/api/studio/episodes/${episodeId}`);
    return response.data;
  }
};

export default studioService;
