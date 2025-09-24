import { Download, X, File, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
}

export default function FilePreview({ file, isOpen, onClose, onDownload }: FilePreviewProps) {
  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');
  const isPdf = file.mime_type?.includes('pdf');


  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px] max-h-[80vh] bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={file.url}
            alt={file.original_name || file.name}
            className="max-w-full max-h-full object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
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
        <div className="flex items-center justify-center w-full h-full min-h-[400px] max-h-[80vh] bg-gray-50 rounded-lg overflow-hidden">
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
            onError={(e) => {
              console.error('Video load error:', e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-[80vh] bg-gray-50 rounded-lg overflow-hidden">
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
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground bg-gray-50 rounded-lg">
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
      <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="truncate">{file.original_name || file.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-shrink-0">
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

          {/* Preview Content */}
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-gray-50">
            {renderPreview()}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center flex-shrink-0 pt-2">
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
      </DialogContent>
    </Dialog>
  );
}
