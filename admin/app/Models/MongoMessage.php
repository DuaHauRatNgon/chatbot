<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MongoMessage extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'messages';
    protected $fillable = [
        'conversation_id',
        'content',
        'sender',
        'emotion',
        'timestamp'
    ];

    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        '_id' => 'string',
        'conversation_id' => 'string', // THÊM cast này
        'timestamp' => 'datetime',
    ];

    // Debug method
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }

    public function conversation()
    {
        return $this->belongsTo(MongoConversation::class, 'conversation_id', '_id');
    }

    // THÊM: Boot method để debug
    protected static function boot()
    {
        parent::boot();

        static::retrieved(function ($model) {
            \Log::info('Message retrieved - conversation_id: ' . ($model->conversation_id ?? 'NULL'));
        });
    }
}
