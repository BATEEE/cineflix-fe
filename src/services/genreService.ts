import axiosClient from '../api/axiosClient';

export interface Genre {
  id: number;
  genrename: string;
}

const genreService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/genre');
    return response.data.data as Genre[];
  },

  create: async (name: string) => {
    const response = await axiosClient.post('/api/genre', { name });
    return response.data;
  },
};

export default genreService;
