import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Upload, X, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FloatingUploadButtonProps {
  parentId?: number | null;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FloatingUploadButton({ parentId }: FloatingUploadButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    uploadFilesToServer(newUploadFiles);
  };

  const uploadFilesToServer = async (files: UploadFile[]) => {
    setIsUploading(true);

    // Update progress to uploading
    setUploadFiles(prev => 
      prev.map(f => 
        files.some(file => file.id === f.id) 
          ? { ...f, status: 'uploading', progress: 50 }
          : f
      )
    );

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append('files[]', file);
    });
    if (parentId) {
      formData.append('parent_id', parentId.toString());
    }

    router.post('/file-manager/upload', formData, {
      forceFormData: true,
      onSuccess: () => {
        setUploadFiles(prev => 
          prev.map(f => 
            files.some(file => file.id === f.id) 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );
        setIsUploading(false);
      },
      onError: (errors) => {
        console.error('Upload error:', errors);
        setUploadFiles(prev => 
          prev.map(f => 
            files.some(file => file.id === f.id) 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          )
        );
        setIsUploading(false);
      },
      onFinish: () => {
        setIsUploading(false);
      }
    });
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  return (
    <div className="relative">
      {/* Main Upload Button */}
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={() => setShowUploadArea(!showUploadArea)}
      >
        <Upload className="w-6 h-6" />
      </Button>

      {/* Upload Area */}
      {showUploadArea && (
        <div className="absolute bottom-16 right-0 w-80 bg-background border border-border rounded-lg shadow-xl p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Upload Files</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUploadArea(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or{' '}
              <button
                className="text-primary hover:text-primary/80 underline font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports all file types up to 100MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Upload Progress */}
          {uploadFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Uploading Files</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCompleted}
                  disabled={!uploadFiles.some(f => f.status === 'success')}
                >
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-2 p-2 border rounded bg-card">
                    <File className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={uploadFile.progress} 
                          className="flex-1 h-1"
                        />
                        <span className="text-xs text-muted-foreground min-w-0">
                          {uploadFile.status === 'success' && '✓'}
                          {uploadFile.status === 'error' && '✗'}
                          {uploadFile.status === 'uploading' && `${uploadFile.progress}%`}
                          {uploadFile.status === 'pending' && '...'}
                        </span>
                      </div>
                      {uploadFile.error && (
                        <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
