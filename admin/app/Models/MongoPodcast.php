<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MongoPodcast extends Model
{
    //

    protected $connection = 'mongodb';
    protected $collection = 'podcasts';

    protected $fillable = [
        'title',
        'file_url',
        'duration',
        'description',
    ];
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }
    public function getPodcastUrlAttribute(): string
    {
        return Storage::disk('Podcast_upload')->url($this->file_name);
    }
}
