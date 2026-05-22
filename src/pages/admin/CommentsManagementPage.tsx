import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X, 
  MessageSquare, 
  Film, 
  User, 
  Mail, 
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import adminService, { type AdminCommentListItem } from '@/services/adminService';

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CommentsManagementPage = () => {
  const [comments, setComments] = useState<AdminCommentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminService.getComments();
      setComments(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách bình luận:", err);
      setErrorMsg("Không thể tải danh sách bình luận. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Clear notifications automatically after 4 seconds
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

  const handleToggleDelete = async (id: number, userName: string, isCurrentlyDeleted: boolean) => {
    setErrorMsg(null);
    try {
      await adminService.toggleCommentDelete(id);
      
      // Update local state dynamically
      setComments(prev => prev.map(c => c.id === id ? { ...c, isDeleted: !isCurrentlyDeleted } : c));
      
      setSuccessMsg(
        isCurrentlyDeleted 
          ? `Đã khôi phục bình luận của "${userName}" thành công.` 
          : `Đã ẩn bình luận của "${userName}" thành công (xóa mềm).`
      );
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái ẩn/hiện bình luận:", err);
      const errMsg = err?.response?.data?.message || "Không thể thay đổi trạng thái bình luận.";
      setErrorMsg(errMsg);
    }
  };

  // Local filtering based on Search Input and Status Filter
  const filteredComments = comments.filter(c => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const contentNormalized = removeVietnameseTones(c.content.toLowerCase());
    const userNameNormalized = removeVietnameseTones(c.userName.toLowerCase());
    const movieTitleNormalized = removeVietnameseTones(c.movieTitle.toLowerCase());
    const emailNormalized = c.userEmail.toLowerCase();

    const matchesSearch = 
      contentNormalized.includes(searchNormalized) ||
      userNameNormalized.includes(searchNormalized) ||
      movieTitleNormalized.includes(searchNormalized) ||
      emailNormalized.includes(searchNormalized);

    // Status filtering
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !c.isDeleted) ||
      (statusFilter === 'hidden' && c.isDeleted);

    return matchesSearch && matchesStatus;
  });

  // Helper to determine avatar gradient
  const getAvatarGradient = (userId: number) => {
    const gradients = [
      'from-rose-500 to-orange-500 text-rose-100',
      'from-blue-500 to-indigo-500 text-blue-100',
      'from-emerald-500 to-teal-500 text-emerald-100',
      'from-violet-500 to-purple-500 text-violet-100',
      'from-amber-500 to-yellow-500 text-amber-900',
      'from-fuchsia-500 to-pink-500 text-fuchsia-100',
    ];
    return gradients[userId % gradients.length];
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Bình luận</h1>
          <p className="text-gray-400">Xem danh sách bình luận của người dùng trên hệ thống, thực hiện tìm kiếm, lọc và ẩn/hiện (xóa mềm) các bình luận không phù hợp.</p>
        </div>
        <div>
          <Button onClick={fetchComments} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
        </div>
      </div>

      {/* Action Notifications */}
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
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/20 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
            {/* Search Input - Extra wide! */}
            <div className="relative w-full xl:w-[600px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm bình luận theo nội dung, tên phim, người gửi hoặc email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white h-10 w-full" 
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-stretch md:items-center">
              {/* Status Select Filter */}
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Trạng thái bình luận</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                    <SelectValue placeholder="Tất cả bình luận" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all" className="text-xs">Tất cả bình luận</SelectItem>
                    <SelectItem value="active" className="text-xs">Đang hiển thị (Hoạt động)</SelectItem>
                    <SelectItem value="hidden" className="text-xs">Đang bị ẩn (Xóa mềm)</SelectItem>
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
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs h-9 self-end flex items-center gap-1.5 mt-auto"
                >
                  <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Comments Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-20">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[220px]">Người gửi</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Phim liên quan</TableHead>
                <TableHead className="text-gray-300 min-w-[320px]">Nội dung bình luận</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Ngày đăng</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Hiển thị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">Đang tải danh sách bình luận...</TableCell>
                </TableRow>
              ) : filteredComments.map((comment) => {
                const avatarGradient = getAvatarGradient(comment.userId);

                return (
                  <TableRow 
                    key={comment.id} 
                    className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                      comment.isDeleted ? 'opacity-50 grayscale bg-gray-950/40 text-gray-500 animate-fadeIn' : ''
                    }`}
                  >
                    {/* ID */}
                    <TableCell className="font-medium">#{comment.id}</TableCell>

                    {/* Sender User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center p-[2px] border border-gray-700 bg-gradient-to-tr ${avatarGradient}`}>
                          {comment.userAvt ? (
                            <img 
                              src={comment.userAvt} 
                              alt={comment.userName} 
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs font-bold uppercase">
                              {comment.userName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm ${comment.isDeleted ? 'text-gray-500' : 'text-white'}`}>
                            {comment.userName}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            {comment.userEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Movie Info */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <Film className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className={`font-semibold ${comment.isDeleted ? 'text-gray-500' : 'text-gray-200 hover:text-red-400 transition-colors'}`}>
                          {comment.movieTitle}
                        </span>
                      </div>
                    </TableCell>

                    {/* Content */}
                    <TableCell>
                      <div className="flex gap-2 items-start py-1">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-500 mt-1 flex-shrink-0" />
                        <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap max-w-lg ${
                          comment.isDeleted ? 'text-gray-500 line-through' : 'text-gray-200'
                        }`}>
                          {comment.content}
                        </p>
                      </div>
                    </TableCell>

                    {/* Comment Date */}
                    <TableCell className="text-xs text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(comment.commentDate)}</span>
                      </div>
                    </TableCell>

                    {/* Toggle Soft Delete */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <div className="flex items-center gap-2">
                          {comment.isDeleted ? (
                            <EyeOff className="w-3.5 h-3.5 text-red-500/80" title="Đang bị ẩn" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-green-500/80" title="Đang hiển thị" />
                          )}
                          <Switch 
                            checked={!comment.isDeleted} 
                            onCheckedChange={() => handleToggleDelete(comment.id, comment.userName, comment.isDeleted)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                        {comment.isDeleted && (
                          <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[9px] py-0 px-1.5 font-normal animate-pulse">
                            Đã ẩn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && filteredComments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Không tìm thấy bình luận nào phù hợp với bộ lọc tìm kiếm.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer counts */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{filteredComments.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{comments.length}</span> bình luận của hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
};
