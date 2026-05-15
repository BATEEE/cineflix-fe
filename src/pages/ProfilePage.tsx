import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Clock, Heart, Crown, Settings, Play } from 'lucide-react';

const mockHistory = [
  { id: 1, movieId: 1, title: 'Stranger Things 4', episode: 'Tập 1: Câu lạc bộ Hellfire', progress: 45, image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop' },
  { id: 2, movieId: 2, title: 'The Witcher', episode: 'Tập 3: Kẻ sát nhân', progress: 80, image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&auto=format&fit=crop' },
];

const mockFavorites = [
  { id: 101, title: 'Interstellar', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop' },
  { id: 102, title: 'Inception', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400&auto=format&fit=crop' },
  { id: 103, title: 'Dark Knight', image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=400&auto=format&fit=crop' },
];

const mockVipPackages = [
  { id: 1, name: 'Cơ bản', price: '50,000đ', duration: '1 Tháng', features: ['Quảng cáo', 'Chất lượng HD'] },
  { id: 2, name: 'Tiêu chuẩn', price: '120,000đ', duration: '3 Tháng', features: ['Không quảng cáo', 'Chất lượng Full HD', 'Tải phim'] },
  { id: 3, name: 'Cao cấp', price: '400,000đ', duration: '12 Tháng', features: ['Không quảng cáo', 'Chất lượng 4K', 'Tải phim', 'Độc quyền'] },
];

export const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'history';
  const { user } = useAuthStore();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 px-4 text-center">
        <h2 className="text-2xl text-white font-bold mb-4">Bạn chưa đăng nhập</h2>
        <Link to="/login" className="bg-brand-red text-white px-6 py-2 rounded-md font-medium">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-700 shrink-0 bg-gray-800">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{user.displayName || user.username}</h1>
            <p className="text-gray-400 mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1">
                <Crown className="w-4 h-4" /> THÀNH VIÊN VIP
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1 rounded border border-gray-700">
                Gia nhập: Tháng 5, 2026
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors mt-4 md:mt-0">
            <Settings className="w-4 h-4" /> Cài đặt
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" /> Lịch sử xem
          </button>
          <button 
            onClick={() => handleTabChange('mylist')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'mylist' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5" /> Phim yêu thích
          </button>
          <button 
            onClick={() => handleTabChange('vip')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'vip' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown className="w-5 h-5" /> Quản lý gói VIP
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Watch History */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Đang xem dở</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockHistory.map(item => (
                  <Link key={item.id} to={`/watch/${item.movieId}`} className="group bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="relative aspect-video">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
                           <Play className="w-6 h-6 fill-white ml-1" />
                         </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                        <div className="h-full bg-brand-red" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.episode}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My List */}
          {activeTab === 'mylist' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Danh sách của tôi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mockFavorites.map(item => (
                  <Link key={item.id} to={`/movie/${item.id}`} className="group relative rounded-md overflow-hidden aspect-[2/3]">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                       <h3 className="text-white font-medium text-sm line-clamp-2">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* VIP Packages */}
          {activeTab === 'vip' && (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Nâng cấp trải nghiệm điện ảnh</h2>
                <p className="text-gray-400">Chọn gói cước phù hợp với bạn để thưởng thức kho phim bản quyền, không quảng cáo với chất lượng lên đến 4K.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {mockVipPackages.map((pkg, idx) => (
                  <div key={pkg.id} className={`rounded-2xl p-6 border ${idx === 1 ? 'bg-gradient-to-b from-brand-gold/20 to-gray-900 border-brand-gold' : 'bg-gray-900 border-gray-800'} flex flex-col`}>
                    {idx === 1 && <span className="bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-full w-max mb-4">PHỔ BIẾN NHẤT</span>}
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{pkg.price}</span>
                      <span className="text-gray-400">/{pkg.duration}</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-3 rounded-lg font-bold transition-colors ${idx === 1 ? 'bg-brand-gold text-black hover:bg-yellow-400' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                      Chọn Gói Này
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
