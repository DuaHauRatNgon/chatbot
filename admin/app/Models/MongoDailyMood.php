<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MongoDailyMood extends Model
{
    //
    protected $connection = 'mongodb';
    protected $collection = 'dailymoods';
    protected $fillable = [
        'user_id',
        'date',
        'emotion',
        'created_at',
    ];
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }
    
    public function user()
    {
        return $this->belongsTo(MongoUser::class, 'user_id', '_id');
    }

}
