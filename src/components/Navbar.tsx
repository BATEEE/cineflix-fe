import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Search, Bell, User, Settings, LogOut, Heart, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();

  // Handle scroll effect for navbar background
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Phim Lẻ', path: '/movies' },
    { name: 'Phim Bộ', path: '/tv-shows' },
    { name: 'Mới & Phổ biến', path: '/latest' },
  ];
  
  if (isAuthenticated) {
    navLinks.push({ name: 'Danh sách của tôi', path: '/profile?tab=mylist' });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-brand-bg shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center h-[68px]">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-brand-red font-black text-2xl tracking-tighter">
            <Film className="w-8 h-8" />
            <span>CINEFLIX</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-[14px] transition-colors ${
                    isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-gray-400'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex flex-1 items-center justify-end gap-6">
          {/* Search Icon */}
          <button className="text-gray-300 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* VIP Button */}
          <Link
            to="/vip"
            className="hidden sm:block text-[13px] font-bold text-black bg-brand-gold hover:bg-yellow-400 px-3 py-1.5 rounded-md transition-colors shadow-[0_0_10px_rgba(255,193,7,0.3)]"
          >
            MUA VIP
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="text-gray-300 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-brand-red rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-red to-orange-500 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <img src={user?.avt || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="caret-down border-t-4 border-l-4 border-r-4 border-transparent border-t-white mt-1"></span>
                </div>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-gray-800 rounded-md shadow-xl py-2 flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-800 mb-2">
                      <p className="text-[13px] text-white font-medium truncate">{user?.displayName || 'Người dùng'}</p>
                    </div>

                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-300 hover:underline">
                      <User className="w-4 h-4" />
                      Quản lý hồ sơ
                    </Link>
                    <Link to="/profile?tab=history" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-300 hover:underline">
                      <Clock className="w-4 h-4" />
                      Lịch sử xem
                    </Link>
                    <Link to="/profile?tab=mylist" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-300 hover:underline">
                      <Heart className="w-4 h-4" />
                      Phim yêu thích
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-300 hover:underline">
                      <Settings className="w-4 h-4" />
                      Cài đặt tài khoản
                    </Link>

                    <div className="border-t border-gray-800 mt-2 pt-2">
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-[13px] text-gray-300 hover:underline"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất khỏi Cineflix
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="text-[14px] font-medium text-white bg-[#E50914] hover:bg-[#C11119] px-4 py-1.5 rounded transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
