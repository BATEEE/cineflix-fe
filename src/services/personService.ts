import axiosClient from '../api/axiosClient';

export interface Person {
  id: number;
  fullname: string;
  avatar: string | null;
  isDeleted?: boolean;
}

const personService = {
  getAll: async (includeDeleted: boolean = false) => {
    const response = await axiosClient.get(`/api/person?includeDeleted=${includeDeleted}`);
    return response.data.data as Person[];
  },

  create: async (formData: FormData) => {
    const response = await axiosClient.post('/api/person', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, formData: FormData) => {
    const response = await axiosClient.put(`/api/person/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await axiosClient.patch(`/api/person/${id}/toggle`);
    return response.data;
  },
};

export default personService;
