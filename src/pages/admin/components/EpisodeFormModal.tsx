import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode?: any | null; // null means Add new
  movieId: number;
}

export const EpisodeFormModal: React.FC<EpisodeFormModalProps> = ({ isOpen, onClose, episode, movieId }) => {
  const isEditing = !!episode;
  
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    video_url: '',
    video_type: '2', // 1: Trailer, 2: Main Episode
  });

  useEffect(() => {
    if (episode) {
      setFormData({
        title: episode.title || '',
        duration: episode.duration || '',
        video_url: episode.video_url || '',
        video_type: episode.video_type?.toString() || '2',
      });
    } else {
      setFormData({
        title: '',
        duration: '',
        video_url: '',
        video_type: '2',
      });
    }
  }, [episode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log(`Saving episode for movie ${movieId}...`, formData);
    // TODO: Call API
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? 'Sửa thông tin tập' : 'Thêm tập mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-gray-300">Tên tập</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" placeholder="VD: Tập 1: Bắt đầu" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right text-gray-300">Thời lượng</Label>
            <Input id="duration" name="duration" value={formData.duration} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" placeholder="VD: 45 phút" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video_url" className="text-right text-gray-300">Link Video</Label>
            <Input id="video_url" name="video_url" value={formData.video_url} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" placeholder="URL file MP4/M3U8..." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video_type" className="text-right text-gray-300">Loại Video</Label>
            <div className="col-span-3">
              <Select value={formData.video_type} onValueChange={(val) => setFormData(prev => ({ ...prev, video_type: val }))}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Chọn loại video" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="1">Trailer</SelectItem>
                  <SelectItem value="2">Phim chính</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-gray-700 text-white hover:bg-gray-800">Hủy</Button>
          <Button onClick={handleSave} className="bg-brand-red text-white hover:bg-red-700">Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
