import axiosClient from '../api/axiosClient';

export interface MovieListItem {
  id: number;
  title: string;
  description: string | null;
  coverImg: string | null;
  releaseDate: string;
  type: number; // 1=Phim lẻ, 2=Phim bộ
  studioName: string;
  country?: string | null;
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

export interface MovieDto {
  id: number;
  title: string;
  coverImg: string;
  avgRating: number;
  isPremium: boolean;
  type: number;
  genres: string[];
}

export interface HomeFeedDto {
  hotMovies: MovieDto[];
  newMovies: MovieDto[];
  topRatedMovies: MovieDto[];
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ExploreParams {
  search?: string;
  type?: number;
  genreId?: number;
  country?: string;
  year?: number;
  sortBy?: string;
  isPremium?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export const cleanParams = <T extends Record<string, any>>(params: T): Partial<T> => {
  const cleaned: Partial<T> = {};
  for (const key in params) {
    const val = params[key];
    if (val !== null && val !== undefined && val !== '') {
      cleaned[key] = val;
    }
  }
  return cleaned;
};

const movieService = {
  getAll: async (params?: { 
    search?: string; 
    type?: number; 
    genreId?: number; 
    isPremium?: boolean;
    country?: string;
    year?: number;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
  }) => {
    const cleaned = params ? cleanParams(params) : undefined;
    const response = await axiosClient.get('/api/movie', { params: cleaned });
    return response.data.data;
  },

  getLatest: async (type?: number) => {
    const response = await axiosClient.get('/api/movie/latest', { params: { type } });
    return response.data.data as MovieListItem[];
  },

  getTrending: async (type?: number) => {
    const response = await axiosClient.get('/api/movie/trending', { params: { type } });
    return response.data.data as MovieListItem[];
  },

  getHomeFeed: async () => {
    const response = await axiosClient.get('/api/movie/home-feed');
    return response.data.data as HomeFeedDto;
  },

  getExplore: async (params?: ExploreParams) => {
    const cleaned = params ? cleanParams(params) : undefined;
    const response = await axiosClient.get('/api/movie/explore', { params: cleaned });
    return response.data.data as PagedResult<MovieListItem>;
  },

  getCountries: async () => {
    const response = await axiosClient.get('/api/movie/countries');
    return response.data.data as string[];
  },

  getYears: async () => {
    const response = await axiosClient.get('/api/movie/years');
    return response.data.data as number[];
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
