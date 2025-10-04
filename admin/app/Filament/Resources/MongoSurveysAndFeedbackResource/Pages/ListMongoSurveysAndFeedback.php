<?php

namespace App\Filament\Resources\MongoSurveysAndFeedbackResource\Pages;

use App\Filament\Resources\MongoSurveysAndFeedbackResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMongoSurveysAndFeedback extends ListRecords
{
    protected static string $resource = MongoSurveysAndFeedbackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Thêm khảo sát'),
        ];
    }
}
