<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});
Route::get('/debug-storage', function() {
    $disk = Storage::disk('music_upload');

    // Kiểm tra cấu hình disk
    dd([
        'disk_config' => config('filesystems.disks.music_upload'),
        'disk_root' => $disk->path(''),
        'disk_url_base' => $disk->url(''),
        'files_in_disk' => $disk->files(),
        'storage_path' => storage_path('app/public'),
        'public_path' => public_path('storage'),
        'symlink_exists' => is_link(public_path('storage')),
        'app_url' => config('app.url'),
    ]);
});

