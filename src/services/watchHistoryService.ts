import axiosClient from '../api/axiosClient';

export interface WatchHistoryItem {
  episodeId: number;
  movieId: number;
  movieTitle: string;
  movieCoverImg: string | null;
  episodeTitle: string | null;
  episodeNumber: number;
  seasonNumber: number | null;
  stoppedAtSeconds: number;
  lastWatchedAt: string;
}

const watchHistoryService = {
  getHistory: async () => {
    const response = await axiosClient.get('/api/watchhistory');
    return response.data.data as WatchHistoryItem[];
  },

  getProgress: async (episodeId: number) => {
    const response = await axiosClient.get(`/api/watchhistory/progress/${episodeId}`);
    return response.data.data as WatchHistoryItem | null;
  },

  saveProgress: async (episodeId: number, stoppedAtSeconds: number) => {
    const response = await axiosClient.post('/api/watchhistory', { episodeId, stoppedAtSeconds });
    return response.data;
  },

  /**
   * Ghi 1 lượt xem vào view_logs và tăng totalviews của movie.
   * Gọi 1 lần duy nhất khi bắt đầu xem — cả khách vãng lai cũng được tính.
   */
  logView: async (movieId: number, episodeId: number | null) => {
    const response = await axiosClient.post('/api/watchhistory/view', { movieId, episodeId });
    return response.data;
  },
};

export default watchHistoryService;
