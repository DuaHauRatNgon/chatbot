<?php

namespace App\Filament\Resources\MongoUserResource\Pages;

use App\Filament\Resources\MongoUserResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMongoUsers extends ListRecords
{
    protected static string $resource = MongoUserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Actions\CreateAction::make(),
        ];
    }
}
