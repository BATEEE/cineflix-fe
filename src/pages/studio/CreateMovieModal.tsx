import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Clapperboard, Calendar, Film, Star, AlertCircle } from 'lucide-react';
import genreService, { type Genre } from '@/services/genreService';
import personService, { type Person } from '@/services/personService';
import studioService, { type CreateStudioMoviePayload } from '@/services/studioService';

interface CreateMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CastMember {
  personId: number;
  roleName: string;
}

export const CreateMovieModal: React.FC<CreateMovieModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<number>(1); // 1 = Phim Lẻ, 2 = Phim Bộ
  const [coverImg, setCoverImg] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);

  // Master Data States
  const [genres, setGenres] = useState<Genre[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([genreService.getAll(), personService.getAll()])
        .then(([genreRes, personRes]) => {
          setGenres(genreRes || []);
          setPersons(personRes || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Không thể tải danh sách thể loại hoặc diễn viên.");
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCast = () => {
    setCast([...cast, { personId: persons[0]?.id || 0, roleName: '' }]);
  };

  const handleRemoveCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const handleCastChange = (index: number, field: keyof CastMember, value: any) => {
    const updated = [...cast];
    updated[index] = { ...updated[index], [field]: value };
    setCast(updated);
  };

  const handleGenreToggle = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tên phim.");
      return;
    }
    if (selectedGenres.length === 0) {
      setError("Vui lòng chọn ít nhất một thể loại.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateStudioMoviePayload = {
      title,
      description,
      releaseDate,
      type,
      coverImg: coverImg.trim() || null,
      isPremium,
      genreIds: selectedGenres,
      cast: cast.filter(c => c.personId > 0 && c.roleName.trim() !== '')
    };

    try {
      const res = await studioService.createMovie(payload);
      if (res.success) {
        onSuccess();
        // Reset form
        setTitle('');
        setDescription('');
        setReleaseDate(new Date().toISOString().split('T')[0]);
        setType(1);
        setCoverImg('');
        setIsPremium(false);
        setSelectedGenres([]);
        setCast([]);
        onClose();
      } else {
        setError(res.message || "Đã xảy ra lỗi khi tạo phim.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <Clapperboard className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Đăng phim mới</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Thêm tác phẩm điện ảnh mới vào hệ thống phát sóng của bạn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-2">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm mt-2">Đang tải dữ liệu cấu hình...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Cột trái - 7 cột */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-500" />
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Tên phim *</label>
                      <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tên phim đầy đủ..."
                        className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Mô tả tóm tắt</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Viết tóm tắt nội dung cốt truyện thật hấp dẫn..."
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600/50 focus:border-red-600 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-red-500" />
                    Dàn diễn viên (Cast)
                  </h3>
                  <div className="space-y-3 bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-2xl">
                    {cast.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
                        <select
                          value={item.personId}
                          onChange={(e) => handleCastChange(idx, 'personId', parseInt(e.target.value))}
                          className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-red-600"
                        >
                          {persons.map(p => (
                            <option key={p.id} value={p.id}>{p.fullname}</option>
                          ))}
                        </select>
                        <input 
                          type="text"
                          value={item.roleName}
                          onChange={(e) => handleCastChange(idx, 'roleName', e.target.value)}
                          placeholder="Tên vai diễn..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-red-600"
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveCast(idx)}
                          className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCast}
                      className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-red-500/50 hover:bg-red-500/5 text-zinc-400 hover:text-red-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Diễn viên</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cột phải - 5 cột */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    Phân loại & Định dạng
                  </h3>
                  <div className="bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Định dạng</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setType(1)}
                          className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${type === 1 ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                        >
                          Phim Lẻ
                        </button>
                        <button
                          type="button"
                          onClick={() => setType(2)}
                          className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${type === 2 ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                        >
                          Phim Bộ
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Ngày chiếu</label>
                      <input 
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Loại hình phát hành</label>
                      <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/50 p-3 rounded-xl">
                        <div>
                          <p className="text-xs font-semibold text-white">Phim VIP (Premium)</p>
                          <p className="text-[10px] text-zinc-500">Chỉ người dùng mua VIP mới được xem</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Thể loại phim *</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-2xl custom-scrollbar">
                    {genres.map(genre => (
                      <button
                        type="button"
                        key={genre.id}
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-red-600 border-red-600 text-white font-semibold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {genre.genrename}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Ảnh bìa / Poster (URL)</label>
                  <input 
                    type="text"
                    value={coverImg}
                    onChange={(e) => setCoverImg(e.target.value)}
                    placeholder="Dán link ảnh poster (https://...)"
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-600"
                  />
                  {coverImg && (
                    <div className="mt-3 aspect-[2/3] w-28 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg mx-auto">
                      <img src={coverImg} alt="Poster preview" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=cover';
                      }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Lưu và Đăng</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
