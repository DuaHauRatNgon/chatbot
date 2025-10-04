<?php

namespace App\Filament\Resources\MongoMessageResource\Pages;

use App\Filament\Resources\MongoMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoMessage extends EditRecord
{
    protected static string $resource = MongoMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
