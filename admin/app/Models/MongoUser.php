<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class MongoUser extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'hashedPassword',
        'age',
        'gender',
        'role',
    ];

    // Debug method
    public function getTable()
    {
        \Log::info('Model using collection: ' . $this->collection);
        return $this->collection;
    }

    // Sử dụng mutator với bcrypt
    public function setHashedPasswordAttribute($value)
    {
        if (!empty($value)) {
            // Sử dụng bcrypt với cost 10 giống như Node.js
            $this->attributes['hashedPassword'] = Hash::make($value, [
                'rounds' => 10,
            ]);
        }
    }

    // Hoặc sử dụng boot() method với bcrypt
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (isset($user->hashedPassword) && !empty($user->hashedPassword)) {
                $user->hashedPassword = Hash::make($user->hashedPassword, [
                    'rounds' => 10,
                ]);
            }
        });

        static::updating(function ($user) {
            if ($user->isDirty('hashedPassword') && !empty($user->hashedPassword)) {
                $user->hashedPassword = Hash::make($user->hashedPassword, [
                    'rounds' => 10,
                ]);
            }
        });
    }

    // Method để verify password
    public function verifyPassword($password)
    {
        return Hash::check($password, $this->hashedPassword);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'user_id');
    }
}
