<?php

namespace App\Filament\Resources\MongoMessageResource\Pages;

use App\Filament\Resources\MongoMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMongoMessage extends CreateRecord
{
    protected static string $resource = MongoMessageResource::class;
}
