import React, { useState, useEffect } from 'react';
import { 
  Film, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  Video, 
  Loader2, 
  Eye, 
  EyeOff, 
  Tv, 
  Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import movieService, { type MovieListItem } from '@/services/movieService';
import episodeService, { type EpisodeDetail } from '@/services/episodeService';
import { toast } from 'sonner';

export const EpisodesManagementPage = () => {
  // Movies list states
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  
  // Movie selection
  const [selectedMovie, setSelectedMovie] = useState<MovieListItem | null>(null);

  // Episodes states
  const [episodes, setEpisodes] = useState<EpisodeDetail[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Movies pagination states
  const [moviePageIndex, setMoviePageIndex] = useState(1);
  const [movieTotalCount, setMovieTotalCount] = useState(0);
  const [movieTotalPages, setMovieTotalPages] = useState(1);
  const moviePageSize = 5; // 5 phim/trang theo yêu cầu

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const response = await movieService.getAll({
        search: movieSearchQuery.trim() || undefined,
        pageIndex: moviePageIndex,
        pageSize: moviePageSize
      });
      
      const list = response?.items || [];
      setMovies(list);
      setMovieTotalCount(response?.totalCount || 0);
      setMovieTotalPages(response?.totalPages || 1);
      
      // Nếu có danh sách phim và chưa chọn phim nào, tự động chọn phim đầu tiên để hiển thị cho tiện
      if (list.length > 0 && !selectedMovie) {
        setSelectedMovie(list[0]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách phim:", err);
      toast.error("Không thể tải danh sách phim.");
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchEpisodes = async (movieId: number) => {
    setLoadingEpisodes(true);
    try {
      const data = await episodeService.getByMovieId(movieId);
      setEpisodes(data);
    } catch (err) {
      console.error("Lỗi khi tải tập phim:", err);
      toast.error("Không thể tải danh sách tập phim.");
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Tải danh sách phim khi thay đổi từ khóa tìm kiếm hoặc số trang
  useEffect(() => {
    fetchMovies();
  }, [moviePageIndex, movieSearchQuery]);

  // Tải tập phim khi chọn bộ phim mới
  useEffect(() => {
    if (selectedMovie) {
      fetchEpisodes(selectedMovie.id);
    } else {
      setEpisodes([]);
    }
  }, [selectedMovie]);

  const handleToggleDelete = async (id: number, currentStatus: boolean) => {
    try {
      await episodeService.toggleStatus(id);
      setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, isDeleted: !currentStatus } : ep));
      toast.success(currentStatus ? "Đã hiển thị lại tập phim." : "Đã ẩn tập phim.");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thay đổi trạng thái tập phim.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieSearchQuery(e.target.value);
    setMoviePageIndex(1); // Reset trang về 1 khi tìm kiếm mới
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Video className="w-8 h-8 text-brand-gold" />
          Quản lý Tập Phim & Trailer
        </h1>
        <p className="text-gray-400">
          Xem danh sách phim và chọn một bộ phim để quản lý các tập phim chính thức hoặc video giới thiệu (trailer).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CỘT BÊN TRÁI: DANH SÁCH BỘ PHIM (5 PHIM/TRANG) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-gold" />
              Chọn bộ phim
            </h2>
            
            {/* Thanh tìm kiếm phim */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm phim theo tiêu đề..."
                value={movieSearchQuery}
                onChange={handleSearchChange}
                className="w-full bg-gray-950 border border-gray-850 pl-10 pr-4 h-10 text-sm text-white rounded-lg focus:outline-none focus:border-brand-gold transition-all duration-300"
              />
            </div>

            {/* Danh sách phim */}
            <div className="space-y-2.5 min-h-[380px]">
              {loadingMovies ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                  <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                  <span className="text-xs">Đang tải danh sách phim...</span>
                </div>
              ) : movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center gap-2">
                  <Inbox className="w-10 h-10 opacity-30" />
                  <span className="text-sm font-semibold text-gray-400">Không tìm thấy bộ phim nào</span>
                </div>
              ) : (
                movies.map((movie) => {
                  const isSelected = selectedMovie?.id === movie.id;
                  return (
                    <button
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex gap-3 ${
                        isSelected
                          ? 'bg-brand-gold/10 border-brand-gold shadow-lg shadow-brand-gold/5'
                          : 'bg-gray-950/40 border-gray-800 hover:bg-gray-850/30'
                      }`}
                    >
                      {/* Cover Image */}
                      <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-850 shadow-inner">
                        <img 
                          src={movie.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} 
                          alt={movie.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      {/* Movie Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{movie.studioName}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-gray-700 text-gray-400 bg-gray-900/60`}>
                            {movie.type === 1 ? 'Phim Lẻ' : 'Phim Bộ'}
                          </Badge>
                          {movie.isPremium ? (
                            <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0 rounded">VIP</span>
                          ) : (
                            <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0 rounded">FREE</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Phân trang danh sách phim */}
            {!loadingMovies && movieTotalPages > 1 && (
              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Trang {moviePageIndex}/{movieTotalPages} ({movieTotalCount} phim)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={moviePageIndex === 1}
                    onClick={() => setMoviePageIndex(p => Math.max(1, p - 1))}
                    variant="ghost"
                    className="p-1 h-8 w-8 text-gray-400 hover:text-white rounded-lg disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    disabled={moviePageIndex === movieTotalPages}
                    onClick={() => setMoviePageIndex(p => Math.min(movieTotalPages, p + 1))}
                    variant="ghost"
                    className="p-1 h-8 w-8 text-gray-400 hover:text-white rounded-lg disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT BÊN PHẢI: DANH SÁCH TẬP PHIM CỦA BỘ PHIM ĐÃ CHỌN */}
        <div className="lg:col-span-7">
          {!selectedMovie ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center flex flex-col items-center justify-center">
              <Tv className="w-16 h-16 text-gray-800 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">Chưa chọn phim</h3>
              <p className="text-gray-500">Vui lòng chọn một bộ phim từ cột bên trái để bắt đầu quản lý các tập phim.</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
              {/* Selected Movie Header */}
              <div className="p-5 border-b border-gray-800 bg-gray-950/40 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider block mb-1">
                    Đang xem danh sách tập của phim:
                  </span>
                  <h3 className="text-lg font-bold text-white truncate" title={selectedMovie.title}>
                    {selectedMovie.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    onClick={() => fetchEpisodes(selectedMovie.id)} 
                    variant="ghost" 
                    className="h-9 w-9 p-0 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingEpisodes ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Episodes List Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-850/40">
                    <TableRow className="border-gray-800 hover:bg-gray-850/20">
                      <TableHead className="text-gray-400 w-20">ID</TableHead>
                      <TableHead className="text-gray-400">Tên Tập phim</TableHead>
                      <TableHead className="text-gray-400 w-28">Loại video</TableHead>
                      <TableHead className="text-gray-400 w-28">Thời lượng</TableHead>
                      <TableHead className="text-gray-400 w-24 text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEpisodes ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-7 h-7 text-brand-gold animate-spin" />
                            <span className="text-xs">Đang tải danh sách tập phim...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : episodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Inbox className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-semibold text-gray-400">Chưa có tập phim hoặc trailer nào</p>
                            <p className="text-xs text-gray-500">Bộ phim này hiện chưa được cấu hình nội dung video.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      episodes.map((ep) => (
                        <TableRow 
                          key={ep.id} 
                          className={`border-gray-800 hover:bg-gray-800/40 transition-all duration-200 ${
                            ep.isDeleted ? 'opacity-40 grayscale bg-gray-950/40 text-gray-500' : ''
                          }`}
                        >
                          {/* ID */}
                          <TableCell className="font-semibold text-gray-400">#{ep.id}</TableCell>
                          
                          {/* Episode Title */}
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">
                                {ep.episodeTitle || `Tập ${ep.episodeNumber}`}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                Season {ep.seasonNumber || 1} - Số thứ tự tập: {ep.episodeNumber}
                              </span>
                            </div>
                          </TableCell>

                          {/* Video Type */}
                          <TableCell>
                            {ep.videoType === 1 ? (
                              <Badge variant="outline" className={`text-[10px] font-bold border-green-500/30 text-green-500 bg-green-500/5 ${ep.isDeleted ? 'opacity-50 border-gray-700 text-gray-500 bg-transparent' : ''}`}>
                                Phim chính
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`text-[10px] font-bold border-blue-500/30 text-blue-500 bg-blue-500/5 ${ep.isDeleted ? 'opacity-50 border-gray-700 text-gray-500 bg-transparent' : ''}`}>
                                Trailer
                              </Badge>
                            )}
                          </TableCell>

                          {/* Duration */}
                          <TableCell className="text-sm text-gray-300 font-mono">
                            {ep.duration || 'N/A'}
                          </TableCell>

                          {/* Action Switch Toggle Deleted */}
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Switch 
                                checked={ep.isDeleted} 
                                onCheckedChange={() => handleToggleDelete(ep.id, ep.isDeleted)}
                                className="data-[state=checked]:bg-red-600 scale-90"
                              />
                              <span className={`text-[10px] ${ep.isDeleted ? 'text-red-500 font-bold' : 'text-green-500 font-medium'}`}>
                                {ep.isDeleted ? 'Đã Ẩn' : 'Hiện'}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Card Footer Info */}
              {!loadingEpisodes && episodes.length > 0 && (
                <div className="p-4 border-t border-gray-800 bg-gray-900/10 flex justify-between items-center text-xs text-gray-400">
                  <span>Tổng số tập: <span className="font-semibold text-white">{episodes.length}</span> tập phim.</span>
                  <span>Đã ẩn: <span className="font-semibold text-red-500">{episodes.filter(e => e.isDeleted).length}</span> tập.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .border-gray-850 {
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};
