<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MongoMusic extends Model
{
    //

    protected $connection = 'mongodb';
    protected $collection = 'musics';

    protected $fillable = [
        'title',
        'file_url',
        'duration'
    ];
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }
    public function getMusicUrlAttribute(): string
    {
        return Storage::disk('music_upload')->url($this->file_name);
    }
}
