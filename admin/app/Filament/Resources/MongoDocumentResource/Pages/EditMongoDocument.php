<?php

namespace App\Filament\Resources\MongoDocumentResource\Pages;

use App\Filament\Resources\MongoDocumentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoDocument extends EditRecord
{
    protected static string $resource = MongoDocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
