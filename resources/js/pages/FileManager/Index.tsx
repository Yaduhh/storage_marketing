import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Search
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

interface Props {
  files: FileItem[];
  breadcrumbs: Breadcrumb[];
  currentParentId: number | null;
}

export default function FileManagerIndex({ files, breadcrumbs, currentParentId }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Search Bar */}
        <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg text-sm"
            />
          </div>
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


        {/* Files Display */}
        {filteredFiles.length > 0 ? (
          <div className="flex-1 p-8">
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
                      <FileCard
                        key={file.id}
                        file={file}
                        onFileClick={handleFileClick}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        viewMode={viewMode}
                        isFolder={true}
                      />
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
                      <FileCard
                        key={file.id}
                        file={file}
                        onFileClick={handleFileClick}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        viewMode={viewMode}
                        isFolder={false}
                      />
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

      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <FloatingUploadButton parentId={currentParentId} />
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
        />
        )}
      </div>

      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <FloatingUploadButton parentId={currentParentId} />
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
        />
      )}
    </AppLayout>
  );
}
