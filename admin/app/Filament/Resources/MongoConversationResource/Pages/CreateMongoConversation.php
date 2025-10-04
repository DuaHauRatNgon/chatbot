<?php

namespace App\Filament\Resources\MongoConversationResource\Pages;

use App\Filament\Resources\MongoConversationResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMongoConversation extends CreateRecord
{
    protected static string $resource = MongoConversationResource::class;
}
