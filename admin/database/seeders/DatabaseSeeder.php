<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
        /**
         * Seed the application's database.
         */
    public function run(): void
    {
        User::create([
            'name' => 'minh anh',
            'email' => 'buiminhanhnbk@gmail.com',
            'password' => bcrypt('minhanhbui0804'),
        ]);
    }
}
