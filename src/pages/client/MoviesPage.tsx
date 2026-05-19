import React, { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import movieService, { type MovieListItem } from '@/services/movieService';

export const MoviesPage = () => {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [latestMovies, setLatestMovies] = useState<MovieListItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieListItem[]>([]);

  useEffect(() => {
    // Fetch tất cả phim lẻ để lấy phim Độc Quyền (isPremium)
    movieService.getAll({ type: 1 }).then(setMovies).catch(console.error);

    // Fetch top 10 phim lẻ mới nhất
    movieService.getLatest(1).then(setLatestMovies).catch(console.error);

    // Fetch top 10 phim lẻ thịnh hành trong 7 ngày qua
    movieService.getTrending(1).then(setTrendingMovies).catch(console.error);
  }, []);

  // Convert sang format mà MovieRow cần
  const mapToRowItem = (m: MovieListItem) => ({
    id: m.id,
    title: m.title,
    posterPath: m.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    isPremium: m.isPremium
  });

  const trendingMoviesRow = trendingMovies.map(mapToRowItem);
  const latestMoviesRow = latestMovies.map(mapToRowItem);
  const premiumMovies = movies.filter(m => m.isPremium).map(mapToRowItem);

  return (
    <div className="pb-16 bg-brand-bg min-h-screen">
      <HeroBanner />
      
      {/* Container for rows to overlap the HeroBanner slightly */}
      <div className="-mt-32 sm:-mt-48 relative z-20 space-y-2">
        <MovieRow title="Phim Lẻ Thịnh Hành" movies={trendingMoviesRow} />
        <MovieRow title="Phim Lẻ Mới Cập Nhật" movies={latestMoviesRow} />
        <MovieRow title="Phim Lẻ Độc Quyền 👑" movies={premiumMovies} />
      </div>
    </div>
  );
};
