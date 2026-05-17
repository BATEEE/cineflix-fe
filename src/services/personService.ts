import axiosClient from '../api/axiosClient';

export interface Person {
  id: number;
  fullname: string;
  avatar: string | null;
}

const personService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/person');
    return response.data.data as Person[];
  }
};

export default personService;
