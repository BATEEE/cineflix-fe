import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import movieService, { type MovieListItem } from '@/services/movieService';
import genreService, { type Genre } from '@/services/genreService';

export const MoviesManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const fetchMovies = async () => {
    setLoading(true);
    try {
      // Map từ selectedGenre sang genreId
      const matchedGenre = genres.find(g => g.genrename === selectedGenre);
      const genreId = matchedGenre ? matchedGenre.id : undefined;

      const params = {
        search: searchTerm || undefined,
        type: selectedType !== 'all' ? Number(selectedType) : undefined,
        genreId: genreId,
        country: selectedCountry !== 'all' ? selectedCountry : undefined,
        year: selectedYear !== 'all' ? Number(selectedYear) : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        pageIndex: currentPage,
        pageSize: pageSize
      };

      const response = await movieService.getAll(params);
      
      if (response && response.items) {
        setMovies(response.items);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages);
      } else {
        // Fallback tương thích ngược
        const list = Array.isArray(response) ? response : [];
        setMovies(list);
        setTotalCount(list.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách phim.");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ load static options (genres, countries) một lần khi mount
  useEffect(() => {
    genreService.getAll().then(setGenres).catch(console.error);
    movieService.getCountries().then(setCountries).catch(console.error);
  }, []);

  // Fetch phim mỗi khi các filter hoặc trang thay đổi
  useEffect(() => {
    fetchMovies();
  }, [currentPage, searchTerm, selectedType, selectedGenre, selectedCountry, selectedYear, selectedStatus, genres]);

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

  const handleToggleDelete = async (id: number, currentStatus: boolean) => {
    try {
      await movieService.toggleStatus(id);
      setMovies(prev => prev.map(m => m.id === id ? { ...m, isDeleted: !currentStatus } : m));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thay đổi trạng thái phim.");
    }
  };

  // Tạo danh sách năm động lùi về 20 năm từ năm hiện tại
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - i);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Phim</h1>
          <p className="text-gray-400">Xem danh sách và ẩn các bộ phim trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchMovies} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/20 flex flex-col gap-4">
          {/* Hàng 1: Tìm kiếm */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm kiếm theo tên phim..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-gray-800 border-gray-700 text-white h-10 w-full" 
              />
            </div>
            
            {/* Nút reset bộ lọc */}
            {(searchTerm || selectedType !== 'all' || selectedGenre !== 'all' || selectedCountry !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedGenre('all');
                  setSelectedCountry('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }} 
                className="text-brand-red hover:text-red-400 hover:bg-red-500/10 text-xs h-9 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
              </Button>
            )}
          </div>

          {/* Hàng 2: Các Select Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* 1. Định dạng phim */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Định dạng</label>
              <Select value={selectedType} onValueChange={(val) => handleFilterChange(setSelectedType, val)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả định dạng" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-xs">Tất cả định dạng</SelectItem>
                  <SelectItem value="1" className="text-xs">Phim Lẻ</SelectItem>
                  <SelectItem value="2" className="text-xs">Phim Bộ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Thể loại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Thể loại</label>
              <Select value={selectedGenre} onValueChange={(val) => handleFilterChange(setSelectedGenre, val)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả thể loại" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[250px]">
                  <SelectItem value="all" className="text-xs">Tất cả thể loại</SelectItem>
                  {genres.map(g => (
                    <SelectItem key={g.id} value={g.genrename} className="text-xs">{g.genrename}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Quốc gia */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Quốc gia</label>
              <Select value={selectedCountry} onValueChange={(val) => handleFilterChange(setSelectedCountry, val)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả quốc gia" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[250px]">
                  <SelectItem value="all" className="text-xs">Tất cả quốc gia</SelectItem>
                  {countries.map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Năm phát hành */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Năm phát hành</label>
              <Select value={selectedYear} onValueChange={(val) => handleFilterChange(setSelectedYear, val)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả các năm" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[250px]">
                  <SelectItem value="all" className="text-xs">Tất cả các năm</SelectItem>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Trạng thái */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Trạng thái</label>
              <Select value={selectedStatus} onValueChange={(val) => handleFilterChange(setSelectedStatus, val)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active" className="text-xs">Chưa bị ẩn</SelectItem>
                  <SelectItem value="hidden" className="text-xs">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : movies.map((movie) => (
                <TableRow 
                  key={movie.id} 
                  className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                    movie.isDeleted ? 'opacity-40 grayscale bg-gray-950/40 text-gray-500' : ''
                  }`}
                >
                  <TableCell className="font-medium">#{movie.id}</TableCell>
                  <TableCell>
                    <div className="w-12 h-16 rounded overflow-hidden shadow-md border border-gray-800">
                      <img src={movie.coverImg || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className={`font-medium ${movie.isDeleted ? 'text-gray-500' : 'text-white'}`}>
                    <div className="flex items-center gap-2">
                      <span>{movie.title}</span>
                      {movie.isDeleted && (
                        <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[10px] py-0 px-2 font-normal animate-pulse">
                          Đã ẩn
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{movie.type === 1 ? 'Phim Lẻ' : 'Phim Bộ'}</TableCell>
                  <TableCell>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'N/A'}</TableCell>
                  <TableCell>
                    {movie.isPremium 
                      ? <Badge className="bg-brand-gold text-black hover:bg-yellow-400">VIP</Badge> 
                      : <Badge variant="outline" className={`${movie.isDeleted ? 'text-gray-500 border-gray-800' : 'text-gray-300 border-gray-600'}`}>Thường</Badge>}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={movie.isDeleted} 
                      onCheckedChange={() => handleToggleDelete(movie.id, movie.isDeleted)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!loading && movies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không tìm thấy phim nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Thanh Phân trang cao cấp */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{movies.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{totalCount}</span> bộ phim
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-700 text-black dark:text-white hover:bg-gray-800 disabled:opacity-40 h-8 text-xs px-3"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsisBefore && <span className="text-gray-600 px-1 text-xs">...</span>}
                        <Button
                          variant={currentPage === p ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 w-8 p-0 text-xs ${
                            currentPage === p
                              ? 'bg-brand-red text-white hover:bg-red-600 border-transparent'
                              : 'border-gray-700 text-black dark:text-white hover:bg-gray-800'
                          }`}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-700 text-black dark:text-white hover:bg-gray-800 disabled:opacity-40 h-8 text-xs px-3"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
