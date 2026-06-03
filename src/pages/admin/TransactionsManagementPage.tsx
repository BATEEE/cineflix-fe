import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  DollarSign, 
  Calendar, 
  User, 
  Mail, 
  CreditCard,
  TrendingUp,
  Inbox,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import adminService, { type AdminTransactionListItem } from '@/services/adminService';

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const TransactionsManagementPage = () => {
  const [transactions, setTransactions] = useState<AdminTransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminService.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      console.error("Lỗi khi tải lịch sử giao dịch:", err);
      setErrorMsg("Không thể tải danh sách giao dịch. Vui lòng kiểm tra lại kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
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

  // Filter and Search logic
  const filteredTransactions = transactions.filter(t => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const nameNormalized = removeVietnameseTones(t.userName.toLowerCase());
    const emailNormalized = t.userEmail.toLowerCase();
    const pkgNormalized = removeVietnameseTones(t.packageName.toLowerCase());
    const methodNormalized = removeVietnameseTones(t.paymentMethod.toLowerCase());

    const matchesSearch = 
      nameNormalized.includes(searchNormalized) ||
      emailNormalized.includes(searchNormalized) ||
      pkgNormalized.includes(searchNormalized) ||
      methodNormalized.includes(searchNormalized);

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'success' && t.status === true) ||
      (statusFilter === 'failed' && t.status === false);

    return matchesSearch && matchesStatus;
  });

  // Calculate total successful revenue
  const totalRevenue = filteredTransactions
    .filter(t => t.status)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-brand-gold" />
            Lịch sử Giao dịch
          </h1>
          <p className="text-gray-400">
            Xem và lọc toàn bộ lịch sử thanh toán nạp VIP của khách hàng trên hệ thống.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchTransactions} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng số giao dịch</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{filteredTransactions.length}</span>
            <span className="text-xs text-gray-500">giao dịch phù hợp</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doanh thu</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-500">
              {formatVND(totalRevenue)}
            </span>
            <span className="text-xs text-emerald-500/80 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> thực nhận
            </span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tỷ lệ thành công</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              {filteredTransactions.length > 0
                ? Math.round((filteredTransactions.filter(t => t.status).length / filteredTransactions.length) * 100)
                : 0}%
            </span>
            <span className="text-xs text-gray-500">
              {filteredTransactions.filter(t => t.status).length} / {filteredTransactions.length} GD
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Tìm theo tên, email, gói VIP, phương thức..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950 border-gray-850 pl-10 pr-4 text-white focus:border-brand-gold h-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-950 border border-gray-850 hover:border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all cursor-pointer appearance-none h-10"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại / Chờ thanh toán</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-20">ID</TableHead>
                <TableHead className="text-gray-300 min-w-[200px]">Khách hàng</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Gói VIP</TableHead>
                <TableHead className="text-gray-300 min-w-[120px]">Số tiền</TableHead>
                <TableHead className="text-gray-300 min-w-[150px]">Cổng thanh toán</TableHead>
                <TableHead className="text-gray-300 min-w-[180px]">Thời gian</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                      <p>Đang tải danh sách giao dịch...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-12 h-12 opacity-25" />
                      <p className="font-semibold text-gray-400">Không tìm thấy giao dịch nào</p>
                      <p className="text-xs text-gray-500">Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow 
                    key={tx.id} 
                    className="border-gray-800 hover:bg-gray-800/50 transition-all duration-200"
                  >
                    {/* ID */}
                    <TableCell className="font-semibold text-gray-400">#{tx.id}</TableCell>

                    {/* Customer info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-brand-gold font-bold text-sm shadow-inner">
                          {tx.userName ? tx.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm flex items-center gap-1.5">
                            {tx.userName}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {tx.userEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* VIP Package */}
                    <TableCell>
                      <span className="font-bold text-zinc-200 text-sm">{tx.packageName}</span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-extrabold text-white text-sm">
                      {formatVND(tx.amount)}
                    </TableCell>

                    {/* Payment Method */}
                    <TableCell>
                      <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-full uppercase font-mono tracking-wider font-semibold">
                        {tx.paymentMethod}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {formatDate(tx.transactionDate)}
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      {tx.status ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Thành công
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-0.5 rounded-full font-normal">
                          Thất bại / Chờ
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer info */}
        {!loading && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/10">
            <p className="text-xs text-gray-400">
              Hiển thị <span className="font-semibold text-white">{filteredTransactions.length}</span> giao dịch trong tổng số <span className="font-semibold text-white">{transactions.length}</span> của hệ thống.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .border-gray-850 {
          border-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};
