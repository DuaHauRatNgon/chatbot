<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MongoSurveysAndFeedback extends Model
{
    //

    protected $connection = 'mongodb';
    protected $collection = 'survey_and_feedbacks';

    protected $fillable = [
        'title',
        'description',
        'link',
        'category'
    ];
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }
}
