import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Play, Search, AlertCircle, Star } from "lucide-react";
import movieService, { type MovieListItem } from "@/services/movieService";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
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

    if (query) {
      fetchResults();
    } else {
      setMovies([]);
      setLoading(false);
    }
  }, [query]);

  // Helper xử lý link ảnh: Nếu là chuỗi rỗng -> ảnh mặc định, nếu là path tương đối -> nối với backend URL
  const getImageUrl = (url?: string | null) => {
    if (!url || url.trim() === "") {
      return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";
    }
    if (url.startsWith("http")) return url;
    return `http://localhost:5063${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-[100px] pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1920px] mx-auto">
        {/* Tiêu đề tìm kiếm */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <Search className="w-6 h-6 text-brand-red" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Kết quả tìm kiếm cho:{" "}
            <span className="text-brand-red">"{query}"</span>
          </h1>
        </div>

        {loading ? (
          /* Trạng thái đang tải cao cấp */
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-brand-red rounded-full animate-spin" />
            <span className="text-zinc-400 text-sm animate-pulse tracking-wider">
              Đang tìm kiếm bộ phim phù hợp...
            </span>
          </div>
        ) : movies.length === 0 ? (
          /* Không tìm thấy phim */
          <div className="flex flex-col items-center justify-center py-24 space-y-5 bg-zinc-900/40 border border-white/5 rounded-xl p-8 max-w-lg mx-auto shadow-xl backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center border border-white/10 shadow-inner">
              <AlertCircle className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Không tìm thấy kết quả
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Chúng tôi không tìm thấy bộ phim nào phù hợp với "{query}". Hãy
                thử tìm kiếm bằng tên phim khác hoặc kiểm tra lại chính tả nhé.
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-2.5 bg-brand-red hover:bg-[#C11119] text-white font-bold text-sm rounded transition-colors shadow-[0_0_15px_rgba(229,9,20,0.3)]"
            >
              Trở về Trang chủ
            </Link>
          </div>
        ) : (
          /* Grid danh sách phim */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-10">
            {movies.map((movie) => {
              const cover =
                movie.coverImg ||
                (movie as any).coverimg ||
                (movie as any).Coverimg;
              const rating =
                movie.avgRating ??
                (movie as any).avgrating ??
                (movie as any).Avgrating;
              const typeText =
                movie.type === 1
                  ? "Phim lẻ"
                  : movie.type === 2
                    ? "Phim bộ"
                    : undefined;

              return (
                <div key={movie.id} className="relative group">
                  <div className="relative rounded-md overflow-hidden bg-gray-900 transition-transform duration-300 group-hover:scale-105 group-hover:z-20 shadow-md">
                    <Link
                      to={`/movie/${movie.id}`}
                      className="block w-full h-full aspect-[2/3] relative"
                    >
                      <img
                        src={getImageUrl(cover)}
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
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-5 h-5 text-white ml-1 fill-white" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Movie Info (Title, Rating, Genres) - Same as modern MovieRow */}
                  <div className="mt-3 flex flex-col gap-1">
                    <h3
                      className="text-[15px] font-bold text-white truncate hover:text-brand-red cursor-pointer transition-colors"
                      title={movie.title}
                    >
                      <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
                    </h3>

                    <div className="flex items-center text-xs font-medium text-gray-400 gap-2">
                      {rating !== undefined && rating > 0 && (
                        <span className="flex items-center text-green-400">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                      {rating !== undefined && rating > 0 && typeText && (
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                      )}
                      {typeText && (
                        <span className="text-gray-300">{typeText}</span>
                      )}
                    </div>

                    {movie.genres && movie.genres.length > 0 && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {movie.genres.slice(0, 2).join(" • ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
