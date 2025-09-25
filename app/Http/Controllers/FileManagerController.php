<?php

namespace App\Http\Controllers;

use App\Models\FileManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FileManagerController extends Controller
{
    /**
     * Display the file manager page
     */
    public function index(Request $request): Response
    {
        $parentId = $request->get('parent_id');
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $filterType = $request->get('filter_type');
        $filterDate = $request->get('filter_date');
        
        $query = FileManager::with('user')
            ->where('user_id', Auth::id())
            ->where('parent_id', $parentId)
            ->notDeleted(); // Hanya tampilkan file yang belum di-delete

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        // Apply type filter
        if ($filterType) {
            switch ($filterType) {
                case 'images':
                    $query->where('mime_type', 'like', 'image/%');
                    break;
                case 'videos':
                    $query->where('mime_type', 'like', 'video/%');
                    break;
                case 'documents':
                    $query->where(function ($q) {
                        $q->where('mime_type', 'like', 'application/pdf')
                          ->orWhere('mime_type', 'like', 'application/msword')
                          ->orWhere('mime_type', 'like', 'application/vnd.openxmlformats-officedocument%')
                          ->orWhere('mime_type', 'like', 'text/%');
                    });
                    break;
                case 'archives':
                    $query->where(function ($q) {
                        $q->where('mime_type', 'like', 'application/zip')
                          ->orWhere('mime_type', 'like', 'application/x-rar%')
                          ->orWhere('mime_type', 'like', 'application/x-7z%');
                    });
                    break;
                case 'folders':
                    $query->where('is_folder', true);
                    break;
            }
        }

        // Apply date filter
        if ($filterDate) {
            switch ($filterDate) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'week':
                    $query->where('created_at', '>=', now()->subWeek());
                    break;
                case 'month':
                    $query->where('created_at', '>=', now()->subMonth());
                    break;
                case 'year':
                    $query->where('created_at', '>=', now()->subYear());
                    break;
            }
        }

        // Apply sorting
        switch ($sortBy) {
            case 'name':
                $query->orderBy('is_folder', 'desc')->orderBy('name', $sortOrder);
                break;
            case 'size':
                $query->orderBy('is_folder', 'desc')->orderBy('size', $sortOrder);
                break;
            case 'date':
                $query->orderBy('is_folder', 'desc')->orderBy('created_at', $sortOrder);
                break;
            case 'type':
                $query->orderBy('is_folder', 'desc')->orderBy('mime_type', $sortOrder);
                break;
            default:
                $query->orderBy('is_folder', 'desc')->orderBy('name', 'asc');
        }
        
        $files = $query->get()
            ->map(function ($file) {
                // Generate correct URL - use stream for videos, storage for others
                $url = '';
                if (!$file->is_folder) {
                    if ($file->mime_type && str_starts_with($file->mime_type, 'video/')) {
                        $url = route('file-manager.stream', $file->id);
                    } else {
                        $url = url('/storage/' . $file->path);
                    }
                }
                
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'original_name' => $file->original_name,
                    'path' => $file->path,
                    'type' => $file->type,
                    'size' => $file->size,
                    'mime_type' => $file->mime_type,
                    'extension' => $file->extension,
                    'is_folder' => $file->is_folder,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at,
                    'url' => $url,
                    'human_size' => $file->human_size,
                    'uploader' => [
                        'name' => $file->user->name,
                        'email' => $file->user->email,
                    ],
                ];
            });

        $breadcrumbs = $this->getBreadcrumbs($parentId);
        $folders = $this->getFoldersForMove($parentId);

        return Inertia::render('FileManager/Index', [
            'files' => $files,
            'breadcrumbs' => $breadcrumbs,
            'currentParentId' => $parentId,
            'folders' => $folders,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'filter_type' => $filterType,
                'filter_date' => $filterDate,
            ],
        ]);
    }

    /**
     * Display the trash page (deleted files)
     */
    public function trash(Request $request): Response
    {
        $files = FileManager::with('user')
            ->where('user_id', Auth::id())
            ->deleted() // Hanya tampilkan file yang sudah di-delete
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($file) {
                // Generate correct URL - use stream for videos, storage for others
                $url = '';
                if (!$file->is_folder) {
                    if ($file->mime_type && str_starts_with($file->mime_type, 'video/')) {
                        $url = route('file-manager.stream', $file->id);
                    } else {
                        $url = url('/storage/' . $file->path);
                    }
                }
                
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'original_name' => $file->original_name,
                    'path' => $file->path,
                    'type' => $file->type,
                    'size' => $file->size,
                    'mime_type' => $file->mime_type,
                    'extension' => $file->extension,
                    'is_folder' => $file->is_folder,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at,
                    'deleted_at' => $file->deleted_at,
                    'url' => $url,
                    'human_size' => $file->human_size,
                    'uploader' => [
                        'name' => $file->user->name,
                        'email' => $file->user->email,
                    ],
                ];
            });

        return Inertia::render('FileManager/Trash', [
            'files' => $files,
        ]);
    }

    /**
     * Upload files
     */
    public function upload(Request $request)
    {

        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:1024000', // 1GB max (1024000 KB)
            'parent_id' => 'nullable|exists:file_managers,id',
        ]);

        $parentId = $request->get('parent_id');
        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $extension;
            $path = 'file-manager/' . Auth::id() . '/' . $filename;
            
            // Store file
            $storedPath = $file->storeAs('file-manager/' . Auth::id(), $filename, 'public');
            
            
            // Save to database
            $fileManager = FileManager::create([
                'name' => $filename,
                'original_name' => $originalName,
                'path' => $storedPath,
                'type' => 'file',
                'size' => $size,
                'mime_type' => $mimeType,
                'extension' => $extension,
                'parent_id' => $parentId,
                'is_folder' => false,
                'user_id' => Auth::id(),
            ]);

            $uploadedFiles[] = $fileManager;
        }

        return redirect()->route('file-manager.index', ['parent_id' => $parentId])
            ->with('success', 'Files uploaded successfully');
    }

    /**
     * Create a new folder
     */
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:file_managers,id',
        ]);

        $parentId = $request->get('parent_id');
        $folderName = $request->get('name');

        // Check if folder name already exists in the same parent
        $existingFolder = FileManager::where('user_id', Auth::id())
            ->where('parent_id', $parentId)
            ->where('name', $folderName)
            ->where('is_folder', true)
            ->notDeleted() // Hanya cek folder yang belum di-delete
            ->first();

        if ($existingFolder) {
            return back()->withErrors([
                'name' => 'Folder with this name already exists'
            ]);
        }

        $folder = FileManager::create([
            'name' => $folderName,
            'path' => 'file-manager/' . Auth::id() . '/' . $folderName,
            'type' => 'folder',
            'parent_id' => $parentId,
            'is_folder' => true,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('file-manager.index', ['parent_id' => $parentId])
            ->with('success', 'Folder created successfully');
    }

    /**
     * Download a file
     */
    public function download(FileManager $fileManager)
    {
        // Simple download without strict validation for hosting
        if ($fileManager->is_folder) {
            abort(404, 'Cannot download folder');
        }

        if (!Storage::disk('public')->exists($fileManager->path)) {
            abort(404, 'File not found');
        }

        try {
            return Storage::disk('public')->download($fileManager->path, $fileManager->original_name);
        } catch (\Exception $e) {
            // Fallback: Try alternative download method
            try {
                $file = Storage::disk('public')->get($fileManager->path);
                return response($file, 200, [
                    'Content-Type' => 'application/octet-stream',
                    'Content-Disposition' => 'attachment; filename="' . $fileManager->original_name . '"',
                    'Content-Length' => strlen($file)
                ]);
            } catch (\Exception $e2) {
                abort(500, 'Download failed');
            }
        }
    }

    /**
     * Alternative download method for hosting issues
     */
    public function downloadAlternative(FileManager $fileManager)
    {
        // Simple alternative download without validation for hosting
        if ($fileManager->is_folder) {
            abort(404, 'Cannot download folder');
        }

        if (!Storage::disk('public')->exists($fileManager->path)) {
            abort(404, 'File not found');
        }

        try {
            $file = Storage::disk('public')->get($fileManager->path);
            return response($file, 200, [
                'Content-Type' => 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="' . $fileManager->original_name . '"',
                'Content-Length' => strlen($file),
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            abort(500, 'Download failed');
        }
    }

    /**
     * Stream a file (for video preview)
     */
    public function stream(FileManager $fileManager)
    {
        // Simple stream without strict validation for hosting
        if ($fileManager->is_folder) {
            abort(404);
        }

        if (!Storage::disk('public')->exists($fileManager->path)) {
            abort(404);
        }

        $file = Storage::disk('public')->get($fileManager->path);
        $mimeType = Storage::disk('public')->mimeType($fileManager->path);

        return response($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => Storage::disk('public')->size($fileManager->path),
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Soft delete a file or folder
     */
    public function destroy(FileManager $fileManager)
    {
        // Simple delete without strict validation for hosting
        try {
            if ($fileManager->is_folder) {
                // Soft delete all children first
                $this->softDeleteFolderRecursively($fileManager);
            }

            // Soft delete the file/folder
            $fileManager->softDelete();

            return redirect()->route('file-manager.index', ['parent_id' => $fileManager->parent_id])
                ->with('success', 'Moved to trash successfully');
        } catch (\Exception $e) {
            abort(500, 'Delete failed');
        }
    }

    /**
     * Rename a file or folder
     */
    public function rename(Request $request, FileManager $fileManager)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $newName = $request->get('name');

        // Check if name already exists in the same parent
        $existingItem = FileManager::where('user_id', Auth::id())
            ->where('parent_id', $fileManager->parent_id)
            ->where('name', $newName)
            ->where('id', '!=', $fileManager->id)
            ->notDeleted() // Hanya cek item yang belum di-delete
            ->first();

        if ($existingItem) {
            return back()->withErrors([
                'name' => 'Name already exists'
            ]);
        }

        $fileManager->update(['name' => $newName]);

        return redirect()->route('file-manager.index', ['parent_id' => $fileManager->parent_id])
            ->with('success', 'Renamed successfully');
    }

    /**
     * Move a file or folder
     */
    public function move(Request $request, FileManager $fileManager)
    {

        $request->validate([
            'parent_id' => 'nullable|exists:file_managers,id',
        ]);

        $newParentId = $request->get('parent_id');

        // Check if moving to a folder that is a child of current item (prevent circular reference)
        if ($newParentId && $this->isCircularReference($fileManager, $newParentId)) {
            return back()->withErrors([
                'parent_id' => 'Cannot move folder into itself or its subfolder'
            ]);
        }

        $fileManager->update(['parent_id' => $newParentId]);

        return redirect()->route('file-manager.index', ['parent_id' => $newParentId])
            ->with('success', 'Moved successfully');
    }

    /**
     * Move multiple files/folders
     */
    public function moveMultiple(Request $request)
    {
        $request->validate([
            'file_ids' => 'required|array|min:1',
            'file_ids.*' => 'exists:file_managers,id',
            'parent_id' => 'nullable|exists:file_managers,id',
        ]);

        $fileIds = $request->get('file_ids');
        $newParentId = $request->get('parent_id');

        $files = FileManager::where('user_id', Auth::id())
            ->whereIn('id', $fileIds)
            ->get();

        $movedCount = 0;
        $errors = [];

        foreach ($files as $file) {
            // Check if moving to a folder that is a child of current item (prevent circular reference)
            if ($newParentId && $this->isCircularReference($file, $newParentId)) {
                $errors[] = "Cannot move '{$file->name}' into itself or its subfolder";
                continue;
            }

            $file->update(['parent_id' => $newParentId]);
            $movedCount++;
        }

        if (!empty($errors)) {
            return back()->withErrors(['move' => implode(', ', $errors)]);
        }

        return redirect()->route('file-manager.index', ['parent_id' => $newParentId])
            ->with('success', "Successfully moved {$movedCount} item(s)");
    }

    /**
     * Delete multiple files/folders
     */
    public function deleteMultiple(Request $request)
    {
        $request->validate([
            'file_ids' => 'required|array|min:1',
            'file_ids.*' => 'exists:file_managers,id',
        ]);

        $fileIds = $request->get('file_ids');

        $files = FileManager::where('user_id', Auth::id())
            ->whereIn('id', $fileIds)
            ->get();

        $deletedCount = 0;

        foreach ($files as $file) {
            if ($file->is_folder) {
                // Soft delete all children first
                $this->softDeleteFolderRecursively($file);
            }
            $file->softDelete();
            $deletedCount++;
        }

        return redirect()->route('file-manager.index')
            ->with('success', "Successfully moved {$deletedCount} item(s) to trash");
    }

    /**
     * Get breadcrumbs for navigation
     */
    private function getBreadcrumbs(?int $parentId): array
    {
        $breadcrumbs = [
            ['id' => null, 'name' => 'Home']
        ];

        if ($parentId) {
            $current = FileManager::find($parentId);
            $path = [];

            while ($current) {
                $path[] = ['id' => $current->id, 'name' => $current->name];
                $current = $current->parent;
            }

            $breadcrumbs = array_merge($breadcrumbs, array_reverse($path));
        }

        return $breadcrumbs;
    }

    /**
     * Restore a file or folder from trash
     */
    public function restore(FileManager $fileManager)
    {

        if ($fileManager->is_folder) {
            // Restore all children first
            $this->restoreFolderRecursively($fileManager);
        }

        // Restore the file/folder
        $fileManager->restore();

        return redirect()->route('file-manager.index', ['parent_id' => $fileManager->parent_id])
            ->with('success', 'Restored successfully');
    }

    /**
     * Force delete a file or folder permanently
     */
    public function forceDelete(FileManager $fileManager)
    {

        if ($fileManager->is_folder) {
            // Force delete all children first
            $this->forceDeleteFolderRecursively($fileManager);
        } else {
            // Delete file from storage
            Storage::disk('public')->delete($fileManager->path);
        }

        // Force delete the file/folder
        $fileManager->forceDelete();

        return redirect()->route('file-manager.index', ['parent_id' => $fileManager->parent_id])
            ->with('success', 'Permanently deleted successfully');
    }

    /**
     * Soft delete folder and all its contents recursively
     */
    private function softDeleteFolderRecursively(FileManager $folder): void
    {
        $children = $folder->children()->notDeleted()->get();

        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->softDeleteFolderRecursively($child);
            }
            $child->softDelete();
        }
    }

    /**
     * Restore folder and all its contents recursively
     */
    private function restoreFolderRecursively(FileManager $folder): void
    {
        $children = $folder->children()->deleted()->get();

        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->restoreFolderRecursively($child);
            }
            $child->restore();
        }
    }

    /**
     * Force delete folder and all its contents recursively
     */
    private function forceDeleteFolderRecursively(FileManager $folder): void
    {
        $children = $folder->children;

        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->forceDeleteFolderRecursively($child);
            } else {
                Storage::disk('public')->delete($child->path);
            }
            $child->forceDelete();
        }
    }

    /**
     * Check for circular reference when moving folders
     */
    private function isCircularReference(FileManager $item, int $newParentId): bool
    {
        if ($item->id === $newParentId) {
            return true;
        }

        $parent = FileManager::find($newParentId);
        while ($parent) {
            if ($parent->id === $item->id) {
                return true;
            }
            $parent = $parent->parent;
        }

        return false;
    }

    /**
     * Get folders for move operation
     */
    private function getFoldersForMove(?int $excludeId = null): array
    {
        try {
            $query = FileManager::where('user_id', Auth::id())
                ->where('is_folder', true)
                ->notDeleted()
                ->with('parent'); // Load parent relationship

            if ($excludeId) {
                // Exclude current folder and its children
                $query->where('id', '!=', $excludeId);
            }

            return $query->orderBy('name')
                ->get()
                ->map(function ($folder) {
                    return [
                        'id' => $folder->id,
                        'name' => $folder->name,
                        'path' => $this->getFolderPath($folder),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting folders for move: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get folder path for display
     */
    private function getFolderPath(FileManager $folder): string
    {
        try {
            $path = [];
            $current = $folder;
            $maxDepth = 10; // Prevent infinite loop
            $depth = 0;

            while ($current && $depth < $maxDepth) {
                $path[] = $current->name;
                $current = $current->parent;
                $depth++;
            }

            return implode(' / ', array_reverse($path));
        } catch (\Exception $e) {
            \Log::error('Error getting folder path: ' . $e->getMessage());
            return $folder->name;
        }
    }
}
