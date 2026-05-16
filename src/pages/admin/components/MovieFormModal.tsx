import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import movieService, { type CreateMoviePayload, type MovieListItem } from '@/services/movieService';

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: MovieListItem | null; // null means Add new
  onSuccess?: () => void;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({ isOpen, onClose, movie, onSuccess }) => {
  const isEditing = !!movie;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateMoviePayload>({
    title: '',
    description: '',
    coverImg: '',
    type: 1,
    isPremium: false,
    releaseDate: new Date().toISOString().split('T')[0],
    studioId: 1, // Default, should ideally fetch from studioService
    genreIds: [],
  });

  useEffect(() => {
    if (movie && isOpen) {
      // In real app, might need to fetch full movie details to get studioId, genreIds
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        coverImg: movie.coverImg || '',
        type: movie.type || 1,
        isPremium: movie.isPremium || false,
        releaseDate: movie.releaseDate?.split('T')[0] || '',
        studioId: 1, // Mock
        genreIds: [], // Mock
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        coverImg: '',
        type: 1,
        isPremium: false,
        releaseDate: new Date().toISOString().split('T')[0],
        studioId: 1,
        genreIds: [],
      });
    }
  }, [movie, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && movie?.id) {
        await movieService.update(movie.id, formData);
        alert("Cập nhật phim thành công!");
      } else {
        await movieService.create(formData);
        alert("Thêm phim mới thành công!");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? 'Sửa thông tin phim' : 'Thêm phim mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-gray-300">Tên phim</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-gray-300">Loại phim</Label>
            <div className="col-span-3">
              <Select value={formData.type.toString()} onValueChange={(val) => setFormData(prev => ({ ...prev, type: Number(val) }))}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Chọn loại phim" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="1">Phim Lẻ (Movie)</SelectItem>
                  <SelectItem value="2">Phim Bộ (TV Show)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverImg" className="text-right text-gray-300">Link Poster</Label>
            <Input id="coverImg" name="coverImg" value={formData.coverImg} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="releaseDate" className="text-right text-gray-300">Ngày phát hành</Label>
            <Input id="releaseDate" type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPremium" className="text-right text-gray-300">Phim VIP</Label>
            <div className="col-span-3 flex items-center">
              <Switch id="isPremium" checked={formData.isPremium} onCheckedChange={(val) => setFormData(prev => ({ ...prev, isPremium: val }))} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-gray-300">Mô tả ngắn</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          {/* Note: Studio ID and Genre IDs are hardcoded in this simple implementation */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="bg-transparent border-gray-700 text-white hover:bg-gray-800">Hủy</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-brand-red text-white hover:bg-red-700">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
