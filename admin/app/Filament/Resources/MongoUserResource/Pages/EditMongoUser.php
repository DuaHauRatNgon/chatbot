<?php

namespace App\Filament\Resources\MongoUserResource\Pages;

use App\Filament\Resources\MongoUserResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoUser extends EditRecord
{
    protected static string $resource = MongoUserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
