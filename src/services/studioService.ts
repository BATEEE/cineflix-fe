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
  }
};

export default studioService;
