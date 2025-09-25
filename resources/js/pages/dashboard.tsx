import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
  File, 
  Folder, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Archive, 
  Trash2,
  HardDrive,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    totalFiles: number;
    totalFolders: number;
    totalImages: number;
    totalVideos: number;
    totalDocuments: number;
    totalArchives: number;
    deletedFiles: number;
}

interface StorageUsage {
    totalSize: number;
    totalSizeFormatted: string;
    imageSize: number;
    imageSizeFormatted: string;
    videoSize: number;
    videoSizeFormatted: string;
    documentSize: number;
    documentSizeFormatted: string;
    archiveSize: number;
    archiveSizeFormatted: string;
}

interface RecentFile {
    id: number;
    name: string;
    original_name?: string;
    mime_type?: string;
    size?: number;
    human_size?: string;
    created_at: string;
    url: string;
    uploader: {
        name: string;
        email: string;
    };
}

interface FileTypeBreakdown {
    type: string;
    count: number;
    size: number;
    sizeFormatted: string;
}

interface Props {
    stats: Stats;
    storageUsage: StorageUsage;
    recentFiles: RecentFile[];
    fileTypeBreakdown: FileTypeBreakdown[];
}

export default function Dashboard({ stats, storageUsage, recentFiles, fileTypeBreakdown }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (mimeType?: string) => {
        if (mimeType?.startsWith('image/')) {
            return <ImageIcon className="w-4 h-4 text-green-500" />;
        }
        if (mimeType?.startsWith('video/')) {
            return <Video className="w-4 h-4 text-purple-500" />;
        }
        if (mimeType?.includes('pdf') || mimeType?.includes('document')) {
            return <FileText className="w-4 h-4 text-red-500" />;
        }
        if (mimeType?.includes('zip') || mimeType?.includes('rar')) {
            return <Archive className="w-4 h-4 text-orange-500" />;
        }
        return <File className="w-4 h-4 text-gray-500" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of your file storage</p>
                    </div>
                    <Button 
                        onClick={() => router.get('/file-manager')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <File className="w-4 h-4 mr-2" />
                        Open File Manager
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Files */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">All Files (Global)</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalFiles.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Folders */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">All Folders (Global)</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalFolders.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                                    <Folder className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Used */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Storage Used</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{storageUsage.totalSizeFormatted}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                    <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deleted Files */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">In Trash</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.deletedFiles.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* File Type Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* File Types */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                File Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">Images</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalImages.toLocaleString()}</p>
                                    <p className="text-sm text-zinc-500">{storageUsage.imageSizeFormatted}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Video className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium">Videos</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalVideos.toLocaleString()}</p>
                                    <p className="text-sm text-zinc-500">{storageUsage.videoSizeFormatted}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-red-600" />
                                    <span className="font-medium">Documents</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalDocuments.toLocaleString()}</p>
                                    <p className="text-sm text-zinc-500">{storageUsage.documentSizeFormatted}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Archive className="w-5 h-5 text-orange-600" />
                                    <span className="font-medium">Archives</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalArchives.toLocaleString()}</p>
                                    <p className="text-sm text-zinc-500">{storageUsage.archiveSizeFormatted}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Files */}
                    <Card className="border-zinc-200 dark:border-zinc-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Recent Files (Global)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentFiles.length > 0 ? (
                                <div className="space-y-3">
                                    {recentFiles.slice(0, 5).map((file) => (
                                        <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                            {getFileIcon(file.mime_type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate text-zinc-900 dark:text-white">
                                                    {file.original_name || file.name}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {file.human_size} • {formatDate(file.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                    <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No files yet</p>
                                    <p className="text-sm">Upload your first file to get started</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-zinc-200 dark:border-zinc-700">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.get('/file-manager')}
                            >
                                <File className="w-6 h-6" />
                                <span>Browse Files</span>
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.get('/file-manager/trash')}
                            >
                                <Trash2 className="w-6 h-6" />
                                <span>View Trash</span>
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.get('/file-manager')}
                            >
                                <TrendingUp className="w-6 h-6" />
                                <span>Upload Files</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
