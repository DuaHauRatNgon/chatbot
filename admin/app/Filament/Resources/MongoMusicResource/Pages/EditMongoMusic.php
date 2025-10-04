<?php

namespace App\Filament\Resources\MongoMusicResource\Pages;

use App\Filament\Resources\MongoMusicResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoMusic extends EditRecord
{
    protected static string $resource = MongoMusicResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
