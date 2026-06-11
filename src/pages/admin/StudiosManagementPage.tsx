import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle, Building, X, Film, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import adminService, { type AdminStudioListItem } from '@/services/adminService';

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const StudiosManagementPage = () => {
  const [studios, setStudios] = useState<AdminStudioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStudios = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminService.getStudios();
      setStudios(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách hãng sản xuất:", err);
      setErrorMsg("Không thể tải danh sách hãng sản xuất. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
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

  const handleToggleActive = async (id: number, currentName: string, isCurrentlyActive: boolean) => {
    setErrorMsg(null);
    try {
      await adminService.toggleStudioActive(id);
      
      // Update local state dynamically
      setStudios(prev => prev.map(s => s.id === id ? { ...s, isActive: !isCurrentlyActive } : s));
      
      setSuccessMsg(
        isCurrentlyActive 
          ? `Đã khóa hoạt động của hãng sản xuất "${currentName}" thành công.` 
          : `Đã mở khóa hoạt động cho hãng sản xuất "${currentName}" thành công.`
      );
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái hãng sản xuất:", err);
      const errMsg = err?.response?.data?.message || "Không thể thay đổi trạng thái hãng sản xuất.";
      setErrorMsg(errMsg);
    }
  };

  // Local filtering based on Search Input and Status Dropdown with Vietnamese accent-insensitive matching
  const filteredStudios = studios.filter(s => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const nameNormalized = removeVietnameseTones(s.studioName.toLowerCase());
    const countryNormalized = removeVietnameseTones((s.country || '').toLowerCase());
    const ownerNameNormalized = removeVietnameseTones((s.ownerUserName || '').toLowerCase());
    const ownerEmailNormalized = (s.ownerEmail || '').toLowerCase();

    const matchesSearch = 
      nameNormalized.includes(searchNormalized) ||
      countryNormalized.includes(searchNormalized) ||
      ownerNameNormalized.includes(searchNormalized) ||
      ownerEmailNormalized.includes(searchNormalized);

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'locked' && !s.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Hãng sản xuất</h1>
          <p className="text-gray-400">Xem thông tin và quản lý trạng thái khóa/mở khóa các hãng sản xuất (studios) trong hệ thống.</p>
        </div>
        <div>
          <Button onClick={fetchStudios} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
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
                placeholder="Tìm theo tên hãng, quốc gia, tên chủ sở hữu hoặc email..." 
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
                  <SelectItem value="all" className="text-xs">Tất cả hãng phim</SelectItem>
                  <SelectItem value="active" className="text-xs">Đang hoạt động</SelectItem>
                  <SelectItem value="locked" className="text-xs">Đang bị khóa</SelectItem>
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
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs h-9 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-20">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Hãng sản xuất</TableHead>
                <TableHead className="text-gray-300">Quốc gia</TableHead>
                <TableHead className="text-gray-300 min-w-[220px]">Chủ sở hữu</TableHead>
                <TableHead className="text-gray-300 text-center w-32">Số phim</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Hoạt động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">Đang tải danh sách...</TableCell>
                </TableRow>
              ) : filteredStudios.map((studio) => (
                <TableRow 
                  key={studio.id} 
                  className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                    !studio.isActive ? 'opacity-50 grayscale bg-gray-950/40 text-gray-500' : ''
                  }`}
                >
                  <TableCell className="font-medium">#{studio.id}</TableCell>
                  <TableCell className={`font-semibold ${studio.isActive ? 'text-white' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${studio.isActive ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-600'}`}>
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>{studio.studioName}</span>
                        {!studio.isActive && (
                          <div className="mt-1">
                            <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[10px] py-0 px-2 font-normal animate-pulse">
                              Đã khóa
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{studio.country || 'N/A'}</TableCell>
                  <TableCell>
                    {studio.ownerUserId ? (
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{studio.ownerUserName || `ID: ${studio.ownerUserId}`}</span>
                        </div>
                        {studio.ownerEmail && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span>{studio.ownerEmail}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs italic">Không có chủ sở hữu</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-200">{studio.movieCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch 
                        checked={studio.isActive} 
                        onCheckedChange={() => handleToggleActive(studio.id, studio.studioName, studio.isActive)}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredStudios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy hãng sản xuất nào khớp với điều kiện lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{filteredStudios.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{studios.length}</span> hãng sản xuất
          </p>
        </div>
      </div>
    </div>
  );
};
