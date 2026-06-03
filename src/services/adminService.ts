import axiosClient from '../api/axiosClient';

export interface StatCard {
  value: number;
  change: string;
  isPositive: boolean;
}

export interface ChartData {
  name: string;
  views: number;
}

export interface TopMovie {
  id: number;
  title: string;
  views: number;
  rating: number;
}

export interface DashboardStats {
  totalMovies: StatCard;
  totalViews: StatCard;
  monthlyRevenue: StatCard;
  totalVipUsers: StatCard;
  chartData: ChartData[];
  topMovies: TopMovie[];
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avt: string | null;
  roleId: number;
  roleName: string;
  createdAt: string;
  isActive: boolean;
  vipExpireDate: string | null;
  studioName: string | null;
}

export interface AdminStudioListItem {
  id: number;
  studioName: string;
  ownerUserId: number | null;
  ownerUserName: string | null;
  ownerEmail: string | null;
  country: string | null;
  isActive: boolean;
  movieCount: number;
}

export interface AdminCommentListItem {
  id: number;
  movieId: number;
  movieTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  userAvt: string | null;
  content: string;
  commentDate: string;
  isDeleted: boolean;
}

export interface AdminTransactionListItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  packageId: number;
  packageName: string;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  status: boolean;
}

export interface AdminVipPackage {
  id: number;
  packageName: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

export interface VipPackagePayload {
  packageName: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

const adminService = {
  getDashboardStats: async () => {
    const response = await axiosClient.get('/api/admin/dashboard/stats');
    return response.data as DashboardStats;
  },

  getUsers: async () => {
    const response = await axiosClient.get('/api/admin/users');
    return response.data.data as UserListItem[];
  },

  getStudios: async () => {
    const response = await axiosClient.get('/api/admin/studios');
    return response.data.data as AdminStudioListItem[];
  },

  toggleStudioActive: async (id: number) => {
    const response = await axiosClient.put(`/api/admin/studios/${id}/toggle-active`);
    return response.data;
  },

  toggleUserActive: async (id: number) => {
    const response = await axiosClient.put(`/api/admin/users/${id}/toggle-active`);
    return response.data;
  },

  getComments: async () => {
    const response = await axiosClient.get('/api/admin/comments');
    return response.data.data as AdminCommentListItem[];
  },

  toggleCommentDelete: async (id: number) => {
    const response = await axiosClient.put(`/api/admin/comments/${id}/toggle-delete`);
    return response.data;
  },

  getVipPackages: async () => {
    const response = await axiosClient.get('/api/admin/vip-packages');
    return response.data.data as AdminVipPackage[];
  },

  createVipPackage: async (payload: VipPackagePayload) => {
    const response = await axiosClient.post('/api/admin/vip-packages', payload);
    return response.data.data as AdminVipPackage;
  },

  updateVipPackage: async (id: number, payload: VipPackagePayload) => {
    const response = await axiosClient.put(`/api/admin/vip-packages/${id}`, payload);
    return response.data.data as AdminVipPackage;
  },

  toggleVipPackageActive: async (id: number) => {
    const response = await axiosClient.put(`/api/admin/vip-packages/${id}/toggle-active`);
    return response.data;
  },

  getTransactions: async () => {
    const response = await axiosClient.get('/api/admin/transactions');
    return response.data.data as AdminTransactionListItem[];
  },
};

export default adminService;
