<?php

namespace App\Observers;

use App\Models\MongoMusic;
use Illuminate\Support\Facades\Storage;

class MongoMusicObserver
{
    public function created(MongoMusic $music)
    {
        $this->updateDuration($music);
    }

    public function updated(MongoMusic $music)
    {
        if ($music->isDirty('file_url')) {
            $this->updateDuration($music);
        }
    }

    private function updateDuration(MongoMusic $music)
    {
        if ($music->file_url && ($music->duration === '00:00' || empty($music->duration))) {
            try {
                $fullPath = Storage::disk('music_upload')->path($music->file_url);

                if (file_exists($fullPath)) {
                    $duration = $this->getMp3Duration($fullPath);
                    if ($duration) {
                        $music->duration = $duration;
                        $music->saveQuietly(); // ✅ Không gọi lại observer
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Error updating duration: ' . $e->getMessage());
            }
        }
    }


    private function getMp3Duration($filePath)
    {
        try {
            $getID3 = new \getID3();
            $fileInfo = $getID3->analyze($filePath);

            if (isset($fileInfo['playtime_seconds']) && is_numeric($fileInfo['playtime_seconds'])) {
                $seconds = floatval($fileInfo['playtime_seconds']);
                $minutes = floor($seconds / 60);
                $remainingSeconds = floor($seconds % 60);
                return sprintf('%02d:%02d', $minutes, $remainingSeconds);
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
