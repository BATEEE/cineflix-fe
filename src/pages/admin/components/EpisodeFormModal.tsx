import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import episodeService, { type CreateEpisodePayload, type EpisodeDetail } from '@/services/episodeService';

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode?: EpisodeDetail | null; // null means Add new
  movieId: number;
  onSuccess?: () => void;
}

export const EpisodeFormModal: React.FC<EpisodeFormModalProps> = ({ isOpen, onClose, episode, movieId, onSuccess }) => {
  const isEditing = !!episode;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateEpisodePayload>({
    movieId: movieId,
    episodeNumber: 1, // Default, you might want to auto-increment this
    episodeTitle: '',
    duration: '',
    videoType: 1, // 1: Main Episode, 2: Trailer
  });

  useEffect(() => {
    if (episode && isOpen) {
      setFormData({
        movieId: episode.movieId || movieId,
        episodeNumber: episode.episodeNumber || 1,
        episodeTitle: episode.episodeTitle || '',
        duration: episode.duration || '',
        videoType: episode.videoType || 1,
      });
    } else if (isOpen) {
      setFormData({
        movieId: movieId,
        episodeNumber: 1,
        episodeTitle: '',
        duration: '',
        videoType: 1,
      });
    }
  }, [episode, isOpen, movieId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'episodeNumber' ? Number(value) : value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && episode?.id) {
        await episodeService.update(episode.id, formData);
        alert("Cập nhật tập phim thành công!");
      } else {
        await episodeService.create(formData);
        alert("Thêm tập phim mới thành công!");
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
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? 'Sửa thông tin tập' : 'Thêm tập mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="episodeNumber" className="text-right text-gray-300">Tập số</Label>
            <Input id="episodeNumber" name="episodeNumber" type="number" value={formData.episodeNumber} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="episodeTitle" className="text-right text-gray-300">Tên tập</Label>
            <Input id="episodeTitle" name="episodeTitle" value={formData.episodeTitle} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" placeholder="VD: Tập 1: Bắt đầu" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right text-gray-300">Thời lượng</Label>
            <Input id="duration" name="duration" value={formData.duration} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" placeholder="VD: 45 phút" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoType" className="text-right text-gray-300">Loại Video</Label>
            <div className="col-span-3">
              <Select value={formData.videoType.toString()} onValueChange={(val) => setFormData(prev => ({ ...prev, videoType: Number(val) }))}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Chọn loại video" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="1">Phim chính</SelectItem>
                  <SelectItem value="2">Trailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
