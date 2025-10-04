<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoDocumentResource\Pages;
use App\Models\MongoDocument;
use Filament\Forms; // Chỉ import Forms chung, các components cụ thể sẽ được import ở trang List
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Columns\TextColumn;
use Filament\Forms\Components\Textarea; // Cần import Textarea


class MongoDocumentResource extends Resource
{
    protected static ?string $model = MongoDocument::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationLabel = 'Tài liệu';
    protected static ?string $pluralLabel = 'Tài liệu';

    public static function form(Form $form): Form
    {
        // Form này dùng để hiển thị/sửa bản ghi đã tồn tại
        // Bỏ các field nhập liệu và xử lý mới ở đây
        return $form
            ->schema([
                Textarea::make('text') // Sử dụng Textarea (một Form Component)
                    ->label('Nội dung đã lưu (Chunk)')
                    ->rows(10) // Đặt số hàng hiển thị
                    ->disabled() // Không cho phép chỉnh sửa nội dung chunk trực tiếp
                    ->columnSpanFull() // Mở rộng component ra toàn bộ chiều rộng form nếu layout có cột


                // Có thể thêm các field metadata khác nếu muốn hiển thị
                // Forms\Components\KeyValue::make('metadata')
                //     ->label('Metadata')
                //     ->disabled() // Không cho sửa metadata ở đây
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('text')
                    ->label('Dữ liệu (Chunk)')
                    ->searchable()
                    ->sortable()
                    ->limit(20) // Giới hạn hiển thị chunk
                    ->tooltip(fn (string $state): string => $state), // Hiển thị toàn bộ khi hover

                TextColumn::make('metadata.sourceType') // Hiển thị loại nguồn (text_input hoặc pdf_file)
                    ->label('Loại Nguồn')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'text_input' => 'info',
                        'pdf_file' => 'success',
                        default => 'secondary',
                    })
                    ->sortable(),

                 TextColumn::make('metadata.sourceFile') // Hiển thị tên file gốc nếu có
                    ->label('File Gốc')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // Ẩn mặc định

                TextColumn::make('metadata.chunkIndex') // Hiển thị index của chunk nếu có
                    ->label('Index Chunk')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // Ẩn mặc định

                TextColumn::make('metadata.chunkSize')
                    ->label('Kích thước Chunk')
                    ->sortable(),

                TextColumn::make('metadata.createdAt')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                // Có thể thêm filter theo source type
                Tables\Filters\SelectFilter::make('sourceType')
                    ->options([
                        'text_input' => 'Text Input',
                        'pdf_file' => 'PDF File',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        if (isset($data['value']) && $data['value']) {
                            $query->where('metadata.sourceType', $data['value']);
                        }
                        return $query;
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(), // Vẫn giữ action sửa để xem chi tiết
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
            'index' => Pages\ListMongoDocuments::route('/'),
            'edit' => Pages\EditMongoDocument::route('/{record}/edit'), // Giữ trang edit
            // Loại bỏ trang 'create' mặc định
            // 'create' => Pages\CreateMongoDocument::route('/create'),
        ];
    }

    // Có thể thêm method này để disable nút "Create" mặc định trên trang list nếu getPages không đủ
    // protected static bool $canCreate = false; // Uncomment this if needed, but removing 'create' from getPages is sufficient.
}
