import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, 
  Film, 
  Tags, 
  Video, 
  Users, 
  MessageSquare, 
  CreditCard, 
  History, 
  Menu,
  LogOut,
  UsersRound
} from 'lucide-react';

export const AdminLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: "Cơ bản",
      items: [
        { label: "Tổng quan", icon: LayoutDashboard, path: "/admin/dashboard" },
      ]
    },
    {
      title: "🎬 Nội dung",
      items: [
        { label: "Danh sách Phim", icon: Film, path: "/admin/movies" },
        { label: "Tập phim & Trailer", icon: Video, path: "/admin/episodes" },
      ]
    },
    {
      title: "🗂️ Danh mục",
      items: [
        { label: "Thể loại", icon: Tags, path: "/admin/genres" },
        { label: "Hãng sản xuất", icon: Video, path: "/admin/studios" },
        { label: "Diễn viên/Đạo diễn", icon: UsersRound, path: "/admin/persons" },
      ]
    },
    {
      title: "👥 Cộng đồng",
      items: [
        { label: "Người dùng", icon: Users, path: "/admin/users" },
        { label: "Bình luận", icon: MessageSquare, path: "/admin/comments" },
      ]
    },
    {
      title: "💰 Kinh doanh",
      items: [
        { label: "Gói VIP", icon: CreditCard, path: "/admin/vip-packages" },
        { label: "Lịch sử Giao dịch", icon: History, path: "/admin/transactions" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
            CineFlix Admin
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-2 px-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-red-600/10 text-red-500 font-medium" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-gray-950/50 border-b border-gray-800 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-white transition-colors lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-medium hidden sm:inline-block">Xin chào, Admin!</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 p-[2px]">
              <div className="w-full h-full bg-gray-900 rounded-full border-2 border-transparent"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
