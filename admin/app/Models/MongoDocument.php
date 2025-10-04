<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MongoDocument extends Model
{
    //
    protected $connection = 'mongodb';
    protected $collection = 'documents';

    protected $fillable = [
        'text',
        'embedding',
        'metadata',
    ];
    protected $casts = [
        'embedding' => 'array',
        'metadata' => 'array',
    ];
            // Debug method
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }
}
