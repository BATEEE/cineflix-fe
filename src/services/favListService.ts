import axiosClient from '../api/axiosClient';

export interface FavListItem {
  movieId: number;
  title: string;
  coverImg: string | null;
  isPremium: boolean;
  avgRating: number;
  addedDate: string;
}

const favListService = {
  getMyList: async () => {
    const response = await axiosClient.get('/api/favlist');
    return response.data.data as FavListItem[];
  },

  add: async (movieId: number) => {
    const response = await axiosClient.post('/api/favlist', { movieId });
    return response.data;
  },

  remove: async (movieId: number) => {
    const response = await axiosClient.delete(`/api/favlist/${movieId}`);
    return response.data;
  },

  check: async (movieId: number) => {
    const response = await axiosClient.get(`/api/favlist/check/${movieId}`);
    return response.data.data as boolean;
  },
};

export default favListService;
