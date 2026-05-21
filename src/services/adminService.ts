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
};

export default adminService;
