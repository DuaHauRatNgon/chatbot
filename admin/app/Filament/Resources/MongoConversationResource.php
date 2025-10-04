<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoConversationResource\Pages;
use App\Models\MongoUser;
use App\Models\MongoConversation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;

class MongoConversationResource extends Resource
{
    protected static ?string $model = MongoConversation::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-oval-left-ellipsis';
    protected static ?string $navigationLabel = 'Trò chuyện';
    protected static ?string $pluralLabel = 'Trò chuyện';
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
                Select::make('user.name')
                ->label('Người dùng')
                ->required(),
                TextInput::make('title')->label('Tiêu đề') ->required()->maxLength(225),
                TextInput::make('mood_before')
                ->label('Tâm trạng trước')
                ->maxLength(100),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Tiêu đề')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('user.name')
                    ->label('Người dùng')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),

                TextColumn::make('mood_before')
                    ->label('Tâm trạng trước')
                    ->searchable(),

                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('user_id')
                    ->label('Lọc theo người dùng')
                    ->options(MongoUser::all()->pluck('name', '_id')),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
    public static function getEloquentQuery(): Builder
    {
        // Eager load đúng cách
        return parent::getEloquentQuery()
            ->with(['user', 'messages' => function($query) {
                // Thêm ordering nếu cần
                $query->orderBy('timestamp', 'asc');
            }]);
    }
    public static function getRelations(): array
    {
        return [
            //
        ];
    }
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                TextEntry::make('user.name')->label('Người dùng'),
                TextEntry::make('title')->label('Tiêu đề'),
                TextEntry::make('mood_before')->label('Tâm trạng trước')
                    ->columnSpanFull(),
            ]);
    }
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMongoConversations::route('/'),
            // 'create' => Pages\CreateMongoConversation::route('/create'),
            'view' => Pages\ViewMongoConversation::route('/{record}'),
            // 'edit' => Pages\EditMongoConversation::route('/{record}/edit'),
        ];
    }

}
