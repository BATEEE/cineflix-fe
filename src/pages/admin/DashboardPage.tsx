import { useState, useEffect } from 'react';
import { 
  Film, 
  Eye, 
  TrendingUp, 
  Crown,
  PlayCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export const DashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5063/api/admin/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-white p-8">Loading dashboard data...</div>;
  }

  if (!data) {
    return <div className="text-white p-8">Error loading data.</div>;
  }

  const { stats, chartData, topMovies } = data;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-gray-400 mt-1">Theo dõi các chỉ số quan trọng của CineMax</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng số Phim" 
          value={stats.totalMovies.value.toLocaleString()} 
          change={stats.totalMovies.change} 
          isPositive={stats.totalMovies.isPositive}
          icon={Film}
          color="from-blue-500 to-cyan-400"
        />
        <StatCard 
          title="Lượt xem hệ thống" 
          value={stats.totalViews.value.toLocaleString()} 
          change={stats.totalViews.change} 
          isPositive={stats.totalViews.isPositive}
          icon={Eye}
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          title="Doanh thu tháng này" 
          value={`${stats.monthlyRevenue.value.toLocaleString()} đ`} 
          change={stats.monthlyRevenue.change} 
          isPositive={stats.monthlyRevenue.isPositive}
          icon={TrendingUp}
          color="from-emerald-400 to-teal-500"
        />
        <StatCard 
          title="Tổng user VIP" 
          value={stats.totalVipUsers.value.toLocaleString()} 
          change={stats.totalVipUsers.change} 
          isPositive={stats.totalVipUsers.isPositive}
          icon={Crown}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* Chart & Top List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Section */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Lượt xem 7 ngày qua</h2>
            <select className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-300 outline-none focus:ring-2 focus:ring-red-500">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Movies List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Top 5 Phim</h2>
            <button className="text-red-500 text-sm hover:underline">Xem tất cả</button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {topMovies.map((movie: any, index: number) => (
              <div key={movie.id} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-white font-medium truncate">{movie.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {movie.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-yellow-500">⭐ {movie.rating}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

// Helper component for Stat Cards
const StatCard = ({ title, value, change, isPositive, icon: Icon, color }: any) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} bg-opacity-10 text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 z-10 relative">
        <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-500">so với tháng trước</span>
      </div>
      {/* Decorative gradient blur */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
    </div>
  );
};
