<?php
// app/Models/FilamentNotification.php

namespace App\Models;

use Filament\Notifications\DatabaseNotification;

class FilamentNotification extends DatabaseNotification
{
    public $connection = 'sqlite';
}
