import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: any | null; // null means Add new
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({ isOpen, onClose, movie }) => {
  const isEditing = !!movie;
  
  const [formData, setFormData] = useState({
    title: '',
    original_title: '',
    poster_path: '',
    backdrop_path: '',
    type: '1',
    is_premium: false,
    release_date: '',
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        original_title: movie.original_title || '',
        poster_path: movie.poster_path || '',
        backdrop_path: movie.backdrop_path || '',
        type: movie.type?.toString() || '1',
        is_premium: movie.is_premium || false,
        release_date: movie.release_date || '',
      });
    } else {
      setFormData({
        title: '',
        original_title: '',
        poster_path: '',
        backdrop_path: '',
        type: '1',
        is_premium: false,
        release_date: '',
      });
    }
  }, [movie, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving movie...", formData);
    // TODO: Call API to save/update
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? 'Sửa thông tin phim' : 'Thêm phim mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-gray-300">Tên phim</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="original_title" className="text-right text-gray-300">Tên gốc</Label>
            <Input id="original_title" name="original_title" value={formData.original_title} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-gray-300">Loại phim</Label>
            <div className="col-span-3">
              <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
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
            <Label htmlFor="poster_path" className="text-right text-gray-300">Link Poster</Label>
            <Input id="poster_path" name="poster_path" value={formData.poster_path} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backdrop_path" className="text-right text-gray-300">Link Backdrop</Label>
            <Input id="backdrop_path" name="backdrop_path" value={formData.backdrop_path} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="release_date" className="text-right text-gray-300">Ngày phát hành</Label>
            <Input id="release_date" type="date" name="release_date" value={formData.release_date} onChange={handleChange} className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_premium" className="text-right text-gray-300">Phim VIP</Label>
            <div className="col-span-3 flex items-center">
              <Switch id="is_premium" checked={formData.is_premium} onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_premium: val }))} />
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
