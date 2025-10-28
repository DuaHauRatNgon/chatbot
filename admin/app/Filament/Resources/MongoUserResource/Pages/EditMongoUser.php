<?php

namespace App\Filament\Resources\MongoUserResource\Pages;

use App\Filament\Resources\MongoUserResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use App\Filament\Resources\MongoUserResource\Widgets\MoodChartWidget;


class EditMongoUser extends EditRecord
{
    protected static string $resource = MongoUserResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            MoodChartWidget::make(['userId' => (string) $this->record->_id]),
        ];
    }
}
