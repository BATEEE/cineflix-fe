import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MovieFormModal } from './components/MovieFormModal';
import movieService, { type MovieListItem } from '@/services/movieService';

export const MoviesManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieListItem | null>(null);
  
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await movieService.getAll();
      setMovies(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách phim.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleEdit = (movie: MovieListItem) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const handleToggleDelete = async (id: number, currentStatus: boolean) => {
    try {
      await movieService.toggleStatus(id);
      // Cập nhật state local thay vì fetch lại toàn bộ cho mượt
      setMovies(prev => prev.map(m => m.id === id ? { ...m, isDeleted: !currentStatus } : m));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thay đổi trạng thái phim.");
    }
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchMovies();
  };

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Phim</h1>
          <p className="text-gray-400">Xem, thêm, sửa, xóa các bộ phim trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchMovies} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
          <Button onClick={handleAddNew} className="bg-brand-red text-white hover:bg-red-700 flex items-center gap-2 border-none">
            <Plus className="w-4 h-4" /> Thêm phim mới
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm theo tên phim..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-white" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Poster</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Tên phim</TableHead>
                <TableHead className="text-gray-300">Loại</TableHead>
                <TableHead className="text-gray-300">Ngày PH</TableHead>
                <TableHead className="text-gray-300">Phân loại</TableHead>
                <TableHead className="text-gray-300">Đã xóa (Ẩn)</TableHead>
                <TableHead className="text-gray-300 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredMovies.map((movie) => (
                <TableRow key={movie.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-white">#{movie.id}</TableCell>
                  <TableCell>
                    <div className="w-12 h-16 rounded overflow-hidden">
                      <img src={movie.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{movie.title}</TableCell>
                  <TableCell className="text-gray-300">{movie.type === 1 ? 'Phim Lẻ' : 'Phim Bộ'}</TableCell>
                  <TableCell className="text-gray-300">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    {movie.isPremium 
                      ? <Badge className="bg-brand-gold text-black hover:bg-yellow-400">VIP</Badge> 
                      : <Badge variant="outline" className="text-gray-300 border-gray-600">Thường</Badge>}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={movie.isDeleted} 
                      onCheckedChange={() => handleToggleDelete(movie.id, movie.isDeleted)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(movie)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* Có toggle trạng thái ở Switch, nút xoá mềm tạm thời có thể ẩn hoặc để */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredMovies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không tìm thấy phim nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <MovieFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        movie={editingMovie} 
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
};
