import axiosClient from '../api/axiosClient';

export interface Genre {
  id: number;
  genrename: string;
  isDeleted?: boolean;
}

const genreService = {
  getAll: async (includeDeleted: boolean = false) => {
    const response = await axiosClient.get(`/api/genre?includeDeleted=${includeDeleted}`);
    return response.data.data as Genre[];
  },

  create: async (name: string) => {
    const response = await axiosClient.post('/api/genre', { name });
    return response.data;
  },

  update: async (id: number, name: string) => {
    const response = await axiosClient.put(`/api/genre/${id}`, { name });
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await axiosClient.patch(`/api/genre/${id}/toggle`);
    return response.data;
  },
};

export default genreService;
