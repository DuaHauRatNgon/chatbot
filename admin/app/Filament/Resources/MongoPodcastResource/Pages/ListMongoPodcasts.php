<?php

namespace App\Filament\Resources\MongoPodcastResource\Pages;

use App\Filament\Resources\MongoPodcastResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMongoPodcasts extends ListRecords
{
    protected static string $resource = MongoPodcastResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Thêm podcast'),
        ];
    }
}
