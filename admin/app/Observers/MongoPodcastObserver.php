<?php

namespace App\Observers;

use App\Models\MongoPodcast;
use Illuminate\Support\Facades\Storage;

class MongoPodcastObserver
{
    public function created(MongoPodcast $podcast)
    {
        $this->updateDuration($podcast);
    }

    public function updated(MongoPodcast $podcast)
    {
        if ($podcast->isDirty('file_url')) {
            $this->updateDuration($podcast);
        }
    }

    private function updateDuration(MongoPodcast $podcast)
    {
        if ($podcast->file_url && ($podcast->duration === '00:00' || empty($podcast->duration))) {
            try {
                $fullPath = Storage::disk('music_upload')->path($podcast->file_url);

                if (file_exists($fullPath)) {
                    $duration = $this->getMp3Duration($fullPath);
                    if ($duration) {
                        $podcast->duration = $duration;
                        $podcast->saveQuietly(); // ✅ Không gọi lại observer
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Error updating podcast duration: ' . $e->getMessage());
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
