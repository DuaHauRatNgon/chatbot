<?php

namespace App\Filament\Resources\MongoDocumentResource\Pages;

use App\Filament\Resources\MongoDocumentResource;
use App\Jobs\ProcessPdfDocument;
use App\Services\DocumentService;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ListMongoDocuments extends ListRecords
{
    protected static string $resource = MongoDocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('process_new_document')
                ->label('Thêm Tài liệu mới')
                ->icon('heroicon-o-plus')
                ->color('primary')
                ->modalHeading('Thêm Tài liệu mới')
                ->modalDescription('Chọn loại dữ liệu và nhập/upload nội dung để tạo embedding.')
                ->modalSubmitActionLabel('Xử lý và Lưu')
                ->modalWidth('2xl')
                ->form([
                    Radio::make('input_type')
                        ->label('Loại dữ liệu')
                        ->options([
                            'text' => 'Nhập văn bản',
                            'file' => 'Upload file PDF'
                        ])
                        ->default('text')
                        ->live()
                        ->afterStateUpdated(function (Set $set) {
                            // Reset các field khi thay đổi loại input
                            $set('content', null);
                            $set('attachment', null);
                        })
                        ->columnSpanFull(),

                    // Section cho Text Input
                    Section::make('Nhập văn bản')
                        ->description('Nhập trực tiếp nội dung văn bản để tạo embedding ngay lập tức.')
                        ->schema([
                            Textarea::make('content')
                                ->label('Nội dung văn bản')
                                ->rows(6)
                                ->placeholder('Nhập nội dung văn bản cần tạo embedding...')
                                ->helperText('Văn bản sẽ được xử lý ngay lập tức.')
                                ->required()
                                ->minLength(10)
                                ->maxLength(10000),
                        ])
                        ->visible(fn (Get $get) => $get('input_type') === 'text')
                        ->collapsible()
                        ->collapsed(false),

                    // Section cho File Upload
                    Section::make('Upload file PDF')
                        ->description('File PDF sẽ được xử lý trong background. Bạn sẽ nhận được thông báo khi hoàn tất.')
                        ->schema([
                            FileUpload::make('attachment')
                                ->label('File PDF')
                                ->acceptedFileTypes(['application/pdf'])
                                ->maxSize(20480) // 20MB
                                ->required()
                                ->helperText('Chỉ chấp nhận file PDF, tối đa 20MB. File sẽ được xử lý trong background.')
                                ->directory('documents_temp')
                                ->disk('public')
                                ->preserveFilenames(false)
                                ->visibility('private')
                                ->live()
                                ->afterStateUpdated(function ($state) {
                                    if ($state) {
                                        Log::info('PDF file uploaded for processing', [
                                            'file' => $state,
                                            'user_id' => auth()->id()
                                        ]);
                                    }
                                })
                                ->downloadable(false)
                                ->openable(false),
                        ])
                        ->visible(fn (Get $get) => $get('input_type') === 'file')
                        ->collapsible()
                        ->collapsed(false),
                ])
                ->action(function (array $data): void {
                    $this->processDocument($data);
                })
                ->slideOver()
                ->closeModalByClickingAway(false),
        ];
    }

    /**
     * Xử lý document được submit từ modal
     */
    protected function processDocument(array $data): void
    {
        try {
            if ($data['input_type'] === 'text') {
                $this->processTextInput($data['content']);
            } elseif ($data['input_type'] === 'file') {
                $this->processPdfFile($data['attachment']);
            } else {
                $this->showErrorNotification('Loại dữ liệu không hợp lệ.');
            }
        } catch (\Exception $e) {
            Log::error('Error processing document in modal', [
                'error' => $e->getMessage(),
                'data' => $data,
                'user_id' => auth()->id()
            ]);

            $this->showErrorNotification('Có lỗi xảy ra khi xử lý tài liệu. Vui lòng thử lại.');
        }
    }

    /**
     * Xử lý văn bản đầu vào
     */
    protected function processTextInput(string $content): void
    {
        if (empty(trim($content))) {
            $this->showErrorNotification('Vui lòng nhập nội dung văn bản.');
            return;
        }

        try {
            $documentService = app(DocumentService::class);
            $result = $documentService->createDocumentFromText($content);

            if ($result['success']) {
                $this->showSuccessNotification(
                    'Xử lý văn bản thành công',
                    'Đã tạo embedding và lưu document từ văn bản.'
                );

                // Refresh table để hiển thị document mới
                $this->dispatch('refresh-table');

                Log::info('Text document processed successfully', [
                    'content_length' => strlen($content),
                    'user_id' => auth()->id()
                ]);
            } else {
                $this->showErrorNotification(
                    'Lỗi xử lý văn bản: ' . ($result['message'] ?? 'Unknown error')
                );

                Log::warning('Failed to process text document', [
                    'result' => $result,
                    'user_id' => auth()->id()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception processing text input', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            $this->showErrorNotification('Có lỗi xảy ra khi xử lý văn bản.');
        }
    }

    /**
     * Xử lý file PDF thông qua queue job
     */
    protected function processPdfFile(string $attachmentPath): void
    {
        if (empty($attachmentPath)) {
            $this->showErrorNotification('Vui lòng upload file PDF.');
            return;
        }

        try {
            // Lấy đường dẫn tuyệt đối của file
            $filePath = Storage::disk('public')->path($attachmentPath);

            // Kiểm tra file tồn tại
            if (!file_exists($filePath)) {
                $this->showErrorNotification('File không tồn tại hoặc đã bị xóa.');
                return;
            }

            // Kiểm tra kích thước file
            $fileSize = filesize($filePath);
            if ($fileSize === false || $fileSize > 20 * 1024 * 1024) { // 20MB
                $this->showErrorNotification('File quá lớn hoặc không thể đọc.');
                return;
            }

            // Dispatch job để xử lý PDF
            ProcessPdfDocument::dispatch($filePath, auth()->id());

            $this->showInfoNotification(
                'Đang xử lý file PDF',
                'File đã được gửi để xử lý. Bạn sẽ nhận được thông báo khi hoàn tất.'
            );

            Log::info('PDF processing job dispatched', [
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'user_id' => auth()->id()
            ]);

        } catch (\Exception $e) {
            Log::error('Error dispatching PDF processing job', [
                'error' => $e->getMessage(),
                'attachment_path' => $attachmentPath,
                'user_id' => auth()->id()
            ]);

            $this->showErrorNotification('Có lỗi xảy ra khi xử lý file PDF.');
        }
    }

    /**
     * Hiển thị thông báo thành công
     */
    protected function showSuccessNotification(string $title, string $body = ''): void
    {
        Notification::make()
            ->title($title)
            ->body($body)
            ->success()
            ->duration(5000)
            ->send();
    }

    /**
     * Hiển thị thông báo thông tin
     */
    protected function showInfoNotification(string $title, string $body = ''): void
    {
        Notification::make()
            ->title($title)
            ->body($body)
            ->info()
            ->duration(8000)
            ->send();
    }

    /**
     * Hiển thị thông báo lỗi
     */
    protected function showErrorNotification(string $message): void
    {
        Notification::make()
            ->title('Lỗi')
            ->body($message)
            ->danger()
            ->duration(8000)
            ->send();
    }
}
