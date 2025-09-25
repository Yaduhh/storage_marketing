<?php

namespace App\Http\Controllers;

use App\Models\FileManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with file manager statistics
     */
    public function index(): Response
    {
        // Get global file statistics (all users)
        $stats = $this->getFileStatistics();
        
        // Get global storage usage (all users)
        $storageUsage = $this->getStorageUsage();
        
        // Get recent files (all users)
        $recentFiles = $this->getRecentFiles();
        
        // Get file type breakdown (all users)
        $fileTypeBreakdown = $this->getFileTypeBreakdown();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'storageUsage' => $storageUsage,
            'recentFiles' => $recentFiles,
            'fileTypeBreakdown' => $fileTypeBreakdown,
        ]);
    }

    /**
     * Get file statistics
     */
    private function getFileStatistics(): array
    {
        $totalFiles = FileManager::notDeleted()
            ->where('is_folder', false)
            ->count();

        $totalFolders = FileManager::notDeleted()
            ->where('is_folder', true)
            ->count();

        $totalImages = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'image/%');
            })
            ->count();

        $totalVideos = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'video/%');
            })
            ->count();

        $totalDocuments = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'application/pdf')
                    ->orWhere('mime_type', 'like', 'application/msword')
                    ->orWhere('mime_type', 'like', 'application/vnd.openxmlformats-officedocument%')
                    ->orWhere('mime_type', 'like', 'text/%');
            })
            ->count();

        $totalArchives = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'application/zip')
                    ->orWhere('mime_type', 'like', 'application/x-rar%')
                    ->orWhere('mime_type', 'like', 'application/x-7z%');
            })
            ->count();

        $deletedFiles = FileManager::where('status_deleted', true)
            ->count();

        return [
            'totalFiles' => $totalFiles,
            'totalFolders' => $totalFolders,
            'totalImages' => $totalImages,
            'totalVideos' => $totalVideos,
            'totalDocuments' => $totalDocuments,
            'totalArchives' => $totalArchives,
            'deletedFiles' => $deletedFiles,
        ];
    }

    /**
     * Get global storage usage statistics (all users)
     */
    private function getStorageUsage(): array
    {
        $totalSize = FileManager::notDeleted()
            ->where('is_folder', false)
            ->sum('size');

        $imageSize = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where('mime_type', 'like', 'image/%')
            ->sum('size');

        $videoSize = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where('mime_type', 'like', 'video/%')
            ->sum('size');

        $documentSize = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'application/pdf')
                    ->orWhere('mime_type', 'like', 'application/msword')
                    ->orWhere('mime_type', 'like', 'application/vnd.openxmlformats-officedocument%')
                    ->orWhere('mime_type', 'like', 'text/%');
            })
            ->sum('size');

        $archiveSize = FileManager::notDeleted()
            ->where('is_folder', false)
            ->where(function ($query) {
                $query->where('mime_type', 'like', 'application/zip')
                    ->orWhere('mime_type', 'like', 'application/x-rar%')
                    ->orWhere('mime_type', 'like', 'application/x-7z%');
            })
            ->sum('size');

        return [
            'totalSize' => $totalSize,
            'totalSizeFormatted' => $this->formatBytes($totalSize),
            'imageSize' => $imageSize,
            'imageSizeFormatted' => $this->formatBytes($imageSize),
            'videoSize' => $videoSize,
            'videoSizeFormatted' => $this->formatBytes($videoSize),
            'documentSize' => $documentSize,
            'documentSizeFormatted' => $this->formatBytes($documentSize),
            'archiveSize' => $archiveSize,
            'archiveSizeFormatted' => $this->formatBytes($archiveSize),
        ];
    }

    /**
     * Get recent files (all users)
     */
    private function getRecentFiles(): array
    {
        return FileManager::notDeleted()
            ->where('is_folder', false)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'original_name' => $file->original_name,
                    'mime_type' => $file->mime_type,
                    'size' => $file->size,
                    'human_size' => $file->human_size,
                    'created_at' => $file->created_at,
                    'url' => $file->mime_type && str_starts_with($file->mime_type, 'video/') 
                        ? route('file-manager.stream', $file->id) 
                        : url('/storage/' . $file->path),
                    'uploader' => [
                        'name' => $file->user->name,
                        'email' => $file->user->email,
                    ],
                ];
            })
            ->toArray();
    }

    /**
     * Get global file type breakdown for charts (all users)
     */
    private function getFileTypeBreakdown(): array
    {
        $breakdown = FileManager::notDeleted()
            ->where('is_folder', false)
            ->selectRaw('
                CASE 
                    WHEN mime_type LIKE "image/%" THEN "Images"
                    WHEN mime_type LIKE "video/%" THEN "Videos"
                    WHEN mime_type LIKE "application/pdf" OR mime_type LIKE "application/msword" OR mime_type LIKE "application/vnd.openxmlformats-officedocument%" OR mime_type LIKE "text/%" THEN "Documents"
                    WHEN mime_type LIKE "application/zip" OR mime_type LIKE "application/x-rar%" OR mime_type LIKE "application/x-7z%" THEN "Archives"
                    ELSE "Others"
                END as file_type,
                COUNT(*) as count,
                SUM(size) as total_size
            ')
            ->groupBy('file_type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->file_type,
                    'count' => $item->count,
                    'size' => $item->total_size,
                    'sizeFormatted' => $this->formatBytes($item->total_size),
                ];
            })
            ->toArray();

        return $breakdown;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}