import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Heart, Share2, Star, Clock, Calendar } from 'lucide-react';
import { TrailerModal } from '@/components/TrailerModal';
import movieService, { type MovieDetail } from '@/services/movieService';
import favListService from '@/services/favListService';
import { useAuthStore } from '@/stores/authStore';

export const MovieDetailPage = () => {
  const { id } = useParams();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      try {
        const data = await movieService.getById(Number(id));
        setMovieDetail(data);

        if (isAuthenticated) {
          const favStatus = await favListService.check(Number(id));
          setIsFavorite(favStatus);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !movieDetail) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    
    try {
      if (isFavorite) {
        await favListService.remove(movieDetail.id);
        setIsFavorite(false);
      } else {
        await favListService.add(movieDetail.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-white">Đang tải...</div>;
  if (!movieDetail) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-white">Không tìm thấy phim.</div>;

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-16">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        {/* Blurred Backdrop */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={movieDetail.coverImg || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop'}
            alt={movieDetail.title}
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 h-full flex flex-col md:flex-row items-center md:items-end pb-12 gap-8">
          {/* Poster */}
          <div className="hidden md:block w-64 lg:w-80 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img src={movieDetail.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop'} alt={movieDetail.title} className="w-full h-auto object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 mt-24 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tight">
              {movieDetail.title}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium mb-6">
              {/* Optional: Original Title field missing in new schema, maybe use title */}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-6">
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Star className="w-4 h-4 fill-green-400" />
                {movieDetail.avgRating}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {movieDetail.releaseDate?.substring(0, 4)}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {movieDetail.episodes?.length || 1} Tập
              </span>
              <span>|</span>
              <span>{movieDetail.genres?.join(', ')}</span>
            </div>

            <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-3xl mb-8 line-clamp-4">
              {movieDetail.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/watch/${movieDetail.id}`}
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
                onClick={toggleFavorite}
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
              {movieDetail.cast?.map(actor => (
                <div key={actor.personId} className="flex flex-col items-center min-w-[100px]">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10">
                    <img src={actor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${actor.fullName}`} alt={actor.fullName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-sm font-medium text-center line-clamp-1">{actor.fullName}</span>
                  <span className="text-gray-400 text-xs text-center line-clamp-1">{actor.roleName}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Đối với Phim Lẻ (movieDetail.type === 1) */}
          {movieDetail.type === 1 && movieDetail.episodes?.length > 0 && (
            <section className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-brand-red pl-3">Nội dung & Video liên quan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột 1: Trailer & Teaser */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-zinc-300 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />
                    Trailer & Teaser
                  </h4>
                  {movieDetail.episodes.filter(ep => ep.videoType === 2).length === 0 ? (
                    <p className="text-sm text-zinc-500 italic py-4">Chưa có Trailer/Teaser nào cho phim này.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {movieDetail.episodes.filter(ep => ep.videoType === 2).map(ep => (
                        <Link 
                          key={ep.id} 
                          to={`/watch/${movieDetail.id}?episode=${ep.id}`}
                          className="flex gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-colors group"
                        >
                          <div className="w-28 aspect-video rounded overflow-hidden relative shrink-0">
                            <img src={movieDetail.coverImg || 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1000&auto=format&fit=crop'} alt={ep.episodeTitle || 'Trailer'} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h5 className="text-white font-medium text-sm line-clamp-1 group-hover:text-brand-red transition-colors">{ep.episodeTitle || "Trailer chính thức"}</h5>
                            <span className="text-zinc-500 text-xs mt-1">{ep.duration || 'N/A'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cột 2: Tập Phim Chính Thức */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-zinc-300 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    Tập Phim Chính Thức
                  </h4>
                  {movieDetail.episodes.filter(ep => ep.videoType === 1).length === 0 ? (
                    <p className="text-sm text-zinc-500 italic py-4">Chưa có tập phim chính thức nào được đăng tải.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {movieDetail.episodes.filter(ep => ep.videoType === 1).map(ep => (
                        <Link 
                          key={ep.id} 
                          to={`/watch/${movieDetail.id}?episode=${ep.id}`}
                          className="flex gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-colors group border border-transparent hover:border-green-500/20"
                        >
                          <div className="w-28 aspect-video rounded overflow-hidden relative shrink-0">
                            <img src={movieDetail.coverImg || 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1000&auto=format&fit=crop'} alt={ep.episodeTitle || 'Tập chính thức'} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h5 className="text-white font-medium text-sm line-clamp-1 group-hover:text-green-400 transition-colors">{ep.episodeTitle || `Tập ${ep.episodeNumber}`}</h5>
                            <span className="text-zinc-500 text-xs mt-1">{ep.duration || 'N/A'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Episodes List (if TV Show) */}
          {movieDetail.type === 2 && movieDetail.episodes?.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white border-l-4 border-brand-red pl-3">Danh sách Tập phim</h3>
              </div>
              
              <div className="flex flex-col gap-4">
                {movieDetail.episodes.map(ep => (
                  <Link 
                    key={ep.id} 
                    to={`/watch/${movieDetail.id}?episode=${ep.id}`}
                    className="flex flex-col sm:flex-row gap-4 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors group"
                  >
                    <div className="w-full sm:w-48 aspect-video rounded-md overflow-hidden relative shrink-0">
                      <img src={movieDetail.coverImg || 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1000&auto=format&fit=crop'} alt={ep.episodeTitle || `Tập ${ep.episodeNumber}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/50">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center py-2">
                      <h4 className="text-white font-medium text-lg mb-1">{ep.episodeTitle || `Tập ${ep.episodeNumber}`}</h4>
                      <p className="text-gray-400 text-sm mb-2">{ep.duration || 'N/A'}</p>
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
                <span className="text-white">{movieDetail.studioName}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Thể loại</span>
                <span className="text-white">{movieDetail.genres?.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Loại</span>
                <span className="text-white">{movieDetail.type === 1 ? 'Phim Lẻ' : 'Phim Bộ'}</span>
              </div>
              {movieDetail.isPremium && (
                <div>
                  <span className="inline-block bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">👑 PREMIUM</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoUrl={movieDetail.episodes?.find(e => e.videoType === 1)?.episodeTitle || "https://www.youtube.com/watch?v=yQEondeGvKo"} 
      />
    </div>
  );
};

