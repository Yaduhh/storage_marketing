import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  File, 
  Download, 
  Trash2, 
  Play,
  Image as ImageIcon,
  Video,
  FileText,
  Archive,
  User,
  RotateCcw,
  X
} from 'lucide-react';

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

interface FileCardProps {
  file: FileItem;
  onFileClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onDelete: (fileId: number) => void;
  onRestore?: (fileId: number) => void;
  viewMode: 'grid' | 'list';
  isFolder?: boolean;
  isDeleted?: boolean;
}

export default function FileCard({ file, onFileClick, onDownload, onDelete, onRestore, viewMode, isFolder = false, isDeleted = false }: FileCardProps) {
  const [imageError, setImageError] = useState(false);

  const getFileIcon = () => {
    if (file.is_folder) {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }

    if (file.mime_type?.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    }

    if (file.mime_type?.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-500" />;
    }

    if (file.mime_type?.includes('pdf') || file.mime_type?.includes('document')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }

    if (file.mime_type?.includes('zip') || file.mime_type?.includes('rar')) {
      return <Archive className="w-8 h-8 text-orange-500" />;
    }

    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');

  // Minimalist folder display
  if (isFolder) {
    return (
      <div className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => onFileClick(file)}>
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Folder className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="font-medium text-sm truncate text-zinc-900 dark:text-white"
              title={file.name}
            >
              {file.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{formatDate(file.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {isDeleted ? (
              <div className="flex items-center gap-1">
                {onRestore && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(file.id);
                    }}
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  title="Permanently delete"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="group cursor-pointer bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
        <div className="flex items-center gap-4 p-4">
          {/* Preview/Icon */}
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
            {getFileIcon()}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="font-medium text-sm truncate text-zinc-900 dark:text-white"
                onClick={() => onFileClick(file)}
              >
                {file.original_name || file.name}
              </h3>
              {!file.is_folder && file.extension && (
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {file.extension.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {!file.is_folder && (
                <>
                  <span>{file.human_size}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(file.created_at)}</span>
              {!file.is_folder && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{file.uploader.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!file.is_folder && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {isDeleted ? (
              <div className="flex items-center gap-1">
                {onRestore && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(file.id);
                    }}
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  title="Permanently delete"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-sm transition-all">
      <div className="p-4">
        {/* Preview Area */}
        <div 
          className="relative w-full aspect-square mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden"
          onClick={() => onFileClick(file)}
        >
          {file.is_folder ? (
            <div className="w-full h-full flex items-center justify-center">
              {getFileIcon()}
            </div>
          ) : isImage && !imageError ? (
            <img
              src={file.url}
              alt={file.original_name || file.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-600 relative">
              <video 
                src={file.url}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
                onLoadedMetadata={(e) => {
                  // Set video to show first frame as thumbnail
                  e.currentTarget.currentTime = 1;
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
          
          {/* Overlay for video */}
          {isVideo && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-sm truncate text-zinc-900 dark:text-white"
                onClick={() => onFileClick(file)}
                title={file.original_name || file.name}
              >
                {file.original_name || file.name}
              </h3>
              {!file.is_folder && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {file.human_size}
                </p>
              )}
            </div>
            
            {!file.is_folder && file.extension && (
              <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-shrink-0">
                {file.extension.toUpperCase()}
              </span>
            )}
          </div>

          {/* Uploader Info - Only for files */}
          {!file.is_folder && (
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <User className="w-3 h-3" />
              <span className="truncate">{file.uploader.name}</span>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(file.created_at)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!file.is_folder && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(file);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {isDeleted ? (
              <div className="flex items-center gap-1">
                {onRestore && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(file.id);
                    }}
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  title="Permanently delete"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
