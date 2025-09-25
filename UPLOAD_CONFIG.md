# Upload Configuration

## File Upload Limits

Sistem ini mendukung upload file dengan batasan berikut:

### ✅ **Jenis File yang Didukung:**
- **Semua jenis file** - Tidak ada pembatasan jenis file
- **Images**: JPG, PNG, GIF, WebP, SVG, dll
- **Videos**: MP4, AVI, MOV, MKV, WebM, dll  
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, dll
- **Archives**: ZIP, RAR, 7Z, TAR, GZ, dll
- **Audio**: MP3, WAV, FLAC, AAC, dll
- **Code**: JS, TS, PHP, HTML, CSS, JSON, dll
- **Dan semua jenis file lainnya**

### 📏 **Ukuran File:**
- **Maksimal per file**: 1GB (1,024 MB)
- **Maksimal total upload**: 1GB per request
- **Multiple files**: Bisa upload banyak file sekaligus

### ⚙️ **Konfigurasi Server:**

#### **PHP Configuration:**
```ini
upload_max_filesize = 1G
post_max_size = 1G
max_execution_time = 300
max_input_time = 300
memory_limit = 1G
max_file_uploads = 20
```

#### **Laravel Configuration:**
```php
// FileManagerController.php
'files.*' => 'required|file|max:1024000', // 1GB max (1024000 KB)
```

#### **Web Server (.htaccess):**
```apache
php_value upload_max_filesize 1G
php_value post_max_size 1G
php_value max_execution_time 300
php_value max_input_time 300
php_value memory_limit 1G
```

### 🚀 **Fitur Upload:**

#### **Real-time Progress:**
- ✅ Progress bar yang realistis (0% - 100%)
- ✅ Kecepatan upload (KB/s, MB/s, GB/s)
- ✅ Estimasi waktu tersisa
- ✅ Ukuran file yang ditampilkan

#### **Multiple Upload:**
- ✅ Drag & drop multiple files
- ✅ Browse multiple files
- ✅ Upload sequential dengan progress individual

#### **Error Handling:**
- ✅ Validasi ukuran file
- ✅ Validasi jenis file
- ✅ Network error handling
- ✅ Server error handling

### 📱 **Cara Upload:**

1. **Drag & Drop**: Tarik file ke area upload
2. **Browse Files**: Klik "browse files" untuk pilih file
3. **Multiple Selection**: Pilih banyak file sekaligus
4. **Progress Tracking**: Lihat progress real-time
5. **Auto Refresh**: File manager otomatis refresh setelah upload

### 🔧 **Troubleshooting:**

#### **Upload Gagal:**
1. Cek ukuran file (max 1GB)
2. Cek koneksi internet
3. Cek konfigurasi PHP
4. Cek disk space server

#### **Progress Tidak Akurat:**
1. Pastikan menggunakan browser modern
2. Cek console untuk error
3. Restart server jika perlu

### 💡 **Tips:**
- Upload file besar di waktu yang tidak sibuk
- Pastikan koneksi internet stabil
- Gunakan browser modern (Chrome, Firefox, Safari, Edge)
- File akan tersimpan di `storage/app/public/file-manager/{user_id}/`
