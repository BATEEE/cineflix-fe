import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Heart, Share2, Star, Clock, Calendar } from 'lucide-react';
import { TrailerModal } from '@/components/TrailerModal';

// Mock data (sẽ lấy từ API sau)
const mockMovieDetail = {
  id: 1,
  title: "Stranger Things 4",
  originalTitle: "Stranger Things Season 4",
  description: "Đã 6 tháng kể từ Trận chiến Starcourt, nơi mang đến nỗi kinh hoàng và sự hủy diệt cho Hawkins. Giờ đây, nhóm bạn của chúng ta bị chia cắt lần đầu tiên...",
  backdropPath: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
  posterPath: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
  rating: 8.7,
  year: 2022,
  duration: "9 Tập",
  genres: ["Khoa học viễn tưởng", "Kinh dị", "Chính kịch"],
  studios: ["Netflix", "21 Laps Entertainment"],
  type: 2, // 1: Movie, 2: TV Show
  trailerUrl: "https://www.youtube.com/watch?v=yQEondeGvKo",
  cast: [
    { id: 1, name: "Millie Bobby Brown", character: "Eleven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Millie" },
    { id: 2, name: "Finn Wolfhard", character: "Mike Wheeler", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn" },
    { id: 3, name: "Noah Schnapp", character: "Will Byers", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah" },
    { id: 4, name: "Caleb McLaughlin", character: "Lucas Sinclair", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb" },
    { id: 5, name: "Sadie Sink", character: "Max Mayfield", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sadie" },
  ],
  episodes: [
    { id: 101, title: "Tập 1: Câu lạc bộ Hellfire", duration: "1h 18m", image: "https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1000&auto=format&fit=crop" },
    { id: 102, title: "Tập 2: Lời nguyền của Vecna", duration: "1h 17m", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop" },
    { id: 103, title: "Tập 3: Kẻ sát nhân", duration: "1h 3m", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop" },
  ]
};

export const MovieDetailPage = () => {
  const { id } = useParams();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Todo: Fetch movie details using id

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-16">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        {/* Blurred Backdrop */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={mockMovieDetail.backdropPath}
            alt={mockMovieDetail.title}
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 h-full flex flex-col md:flex-row items-center md:items-end pb-12 gap-8">
          {/* Poster */}
          <div className="hidden md:block w-64 lg:w-80 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img src={mockMovieDetail.posterPath} alt={mockMovieDetail.title} className="w-full h-auto object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 mt-24 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tight">
              {mockMovieDetail.title}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium mb-6">
              {mockMovieDetail.originalTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-6">
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Star className="w-4 h-4 fill-green-400" />
                {mockMovieDetail.rating}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {mockMovieDetail.year}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {mockMovieDetail.duration}
              </span>
              <span>|</span>
              <span>{mockMovieDetail.genres.join(', ')}</span>
            </div>

            <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-3xl mb-8 line-clamp-4">
              {mockMovieDetail.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/watch/${mockMovieDetail.id}`}
                className="flex items-center justify-center gap-2 bg-brand-red text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20"
              >
                <Play className="w-5 h-5 fill-white" />
                Xem Phim
              </Link>
              
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-md font-semibold hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Trailer
              </button>
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-colors backdrop-blur-md ${
                  isFavorite ? 'bg-pink-500/20 text-pink-500 border border-pink-500/50' : 'bg-white/5 text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
              </button>
              
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-md font-semibold hover:bg-white/10 transition-colors backdrop-blur-md">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Cast */}
          <section>
            <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-brand-red pl-3">Dàn Diễn Viên</h3>
            <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
              {mockMovieDetail.cast.map(actor => (
                <div key={actor.id} className="flex flex-col items-center min-w-[100px]">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10">
                    <img src={actor.avatar} alt={actor.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-sm font-medium text-center line-clamp-1">{actor.name}</span>
                  <span className="text-gray-400 text-xs text-center line-clamp-1">{actor.character}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Episodes List (if TV Show) */}
          {mockMovieDetail.type === 2 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white border-l-4 border-brand-red pl-3">Danh sách Tập phim</h3>
                <span className="text-gray-400 text-sm">Phần 1</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {mockMovieDetail.episodes.map(ep => (
                  <Link 
                    key={ep.id} 
                    to={`/watch/${mockMovieDetail.id}?episode=${ep.id}`}
                    className="flex flex-col sm:flex-row gap-4 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors group"
                  >
                    <div className="w-full sm:w-48 aspect-video rounded-md overflow-hidden relative shrink-0">
                      <img src={ep.image} alt={ep.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/50">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center py-2">
                      <h4 className="text-white font-medium text-lg mb-1">{ep.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{ep.duration}</p>
                      <p className="text-gray-500 text-sm line-clamp-2">Mô tả ngắn gọn về nội dung tập phim này. Nhóm bạn đang cố gắng tìm cách thoát khỏi tình huống hiểm nghèo...</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4">Thông tin thêm</h4>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Hãng sản xuất</span>
                <span className="text-white">{mockMovieDetail.studios.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Đạo diễn</span>
                <span className="text-white">The Duffer Brothers</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Ngôn ngữ gốc</span>
                <span className="text-white">Tiếng Anh (English)</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Độ tuổi</span>
                <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">16+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoUrl={mockMovieDetail.trailerUrl} 
      />
    </div>
  );
};
