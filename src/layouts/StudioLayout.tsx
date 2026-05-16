import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, 
  Film, 
  MessageSquare, 
  CreditCard, 
  Settings,
  LogOut,
  Clapperboard,
  Users
} from 'lucide-react';

export const StudioLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: "Phân tích",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/studio/dashboard" },
      ]
    },
    {
      title: "🎬 Nội dung",
      items: [
        { label: "Quản lý Phim", icon: Clapperboard, path: "/studio/movies" },
        { label: "Bình luận", icon: MessageSquare, path: "/studio/comments" },
      ]
    },
    {
      title: "💰 Tài chính",
      items: [
        { label: "Doanh thu", icon: CreditCard, path: "/studio/revenue" },
      ]
    },
    {
      title: "⚙️ Hệ thống",
      items: [
        { label: "Cài đặt Hãng phim", icon: Settings, path: "/studio/settings" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0c10] text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800/50 flex flex-col h-full shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-tight">Studio Center</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-[0.1em] mb-3 px-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-red-600/10 text-red-500 font-semibold shadow-sm" 
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[14px]">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[14px]">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-zinc-950/30 border-b border-zinc-800/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="text-sm font-medium">Chào mừng, <span className="text-white">{user?.displayName}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[12px] text-zinc-500">Partner Account</span>
              <span className="text-[13px] font-semibold text-zinc-200">{user?.username}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 p-[2px] shadow-lg shadow-red-600/20">
               {user?.avt ? (
                 <img src={user.avt} alt="avt" className="w-full h-full object-cover rounded-xl" />
               ) : (
                 <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                 </div>
               )}
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
