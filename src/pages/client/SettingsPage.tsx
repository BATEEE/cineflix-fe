import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  Mail, 
  Camera, 
  Loader2, 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';
import userService from '@/services/userService';

export const SettingsPage = () => {
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General States
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'email'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Form States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avt || null);

  // Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Email Form States
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để truy cập trang cài đặt.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle Avatar Change & Preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger File Input Click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit Profile Changes (DisplayName, Avatar)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() && !avatarFile) {
      toast.warning('Vui lòng nhập tên hiển thị hoặc chọn ảnh đại diện mới.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang cập nhật hồ sơ...');
    try {
      const response = await userService.updateProfile(displayName.trim(), avatarFile);
      if (response.success && response.data) {
        // Update Zustand global state
        updateUser({
          displayName: response.data.displayName,
          avt: response.data.avt
        });
        setAvatarFile(null);
        toast.success('Cập nhật thông tin hồ sơ thành công!', { id: toastId });
      } else {
        toast.error(response.message || 'Cập nhật thất bại.', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình cập nhật.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Change Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning('Vui lòng điền đầy đủ tất cả các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang đổi mật khẩu...');
    try {
      const response = await userService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });

      if (response.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Thay đổi mật khẩu thành công!', { id: toastId });
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại.', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình đổi mật khẩu.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Email Change OTP
  const handleEmailRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.warning('Vui lòng nhập địa chỉ email mới.');
      return;
    }
    if (newEmail.trim() === user?.email) {
      toast.warning('Email mới không được trùng với email hiện tại.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang gửi mã OTP xác nhận...');
    try {
      const response = await userService.requestChangeEmail(newEmail.trim());
      if (response.success) {
        setIsOtpSent(true);
        toast.success('Mã OTP đã được gửi đến email mới của bạn!', { id: toastId });
      } else {
        toast.error(response.message || 'Yêu cầu đổi email thất bại.', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Không thể gửi mã xác nhận.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify and complete email change
  const handleEmailVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.warning('Vui lòng nhập mã OTP xác thực.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang xác minh mã OTP...');
    try {
      const response = await userService.verifyChangeEmail(newEmail.trim(), otpCode.trim());
      if (response.success && response.data) {
        // Update Zustand Global State
        updateUser({
          email: response.data.email
        });
        setIsOtpSent(false);
        setOtpCode('');
        setNewEmail('');
        toast.success('Thay đổi địa chỉ email thành công!', { id: toastId });
      } else {
        toast.error(response.message || 'Mã xác nhận không chính xác.', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Xác thực OTP thất bại.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 flex justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-wide">Cài đặt tài khoản</h1>

        <div className="flex flex-col md:flex-row gap-8 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          {/* Settings Sidebar Tabs */}
          <div className="w-full md:w-64 bg-black/30 border-b md:border-b-0 md:border-r border-gray-800 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-brand-red text-white shadow-lg shadow-red-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-[18px] h-[18px]" />
              Hồ sơ cá nhân
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-brand-red text-white shadow-lg shadow-red-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-[18px] h-[18px]" />
              Đổi mật khẩu
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'email'
                  ? 'bg-brand-red text-white shadow-lg shadow-red-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-[18px] h-[18px]" />
              Thay đổi Email
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-6 sm:p-8">
            
            {/* Tab 1: Profile (DisplayName & Cloudinary Avatar) */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-brand-red" /> Thông tin cá nhân
                  </h2>
                  <p className="text-sm text-gray-400">Thay đổi tên hiển thị và hình ảnh đại diện của bạn.</p>
                </div>

                {/* Avatar upload & Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-6 py-4 border-y border-gray-800/85">
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-brand-red/50 bg-gray-800 shadow-md transition-all group-hover:border-brand-red shrink-0">
                      <img 
                        src={avatarPreview || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-white/10">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors border border-gray-700"
                    >
                      Chọn ảnh mới
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Định dạng JPG, PNG hoặc GIF. Kích thước tối đa 2MB.</p>
                  </div>
                </div>

                {/* DisplayName field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Tên hiển thị</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị..."
                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-medium"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Security (Change Password) */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Key className="w-5 h-5 text-brand-red" /> Đổi mật khẩu
                  </h2>
                  <p className="text-sm text-gray-400">Đảm bảo mật khẩu của bạn có ít nhất 6 ký tự để giữ an toàn tối đa.</p>
                </div>

                {/* Old Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showOldPwd ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ..."
                      className="w-full bg-black/40 border border-gray-800 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPwd(!showOldPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showOldPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full bg-black/40 border border-gray-800 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showNewPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full bg-black/40 border border-gray-800 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showConfirmPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Account (Change Email with OTP verification) */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-red" /> Thay đổi Email
                  </h2>
                  <p className="text-sm text-gray-400">
                    Email hiện tại của bạn: <span className="text-white font-semibold">{user.email}</span>.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Khi bạn đổi email, hệ thống sẽ gửi một mã OTP gồm 6 chữ số tới địa chỉ email mới để xác thực.</p>
                </div>

                {!isOtpSent ? (
                  /* Step 1: Request change */
                  <form onSubmit={handleEmailRequestSubmit} className="space-y-4 pt-4 border-t border-gray-800/85">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Địa chỉ email mới</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-medium"
                        required
                      />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Gửi mã xác nhận
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Verify OTP */
                  <form onSubmit={handleEmailVerifySubmit} className="space-y-5 pt-4 border-t border-gray-800/85 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-brand-red/10 border border-brand-red/30 p-4 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-300 font-medium">Mã OTP đã được gửi đi!</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Vui lòng kiểm tra hộp thư của <span className="text-white font-bold">{newEmail}</span> (bao gồm cả thư rác) để lấy mã xác thực.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Nhập mã xác nhận (OTP)</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Nhập 6 chữ số..."
                        maxLength={6}
                        className="w-full text-center bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-bold text-lg tracking-widest"
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-between items-center flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Quay lại nhập email
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-brand-red hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Xác nhận đổi email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
