import axiosClient from '../api/axiosClient';

export interface VipPackage {
  id: number;
  packageName: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

const vipPackageService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/vippackage');
    return response.data.data as VipPackage[];
  },
};

export default vipPackageService;
