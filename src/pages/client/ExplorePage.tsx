import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, Film, SlidersHorizontal } from 'lucide-react';
import movieService, { type MovieListItem } from '@/services/movieService';
import genreService, { type Genre } from '@/services/genreService';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for search text debouncing
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load genres, countries and years on component mount
  useEffect(() => {
    genreService.getActive().then(setGenres).catch(console.error);
    movieService.getCountries().then(setCountries).catch(console.error);
    movieService.getYears().then(setYears).catch(console.error);
  }, []);

  // Update query parameters in URL (purging empty values)
  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...updates };
    const cleaned: Record<string, string> = {};

    for (const key in merged) {
      const val = merged[key];
      if (val !== undefined && val !== null && val !== '') {
        cleaned[key] = String(val);
      }
    }

    // Reset pageIndex back to '1' when changing a filter (except when explicitly changing pageIndex)
    if (!updates.hasOwnProperty('pageIndex')) {
      cleaned['pageIndex'] = '1';
    }

    setSearchParams(cleaned);
  };

  // Sync searchVal state when URL search parameter changes
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  // Debounce the text search value (500ms delay)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchVal !== currentSearch) {
        updateParams({ search: searchVal });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  // Clear all active filter criteria
  const clearFilters = () => {
    setSearchVal('');
    setSearchParams({});
  };

  // Fetch explore results from backend whenever filters or page changes
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      const typeParam = searchParams.get('type');
      const genreParam = searchParams.get('genreId');
      const yearParam = searchParams.get('year');
      
      const params = {
        search: searchParams.get('search') || undefined,
        type: typeParam ? parseInt(typeParam) : undefined,
        genreId: genreParam ? parseInt(genreParam) : undefined,
        country: searchParams.get('country') || undefined,
        year: yearParam ? parseInt(yearParam) : undefined,
        sortBy: searchParams.get('sortBy') || undefined,
        pageIndex: parseInt(searchParams.get('pageIndex') || '1'),
        pageSize: 12,
      };

      try {
        const result = await movieService.getExplore(params);
        setMovies(result.items);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || 0);
      } catch (err) {
        console.error("Lỗi khám phá phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const currentPage = parseInt(searchParams.get('pageIndex') || '1');

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateParams({ pageIndex: currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateParams({ pageIndex: currentPage + 1 });
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-[100px] pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <SlidersHorizontal className="w-6 h-6 text-brand-red" />
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">Khám phá kho phim</h1>
        </div>

        {/* Horizontal Filters Bar */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 md:p-6 mb-8 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            
            {/* Search Input */}
            <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên phim, diễn viên..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-black/60 text-white placeholder-zinc-500 text-sm px-4 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
              />
            </div>

            {/* Format Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Định dạng</label>
              <select
                value={searchParams.get('type') || ''}
                onChange={(e) => updateParams({ type: e.target.value })}
                className="bg-black/60 text-white text-sm px-3 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="1">Phim lẻ</option>
                <option value="2">Phim bộ</option>
              </select>
            </div>

            {/* Genre Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Thể loại</label>
              <select
                value={searchParams.get('genreId') || ''}
                onChange={(e) => updateParams({ genreId: e.target.value })}
                className="bg-black/60 text-white text-sm px-3 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.genrename}</option>
                ))}
              </select>
            </div>

            {/* Country Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Quốc gia</label>
              <select
                value={searchParams.get('country') || ''}
                onChange={(e) => updateParams({ country: e.target.value })}
                className="bg-black/60 text-white text-sm px-3 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="">Tất cả quốc gia</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Năm phát hành</label>
              <select
                value={searchParams.get('year') || ''}
                onChange={(e) => updateParams({ year: e.target.value })}
                className="bg-black/60 text-white text-sm px-3 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="">Tất cả năm</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Sắp xếp theo</label>
              <select
                value={searchParams.get('sortBy') || ''}
                onChange={(e) => updateParams({ sortBy: e.target.value })}
                className="bg-black/60 text-white text-sm px-3 py-2.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                <option value="">Mới nhất (Mặc định)</option>
                <option value="latest">Ngày phát hành</option>
                <option value="views">Lượt xem nhiều nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

          </div>

          {/* Action buttons (Clear) */}
          <div className="flex justify-end mt-4 pt-4 border-t border-zinc-800/80">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          /* High quality Skeleton Loader */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-md overflow-hidden bg-zinc-900/60 border border-zinc-800 animate-pulse relative">
                <div className="w-full h-full bg-zinc-900/30" />
                <div className="absolute bottom-4 left-4 right-4 h-4 bg-zinc-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          /* Empty State (Cute visuals & tips) */
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-xl p-8 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-zinc-900/80 flex items-center justify-center border border-zinc-800 shadow-inner mb-4">
              <Film className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 text-center">Không tìm thấy phim phù hợp</h3>
            <p className="text-zinc-500 text-sm text-center leading-relaxed mb-6">
              Không tìm thấy bộ phim nào phù hợp với bộ lọc hiện tại của bạn. Hãy thử giảm bớt tiêu chí hoặc thay đổi từ khóa nhé!
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-lg"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            {/* Grid display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="relative group rounded-md overflow-hidden bg-zinc-900 border border-zinc-800/40 transition-transform duration-300 hover:scale-105 hover:z-10 shadow-lg"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-xs transition-all ${
                    currentPage === 1
                      ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang trước
                </button>
                
                <span className="text-zinc-400 text-xs tracking-wider">
                  Trang <strong className="text-white font-semibold">{currentPage}</strong> / <strong className="text-white font-semibold">{totalPages}</strong> ({totalCount} kết quả)
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-xs transition-all ${
                    currentPage === totalPages
                      ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Trang sau
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
