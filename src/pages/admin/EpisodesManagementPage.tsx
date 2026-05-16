import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Film, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EpisodeFormModal } from './components/EpisodeFormModal';
import movieService, { type MovieListItem } from '@/services/movieService';
import episodeService, { type EpisodeDetail } from '@/services/episodeService';

export const EpisodesManagementPage = () => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<EpisodeDetail | null>(null);

  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeDetail[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const data = await movieService.getAll();
        setMovies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, []);

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

  useEffect(() => {
    if (selectedMovieId) {
      fetchEpisodes(parseInt(selectedMovieId));
    } else {
      setEpisodes([]);
    }
  }, [selectedMovieId]);

  const selectedMovie = movies.find(m => m.id.toString() === selectedMovieId);

  const handleEdit = (episode: EpisodeDetail) => {
    setEditingEpisode(episode);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEpisode(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa tập phim này?")) {
      try {
        await episodeService.delete(id);
        if (selectedMovieId) fetchEpisodes(parseInt(selectedMovieId));
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa tập phim.");
      }
    }
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    if (selectedMovieId) fetchEpisodes(parseInt(selectedMovieId));
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Tập Phim</h1>
          <p className="text-gray-400">Chọn một bộ phim để thêm/sửa các tập phim hoặc trailer.</p>
        </div>
        
        {/* Movie Selector */}
        <div className="w-full md:w-72">
          <Select value={selectedMovieId} onValueChange={setSelectedMovieId} disabled={loadingMovies}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white h-12">
              <Film className="w-4 h-4 mr-2 text-brand-red" />
              <SelectValue placeholder={loadingMovies ? "Đang tải..." : "-- Chọn một bộ phim --"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[300px]">
              {movies.map(movie => (
                <SelectItem key={movie.id} value={movie.id.toString()}>{movie.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedMovieId ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <Film className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">Chưa chọn phim</h3>
          <p className="text-gray-500">Vui lòng chọn một bộ phim từ menu thả xuống bên trên để quản lý tập.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Danh sách tập: <span className="text-brand-red">{selectedMovie?.title}</span>
              {loadingEpisodes && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
            </h3>
            <Button onClick={handleAddNew} className="bg-brand-red text-white hover:bg-red-700 flex items-center gap-2 border-none h-9">
              <Plus className="w-4 h-4" /> Thêm tập/trailer
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300">ID Tập</TableHead>
                  <TableHead className="text-gray-300">Tên tập</TableHead>
                  <TableHead className="text-gray-300">Loại</TableHead>
                  <TableHead className="text-gray-300">Thời lượng</TableHead>
                  <TableHead className="text-gray-300 text-right">Hành động</TableHead>
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
                      Phim này chưa có tập nào. Nhấn "Thêm tập/trailer" để bắt đầu.
                    </TableCell>
                  </TableRow>
                ) : (
                  episodes.map((ep) => (
                    <TableRow key={ep.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-medium text-white">#{ep.id}</TableCell>
                      <TableCell className="font-medium text-white">{ep.episodeTitle || `Tập ${ep.episodeNumber}`}</TableCell>
                      <TableCell>
                        {ep.videoType === 1 
                          ? <Badge variant="outline" className="border-blue-500 text-blue-400">Trailer</Badge> 
                          : <Badge variant="outline" className="border-green-500 text-green-400">Phim chính</Badge>}
                      </TableCell>
                      <TableCell className="text-gray-300">{ep.duration || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(ep)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ep.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedMovieId && (
        <EpisodeFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          episode={editingEpisode}
          movieId={parseInt(selectedMovieId)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};
