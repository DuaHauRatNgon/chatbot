<?php

namespace App\Filament\Resources\MongoSurveysAndFeedbackResource\Pages;

use App\Filament\Resources\MongoSurveysAndFeedbackResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMongoSurveysAndFeedback extends EditRecord
{
    protected static string $resource = MongoSurveysAndFeedbackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
