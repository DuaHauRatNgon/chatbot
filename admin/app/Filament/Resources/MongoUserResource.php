<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoUserResource\Pages;
use App\Filament\Resources\MongoUserResource\RelationManagers;
use App\Models\MongoUser;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MongoUserResource extends Resource
{
    protected static ?string $model = MongoUser::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Người dùng';
    protected static ?string $pluralLabel = 'Người dùng';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
                TextInput:: make('name')
                ->required()
                ->maxLength(255),
                TextInput::make('email')
                ->email()
                ->required()
                ->maxLength(255),
                TextInput::make('age')
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(120),
                Select::make('gender')
                    ->options([
                        'male' => 'Male',
                        'female' => 'Female',
                    ]),
                Select::make('role')
                    ->options([
                        'customer' => 'Customer',
                    ])
                    ->default('customer'),
                    TextInput::make('hashedPassword')
                    ->password()
                    ->required(fn (string $context): bool => $context === 'create')
                    ->dehydrated(fn (string $context): bool => $context === 'create') // Không lưu nếu đang edit
                    ->label('Password'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('age')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('gender')
                    ->colors([
                        'primary' => 'male',
                        'success' => 'female',
                    ]),
                Tables\Columns\BadgeColumn::make('role')
                    ->colors([
                        'success' => 'customer',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('gender')
                    ->options([
                        'male' => 'Male',
                        'female' => 'Female',
                    ]),
                Tables\Filters\SelectFilter::make('role')
                    ->options([
                        'customer' => 'customer',
                    ]),
            ])
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
            'index' => Pages\ListMongoUsers::route('/'),
            'edit' => Pages\EditMongoUser::route('/{record}/edit'),
        ];
    }
}
