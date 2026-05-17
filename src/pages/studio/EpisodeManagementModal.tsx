import React, { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Video, Calendar, Clock, Link2, AlertCircle, Film, Sparkles } from 'lucide-react';
import studioService from '@/services/studioService';
import type { Episode } from '@/services/episodeService';

interface EpisodeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number | null;
  movieTitle: string;
}

export const EpisodeManagementModal: React.FC<EpisodeManagementModalProps> = ({
  isOpen,
  onClose,
  movieId,
  movieTitle
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States (for creating/updating inline)
  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [seasonNumber, setSeasonNumber] = useState<number | undefined>(undefined);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('00:45:00'); // Default duration format HH:MM:SS
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoType, setVideoType] = useState<number>(1); // 1 = Tập chính thức, 2 = Trailer/Teaser
  const [showForm, setShowForm] = useState(false);

  const fetchEpisodes = () => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    studioService.getEpisodes(movieId)
      .then(res => {
        setEpisodes(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách tập phim.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen && movieId) {
      fetchEpisodes();
      resetForm();
    }
  }, [isOpen, movieId]);

  if (!isOpen || !movieId) return null;

  const resetForm = () => {
    setEditingEpisodeId(null);
    setEpisodeNumber(episodes.length > 0 ? Math.max(...episodes.map(e => e.episodeNumber)) + 1 : 1);
    setSeasonNumber(undefined);
    setEpisodeTitle('');
    setVideoUrl('');
    setDuration('00:45:00');
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setVideoType(1);
    setShowForm(false);
  };

  const handleEditClick = (episode: Episode) => {
    setEditingEpisodeId(episode.id);
    setEpisodeNumber(episode.episodeNumber);
    setSeasonNumber(episode.seasonNumber || undefined);
    setEpisodeTitle(episode.episodeTitle || '');
    setVideoUrl(episode.videoUrl);
    setDuration(episode.duration || '00:45:00');
    setReleaseDate(episode.releaseDate ? episode.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setVideoType(episode.videoType);
    setShowForm(true);
  };

  const handleDelete = async (episodeId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tập phim này?")) return;
    
    setLoading(true);
    try {
      const res = await studioService.deleteEpisode(episodeId);
      if (res.success) {
        fetchEpisodes();
      } else {
        setError(res.message || "Xóa tập phim không thành công.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError("Vui lòng nhập đường dẫn video.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      episodeNumber,
      seasonNumber,
      episodeTitle: episodeTitle.trim() || undefined,
      videoUrl: videoUrl.trim(),
      duration: duration.trim() || undefined,
      releaseDate: releaseDate || undefined,
      videoType
    };

    try {
      let res;
      if (editingEpisodeId) {
        res = await studioService.updateEpisode(editingEpisodeId, payload);
      } else {
        res = await studioService.createEpisode(movieId, payload);
      }

      if (res.success) {
        fetchEpisodes();
        resetForm();
      } else {
        setError(res.message || "Lưu tập phim thất bại.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lưu tập phim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <Video className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Quản lý tập phim</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Phim: <span className="text-zinc-300 font-semibold">{movieTitle}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body split in 2 columns if Form is visible */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Episodes List */}
          <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar ${showForm ? 'lg:border-r lg:border-zinc-800/60' : ''}`}>
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                Danh sách tập phim ({episodes.length})
              </h3>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/15 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm tập mới</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Đang tải danh sách tập...</p>
              </div>
            ) : episodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/10">
                <Video className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">Chưa có tập phim nào</p>
                <p className="text-xs text-zinc-600 mt-1">Hãng phim của bạn chưa đăng tải tập phim hay trailer nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <div 
                    key={episode.id} 
                    className={`flex items-center justify-between p-4 bg-zinc-950/20 hover:bg-zinc-950/40 border rounded-2xl transition-all group ${
                      editingEpisodeId === episode.id ? 'border-red-600/50 bg-red-600/5' : 'border-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-xs font-bold text-white shadow-sm">
                        <span className="text-[10px] text-zinc-500 font-medium">Tập</span>
                        <span className="mt-[-2px]">{episode.episodeNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {episode.episodeTitle || `Tập ${episode.episodeNumber}`}
                          </h4>
                          {episode.videoType === 2 ? (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Trailer / Teaser
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Chính thức
                            </span>
                          )}
                          {episode.seasonNumber && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-medium bg-zinc-800 text-zinc-400">
                              Mùa {episode.seasonNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {episode.duration || '--:--'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {episode.releaseDate ? new Date(episode.releaseDate).toLocaleDateString('vi-VN') : 'Mới'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(episode)}
                        title="Chỉnh sửa tập"
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(episode.id)}
                        title="Xóa tập"
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Add/Edit Form */}
          {showForm && (
            <div className="w-full lg:w-[420px] bg-zinc-950/10 p-8 overflow-y-auto custom-scrollbar flex flex-col border-t lg:border-t-0 border-zinc-800/60 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                  {editingEpisodeId ? "Cập nhật tập phim" : "Thêm tập phim mới"}
                </h3>
                <button 
                  onClick={resetForm}
                  className="text-zinc-500 hover:text-white text-xs font-semibold"
                >
                  Đóng Form
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Số tập *</label>
                    <input 
                      type="number"
                      min={1}
                      value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Mùa (Season)</label>
                    <input 
                      type="number"
                      min={1}
                      value={seasonNumber || ''}
                      onChange={(e) => setSeasonNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Mùa 1, 2..."
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Tiêu đề tập phim</label>
                  <input 
                    type="text"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="VD: Khởi đầu mới..."
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Loại tập phim *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoType(1)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        videoType === 1 ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Tập chính thức
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoType(2)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        videoType === 2 ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Trailer/Teaser
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Đường dẫn Video (URL) *</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-600"
                      required
                    />
                    <Link2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Thời lượng (Duration)</label>
                    <input 
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="HH:mm:ss"
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Ngày phát sóng</label>
                    <input 
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/15"
                  >
                    {submitting ? "Đang lưu..." : editingEpisodeId ? "Lưu thay đổi" : "Lưu tập phim"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
