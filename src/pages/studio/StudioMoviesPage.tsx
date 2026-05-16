import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock,
  Clapperboard,
  ChevronRight
} from 'lucide-react';
import studioService, { type StudioMovieListItem } from '@/services/studioService';

export const StudioMoviesPage = () => {
  const [movies, setMovies] = useState<StudioMovieListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studioService.getMovies()
      .then(res => {
        setMovies(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Nội dung</h1>
          <p className="text-zinc-500 text-sm mt-1">Danh sách phim và các video đã đăng tải của bạn</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Đăng phim mới</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Tìm kiếm phim của bạn..." 
            className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
          <Filter className="w-4 h-4" />
          <span>Lọc</span>
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/50 text-[12px] uppercase text-zinc-500 font-bold tracking-wider bg-zinc-900/50">
              <th className="px-6 py-4">Phim</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Chỉ số</th>
              <th className="px-6 py-4">Ngày đăng</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">Đang tải danh sách phim...</td>
              </tr>
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                   <div className="flex flex-col items-center gap-2">
                     <Clapperboard className="w-12 h-12 opacity-20" />
                     <p>Bạn chưa đăng bộ phim nào.</p>
                   </div>
                </td>
              </tr>
            ) : (
              movies.map(movie => (
                <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                        {movie.coverImg ? (
                          <img src={movie.coverImg} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{movie.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{movie.movieType} • {movie.episodeCount} tập</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {movie.isPremium ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Lock className="w-3 h-3" /> VIP
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Unlock className="w-3 h-3" /> FREE
                        </span>
                      )}
                      {movie.isDeleted && (
                        <span className="text-[11px] font-bold bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">ĐÃ ẨN</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm text-zinc-300 flex items-center gap-1.5 font-medium">
                         <Eye className="w-3.5 h-3.5 text-zinc-500" /> {movie.views.toLocaleString()}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500">{new Date(movie.createdAt).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Chỉnh sửa" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button title="Quản lý tập phim" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button title="Xóa" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
