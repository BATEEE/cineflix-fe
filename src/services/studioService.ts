import axiosClient from '../api/axiosClient';

export interface Studio {
  id: number;
  studioname: string;
  country: string | null;
}

const studioService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/studio');
    return response.data.data as Studio[];
  },

  create: async (name: string, country?: string) => {
    const response = await axiosClient.post('/api/studio', { name, country });
    return response.data;
  },
};

export default studioService;
