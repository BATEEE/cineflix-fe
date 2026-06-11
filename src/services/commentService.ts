import axiosClient from '../api/axiosClient';

export interface CommentItem {
  id: number;
  movieId: number;
  userId: number;
  userDisplayName: string;
  userAvt: string | null;
  content: string;
  commentDate: string;
  isDeleted: boolean;
}

const commentService = {
  getByMovieId: async (movieId: number) => {
    const response = await axiosClient.get(`/api/comment/movie/${movieId}`);
    return response.data.data as CommentItem[];
  },

  create: async (movieId: number, content: string) => {
    const response = await axiosClient.post('/api/comment', { movieId, content });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosClient.delete(`/api/comment/${id}`);
    return response.data;
  },
};

export default commentService;
