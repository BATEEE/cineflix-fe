import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, Film, Search, AlertCircle } from 'lucide-react';
import movieService, { type MovieListItem } from '@/services/movieService';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const results = await movieService.getAll({ search: query });
        setMovies(results);
      } catch (err) {
        console.error("Lỗi tìm kiếm phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-brand-bg pt-[100px] pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1920px] mx-auto">
        {/* Tiêu đề tìm kiếm */}
        <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
          <Search className="w-6 h-6 text-brand-red" />
          <h1 className="text-xl sm:text-2xl font-medium text-white">
            Kết quả tìm kiếm cho: <span className="text-brand-red font-semibold">"{query}"</span>
          </h1>
        </div>

        {loading ? (
          /* Trạng thái đang tải cao cấp */
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-brand-red rounded-full animate-spin" />
            <span className="text-zinc-400 text-sm animate-pulse tracking-wider">Đang tìm kiếm bộ phim phù hợp...</span>
          </div>
        ) : movies.length === 0 ? (
          /* Không tìm thấy phim */
          <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-zinc-900/20 border border-zinc-900 rounded-xl p-8 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900/60 flex items-center justify-center border border-zinc-800 shadow-inner">
              <AlertCircle className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-white">Không tìm thấy kết quả</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Chúng tôi không tìm thấy bộ phim nào phù hợp với từ khóa của bạn. Hãy thử tìm kiếm bằng tên phim khác hoặc kiểm tra lại chính tả.
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg"
            >
              Trở về Trang chủ
            </Link>
          </div>
        ) : (
          /* Grid danh sách phim */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="relative group rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 hover:scale-105 hover:z-20 shadow-md"
              >
                <Link to={`/movie/${movie.id}`} className="block w-full h-full aspect-[2/3] relative">
                  <img
                    src={movie.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Premium Badge */}
                  {movie.isPremium && (
                    <div className="absolute top-2 left-2 bg-brand-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      👑 VIP
                    </div>
                  )}

                  {/* Hover overlay with Play button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-5 h-5 text-white ml-1 fill-white" />
                    </div>
                    <span className="text-white font-medium text-xs text-center line-clamp-2">{movie.title}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
