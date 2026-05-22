import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, RefreshCw, AlertCircle, CheckCircle, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import genreService, { type Genre } from '@/services/genreService';

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const GenresManagementPage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [genreNameInput, setGenreNameInput] = useState('');

  const fetchGenres = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Load all genres including soft-deleted ones for the Admin
      const data = await genreService.getAll(true);
      setGenres(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách thể loại:", err);
      setErrorMsg("Không thể tải danh sách thể loại phim. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Clear messages automatically after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const handleOpenCreateModal = () => {
    setEditingGenre(null);
    setGenreNameInput('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (genre: Genre) => {
    setEditingGenre(genre);
    setGenreNameInput(genre.genrename);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreNameInput.trim()) {
      setModalError("Tên thể loại không được để trống.");
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      if (editingGenre) {
        // Update existing genre
        await genreService.update(editingGenre.id, genreNameInput.trim());
        setSuccessMsg(`Đã cập nhật thể loại từ "${editingGenre.genrename}" thành "${genreNameInput.trim()}".`);
      } else {
        // Create new genre
        await genreService.create(genreNameInput.trim());
        setSuccessMsg(`Đã thêm mới thể loại "${genreNameInput.trim()}" thành công!`);
      }
      setIsModalOpen(false);
      fetchGenres();
    } catch (err: any) {
      console.error("Lỗi khi lưu thể loại:", err);
      const errMsg = err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thể loại. Tên thể loại có thể đã tồn tại.";
      setModalError(errMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleDelete = async (id: number, currentName: string, isCurrentlyDeleted: boolean) => {
    setErrorMsg(null);
    try {
      await genreService.toggleStatus(id);
      
      // Update local state dynamically
      setGenres(prev => prev.map(g => g.id === id ? { ...g, isDeleted: !isCurrentlyDeleted } : g));
      
      setSuccessMsg(
        isCurrentlyDeleted 
          ? `Đã khôi phục thể loại "${currentName}" thành công.` 
          : `Đã ẩn (xóa mềm) thể loại "${currentName}" thành công.`
      );
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái thể loại:", err);
      const errMsg = err?.response?.data?.message || "Không thể thay đổi trạng thái thể loại.";
      setErrorMsg(errMsg);
    }
  };

  // Local filtering based on Search Input and Status Dropdown with Vietnamese accent-insensitive matching
  const filteredGenres = genres.filter(g => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const genreNormalized = removeVietnameseTones(g.genrename.toLowerCase());
    const matchesSearch = genreNormalized.includes(searchNormalized);
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !g.isDeleted) ||
      (statusFilter === 'deleted' && g.isDeleted);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Thể loại</h1>
          <p className="text-gray-400">Xem danh sách, thêm mới, sửa hoặc ẩn các thể loại phim trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchGenres} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
          <Button 
            onClick={handleOpenCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-medium shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Thêm thể loại mới
          </Button>
        </div>
      </div>

      {/* Global Action Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/20 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-[600px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm kiếm theo tên thể loại..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white h-10 w-full" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[180px]">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-xs">Tất cả thể loại</SelectItem>
                  <SelectItem value="active" className="text-xs">Chưa bị ẩn</SelectItem>
                  <SelectItem value="deleted" className="text-xs">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }} 
                className="text-brand-red hover:text-red-400 hover:bg-red-500/10 text-xs h-9 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Tên thể loại</TableHead>
                <TableHead className="text-gray-300 w-36">Đã xóa (Ẩn)</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredGenres.map((genre) => (
                <TableRow 
                  key={genre.id} 
                  className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                    genre.isDeleted ? 'opacity-40 grayscale bg-gray-950/40 text-gray-500' : ''
                  }`}
                >
                  <TableCell className="font-medium">#{genre.id}</TableCell>
                  <TableCell className={`font-medium ${genre.isDeleted ? 'text-gray-500' : 'text-white'}`}>
                    <div className="flex items-center gap-2">
                      <span>{genre.genrename}</span>
                      {genre.isDeleted && (
                        <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[10px] py-0 px-2 font-normal animate-pulse">
                          Đã ẩn
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={genre.isDeleted} 
                      onCheckedChange={() => handleToggleDelete(genre.id, genre.genrename, !!genre.isDeleted)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenEditModal(genre)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800/80 flex items-center gap-1.5 text-xs h-8 mx-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredGenres.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Không tìm thấy thể loại nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{filteredGenres.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{genres.length}</span> thể loại
          </p>
        </div>
      </div>

      {/* Create/Edit Genre Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[320px] bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-xl p-6">
          <form onSubmit={handleSaveGenre}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-500" />
                {editingGenre ? 'Cập nhật Thể loại' : 'Thêm Thể loại mới'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 animate-fadeIn text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="genreName" className="text-xs font-semibold text-gray-300">Tên thể loại</Label>
                <Input 
                  id="genreName" 
                  type="text" 
                  value={genreNameInput} 
                  onChange={(e) => setGenreNameInput(e.target.value)} 
                  placeholder="Nhập tên thể loại phim..."
                  className="bg-gray-800 border-gray-700 text-white h-10 placeholder-gray-500 focus:ring-red-500/20 focus:border-red-500 w-full text-sm"
                  autoFocus
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                disabled={modalLoading} 
                className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white h-9 px-3 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit"
                disabled={modalLoading} 
                className="bg-red-600 hover:bg-red-700 text-white font-medium h-9 px-4 text-xs shadow-lg shadow-red-600/10"
              >
                {modalLoading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
