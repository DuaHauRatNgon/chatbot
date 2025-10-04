<?php

namespace App\Filament\Resources\MongoUserResource\Pages;

use App\Filament\Resources\MongoUserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMongoUser extends CreateRecord
{
    protected static string $resource = MongoUserResource::class;
}
