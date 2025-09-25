# Fix 403 Error di Hosting

## Masalah
Error 403 saat download/delete file di hosting, tapi normal di local.

## Penyebab Umum

### 1. **CSRF Token Issues**
- Hosting tidak mengirim CSRF token dengan benar
- Session tidak berfungsi dengan baik

### 2. **Session Configuration**
- Session driver tidak sesuai dengan hosting
- Session path tidak writable

### 3. **File Permissions**
- Storage folder tidak writable
- File permission tidak benar

### 4. **Middleware Issues**
- Auth middleware tidak berfungsi
- Route protection bermasalah

## Solusi yang Sudah Diterapkan

### 1. **Enhanced Logging**
```php
// Debug logging untuk troubleshooting
\Log::info('Download request', [
    'file_id' => $fileManager->id,
    'user_id' => Auth::id(),
    'file_user_id' => $fileManager->user_id,
    'is_authenticated' => Auth::check(),
    'session_id' => session()->getId()
]);
```

### 2. **Better Error Handling**
```php
if (!Auth::check()) {
    \Log::warning('Download failed: User not authenticated');
    abort(403, 'Authentication required');
}
```

### 3. **Try-Catch Blocks**
```php
try {
    return Storage::disk('public')->download($fileManager->path, $fileManager->original_name);
} catch (\Exception $e) {
    \Log::error('Download failed: Storage error', [
        'error' => $e->getMessage(),
        'path' => $fileManager->path
    ]);
    abort(500, 'Download failed');
}
```

## Konfigurasi Hosting yang Perlu Dicek

### 1. **Session Configuration (.env)**
```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
```

### 2. **File Permissions**
```bash
# Set permissions untuk storage
chmod -R 755 storage/
chmod -R 755 public/storage/
chown -R www-data:www-data storage/
chown -R www-data:www-data public/storage/
```

### 3. **Storage Link**
```bash
# Pastikan storage link sudah dibuat
php artisan storage:link
```

### 4. **Database Session Table**
```bash
# Buat table sessions jika belum ada
php artisan session:table
php artisan migrate
```

## Troubleshooting Steps

### 1. **Cek Log Files**
```bash
# Cek Laravel log
tail -f storage/logs/laravel.log

# Cek web server log
tail -f /var/log/apache2/error.log
# atau
tail -f /var/log/nginx/error.log
```

### 2. **Test Authentication**
```php
// Tambahkan di controller untuk test
dd([
    'auth_check' => Auth::check(),
    'user_id' => Auth::id(),
    'session_id' => session()->getId(),
    'csrf_token' => csrf_token()
]);
```

### 3. **Cek File Permissions**
```bash
# Cek permission storage
ls -la storage/
ls -la public/storage/

# Cek permission file
ls -la storage/app/public/file-manager/
```

### 4. **Test Session**
```php
// Test session di controller
session(['test' => 'value']);
dd(session('test'));
```

## Konfigurasi Web Server

### Apache (.htaccess)
```apache
# Tambahkan di .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    
    # Handle X-XSRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]
</IfModule>
```

### Nginx
```nginx
# Tambahkan di nginx config
location / {
    try_files $uri $uri/ /index.php?$query_string;
    
    # Handle Authorization Header
    fastcgi_pass_header Authorization;
    
    # Handle X-XSRF-Token Header
    fastcgi_pass_header X-XSRF-Token;
}
```

## Testing

### 1. **Test Download**
```bash
# Test dengan curl
curl -H "Cookie: laravel_session=YOUR_SESSION_ID" \
     -H "X-CSRF-TOKEN: YOUR_CSRF_TOKEN" \
     http://yourdomain.com/file-manager/download/1
```

### 2. **Test Authentication**
```bash
# Test login
curl -X POST http://yourdomain.com/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
```

## Monitoring

### 1. **Log Monitoring**
- Monitor `storage/logs/laravel.log` untuk error
- Monitor web server error log
- Monitor database query log

### 2. **Performance Monitoring**
- Monitor response time
- Monitor memory usage
- Monitor disk usage

## Backup Plan

### 1. **Alternative Download Method**
```php
// Fallback method jika storage download gagal
public function downloadAlternative(FileManager $fileManager)
{
    $file = Storage::disk('public')->get($fileManager->path);
    return response($file, 200, [
        'Content-Type' => 'application/octet-stream',
        'Content-Disposition' => 'attachment; filename="' . $fileManager->original_name . '"'
    ]);
}
```

### 2. **Direct File Access**
```php
// Method untuk direct file access
public function directDownload(FileManager $fileManager)
{
    $filePath = storage_path('app/public/' . $fileManager->path);
    
    if (!file_exists($filePath)) {
        abort(404);
    }
    
    return response()->download($filePath, $fileManager->original_name);
}
```
