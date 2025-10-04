<?php

namespace App\Filament\Resources\MongoConversationResource\Pages;

use App\Filament\Resources\MongoConversationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoConversation extends EditRecord
{
    protected static string $resource = MongoConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
