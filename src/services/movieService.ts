import axiosClient from '../api/axiosClient';

export interface MovieListItem {
  id: number;
  title: string;
  description: string | null;
  coverImg: string | null;
  releaseDate: string;
  type: number; // 1=Phim lẻ, 2=Phim bộ
  studioName: string;
  avgRating: number;
  totalViews: number;
  isPremium: boolean;
  isDeleted: boolean;
  genres: string[];
}

export interface CastMember {
  personId: number;
  fullName: string;
  avatar: string | null;
  roleName: string;
}

export interface EpisodeSummary {
  id: number;
  episodeNumber: number;
  seasonNumber: number | null;
  episodeTitle: string | null;
  duration: string | null;
  videoType: number;
  videoUrl: string | null;
}

export interface MovieDetail extends MovieListItem {
  studioId: number;
  cast: CastMember[];
  episodes: EpisodeSummary[];
}

export interface CreateMoviePayload {
  title: string;
  description?: string;
  coverImg?: string;
  releaseDate: string;
  type: number;
  studioId: number;
  isPremium: boolean;
  genreIds: number[];
}

const movieService = {
  getAll: async (params?: { search?: string; type?: number; genreId?: number; isPremium?: boolean }) => {
    const response = await axiosClient.get('/api/movie', { params });
    return response.data.data as MovieListItem[];
  },

  getLatest: async (type?: number) => {
    const response = await axiosClient.get('/api/movie/latest', { params: { type } });
    return response.data.data as MovieListItem[];
  },

  getTrending: async (type?: number) => {
    const response = await axiosClient.get('/api/movie/trending', { params: { type } });
    return response.data.data as MovieListItem[];
  },

  getById: async (id: number) => {
    const response = await axiosClient.get(`/api/movie/${id}`);
    return response.data.data as MovieDetail;
  },

  create: async (payload: CreateMoviePayload) => {
    const response = await axiosClient.post('/api/movie', payload);
    return response.data;
  },

  update: async (id: number, payload: CreateMoviePayload) => {
    const response = await axiosClient.put(`/api/movie/${id}`, payload);
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await axiosClient.patch(`/api/movie/${id}/toggle`);
    return response.data;
  },
};

export default movieService;
