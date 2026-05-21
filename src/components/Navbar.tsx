import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Film,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Heart,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isAuthenticated } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Phim Lẻ", path: "/movies" },
    { name: "Phim Bộ", path: "/tv-shows" },
    { name: "Khám phá", path: "/explore" },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: "Danh sách của tôi", path: "/profile?tab=mylist" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-2 border-b border-transparent"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center h-[68px] sm:h-[76px]">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-red font-black text-2xl sm:text-3xl tracking-tighter hover:scale-105 transition-transform duration-300 drop-shadow-lg"
          >
            <Film className="w-8 h-8" />
            <span>CINEFLIX</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-[14px] font-medium transition-all duration-300 relative group ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-brand-red transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    ></span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex flex-1 items-center justify-end gap-6 sm:gap-7">
          {/* Search Icon */}
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
                className="bg-black/60 text-white placeholder-gray-500 text-xs pl-9 pr-4 py-1.5 rounded-full border border-zinc-700/80 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all duration-300 w-40 sm:w-48 md:w-56"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

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
              <div className="relative" ref={menuRef}>
                <div
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-brand-red to-orange-500 overflow-hidden border border-white/20 group-hover:border-white/60 transition-colors">
                    <img
                      src={
                        user?.avt ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-black/95 backdrop-blur-xl border border-gray-800 rounded-lg shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-800 mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-brand-red to-orange-500 overflow-hidden shrink-0">
                        <img
                          src={
                            user?.avt ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[14px] text-white font-bold truncate leading-tight">
                          {user?.displayName || "Người dùng"}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {user?.email || "Thành viên"}
                        </p>
                      </div>
                    </div>

                    <div className="px-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="w-[18px] h-[18px]" />
                        Quản lý hồ sơ
                      </Link>
                      <Link
                        to="/profile?tab=history"
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Clock className="w-[18px] h-[18px]" />
                        Lịch sử xem
                      </Link>
                      <Link
                        to="/profile?tab=mylist"
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Heart className="w-[18px] h-[18px]" />
                        Phim yêu thích
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-[18px] h-[18px]" />
                        Cài đặt tài khoản
                      </Link>
                    </div>

                    <div className="border-t border-gray-800 mt-2 mx-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          navigate("/");
                          setShowProfileMenu(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-brand-red hover:bg-white/10 rounded-md transition-colors"
                      >
                        <LogOut className="w-[18px] h-[18px]" />
                        Đăng xuất
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
