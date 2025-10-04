<?php

namespace App\Filament\Resources\MongoPodcastResource\Pages;

use App\Filament\Resources\MongoPodcastResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoPodcast extends EditRecord
{
    protected static string $resource = MongoPodcastResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
