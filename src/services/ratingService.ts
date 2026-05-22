import axiosClient from '../api/axiosClient';

export interface UpsertRatingPayload {
  movieId: number;
  score: number;
}

const ratingService = {
  upsert: async (payload: UpsertRatingPayload) => {
    const response = await axiosClient.post('/api/rating', payload);
    return response.data;
  },

  getUserRating: async (movieId: number) => {
    const response = await axiosClient.get(`/api/rating/${movieId}`);
    return response.data.data as number | null; // return the score or null
  }
};

export default ratingService;
