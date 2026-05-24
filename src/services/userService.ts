import axiosClient from '../api/axiosClient';

export interface UserProfileData {
  username: string;
  email: string;
  displayName: string;
  avt: string | null;
}

const userService = {
  updateProfile: async (displayName?: string, avatarFile?: File | null) => {
    const formData = new FormData();
    if (displayName) {
      formData.append('displayName', displayName);
    }
    if (avatarFile) {
      formData.append('avatarFile', avatarFile);
    }

    const response = await axiosClient.put('/api/user/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await axiosClient.put('/api/user/change-password', data);
    return response.data;
  },

  requestChangeEmail: async (newEmail: string) => {
    const response = await axiosClient.post('/api/user/change-email-request', { newEmail });
    return response.data;
  },

  verifyChangeEmail: async (newEmail: string, code: string) => {
    const response = await axiosClient.post('/api/user/verify-change-email', { newEmail, code });
    return response.data;
  },
};

export default userService;
