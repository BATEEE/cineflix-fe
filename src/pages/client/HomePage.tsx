import React, { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import movieService, { type MovieListItem } from '@/services/movieService';
import watchHistoryService, { type WatchHistoryItem } from '@/services/watchHistoryService';
import { useAuthStore } from '@/stores/authStore';

export const HomePage = () => {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [latestMovies, setLatestMovies] = useState<MovieListItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Fetch tất cả phim
    movieService.getAll().then(setMovies).catch(console.error);

    // Fetch top 10 phim mới nhất
    movieService.getLatest().then(setLatestMovies).catch(console.error);

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

  const latestMoviesRow = latestMovies.map(mapToRowItem);
  const premiumMovies = movies.filter(m => m.isPremium).map(mapToRowItem);

  // Group history theo movieId, chỉ giữ lại tập mới nhất được xem (dựa trên lastWatchedAt)
  const groupedHistory = history.reduce<Record<number, WatchHistoryItem>>((acc, item) => {
    const existing = acc[item.movieId];
    if (!existing || new Date(item.lastWatchedAt) > new Date(existing.lastWatchedAt)) {
      acc[item.movieId] = item;
    }
    return acc;
  }, {});

  const latestHistoryItems = Object.values(groupedHistory).sort((a, b) => 
    new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
  );

  const historyMovies = latestHistoryItems.map(h => ({
    id: h.movieId,
    title: h.episodeTitle ? `${h.movieTitle} - ${h.episodeTitle}` : `${h.movieTitle} - Tập ${h.episodeNumber}`,
    posterPath: h.movieCoverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    isPremium: false,
    progress: 60, // Hiển thị progress bar xem dở
    targetUrl: `/watch/${h.movieId}?episode=${h.episodeId}` // Chuyển hướng trực tiếp đến tập đang xem
  }));

  return (
    <div className="pb-16 bg-brand-bg min-h-screen">
      <HeroBanner />
      
      {/* Container for rows to overlap the HeroBanner slightly */}
      <div className="-mt-32 sm:-mt-48 relative z-20 space-y-2">
        {isAuthenticated && historyMovies.length > 0 && (
          <MovieRow title="Đang xem dở" movies={historyMovies} isContinueWatching={true} />
        )}
        <MovieRow title="Phim Mới Cập Nhật" movies={latestMoviesRow} />
        <MovieRow title="Phim Độc Quyền 👑" movies={premiumMovies} />
      </div>
    </div>
  );
};
