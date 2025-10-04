<?php

namespace App\Filament\Resources\MongoPodcastResource\Pages;

use App\Filament\Resources\MongoPodcastResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CreateMongoPodcast extends CreateRecord
{
    protected static string $resource = MongoPodcastResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Lấy đường dẫn tuyệt đối của file sau khi đã upload
        $filePath = Storage::disk('music_upload')->path($data['file_url']);

        // Tự động đặt title nếu chưa có
        if (empty($data['title'])) {
            $data['title'] = pathinfo($data['file_url'], PATHINFO_FILENAME);
        }

        // Tự động lấy thời lượng podcast
        if (empty($data['duration'])) {
            try {
                $duration = MongoPodcastResource::getMp3Duration($filePath);
                $data['duration'] = $duration ?? '00:00';
            } catch (\Exception $e) {
                Log::error('Error getting podcast duration: ' . $e->getMessage());
                $data['duration'] = '00:00';
            }
        }

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        // Sau khi tạo, ở lại trang tạo mới để tiếp tục thêm podcast
        return static::getResource()::getUrl('create');
    }
}
