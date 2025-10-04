<?php

namespace App\Filament\Resources\MongoMusicResource\Pages;

use App\Filament\Resources\MongoMusicResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMongoMusic extends ListRecords
{
    protected static string $resource = MongoMusicResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Thêm nhạc'),
        ];
    }
}
