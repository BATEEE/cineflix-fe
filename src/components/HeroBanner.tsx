import React from 'react';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

// Dữ liệu mẫu (sau này lấy từ API)
const mockHeroMovie = {
  id: 1,
  title: "Stranger Things 4",
  description: "Đã 6 tháng kể từ Trận chiến Starcourt, nơi mang đến nỗi kinh hoàng và sự hủy diệt cho Hawkins. Giờ đây, nhóm bạn của chúng ta bị chia cắt lần đầu tiên...",
  backdropPath: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
  rating: 8.7,
  year: 2022,
};

export const HeroBanner = () => {
  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] lg:h-[100vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={mockHeroMovie.backdropPath}
          alt={mockHeroMovie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays to blend into background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 mt-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-brand-red font-bold tracking-widest text-sm drop-shadow-md">NỔI BẬT HÔM NAY</span>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-medium text-sm drop-shadow-md">{mockHeroMovie.rating} Điểm</span>
              <span className="text-gray-300 text-sm drop-shadow-md">{mockHeroMovie.year}</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg leading-tight">
            {mockHeroMovie.title}
          </h1>
          
          <p className="text-lg text-gray-200 mb-8 max-w-xl drop-shadow-md leading-relaxed line-clamp-3">
            {mockHeroMovie.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/watch/${mockHeroMovie.id}`}
              className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              <Play className="w-6 h-6 fill-black" />
              Phát
            </Link>
            <Link
              to={`/movie/${mockHeroMovie.id}`}
              className="flex items-center justify-center gap-2 bg-gray-500/50 text-white px-8 py-3.5 rounded-md font-bold text-lg hover:bg-gray-500/70 transition-colors backdrop-blur-sm"
            >
              <Info className="w-6 h-6" />
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
