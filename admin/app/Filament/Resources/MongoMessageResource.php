<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoMessageResource\Pages;
use App\Filament\Resources\MongoMessageResource\RelationManagers;
use App\Models\MongoMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Actions\ViewAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Filament\Forms\Components\Textarea;
use Filament\Infolists\Components\TextEntry;


class MongoMessageResource extends Resource
{
    protected static ?string $model = MongoMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationLabel = 'Tin nhắn';
    protected static ?string $pluralLabel = 'Tin nhắn';

    // Trong file Resource của bạn (VD: MessageResource.php)
    public static function getModelLabel(): string
    {
        return 'tin nhắn';
    }

    public static function getPluralModelLabel(): string
    {
        return 'tin nhắn';
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
                // Select::make('conversation.title')->label('Tiêu đề trò chuyện')->required(),
                // TextInput::make('content')->label('Nội dung'),
                // TextInput::make('sender')->label('Người gửi'),
                // TextInput::make('emotion')->label('cảm xúc'),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
                TextColumn::make('conversation.title')->label('Tiêu đề') -> searchable() ->sortable(),
                TextColumn::make('content')->label('Nội dung')->searchable()->limit(20,'...'),
                TextColumn::make('sender')->label('Người gửi')->color(fn ($record)=>match ($record -> sender) {
                    'bot' =>'success',
                    'user' => 'primary',
                    default => 'gray'
                }),
                TextColumn::make('emotion')->label('Cảm xúc')->color(fn ($record)=> match ($record -> emotion){
                    'happy' => 'success',
                    'sad' =>'primary',
                    'angry' => 'error',
                    default => 'gray'
                }),
                TextColumn::make('timestamp')
                ->label('Ngày tạo')
                ->dateTime('d/m/Y H:i')
                ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                ViewAction::make()->modalHeading('Chi tiết tin nhắn') // Thay đổi tiêu đề modal
                    ->infolist([
                        TextEntry::make('conversation.title')->label('Tiêu đề'),
                        TextEntry::make('content')->label('Nội dung'),
                        TextEntry::make('sender')->label('Người gửi'),
                        TextEntry::make('emotion')->label('Cảm xúc'),
                        TextEntry::make('timestamp')->label('Thời gian tạo'),
                    ])
                ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    // Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])->defaultSort('timestamp', 'desc') // Thêm dòng này để sắp xếp mặc định
            ;
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
            'index' => Pages\ListMongoMessages::route('/'),
            // 'create' => Pages\CreateMongoMessage::route('/create'),
            // 'edit' => Pages\EditMongoMessage::route('/{record}/edit'),
        ];
    }
}
