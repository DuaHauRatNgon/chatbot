<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoSurveysAndFeedbackResource\Pages;
use App\Filament\Resources\MongoSurveysAndFeedbackResource\RelationManagers;
use App\Models\MongoSurveysAndFeedback;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MongoSurveysAndFeedbackResource extends Resource
{
    protected static ?string $model = MongoSurveysAndFeedback::class;

    protected static ?string $navigationIcon = 'heroicon-o-globe-asia-australia';
    protected static ?string $navigationLabel = 'Khảo sát';
    protected static ?string $pluralLabel = 'Khảo sát';
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->label('Tiêu đề')
                    ->required()
                    ->maxLength(255),

                Forms\Components\Textarea::make('description')
                    ->label('Mô tả')
                    ->rows(3)
                    ->maxLength(1000),

                Forms\Components\TextInput::make('link')
                    ->label('Link khảo sát')
                    ->url()
                    ->required()
                    ->maxLength(500),
                Forms\Components\TextInput::make('category')
                    ->label('Thể loại')
                    ->required()
                    ->maxLength(500),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Tiêu đề')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(50),
                Tables\Columns\TextColumn::make('link')
                    ->label('Link khảo sát')
                    ->url(fn ($record) => $record->link)
                    ->openUrlInNewTab()
                    ->copyable()->limit(20),
                Tables\Columns\TextColumn::make('category')
                    ->label('Thể loại')
                    ->limit(50),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }


    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMongoSurveysAndFeedback::route('/'),
            'create' => Pages\CreateMongoSurveysAndFeedback::route('/create'),
            'edit' => Pages\EditMongoSurveysAndFeedback::route('/{record}/edit'),
        ];
    }
}
