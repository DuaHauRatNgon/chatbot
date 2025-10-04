<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MongoConversation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'conversations';
    protected $fillable = [
        'user_id',
        'title',
        'mood_before',
    ];

    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        '_id' => 'string',
    ];

    // Thêm boot method để debug
    protected static function boot()
    {
        parent::boot();

        static::retrieved(function ($model) {
            \Log::info('Conversation retrieved - ID: ' . ($model->_id ?? 'NULL'));
            \Log::info('Conversation attributes: ', $model->attributes);
        });
    }

    // Thêm accessor cho _id
    public function get_IdAttribute()
    {
        if (isset($this->attributes['_id'])) {
            return (string) $this->attributes['_id'];
        }
        return null;
    }

    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }

    public function user()
    {
        return $this->belongsTo(MongoUser::class, 'user_id', '_id');
    }

    public function messages()
    {
        // // Debug thêm thông tin
        // \Log::info('Model exists: ' . ($this->exists ? 'true' : 'false'));
        // \Log::info('Model attributes: ', $this->attributes);
        // \Log::info('Model getKey(): ' . $this->getKey());

        // $conversationId = $this->_id;
        // \Log::info('Looking for messages with conversation_id: ' . $conversationId);
        // \Log::info('Conversation ID type: ' . gettype($conversationId));

        // // Test manual query chỉ khi có ID
        // if ($conversationId) {
        //     $manualMessages = MongoMessage::where('conversation_id', $conversationId)->get();
        //     \Log::info('Manual query found: ' . $manualMessages->count() . ' messages');
        // }

        return $this->hasMany(MongoMessage::class, 'conversation_id', '_id');
    }
}
