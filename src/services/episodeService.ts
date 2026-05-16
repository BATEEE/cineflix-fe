import axiosClient from '../api/axiosClient';

export interface Episode {
  id: number;
  movieId: number;
  episodeNumber: number;
  seasonNumber: number | null;
  episodeTitle: string | null;
  videoUrl: string;
  duration: string | null;
  releaseDate: string | null;
  videoType: number; // 1=Trailer, 2=Main
}

export interface CreateEpisodePayload {
  movieId: number;
  episodeNumber: number;
  seasonNumber?: number;
  episodeTitle?: string;
  videoUrl: string;
  duration?: string;
  releaseDate?: string;
  videoType: number;
}

const episodeService = {
  getByMovieId: async (movieId: number) => {
    const response = await axiosClient.get(`/api/episode/movie/${movieId}`);
    return response.data.data as Episode[];
  },

  create: async (payload: CreateEpisodePayload) => {
    const response = await axiosClient.post('/api/episode', payload);
    return response.data;
  },

  update: async (id: number, payload: Omit<CreateEpisodePayload, 'movieId'>) => {
    const response = await axiosClient.put(`/api/episode/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosClient.delete(`/api/episode/${id}`);
    return response.data;
  },
};

export default episodeService;
