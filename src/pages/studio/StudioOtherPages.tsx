import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Film, 
  Inbox, 
  Loader2,
  TrendingUp,
  DollarSign,
  Eye,
  Percent,
  AlertCircle,
  History,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import studioService, { 
  type StudioCommentDto, 
  type StudioMovieListItem,
  type StudioRevenueDto,
  type StudioEstimatedRevenueDto,
  type StudioPayoutHistoryDto
} from '@/services/studioService';

export const StudioSettingsPage = () => {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Cài đặt Hãng phim</h1>
      <p className="text-zinc-500">Trang này đang được phát triển...</p>
    </div>
  );
};

export const StudioCommentsPage = () => {
  const [movies, setMovies] = useState<StudioMovieListItem[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string>('all');
  const [comments, setComments] = useState<StudioCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    studioService.getMovies()
      .then(res => setMovies(res || []))
      .catch(err => console.error("Lỗi khi tải danh sách phim:", err));
  }, []);

  const fetchComments = async (movieId?: number, page: number = 1) => {
    setLoading(true);
    try {
      const res = await studioService.getComments({
        movieId: movieId || undefined,
        pageIndex: page,
        pageSize: pageSize
      });
      setComments(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const movieIdParam = selectedMovieId === 'all' ? undefined : Number(selectedMovieId);
    fetchComments(movieIdParam, pageIndex);
  }, [selectedMovieId, pageIndex]);

  const handleMovieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMovieId(e.target.value);
    setPageIndex(1); // Reset page to 1 on filter change
  };

  const getPaginationGroup = () => {
    const list: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - pageIndex) <= 1) {
        list.push(i);
      } else if (i === pageIndex - 2 || i === pageIndex + 2) {
        list.push('...');
      }
    }
    return list.filter((item, idx) => item !== '...' || list[idx - 1] !== '...');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-500" />
            Quản lý Bình luận
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Xem bình luận của người xem về các bộ phim thuộc studio của bạn</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
            <Filter className="w-4 h-4 text-red-500" />
          </div>
          <div className="relative">
            <select
              value={selectedMovieId}
              onChange={handleMovieChange}
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all cursor-pointer appearance-none min-w-[220px]"
            >
              <option value="all">Tất cả phim</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-zinc-400">
          Tổng số bình luận: <span className="font-semibold text-white">{totalCount}</span>
        </div>
      </div>

      {/* Comments Table Card */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800/50 text-[12px] uppercase text-zinc-400 font-bold tracking-wider bg-zinc-900/50">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Bộ phim</th>
                <th className="px-6 py-4">Nội dung bình luận</th>
                <th className="px-6 py-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                      <p className="text-sm">Đang tải danh sách bình luận...</p>
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-12 h-12 opacity-20 text-zinc-400" />
                      <p className="text-sm font-medium">Chưa có bình luận nào cho bộ lọc này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-xs shadow-inner">
                          {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-semibold text-zinc-200">{comment.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[240px]">
                        <Film className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-zinc-300 truncate" title={comment.movieTitle}>
                          {comment.movieTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-300 max-w-[400px] break-words line-clamp-2" title={comment.content}>
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        {new Date(comment.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800/30 px-6 py-4 bg-zinc-900/10">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                disabled={pageIndex === 1}
                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                className="relative inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trang trước
              </button>
              <button
                disabled={pageIndex === totalPages}
                onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                className="relative ml-3 inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trang sau
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Hiển thị <span className="font-medium text-white">{Math.min((pageIndex - 1) * pageSize + 1, totalCount)}</span> đến{' '}
                  <span className="font-medium text-white">{Math.min(pageIndex * pageSize, totalCount)}</span> trong tổng số{' '}
                  <span className="font-medium text-white">{totalCount}</span> bình luận
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
                  <button
                    disabled={pageIndex === 1}
                    onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                    className="relative inline-flex items-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {getPaginationGroup().map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`dots-${idx}`} className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-zinc-600 select-none">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={`page-${page}`}
                        onClick={() => setPageIndex(Number(page))}
                        className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                          page === pageIndex
                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    disabled={pageIndex === totalPages}
                    onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                    className="relative inline-flex items-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const StudioRevenuePage = () => {
  const [data, setData] = useState<StudioRevenueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studioService.getRevenueStats();
      setData(res);
    } catch (err: any) {
      console.error("Lỗi khi tải báo cáo doanh thu:", err);
      setError("Không thể tải báo cáo doanh thu. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getMonthName = (month: number) => {
    return `Tháng ${month}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            Báo cáo Doanh thu Hãng phim
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Theo dõi doanh thu tạm tính của tháng hiện tại và lịch sử nhận thanh toán đối soát
          </p>
        </div>
        <button 
          onClick={fetchRevenueStats}
          className="bg-zinc-900 border border-zinc-805 hover:border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
        >
          Tải lại dữ liệu
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-sm">Đang tải báo cáo doanh thu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Section 1: Doanh thu tạm tính (Tháng hiện tại) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                Doanh thu tạm tính ({getMonthName(new Date().getMonth() + 1)} / {new Date().getFullYear()})
              </h2>
            </div>

            {/* Note Warning Box */}
            <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-4 flex gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">Lưu ý quan trọng:</span> Đây là số liệu ước tính dựa trên lượt xem VIP và tổng doanh thu nạp VIP thực tế tính đến thời điểm hiện tại trong tháng. Dữ liệu này mang tính chất tham khảo, có thể liên tục biến động và chỉ được chốt chính thức (settled) vào ngày cuối cùng của tháng.
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Studio VIP Views */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between h-32">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Lượt xem VIP của bạn</span>
                  <Film className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-white">
                    {data.estimatedRevenue.studioVipViews.toLocaleString()}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-1">Lượt xem phim VIP của studio</span>
                </div>
              </div>

              {/* Card 2: Total Platform VIP Views */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between h-32">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tổng lượt xem VIP</span>
                  <Eye className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-zinc-300">
                    {data.estimatedRevenue.totalPlatformVipViews.toLocaleString()}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-1">Lượt xem VIP toàn hệ thống</span>
                </div>
              </div>

              {/* Card 3: Platform Revenue Pool */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between h-32">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Quỹ doanh thu chia sẻ</span>
                  <Percent className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-zinc-300">
                    {formatVND(data.estimatedRevenue.platformRevenuePool)}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-1">70% tổng doanh thu VIP toàn sàn</span>
                </div>
              </div>

              {/* Card 4: Estimated Payout (Highlighted!) */}
              <div className="relative overflow-hidden bg-gradient-to-br from-red-950/20 to-zinc-900/30 border border-red-900/40 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between h-32 shadow-lg shadow-red-950/10">
                <div className="absolute right-0 top-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between text-red-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Doanh thu tạm tính</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-red-500">
                    {formatVND(data.estimatedRevenue.estimatedPayout)}
                  </div>
                  <span className="text-xs text-red-500/70 block mt-1 font-medium">
                    Tỷ trọng: {data.estimatedRevenue.revenueSharePercentage}% view VIP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Lịch sử nhận tiền (Các tháng trước) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <History className="w-5 h-5 text-red-500" />
              Lịch sử nhận tiền đối soát (Các tháng trước)
            </h2>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50 text-[12px] uppercase text-zinc-400 font-bold tracking-wider bg-zinc-900/50">
                      <th className="px-6 py-4">Tháng đối soát</th>
                      <th className="px-6 py-4">Tổng lượt xem VIP</th>
                      <th className="px-6 py-4">Quỹ chia sẻ toàn sàn</th>
                      <th className="px-6 py-4">Tỷ trọng view</th>
                      <th className="px-6 py-4">Số tiền được chia</th>
                      <th className="px-6 py-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {data.payoutHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Inbox className="w-12 h-12 opacity-20 text-zinc-400" />
                            <p className="text-sm font-medium">Chưa có lịch sử thanh toán đối soát nào trước đây.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.payoutHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-zinc-500" />
                              <span className="text-sm font-semibold text-zinc-200">
                                Tháng {history.settlementMonth} / {history.settlementYear}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                            {history.totalVipViews.toLocaleString()} lượt xem
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                            {formatVND(history.platformRevenuePool)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-400">
                            {history.revenueSharePercentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-500">
                            {formatVND(history.payoutAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {history.status === 1 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" /> Đã nhận
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20">
                                <AlertCircle className="w-3 h-3" /> Chờ chuyển khoản
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
