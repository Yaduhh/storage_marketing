import { Download, X, File, Image as ImageIcon, Video, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';

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
  url?: string;
}

interface FilePreviewProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
  files?: FileItem[];
  onFileChange?: (file: FileItem) => void;
}

export default function FilePreview({ file, isOpen, onClose, onDownload, files = [], onFileChange }: FilePreviewProps) {
  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');
  const isPdf = file.mime_type?.includes('pdf');

  // Filter files that can be previewed (non-folders)
  const previewableFiles = files.filter(f => !f.is_folder);
  const currentIndex = previewableFiles.findIndex(f => f.id === file.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < previewableFiles.length - 1;

  // Navigation functions
  const goToPrevious = () => {
    if (hasPrevious && onFileChange) {
      onFileChange(previewableFiles[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext && onFileChange) {
      onFileChange(previewableFiles[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft' && hasPrevious) {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onClose, onFileChange, previewableFiles, currentIndex]);


  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-50">
          <img
            src={file.url}
            alt={file.original_name || file.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Image load error:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-50">
          <video
            src={file.url}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error('Video load error:', e);
              console.error('Video URL:', file.url);
              console.error('Video file:', file);
            }}
            onLoadStart={() => {
              console.log('Video loading started:', file.url);
            }}
            onCanPlay={() => {
              console.log('Video can play:', file.url);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-full bg-gray-50">
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.original_name || file.name}
            onError={(e) => {
              console.error('PDF load error:', e);
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground bg-gray-50">
        <File className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">Preview not available</p>
        <p className="text-sm">This file type cannot be previewed</p>
      </div>
    );
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-6 h-6 text-green-500" />;
    if (isVideo) return <Video className="w-6 h-6 text-purple-500" />;
    if (isPdf) return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="truncate">{file.original_name || file.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Preview Content - 16:9 Aspect Ratio */}
          <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
            {renderPreview()}
            
            {/* Navigation Controls */}
            {previewableFiles.length > 1 && (
              <>
                {/* Previous Button */}
                {hasPrevious && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Next Button */}
                {hasNext && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                
                {/* File Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {previewableFiles.length}
                </div>
              </>
            )}
          </div>

          {/* File Info & Actions */}
          <div className="p-6 pt-4 space-y-4">
            {/* File Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">File Name:</span>
                <p className="text-muted-foreground truncate" title={file.original_name || file.name}>
                  {file.original_name || file.name}
                </p>
              </div>
              <div>
                <span className="font-medium">File Size:</span>
                <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <span className="font-medium">File Type:</span>
                <p className="text-muted-foreground">{file.mime_type || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-medium">Extension:</span>
                <p className="text-muted-foreground">{file.extension?.toUpperCase() || 'N/A'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {file.mime_type && (
                  <span>MIME Type: {file.mime_type}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
                <Button onClick={() => onDownload(file)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
