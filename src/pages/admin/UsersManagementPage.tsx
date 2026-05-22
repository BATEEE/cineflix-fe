import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Crown, 
  Building, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import adminService, { type UserListItem } from '@/services/adminService';

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

const isUserVip = (vipExpireStr: string | null) => {
  if (!vipExpireStr) return false;
  const expireDate = new Date(vipExpireStr);
  return expireDate > new Date();
};

export const UsersManagementPage = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setErrorMsg("Không thể tải danh sách người dùng. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleToggleActive = async (id: number, displayName: string, isCurrentlyActive: boolean) => {
    setErrorMsg(null);
    try {
      await adminService.toggleUserActive(id);
      
      // Update local state dynamically
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !isCurrentlyActive } : u));
      
      setSuccessMsg(
        isCurrentlyActive 
          ? `Đã khóa tài khoản của "${displayName}" thành công.` 
          : `Đã mở khóa tài khoản cho "${displayName}" thành công.`
      );
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái người dùng:", err);
      const errMsg = err?.response?.data?.message || "Không thể thay đổi trạng thái người dùng.";
      setErrorMsg(errMsg);
    }
  };

  // Local filtering based on Search Input, Role Filter, and Status Filter
  const filteredUsers = users.filter(u => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const nameNormalized = removeVietnameseTones(u.displayName.toLowerCase());
    const usernameNormalized = removeVietnameseTones(u.username.toLowerCase());
    const emailNormalized = u.email.toLowerCase();
    const studioNormalized = removeVietnameseTones((u.studioName || '').toLowerCase());

    const matchesSearch = 
      nameNormalized.includes(searchNormalized) ||
      usernameNormalized.includes(searchNormalized) ||
      emailNormalized.includes(searchNormalized) ||
      studioNormalized.includes(searchNormalized);

    // Role filtering
    const hasVip = isUserVip(u.vipExpireDate);
    const hasStudio = u.roleId === 3 || !!u.studioName;
    const isAdmin = u.roleId === 1;

    let matchesRole = true;
    if (roleFilter === 'admin') {
      matchesRole = isAdmin;
    } else if (roleFilter === 'studio') {
      matchesRole = hasStudio;
    } else if (roleFilter === 'vip') {
      matchesRole = hasVip && !isAdmin;
    } else if (roleFilter === 'customer') {
      matchesRole = !isAdmin && !hasStudio && !hasVip;
    }

    // Status filtering
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'locked' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper to determine avatar gradient & border
  const getAvatarStyle = (user: UserListItem) => {
    const isVip = isUserVip(user.vipExpireDate);
    const isStudio = user.roleId === 3 || !!user.studioName;
    const isAdmin = user.roleId === 1;

    if (isAdmin) {
      return {
        borderClass: 'border-purple-500 bg-gradient-to-tr from-purple-600 to-indigo-600',
        text: 'text-purple-100',
      };
    }
    if (isVip) {
      return {
        borderClass: 'border-yellow-500 bg-gradient-to-tr from-yellow-500 to-amber-600',
        text: 'text-yellow-100',
      };
    }
    if (isStudio) {
      return {
        borderClass: 'border-emerald-500 bg-gradient-to-tr from-emerald-500 to-teal-600',
        text: 'text-emerald-100',
      };
    }
    return {
      borderClass: 'border-gray-700 bg-gradient-to-tr from-gray-600 to-slate-700',
      text: 'text-gray-100',
    };
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-400">Xem danh sách người dùng trong hệ thống, bao gồm khách hàng thường, thành viên VIP và đối tác hãng sản xuất. Admin có quyền khóa/mở khóa tài khoản.</p>
        </div>
        <div>
          <Button onClick={fetchUsers} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
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
            <div className="relative w-full xl:w-[500px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm theo tên hiển thị, tên đăng nhập, email hoặc hãng phim liên kết..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white h-10 w-full" 
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-stretch md:items-center">
              {/* Role Select Filter */}
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Loại tài khoản</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                    <SelectValue placeholder="Tất cả loại tài khoản" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all" className="text-xs">Tất cả tài khoản</SelectItem>
                    <SelectItem value="vip" className="text-xs">Thành viên VIP</SelectItem>
                    <SelectItem value="studio" className="text-xs">Hãng sản xuất (Studio)</SelectItem>
                    <SelectItem value="customer" className="text-xs">Khách hàng thường</SelectItem>
                    <SelectItem value="admin" className="text-xs">Ban quản trị (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select Filter */}
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active" className="text-xs">Đang hoạt động</SelectItem>
                    <SelectItem value="locked" className="text-xs">Đang bị khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
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

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-20">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[240px]">Người dùng</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Liên hệ / Email</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Vai trò / Studio</TableHead>
                <TableHead className="text-gray-300 min-w-[160px]">Ngày đăng ký</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">Đang tải danh sách người dùng...</TableCell>
                </TableRow>
              ) : filteredUsers.map((user) => {
                const isVip = isUserVip(user.vipExpireDate);
                const hasStudio = user.roleId === 3 || !!user.studioName;
                const isAdmin = user.roleId === 1;
                const avatarStyle = getAvatarStyle(user);

                return (
                  <TableRow 
                    key={user.id} 
                    className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                      !user.isActive ? 'opacity-50 grayscale bg-gray-950/40 text-gray-500' : ''
                    }`}
                  >
                    {/* ID */}
                    <TableCell className="font-medium">#{user.id}</TableCell>

                    {/* Display Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center p-[2px] border ${avatarStyle.borderClass}`}>
                          {user.avt ? (
                            <img 
                              src={user.avt} 
                              alt={user.displayName} 
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                // Clear src so we trigger letter backup
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className={`text-sm font-bold uppercase ${avatarStyle.text}`}>
                              {user.displayName.charAt(0)}
                            </span>
                          )}
                          
                          {/* Small absolute role badge over avatar */}
                          {isVip && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full p-[2px] border border-gray-900 shadow-md">
                              <Crown className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {isAdmin && (
                            <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-[2px] border border-gray-900 shadow-md">
                              <Shield className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {hasStudio && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-[2px] border border-gray-900 shadow-md">
                              <Building className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm ${user.isActive ? 'text-white' : 'text-gray-500'}`}>
                            {user.displayName}
                          </span>
                          <span className="text-xs text-gray-400">@{user.username}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>

                    {/* Role / Studio linkages */}
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {isAdmin && (
                          <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-medium py-0 px-2">
                            Admin
                          </Badge>
                        )}
                        
                        {isVip && (
                          <div className="flex flex-col gap-0.5">
                            <Badge className="bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 text-[10px] font-medium py-0 px-2 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-yellow-500" /> VIP Member
                            </Badge>
                            {user.vipExpireDate && (
                              <span className="text-[10px] text-yellow-500/70 font-sans">
                                Hết hạn: {formatDate(user.vipExpireDate)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {hasStudio && (
                          <div className="flex flex-col gap-0.5">
                            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium py-0 px-2 flex items-center gap-1">
                              <Building className="w-3 h-3 text-emerald-400" /> Studio
                            </Badge>
                            {user.studioName && (
                              <span className="text-[10px] text-emerald-400/80 font-semibold italic">
                                {user.studioName}
                              </span>
                            )}
                          </div>
                        )}

                        {!isAdmin && !isVip && !hasStudio && (
                          <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] font-medium py-0 px-2">
                            Khách hàng
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Registration Date */}
                    <TableCell className="text-xs text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>

                    {/* Active Switch */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={user.isActive} 
                            onCheckedChange={() => handleToggleActive(user.id, user.displayName, user.isActive)}
                            className="data-[state=checked]:bg-green-600"
                            disabled={isAdmin} // Prevent admin locking themselves easily via UI for safety
                          />
                        </div>
                        {!user.isActive && (
                          <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[9px] py-0 px-1.5 font-normal animate-pulse">
                            Đã khóa
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc tìm kiếm.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info counts */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{filteredUsers.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{users.length}</span> người dùng hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
};
