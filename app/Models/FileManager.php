<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class FileManager extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'original_name',
        'path',
        'type',
        'size',
        'mime_type',
        'extension',
        'parent_id',
        'is_folder',
        'status_deleted',
        'user_id',
    ];

    protected $casts = [
        'is_folder' => 'boolean',
        'status_deleted' => 'boolean',
        'size' => 'integer',
    ];

    /**
     * Get the user that owns the file/folder
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent folder
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FileManager::class, 'parent_id');
    }

    /**
     * Get the child files/folders
     */
    public function children()
    {
        return $this->hasMany(FileManager::class, 'parent_id');
    }

    /**
     * Get the full path of the file/folder
     */
    public function getFullPathAttribute(): string
    {
        if ($this->parent) {
            return $this->parent->full_path . '/' . $this->name;
        }
        return $this->name;
    }

    /**
     * Get the file URL
     */
    public function getUrlAttribute(): string
    {
        if ($this->is_folder) {
            return '';
        }
        
        // Ensure the file exists in storage
        if (!Storage::disk('public')->exists($this->path)) {
            return '';
        }
        
        return Storage::disk('public')->url($this->path);
    }

    /**
     * Get the file size in human readable format
     */
    public function getHumanSizeAttribute(): string
    {
        if ($this->is_folder) {
            return '';
        }

        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if file is image
     */
    public function isImage(): bool
    {
        return in_array($this->mime_type, [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ]);
    }

    /**
     * Check if file is video
     */
    public function isVideo(): bool
    {
        return in_array($this->mime_type, [
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/flv',
            'video/webm',
        ]);
    }

    /**
     * Check if file is document
     */
    public function isDocument(): bool
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
        ]);
    }

    /**
     * Soft delete using status_deleted
     */
    public function softDelete(): bool
    {
        return $this->update([
            'status_deleted' => true,
            'deleted_at' => now(),
        ]);
    }

    /**
     * Restore soft deleted item
     */
    public function restore(): bool
    {
        return $this->update([
            'status_deleted' => false,
            'deleted_at' => null,
        ]);
    }

    /**
     * Check if item is soft deleted
     */
    public function isDeleted(): bool
    {
        return $this->status_deleted === true;
    }

    /**
     * Scope to get only non-deleted items
     */
    public function scopeNotDeleted($query)
    {
        return $query->where('status_deleted', false);
    }

    /**
     * Scope to get only deleted items
     */
    public function scopeDeleted($query)
    {
        return $query->where('status_deleted', true);
    }
}
