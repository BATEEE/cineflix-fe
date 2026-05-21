import React, { useState, useEffect } from 'react';
import { Film, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import movieService, { type MovieListItem } from '@/services/movieService';
import episodeService, { type EpisodeDetail } from '@/services/episodeService';

export const EpisodesManagementPage = () => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MovieListItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieListItem | null>(null);

  const [episodes, setEpisodes] = useState<EpisodeDetail[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClose = () => setShowSuggestions(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Lắng nghe thay đổi của searchQuery và gọi API sau 0.5s debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    // Nếu query trùng khớp chính xác với title của phim đã chọn, tránh tìm lại thừa
    if (selectedMovie && searchQuery === selectedMovie.title) {
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await movieService.getAll({ search: searchQuery });
        const list = Array.isArray(response) ? response : (response?.items || []);
        setSuggestions(list);
      } catch (err) {
        console.error("Lỗi tìm kiếm gợi ý phim:", err);
      }
    }, 500); // 0.5s debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedMovie]);

  const fetchEpisodes = async (movieId: number) => {
    setLoadingEpisodes(true);
    try {
      const data = await episodeService.getByMovieId(movieId);
      setEpisodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleToggleDelete = async (id: number, currentStatus: boolean) => {
    try {
      await episodeService.toggleStatus(id);
      setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, isDeleted: !currentStatus } : ep));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thay đổi trạng thái tập phim.");
    }
  };

  useEffect(() => {
    if (selectedMovieId) {
      fetchEpisodes(parseInt(selectedMovieId));
    } else {
      setEpisodes([]);
    }
  }, [selectedMovieId]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Tập Phim</h1>
          <p className="text-gray-400">Tìm kiếm và chọn một bộ phim để xem danh sách các tập phim hoặc trailer.</p>
        </div>
        
        {/* Hộp Tìm kiếm Phim Auto-suggest */}
        <div className="relative w-full md:w-80" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên phim để tìm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 h-11 text-sm focus:outline-none focus:border-brand-red transition-all duration-300"
            />
          </div>

          {/* Danh sách gợi ý */}
          {showSuggestions && searchQuery.trim() !== '' && (
            <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {suggestions.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy phim phù hợp</div>
              ) : (
                suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSelectedMovieId(movie.id.toString());
                      setSearchQuery(movie.title);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-700/50 flex items-center gap-3 border-b border-gray-700/40 last:border-b-0 transition-colors"
                  >
                    <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-700">
                      <img src={movie.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>{movie.type === 1 ? 'Phim Lẻ' : 'Phim Bộ'}</span>
                        <span>•</span>
                        <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</span>
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedMovieId ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <Film className="w-16 h-16 text-gray-700 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">Chưa chọn phim</h3>
          <p className="text-gray-500">Vui lòng nhập tên phim vào ô tìm kiếm phía trên để bắt đầu quản lý tập phim.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Danh sách tập: <span className="text-brand-red">{selectedMovie?.title}</span>
              {loadingEpisodes && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300">ID Tập</TableHead>
                  <TableHead className="text-gray-300">Tên tập</TableHead>
                  <TableHead className="text-gray-300">Loại</TableHead>
                  <TableHead className="text-gray-300">Thời lượng</TableHead>
                  <TableHead className="text-gray-300">Đã ẩn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingEpisodes ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">Đang tải...</TableCell>
                  </TableRow>
                ) : episodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      Phim này chưa có tập hoặc trailer nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  episodes.map((ep) => (
                    <TableRow 
                      key={ep.id} 
                      className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                        ep.isDeleted ? 'opacity-40 grayscale bg-gray-950/40 text-gray-500' : ''
                      }`}
                    >
                      <TableCell className="font-medium text-white">#{ep.id}</TableCell>
                      <TableCell className={`font-medium ${ep.isDeleted ? 'text-gray-500' : 'text-white'}`}>
                        <div className="flex items-center gap-2">
                          <span>{ep.episodeTitle || `Tập ${ep.episodeNumber}`}</span>
                          {ep.isDeleted && (
                            <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[10px] py-0 px-2 font-normal animate-pulse">
                              Đã ẩn
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ep.videoType === 1 
                          ? <Badge variant="outline" className={`border-green-500 text-green-400 ${ep.isDeleted ? 'opacity-50 border-gray-700 text-gray-500' : ''}`}>Phim chính</Badge> 
                          : <Badge variant="outline" className={`border-blue-500 text-blue-400 ${ep.isDeleted ? 'opacity-50 border-gray-700 text-gray-500' : ''}`}>Trailer</Badge>}
                      </TableCell>
                      <TableCell className="text-gray-300">{ep.duration || 'N/A'}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={ep.isDeleted} 
                          onCheckedChange={() => handleToggleDelete(ep.id, ep.isDeleted)}
                          className="data-[state=checked]:bg-red-600"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
