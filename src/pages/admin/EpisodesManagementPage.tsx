import React, { useState } from 'react';
import { Plus, Edit, Trash2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EpisodeFormModal } from './components/EpisodeFormModal';

// Mock Data
const mockMovies = [
  { id: 1, title: 'Stranger Things 4', type: 2 },
  { id: 2, title: 'Interstellar', type: 1 },
  { id: 3, title: 'The Witcher', type: 2 },
];

const mockEpisodes = {
  1: [
    { id: 101, title: 'Tập 1: Câu lạc bộ Hellfire', duration: '1h 18m', video_type: 2, video_url: 'http://example.com/vid1.mp4' },
    { id: 102, title: 'Tập 2: Lời nguyền của Vecna', duration: '1h 17m', video_type: 2, video_url: 'http://example.com/vid2.mp4' },
    { id: 100, title: 'Trailer Chính thức', duration: '2m 30s', video_type: 1, video_url: 'http://youtube.com/watch?v=123' },
  ],
  2: [
    { id: 201, title: 'Phim chính', duration: '2h 49m', video_type: 2, video_url: 'http://example.com/interstellar.mp4' },
  ]
};

export const EpisodesManagementPage = () => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<any | null>(null);

  const episodes = selectedMovieId ? mockEpisodes[parseInt(selectedMovieId) as keyof typeof mockEpisodes] || [] : [];
  const selectedMovie = mockMovies.find(m => m.id.toString() === selectedMovieId);

  const handleEdit = (episode: any) => {
    setEditingEpisode(episode);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEpisode(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Tập Phim</h1>
          <p className="text-gray-400">Chọn một bộ phim để thêm/sửa các tập phim hoặc trailer.</p>
        </div>
        
        {/* Movie Selector */}
        <div className="w-full md:w-72">
          <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white h-12">
              <Film className="w-4 h-4 mr-2 text-brand-red" />
              <SelectValue placeholder="-- Chọn một bộ phim --" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {mockMovies.map(movie => (
                <SelectItem key={movie.id} value={movie.id.toString()}>{movie.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedMovieId ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
          <Film className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">Chưa chọn phim</h3>
          <p className="text-gray-500">Vui lòng chọn một bộ phim từ menu thả xuống bên trên để quản lý tập.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <h3 className="text-lg font-bold text-white">
              Danh sách tập: <span className="text-brand-red">{selectedMovie?.title}</span>
            </h3>
            <Button onClick={handleAddNew} className="bg-brand-red text-white hover:bg-red-700 flex items-center gap-2 border-none h-9">
              <Plus className="w-4 h-4" /> Thêm tập/trailer
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300">ID Tập</TableHead>
                  <TableHead className="text-gray-300 min-w-[200px]">Tên tập</TableHead>
                  <TableHead className="text-gray-300">Loại</TableHead>
                  <TableHead className="text-gray-300">Thời lượng</TableHead>
                  <TableHead className="text-gray-300 max-w-[300px]">Link Video</TableHead>
                  <TableHead className="text-gray-300 text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((ep) => (
                  <TableRow key={ep.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">#{ep.id}</TableCell>
                    <TableCell className="font-medium text-white">{ep.title}</TableCell>
                    <TableCell>
                      {ep.video_type === 1 
                        ? <Badge variant="outline" className="border-blue-500 text-blue-400">Trailer</Badge> 
                        : <Badge variant="outline" className="border-green-500 text-green-400">Phim chính</Badge>}
                    </TableCell>
                    <TableCell className="text-gray-300">{ep.duration}</TableCell>
                    <TableCell className="text-gray-400 text-sm truncate max-w-[300px] font-mono">
                      {ep.video_url}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ep)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {episodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Phim này chưa có tập nào. Nhấn "Thêm tập/trailer" để bắt đầu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedMovieId && (
        <EpisodeFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          episode={editingEpisode}
          movieId={parseInt(selectedMovieId)}
        />
      )}
    </div>
  );
};
