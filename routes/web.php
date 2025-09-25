<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public download routes (no auth required for testing)
Route::get('/file-manager/download/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'download'])->name('file-manager.download');
Route::get('/file-manager/download-alt/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'downloadAlternative'])->name('file-manager.download-alt');
Route::get('/file-manager/stream/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'stream'])->name('file-manager.stream');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // File Manager Routes
    Route::prefix('file-manager')->name('file-manager.')->group(function () {
        Route::get('/', [App\Http\Controllers\FileManagerController::class, 'index'])->name('index');
        Route::get('/trash', [App\Http\Controllers\FileManagerController::class, 'trash'])->name('trash');
        Route::post('/upload', [App\Http\Controllers\FileManagerController::class, 'upload'])->name('upload');
        Route::post('/folder', [App\Http\Controllers\FileManagerController::class, 'createFolder'])->name('create-folder');
        Route::post('/move-multiple', [App\Http\Controllers\FileManagerController::class, 'moveMultiple'])->name('move-multiple');
        Route::post('/delete-multiple', [App\Http\Controllers\FileManagerController::class, 'deleteMultiple'])->name('delete-multiple');
        Route::delete('/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'destroy'])->name('destroy');
        Route::put('/{fileManager}/rename', [App\Http\Controllers\FileManagerController::class, 'rename'])->name('rename');
        Route::put('/{fileManager}/move', [App\Http\Controllers\FileManagerController::class, 'move'])->name('move');
        Route::put('/{fileManager}/restore', [App\Http\Controllers\FileManagerController::class, 'restore'])->name('restore');
        Route::delete('/{fileManager}/force', [App\Http\Controllers\FileManagerController::class, 'forceDelete'])->name('force-delete');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
