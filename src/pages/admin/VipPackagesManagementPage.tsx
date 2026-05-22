import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Crown, 
  Plus, 
  Edit2, 
  Trash2,
  Lock,
  Unlock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import adminService, { type AdminVipPackage, type VipPackagePayload } from '@/services/adminService';
import { toast } from 'sonner';

export const VipPackagesManagementPage = () => {
  const [packages, setPackages] = useState<AdminVipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdminVipPackage | null>(null);
  const [packageName, setPackageName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminService.getVipPackages();
      setPackages(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách gói VIP:", err);
      setErrorMsg("Không thể tải danh sách gói VIP. Vui lòng kiểm tra lại backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Clear internal notifications automatically after 4 seconds
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

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setPackageName('');
    setPrice(0);
    setDurationMonths(1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: AdminVipPackage) => {
    setEditingPackage(pkg);
    setPackageName(pkg.packageName);
    setPrice(pkg.price);
    setDurationMonths(pkg.durationMonths);
    setIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleToggleActive = async (id: number, name: string, currentStatus: boolean) => {
    setErrorMsg(null);
    try {
      await adminService.toggleVipPackageActive(id);
      
      // Cập nhật state trực tiếp
      setPackages(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      
      const statusText = currentStatus ? "Đã khóa (ẩn) thành công" : "Đã mở khóa (kích hoạt) thành công";
      toast.success(`Gói "${name}": ${statusText}`);
      setSuccessMsg(`Đã cập nhật trạng thái gói "${name}" thành công.`);
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái gói VIP:", err);
      toast.error("Không thể thay đổi trạng thái gói VIP.");
      setErrorMsg("Thao tác thất bại. Vui lòng kiểm tra console.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim()) {
      toast.error("Vui lòng nhập tên gói VIP");
      return;
    }
    if (price < 0) {
      toast.error("Giá tiền không hợp lệ");
      return;
    }
    if (durationMonths <= 0) {
      toast.error("Thời hạn phải từ 1 tháng trở lên");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload: VipPackagePayload = {
      packageName: packageName.trim(),
      price,
      durationMonths,
      isActive,
    };

    try {
      if (editingPackage) {
        // Cập nhật gói VIP
        const updated = await adminService.updateVipPackage(editingPackage.id, payload);
        setPackages(prev => prev.map(p => p.id === editingPackage.id ? updated : p));
        toast.success(`Đã cập nhật gói "${packageName}" thành công.`);
        setSuccessMsg(`Cập nhật gói "${packageName}" thành công.`);
      } else {
        // Tạo mới gói VIP
        const created = await adminService.createVipPackage(payload);
        setPackages(prev => [created, ...prev]);
        toast.success(`Đã tạo mới gói "${packageName}" thành công.`);
        setSuccessMsg(`Tạo mới gói "${packageName}" thành công.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi khi lưu gói VIP:", err);
      const msg = err?.response?.data?.message || "Không thể lưu gói VIP.";
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Crown className="w-8 h-8 text-brand-gold" />
            Quản lý Gói VIP
          </h1>
          <p className="text-gray-400">
            Xem, thêm, sửa, và khóa/mở khóa các gói dịch vụ VIP trên hệ thống CineFlix.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchPackages} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
          <Button onClick={handleOpenAddModal} className="bg-brand-gold hover:bg-yellow-600 text-black font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm Gói VIP
          </Button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Content Container */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-20">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Tên Gói VIP</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Giá Tiền</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Thời Hạn</TableHead>
                <TableHead className="text-gray-300 w-40 text-center">Trạng Thái</TableHead>
                <TableHead className="text-gray-300 w-32 text-center">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Đang tải danh sách các gói VIP...
                  </TableCell>
                </TableRow>
              ) : packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Chưa có gói VIP nào được cấu hình trên hệ thống.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow 
                    key={pkg.id} 
                    className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                      !pkg.isActive ? 'opacity-50 grayscale bg-gray-950/40 text-gray-500' : ''
                    }`}
                  >
                    {/* ID */}
                    <TableCell className="font-semibold">#{pkg.id}</TableCell>

                    {/* Name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${pkg.isActive ? 'text-brand-gold' : 'text-gray-500'}`} />
                        <span className="font-bold text-white text-base">{pkg.packageName}</span>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-bold text-brand-gold text-base">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(pkg.price)}
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="font-semibold text-white">
                      {pkg.durationMonths} tháng
                    </TableCell>

                    {/* Active State Toggle Switch */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <div className="flex items-center gap-2">
                          {!pkg.isActive ? (
                            <Lock className="w-3.5 h-3.5 text-red-500/80" title="Đang bị khóa" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-green-500/80" title="Đang kích hoạt" />
                          )}
                          <Switch 
                            checked={pkg.isActive} 
                            onCheckedChange={() => handleToggleActive(pkg.id, pkg.packageName, pkg.isActive)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                        {!pkg.isActive && (
                          <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[9px] py-0 px-1.5 font-normal">
                            Đã khóa
                          </Badge>
                        )}
                        {pkg.isActive && (
                          <Badge className="bg-green-950/60 text-green-400 border border-green-800/60 text-[9px] py-0 px-1.5 font-normal">
                            Hoạt động
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenEditModal(pkg)}
                        className="text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 p-2 rounded-lg"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Tổng cộng: <span className="font-semibold text-white">{packages.length}</span> gói VIP được cấu hình.
          </p>
        </div>
      </div>

      {/* ── MODAL DIALOG: THÊM / SỬA GÓI VIP (NARROW/COMPACT SIZE) ── */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          style={{ animation: 'fadeIn 0.25s ease' }}
        >
          <div 
            className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden relative"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-850 flex justify-between items-center bg-gray-950/40">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-brand-gold" />
                {editingPackage ? 'Chỉnh sửa Gói VIP' : 'Thêm Gói VIP mới'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Package Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tên Gói VIP <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ví dụ: Premium VIP, Platinum 1 Năm..."
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-brand-gold h-10 w-full"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-gold" />
                  Giá Tiền (VND) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 99000, 499000..."
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-brand-gold h-10 w-full"
                  min="0"
                  required
                />
                <span className="text-[11px] text-gray-400">
                  {price > 0 && new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(price)}
                </span>
              </div>

              {/* Duration Months */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  Thời hạn (Tháng) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 1, 6, 12..."
                  value={durationMonths === 0 ? '' : durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-brand-gold h-10 w-full"
                  min="1"
                  required
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between bg-gray-950/20 border border-gray-850 p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Hiển thị cho khách hàng</span>
                  <span className="text-xs text-gray-400">Khách hàng sẽ nhìn thấy và có thể mua gói này.</span>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-850 flex justify-end gap-3 bg-gray-950/10 -mx-6 -mb-6 p-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                  className="border-gray-700 text-black hover:bg-gray-800 hover:text-white h-10"
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-gold hover:bg-yellow-600 text-black font-semibold h-10 px-6"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : (editingPackage ? 'Cập nhật' : 'Thêm mới')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .border-gray-850 {
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};
