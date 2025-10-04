<?php

namespace App\Filament\Resources\MongoMessageResource\Pages;

use App\Filament\Resources\MongoMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMongoMessages extends ListRecords
{
    protected static string $resource = MongoMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Actions\CreateAction::make(),
        ];
    }
}
