import React, { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import movieService, { type MovieListItem } from '@/services/movieService';
import watchHistoryService, { type WatchHistoryItem } from '@/services/watchHistoryService';
import { useAuthStore } from '@/stores/authStore';

export const HomePage = () => {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Fetch tất cả phim
    movieService.getAll().then(setMovies).catch(console.error);

    // Fetch lịch sử xem nếu đã đăng nhập
    if (isAuthenticated) {
      watchHistoryService.getHistory().then(setHistory).catch(console.error);
    }
  }, [isAuthenticated]);

  // Convert sang format mà MovieRow cần
  const mapToRowItem = (m: MovieListItem) => ({
    id: m.id,
    title: m.title,
    posterPath: m.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    isPremium: m.isPremium
  });

  const rowMovies = movies.map(mapToRowItem);
  const premiumMovies = movies.filter(m => m.isPremium).map(mapToRowItem);

  const historyMovies = history.map(h => ({
    id: h.movieId,
    title: h.movieTitle,
    posterPath: h.movieCoverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    isPremium: false, // History không care premium label lắm vì đã xem được rồi
    progress: h.stoppedAtSeconds > 0 ? 50 : 0 // Tạm thời để 50% nếu đã xem
  }));

  return (
    <div className="pb-16 bg-brand-bg min-h-screen">
      <HeroBanner />
      
      {/* Container for rows to overlap the HeroBanner slightly */}
      <div className="-mt-32 sm:-mt-48 relative z-20 space-y-2">
        {isAuthenticated && historyMovies.length > 0 && (
          <MovieRow title="Đang xem dở" movies={historyMovies} isContinueWatching={true} />
        )}
        <MovieRow title="Phim Mới Cập Nhật" movies={rowMovies} />
        <MovieRow title="Phim Độc Quyền 👑" movies={premiumMovies} />
      </div>
    </div>
  );
};
