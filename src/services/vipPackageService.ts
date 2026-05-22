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

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    message: string;
    payUrl?: string;
  };
}

const vipPackageService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/vippackage');
    return response.data.data as VipPackage[];
  },
  purchase: async (data: PurchasePackageDto): Promise<PurchaseResponse> => {
    const response = await axiosClient.post('/api/vippackage/purchase', data);
    return response.data as PurchaseResponse;
  },
  confirmMomo: async (orderId: string, resultCode: string) => {
    const response = await axiosClient.get(`/api/vippackage/momo-confirm?orderId=${orderId}&resultCode=${resultCode}`);
    return response.data;
  }
};

export default vipPackageService;
