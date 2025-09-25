import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Upload, X, File, RefreshCw, CheckCircle } from 'lucide-react';
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
  speed?: string;
  timeRemaining?: string;
  uploadedBytes?: number;
  startTime?: number;
  xhr?: XMLHttpRequest;
  isPersistent?: boolean;
}

export default function FloatingUploadButton({ parentId }: FloatingUploadButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load upload state on component mount
  useEffect(() => {
    const savedFiles = loadUploadState();
    if (savedFiles.length > 0) {
      setUploadFiles(savedFiles);
      // Resume uploads that were in progress
      savedFiles.forEach(file => {
        if (file.status === 'uploading') {
          // Mark as error since we can't resume the actual upload
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'error', error: 'Upload interrupted - please retry' }
                : f
            )
          );
        }
      });
    }
  }, []);

  // Save upload state whenever uploadFiles changes
  useEffect(() => {
    if (uploadFiles.length > 0) {
      saveUploadState(uploadFiles);
    } else {
      localStorage.removeItem('uploadFiles');
    }
  }, [uploadFiles]);

  // Reset success state after showing success message
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000); // Show success message for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Save upload state to localStorage
  const saveUploadState = (files: UploadFile[]) => {
    const persistentFiles = files.map(file => ({
      ...file,
      file: {
        name: file.file.name,
        size: file.file.size,
        type: file.file.type,
        lastModified: file.file.lastModified
      } as any, // Convert File to serializable object
      xhr: undefined, // Don't save XHR object
      isPersistent: true
    }));
    
    localStorage.setItem('uploadFiles', JSON.stringify(persistentFiles));
  };

  // Load upload state from localStorage
  const loadUploadState = (): UploadFile[] => {
    try {
      const saved = localStorage.getItem('uploadFiles');
      if (!saved) return [];
      
      const files = JSON.parse(saved);
      return files.filter((file: any) => 
        file.status === 'uploading' || file.status === 'pending'
      );
    } catch (error) {
      console.error('Error loading upload state:', error);
      return [];
    }
  };

  // Clear completed uploads from localStorage
  const clearCompletedFromStorage = () => {
    const saved = localStorage.getItem('uploadFiles');
    if (!saved) return;
    
    try {
      const files = JSON.parse(saved);
      const activeFiles = files.filter((file: any) => 
        file.status === 'uploading' || file.status === 'pending'
      );
      
      if (activeFiles.length === 0) {
        localStorage.removeItem('uploadFiles');
      } else {
        localStorage.setItem('uploadFiles', JSON.stringify(activeFiles));
      }
    } catch (error) {
      console.error('Error clearing completed uploads:', error);
    }
  };

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
      status: 'pending',
      uploadedBytes: 0,
      startTime: Date.now()
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    uploadFilesToServer(newUploadFiles);
  };

  const uploadFilesToServer = async (files: UploadFile[]) => {
    setIsUploading(true);

    // Upload files one by one with real progress tracking
    for (const uploadFile of files) {
      await uploadSingleFile(uploadFile);
    }

    setIsUploading(false);
  };

  const uploadSingleFile = (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('files[]', uploadFile.file);
      if (parentId) {
        formData.append('parent_id', parentId.toString());
      }

      // Update status to uploading
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading', progress: 0, startTime: Date.now() }
            : f
        )
      );

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          const elapsed = (Date.now() - (uploadFile.startTime || Date.now())) / 1000;
          const speed = e.loaded / elapsed; // bytes per second
          const remaining = (e.total - e.loaded) / speed; // seconds remaining

          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    progress, 
                    uploadedBytes: e.loaded,
                    speed: formatBytes(speed) + '/s',
                    timeRemaining: remaining > 0 ? formatTime(remaining) : '0s'
                  }
                : f
            )
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'success', progress: 100, speed: undefined, timeRemaining: undefined }
                : f
            )
          );
          
          // Set success state and trigger auto-refresh
          setUploadSuccess(true);
          
          // Auto-refresh file manager after successful upload
          setTimeout(() => {
            router.reload({ only: ['files', 'breadcrumbs', 'folders'] });
            
            // Clear completed uploads after refresh
            setTimeout(() => {
              setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
            }, 2000); // Clear after 2 seconds
          }, 1000); // Wait 1 second to show success state
          
          resolve();
        } else {
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: 'Upload failed' }
                : f
            )
          );
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Network error' }
              : f
          )
        );
        reject(new Error('Network error'));
      });

      xhr.open('POST', '/file-manager/upload');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
      xhr.send(formData);
    });
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
    clearCompletedFromStorage();
  };

  const retryUpload = (fileId: string) => {
    const file = uploadFiles.find(f => f.id === fileId);
    if (!file) return;

    // Reset file status and retry
    setUploadFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending', progress: 0, error: undefined, startTime: Date.now() }
          : f
      )
    );

    // Start upload
    uploadSingleFile({ ...file, status: 'pending', progress: 0, error: undefined, startTime: Date.now() });
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
            <div>
              <h3 className="font-medium">Upload Files</h3>
              <p className="text-xs text-muted-foreground">
                Upload progress is auto-saved - safe to refresh
              </p>
              {uploadSuccess && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    Upload successful! Refreshing file manager...
                  </span>
                </div>
              )}
            </div>
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
              Supports all file types up to 1GB
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
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium truncate">{uploadFile.file.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(uploadFile.file.size)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={uploadFile.progress} 
                          className="flex-1 h-1"
                        />
                        <span className="text-xs text-muted-foreground min-w-0">
                          {uploadFile.status === 'success' && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-green-600">Done</span>
                            </div>
                          )}
                          {uploadFile.status === 'error' && '✗'}
                          {uploadFile.status === 'uploading' && `${uploadFile.progress}%`}
                          {uploadFile.status === 'pending' && '...'}
                        </span>
                      </div>

                      {/* Speed and time remaining */}
                      {uploadFile.status === 'uploading' && uploadFile.speed && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            {uploadFile.speed}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {uploadFile.timeRemaining} left
                          </span>
                        </div>
                      )}

                      {/* Error message and retry button */}
                      {uploadFile.error && (
                        <div className="mt-1">
                          <p className="text-xs text-destructive">{uploadFile.error}</p>
                          {uploadFile.status === 'error' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs mt-1"
                              onClick={() => retryUpload(uploadFile.id)}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Persistent indicator */}
                      {uploadFile.isPersistent && (
                        <div className="mt-1">
                          <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">
                            Auto-saved
                          </span>
                        </div>
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
