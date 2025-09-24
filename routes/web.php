<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // File Manager Routes
    Route::prefix('file-manager')->name('file-manager.')->group(function () {
        Route::get('/', [App\Http\Controllers\FileManagerController::class, 'index'])->name('index');
        Route::post('/upload', [App\Http\Controllers\FileManagerController::class, 'upload'])->name('upload');
        Route::post('/folder', [App\Http\Controllers\FileManagerController::class, 'createFolder'])->name('create-folder');
        Route::get('/download/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'download'])->name('download');
        Route::delete('/{fileManager}', [App\Http\Controllers\FileManagerController::class, 'destroy'])->name('destroy');
        Route::put('/{fileManager}/rename', [App\Http\Controllers\FileManagerController::class, 'rename'])->name('rename');
        Route::put('/{fileManager}/move', [App\Http\Controllers\FileManagerController::class, 'move'])->name('move');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
