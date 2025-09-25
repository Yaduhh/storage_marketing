import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FolderPlus, 
  Folder, 
  File, 
  Download, 
  Trash2, 
  Edit2, 
  Move,
  Image as ImageIcon,
  Video,
  FileText,
  Archive,
  Grid3X3,
  List,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import FileCard from '@/components/FileCard';
import FloatingUploadButton from '@/components/FloatingUploadButton';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface FileItem {
  id: number;
  name: string;
  original_name?: string;
  path: string;
  type: string;
  size?: number;
  mime_type?: string;
  extension?: string;
  is_folder: boolean;
  created_at: string;
  updated_at: string;
  url?: string;
  human_size?: string;
  uploader: {
    name: string;
    email: string;
  };
}

interface Breadcrumb {
  id: number | null;
  name: string;
}

interface Folder {
  id: number;
  name: string;
  path: string;
}

interface Filters {
  search?: string;
  sort_by?: string;
  sort_order?: string;
  filter_type?: string;
  filter_date?: string;
}

interface Props {
  files: FileItem[];
  breadcrumbs: Breadcrumb[];
  currentParentId: number | null;
  folders: Folder[];
  filters: Filters;
}

export default function FileManagerIndex({ files, breadcrumbs, currentParentId, folders, filters }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);


  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.original_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.uploader.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert breadcrumbs to the format expected by AppLayout
  const layoutBreadcrumbs: BreadcrumbItem[] = [
    {
      title: 'File Manager',
      href: '/file-manager',
    },
    ...breadcrumbs.slice(1).map(b => ({
      title: b.name,
      href: `/file-manager?parent_id=${b.id}`,
    }))
  ];

  const handleFileClick = (file: FileItem) => {
    if (file.is_folder) {
      router.get('/file-manager', { parent_id: file.id });
    } else {
      setPreviewFile(file);
      setShowPreview(true);
    }
  };

  const handleBreadcrumbClick = (parentId: number | null) => {
    router.get('/file-manager', { parent_id: parentId });
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      router.post('/file-manager/folder', {
        name: folderName,
        parent_id: currentParentId,
      }, {
        onSuccess: () => {
          setFolderName('');
          setShowCreateFolder(false);
        },
        onError: (errors) => {
          console.error('Error creating folder:', errors);
        }
      });
    }
  };

  const handleDelete = (fileId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(`/file-manager/${fileId}`, {
        onSuccess: () => {
          setSelectedFiles([]);
        }
      });
    }
  };

  const handleRename = (fileId: number, newName: string) => {
    router.put(`/file-manager/${fileId}/rename`, {
      name: newName,
    });
  };

  const handleDownload = (file: FileItem) => {
    window.open(`/file-manager/download/${file.id}`, '_blank');
  };

  const handleSelectFile = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleMoveSelected = () => {
    if (selectedFiles.length === 0) return;
    setShowMoveDialog(true);
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) return;
    if (confirm(`Are you sure you want to move ${selectedFiles.length} item(s) to trash?`)) {
      router.post('/file-manager/delete-multiple', {
        file_ids: selectedFiles,
      }, {
        onSuccess: () => {
          setSelectedFiles([]);
        }
      });
    }
  };

  const handleMoveConfirm = () => {
    if (selectedFiles.length === 0) return;
    
    router.post('/file-manager/move-multiple', {
      file_ids: selectedFiles,
      parent_id: selectedFolder || null,
    }, {
      onSuccess: () => {
        setSelectedFiles([]);
        setShowMoveDialog(false);
        setSelectedFolder('');
      }
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.get('/file-manager', {
      parent_id: currentParentId,
      search: query,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      filter_type: filters.filter_type,
      filter_date: filters.filter_date,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (sortBy: string, sortOrder: string) => {
    router.get('/file-manager', {
      parent_id: currentParentId,
      search: searchQuery,
      sort_by: sortBy,
      sort_order: sortOrder,
      filter_type: filters.filter_type,
      filter_date: filters.filter_date,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (filterType: string, filterDate: string) => {
    router.get('/file-manager', {
      parent_id: currentParentId,
      search: searchQuery,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      filter_type: filterType,
      filter_date: filterDate,
    }, {
      preserveState: true,
      replace: true,
    });
  };


  return (
    <AppLayout breadcrumbs={layoutBreadcrumbs}>
      <Head title="File Manager" />
      
      <div className="flex h-full flex-1 flex-col overflow-x-auto">
        {/* Minimalist Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-zinc-900 dark:text-white mb-1">
                  Files
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {filteredFiles.filter(f => f.is_folder).length} folders • {filteredFiles.filter(f => !f.is_folder).length} files
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.get('/file-manager/trash')}
                  className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Trash
                </Button>
                
                <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      New Folder
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Folder name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFolder}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
                
                {/* View Toggle */}
                <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none px-3 h-8"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none px-3 h-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg text-sm"
              />
            </div>
            
            {/* Sort */}
            <Select value={filters.sort_by || 'name'} onValueChange={(value) => handleSort(value, filters.sort_order || 'asc')}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort(filters.sort_by || 'name', filters.sort_order === 'asc' ? 'desc' : 'asc')}
              className="h-9 px-3"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>

            {/* Filter */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-3"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 flex items-center gap-4">
              <Select value={filters.filter_type || ''} onValueChange={(value) => handleFilter(value, filters.filter_date || '')}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="archives">Archives</SelectItem>
                  <SelectItem value="folders">Folders</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.filter_date || ''} onValueChange={(value) => handleFilter(filters.filter_type || '', value)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="px-8 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.id} className="flex items-center gap-2">
                  {index > 0 && <span className="text-zinc-300 dark:text-zinc-600">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(breadcrumb.id)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {breadcrumb.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedFiles.length > 0 && (
          <div className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedFiles.length} item(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  className="h-8 px-3 text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMoveSelected}
                  className="h-8 px-3"
                >
                  <Move className="w-4 h-4 mr-2" />
                  Move
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="h-8 px-3 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Files Display */}
        {filteredFiles.length > 0 ? (
          <div className="flex-1 p-8">
            {/* Select All */}
            {filteredFiles.length > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <Checkbox
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Select All ({filteredFiles.length} items)
                </span>
              </div>
            )}

            {/* Folders Section */}
            {filteredFiles.filter(file => file.is_folder).length > 0 && (
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Folders</h3>
                </div>
                <div className={
                  // Show folders in list style but arranged in 2-column grid
                  "grid grid-cols-2 gap-3"
                }>
                  {filteredFiles
                    .filter(file => file.is_folder)
                    .map((file) => (
                      <div key={file.id} className="relative">
                        <div className="absolute top-3 left-3 z-10">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </div>
                        <FileCard
                          file={file}
                          onFileClick={handleFileClick}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          viewMode={viewMode}
                          isFolder={true}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.filter(file => !file.is_folder).length > 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Files</h3>
                </div>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-1"
                }>
                  {filteredFiles
                    .filter(file => !file.is_folder)
                    .map((file) => (
                      <div key={file.id} className="relative">
                        <div className="absolute top-3 left-3 z-10">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </div>
                        <FileCard
                          file={file}
                          onFileClick={handleFileClick}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          viewMode={viewMode}
                          isFolder={false}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <Folder className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">No files yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
              Upload files or create a folder to get started
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateFolder(true)}
              className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </div>
        )}

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
          files={filteredFiles}
          onFileChange={(file) => setPreviewFile(file)}
        />
      )}

      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <FloatingUploadButton parentId={currentParentId} />
      </div>

      {/* Move Files Modal */}
      {showMoveDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Move {selectedFiles.length} item(s)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Select destination folder:
                </label>
                <select 
                  value={selectedFolder} 
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Root (No folder)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id.toString()}>
                      {folder.path}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMoveDialog(false);
                    setSelectedFolder('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleMoveConfirm}>
                  Move Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
