import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  RotateCcw, 
  X,
  Folder, 
  File, 
  Download, 
  Image as ImageIcon,
  Video,
  FileText,
  Archive,
  Grid3X3,
  List,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import FileCard from '@/components/FileCard';
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
  deleted_at: string;
  url?: string;
  human_size?: string;
  uploader: {
    name: string;
    email: string;
  };
}

interface Props {
  files: FileItem[];
}

export default function FileManagerTrash({ files }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
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
    {
      title: 'Trash',
      href: '/file-manager/trash',
    }
  ];

  const handleRestore = (fileId: number) => {
    if (confirm('Are you sure you want to restore this item?')) {
      router.put(`/file-manager/${fileId}/restore`, {}, {
        onSuccess: () => {
          setSelectedFiles([]);
        }
      });
    }
  };

  const handleForceDelete = (fileId: number) => {
    if (confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      router.delete(`/file-manager/${fileId}/force`, {
        onSuccess: () => {
          setSelectedFiles([]);
        }
      });
    }
  };

  const handleDownload = (file: FileItem) => {
    window.open(`/file-manager/download/${file.id}`, '_blank');
  };

  const handleBackToFiles = () => {
    router.get('/file-manager');
  };

  return (
    <AppLayout breadcrumbs={layoutBreadcrumbs}>
      <Head title="Trash - File Manager" />
      
      <div className="flex h-full flex-1 flex-col overflow-x-auto">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToFiles}
                  className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Files
                </Button>
                <div>
                  <h1 className="text-2xl font-light text-zinc-900 dark:text-white mb-1">
                    Trash
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {filteredFiles.filter(f => f.is_folder).length} folders • {filteredFiles.filter(f => !f.is_folder).length} files
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
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
              placeholder="Search deleted files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Files Display */}
        {filteredFiles.length > 0 ? (
          <div className="flex-1 p-8">
            {/* Folders Section */}
            {filteredFiles.filter(file => file.is_folder).length > 0 && (
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Deleted Folders</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredFiles
                    .filter(file => file.is_folder)
                    .map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onFileClick={() => {}} // No click action for deleted folders
                        onDownload={handleDownload}
                        onDelete={handleForceDelete}
                        onRestore={handleRestore}
                        viewMode={viewMode}
                        isFolder={true}
                        isDeleted={true}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.filter(file => !file.is_folder).length > 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Deleted Files</h3>
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
                        onFileClick={() => {}} // No click action for deleted files
                        onDownload={handleDownload}
                        onDelete={handleForceDelete}
                        onRestore={handleRestore}
                        viewMode={viewMode}
                        isFolder={false}
                        isDeleted={true}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Trash is empty</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
              Deleted files will appear here. You can restore them or permanently delete them.
            </p>
            <Button 
              variant="ghost" 
              onClick={handleBackToFiles}
              className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Files
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
