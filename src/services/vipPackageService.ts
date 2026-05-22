import axiosClient from '../api/axiosClient';

export interface VipPackage {
  id: number;
  packageName: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

export interface PurchasePackageDto {
  packageId: number;
  paymentMethod: string;
}

const vipPackageService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/vippackage');
    return response.data.data as VipPackage[];
  },
  purchase: async (data: PurchasePackageDto) => {
    const response = await axiosClient.post('/api/vippackage/purchase', data);
    return response.data;
  }
};

export default vipPackageService;
