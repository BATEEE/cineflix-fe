import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, RefreshCw, AlertCircle, CheckCircle, UsersRound, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import personService, { type Person } from '@/services/personService';

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const PersonsManagementPage = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [fullnameInput, setFullnameInput] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPersons = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Load all persons including soft-deleted ones for the Admin
      const data = await personService.getAll(true);
      setPersons(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách nhân sự:", err);
      setErrorMsg("Không thể tải danh sách diễn viên/đạo diễn. Vui lòng kiểm tra kết nối API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  // Clear messages automatically after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenCreateModal = () => {
    setEditingPerson(null);
    setFullnameInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (person: Person) => {
    setEditingPerson(person);
    setFullnameInput(person.fullname);
    setSelectedFile(null);
    setPreviewUrl(person.avatar || null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setModalError("Chỉ chấp nhận các tệp hình ảnh.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setModalError("Kích thước tệp tối đa là 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setModalError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setModalError("Chỉ chấp nhận các tệp hình ảnh.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setModalError("Kích thước tệp tối đa là 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setModalError(null);
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullnameInput.trim()) {
      setModalError("Họ và tên không được để trống.");
      return;
    }

    setModalLoading(true);
    setModalError(null);

    const formData = new FormData();
    formData.append("Fullname", fullnameInput.trim());
    if (selectedFile) {
      formData.append("AvatarFile", selectedFile);
    } else if (editingPerson && previewUrl) {
      // If we are editing and have no new file but have an existing avatar, pass the existing URL
      formData.append("AvatarUrl", previewUrl);
    }

    try {
      if (editingPerson) {
        // Update existing person
        await personService.update(editingPerson.id, formData);
        setSuccessMsg(`Đã cập nhật diễn viên/đạo diễn "${fullnameInput.trim()}" thành công.`);
      } else {
        // Create new person
        await personService.create(formData);
        setSuccessMsg(`Đã thêm mới diễn viên/đạo diễn "${fullnameInput.trim()}" thành công!`);
      }
      setIsModalOpen(false);
      fetchPersons();
    } catch (err: any) {
      console.error("Lỗi khi lưu nhân sự:", err);
      const errMsg = err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin.";
      setModalError(errMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleDelete = async (id: number, currentName: string, isCurrentlyDeleted: boolean) => {
    setErrorMsg(null);
    try {
      await personService.toggleStatus(id);
      
      // Update local state dynamically
      setPersons(prev => prev.map(p => p.id === id ? { ...p, isDeleted: !isCurrentlyDeleted } : p));
      
      setSuccessMsg(
        isCurrentlyDeleted 
          ? `Đã khôi phục diễn viên/đạo diễn "${currentName}" thành công.` 
          : `Đã ẩn (xóa mềm) diễn viên/đạo diễn "${currentName}" thành công.`
      );
    } catch (err: any) {
      console.error("Lỗi khi thay đổi trạng thái nhân sự:", err);
      const errMsg = err?.response?.data?.message || "Không thể thay đổi trạng thái diễn viên/đạo diễn.";
      setErrorMsg(errMsg);
    }
  };

  // Local filtering based on Search Input and Status Dropdown with Vietnamese accent-insensitive matching
  const filteredPersons = persons.filter(p => {
    const searchNormalized = removeVietnameseTones(searchTerm.toLowerCase());
    const nameNormalized = removeVietnameseTones(p.fullname.toLowerCase());
    const matchesSearch = nameNormalized.includes(searchNormalized);
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !p.isDeleted) ||
      (statusFilter === 'deleted' && p.isDeleted);
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(-2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Diễn viên/Đạo diễn</h1>
          <p className="text-gray-400">Xem danh sách, thêm mới, sửa đổi hoặc ẩn các diễn viên và đạo diễn trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchPersons} variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
          <Button 
            onClick={handleOpenCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-medium shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Thêm nhân sự mới
          </Button>
        </div>
      </div>

      {/* Global Action Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/20 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-[600px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm kiếm theo tên diễn viên, đạo diễn..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white h-10 w-full" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[180px]">
              <label className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Trạng thái hiển thị</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-xs">Tất cả nhân sự</SelectItem>
                  <SelectItem value="active" className="text-xs">Đang hoạt động</SelectItem>
                  <SelectItem value="deleted" className="text-xs">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }} 
                className="text-brand-red hover:text-red-400 hover:bg-red-500/10 text-xs h-9 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300 w-24">ID</TableHead>
                <TableHead className="text-gray-300 w-32">Ảnh đại diện</TableHead>
                <TableHead className="text-gray-300 min-w-[250px]">Họ và tên</TableHead>
                <TableHead className="text-gray-300 w-36">Đang hoạt động</TableHead>
                <TableHead className="text-gray-300 w-36 text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredPersons.map((person) => (
                <TableRow 
                  key={person.id} 
                  className={`border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                    person.isDeleted ? 'opacity-40 grayscale bg-gray-950/40 text-gray-500' : ''
                  }`}
                >
                  <TableCell className="font-medium text-gray-400">#{person.id}</TableCell>
                  <TableCell>
                    {person.avatar ? (
                      <img 
                        src={person.avatar} 
                        alt={person.fullname} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border-2 border-gray-700 shadow-md flex items-center justify-center text-gray-300 font-bold text-sm">
                        {getInitials(person.fullname)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={`font-semibold text-base ${person.isDeleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                    <div className="flex items-center gap-2">
                      <span>{person.fullname}</span>
                      {person.isDeleted && (
                        <Badge variant="destructive" className="bg-red-950/60 text-red-400 border border-red-800/60 text-[10px] py-0 px-2 font-normal animate-pulse">
                          Đã ẩn
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={!person.isDeleted} 
                      onCheckedChange={() => handleToggleDelete(person.id, person.fullname, !!person.isDeleted)}
                      className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-700"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenEditModal(person)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800/80 flex items-center gap-1.5 text-xs h-8 mx-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredPersons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Không tìm thấy diễn viên hoặc đạo diễn nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/10">
          <p className="text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-white">{filteredPersons.length}</span> trên tổng số{' '}
            <span className="font-semibold text-white">{persons.length}</span> diễn viên/đạo diễn
          </p>
        </div>
      </div>

      {/* Create/Edit Person Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-xl p-6">
          <form onSubmit={handleSavePerson}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-red-500" />
                {editingPerson ? 'Cập nhật Diễn viên/Đạo diễn' : 'Thêm Nhân sự mới'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 animate-fadeIn text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="fullname" className="text-xs font-semibold text-gray-300">Họ và tên</Label>
                <Input 
                  id="fullname" 
                  type="text" 
                  value={fullnameInput} 
                  onChange={(e) => setFullnameInput(e.target.value)} 
                  placeholder="Nhập họ và tên..."
                  className="bg-gray-800 border-gray-700 text-white h-10 placeholder-gray-500 focus:ring-red-500/20 focus:border-red-500 w-full text-sm"
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-gray-300">Ảnh đại diện (Avatar)</Label>
                
                {/* Circular Preview Container */}
                <div className="flex flex-col items-center justify-center py-2">
                  {previewUrl ? (
                    <div className="relative group w-32 h-32 mb-2">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-red-500/20 shadow-xl transition-all duration-300 group-hover:border-red-500/50"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePreview}
                        className="absolute -top-1 -right-1 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                        title="Xóa ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-700 hover:border-red-500/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-800/30 hover:bg-gray-800/60 p-4 text-center"
                    >
                      <Upload className="w-8 h-8 text-gray-500" />
                      <div className="text-xs text-gray-400">
                        <span className="text-red-500 font-semibold">Tải ảnh lên</span> hoặc kéo thả ảnh vào đây
                      </div>
                      <div className="text-[10px] text-gray-500">PNG, JPG, JPEG (Tối đa 5MB)</div>
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                disabled={modalLoading} 
                className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white h-9 px-3 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit"
                disabled={modalLoading} 
                className="bg-red-600 hover:bg-red-700 text-white font-medium h-9 px-4 text-xs shadow-lg shadow-red-600/10"
              >
                {modalLoading ? 'Đang tải lên...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
