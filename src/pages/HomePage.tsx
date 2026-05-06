import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';

// Mock data (sẽ lấy từ API sau)
const mockMovies = [
  { id: 101, title: 'Movie 1', posterPath: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop', isPremium: true, progress: 45 },
  { id: 102, title: 'Movie 2', posterPath: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop' },
  { id: 103, title: 'Movie 3', posterPath: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop', isPremium: true },
  { id: 104, title: 'Movie 4', posterPath: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop' },
  { id: 105, title: 'Movie 5', posterPath: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop' },
  { id: 106, title: 'Movie 6', posterPath: 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1000&auto=format&fit=crop', isPremium: true },
  { id: 107, title: 'Movie 7', posterPath: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=1000&auto=format&fit=crop' },
  { id: 108, title: 'Movie 8', posterPath: 'https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=1000&auto=format&fit=crop' },
];

export const HomePage = () => {
  return (
    <div className="pb-16 bg-brand-bg min-h-screen">
      <HeroBanner />
      
      {/* Container for rows to overlap the HeroBanner slightly */}
      <div className="-mt-32 sm:-mt-48 relative z-20 space-y-2">
        <MovieRow title="Đang xem dở" movies={mockMovies.slice(0, 5)} isContinueWatching={true} />
        <MovieRow title="Phim Mới Cập Nhật" movies={mockMovies} />
        <MovieRow title="Phim Độc Quyền 👑" movies={mockMovies.filter(m => m.isPremium)} />
        <MovieRow title="Hành động kịch tính" movies={mockMovies.slice().reverse()} />
        <MovieRow title="Tình cảm lãng mạn" movies={mockMovies.slice(2, 7)} />
      </div>
    </div>
  );
};
