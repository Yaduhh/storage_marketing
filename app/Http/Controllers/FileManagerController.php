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
        
        $files = FileManager::with('user')
            ->where('user_id', Auth::id())
            ->where('parent_id', $parentId)
            ->orderBy('is_folder', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($file) {
                // Generate correct URL with port 8000
                $url = $file->is_folder ? '' : url('/storage/' . $file->path);
                
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

        return Inertia::render('FileManager/Index', [
            'files' => $files,
            'breadcrumbs' => $breadcrumbs,
            'currentParentId' => $parentId,
        ]);
    }

    /**
     * Upload files
     */
    public function upload(Request $request)
    {

        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:102400', // 100MB max
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
        if ($fileManager->user_id !== Auth::id()) {
            abort(403);
        }

        if ($fileManager->is_folder) {
            abort(404);
        }

        if (!Storage::disk('public')->exists($fileManager->path)) {
            abort(404);
        }

        return Storage::disk('public')->download($fileManager->path, $fileManager->original_name);
    }

    /**
     * Delete a file or folder
     */
    public function destroy(FileManager $fileManager)
    {
        if ($fileManager->user_id !== Auth::id()) {
            abort(403);
        }

        if ($fileManager->is_folder) {
            // Delete all children first
            $this->deleteFolderRecursively($fileManager);
        } else {
            // Delete file from storage
            Storage::disk('public')->delete($fileManager->path);
        }

        $fileManager->delete();

        return redirect()->route('file-manager.index', ['parent_id' => $fileManager->parent_id])
            ->with('success', 'Deleted successfully');
    }

    /**
     * Rename a file or folder
     */
    public function rename(Request $request, FileManager $fileManager)
    {
        if ($fileManager->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $newName = $request->get('name');

        // Check if name already exists in the same parent
        $existingItem = FileManager::where('user_id', Auth::id())
            ->where('parent_id', $fileManager->parent_id)
            ->where('name', $newName)
            ->where('id', '!=', $fileManager->id)
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
        if ($fileManager->user_id !== Auth::id()) {
            abort(403);
        }

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
     * Delete folder and all its contents recursively
     */
    private function deleteFolderRecursively(FileManager $folder): void
    {
        $children = $folder->children;

        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->deleteFolderRecursively($child);
            } else {
                Storage::disk('public')->delete($child->path);
            }
            $child->delete();
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
}
