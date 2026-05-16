import React, { useEffect, useState } from 'react';
import { 
  Clapperboard, 
  Eye, 
  Star, 
  TrendingUp, 
  PlayCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import studioService, { type StudioDashboardStats } from '@/services/studioService';

export const StudioDashboard = () => {
  const [data, setData] = useState<StudioDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studioService.getDashboardStats()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-zinc-500">Đang tải dữ liệu Studio...</div>;
  }

  if (!data) return <div className="text-red-400">Không thể tải dữ liệu.</div>;

  const { totalMovies, totalViews, avgRating, chartData, topMovies } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Studio Dashboard</h1>
        <p className="text-zinc-500 mt-1">Hiệu suất nội dung của hãng phim trong 30 ngày qua</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StudioStatCard 
          title="Tổng phim đăng tải" 
          value={totalMovies.value} 
          change={totalMovies.change} 
          isPositive={totalMovies.isPositive} 
          icon={Clapperboard}
          color="blue"
        />
        <StudioStatCard 
          title="Lượt xem toàn bộ" 
          value={totalViews.value.toLocaleString()} 
          change={totalViews.change} 
          isPositive={totalViews.isPositive} 
          icon={Eye}
          color="purple"
        />
        <StudioStatCard 
          title="Đánh giá trung bình" 
          value={avgRating.value} 
          change={avgRating.change} 
          isPositive={avgRating.isPositive} 
          icon={Star}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Biểu đồ tăng trưởng lượt xem</h2>
            <div className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">7 ngày qua</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', border: '1px solid #27272a' }}
                />
                <Area type="monotone" dataKey="views" stroke="#E50914" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movies */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Top phim của Hãng</h2>
          <div className="space-y-4">
            {topMovies.map((movie, idx) => (
              <div key={movie.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{movie.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {movie.views.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" /> {movie.rating}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                   <PlayCircle className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudioStatCard = ({ title, value, change, isPositive, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: "from-blue-600/20 to-cyan-400/20 text-blue-500 border-blue-500/20",
    purple: "from-purple-600/20 to-pink-500/20 text-purple-500 border-purple-500/20",
    amber: "from-amber-600/20 to-orange-400/20 text-amber-500 border-amber-500/20"
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} border shadow-xl`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
        <span className="text-xs text-zinc-500">so với 30 ngày trước</span>
      </div>
      {/* Glow Effect */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-600/5 blur-3xl rounded-full group-hover:bg-red-600/10 transition-all duration-500"></div>
    </div>
  );
};
