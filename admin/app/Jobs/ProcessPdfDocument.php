<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\DocumentService;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Notifications\Actions\Action;

class ProcessPdfDocument implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 phút timeout
    public $tries = 3; // Retry 3 lần nếu fail
    public $backoff = 60; // Delay 60 giây giữa các retry

    protected string $filePath;
    protected ?int $userId;

    public function __construct(string $filePath, ?int $userId = null)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
    }

    public function handle(DocumentService $documentService): void
    {
        ini_set('max_execution_time', 0);

        Log::info("Starting PDF processing job for file: " . basename($this->filePath));

        try {
            // Gửi notification bắt đầu xử lý
            $this->sendNotification(
                'Đang xử lý PDF',
                'Bắt đầu xử lý file ' . basename($this->filePath),
                'info'
            );

            $result = $documentService->createDocumentsFromPdf($this->filePath);

            if ($result['success']) {
                Log::info("PDF processing successful: " . $result['total_chunks_processed'] . " documents created");

                $this->sendNotification(
                    'Xử lý PDF hoàn tất',
                    'Đã tạo thành công ' . $result['total_chunks_processed'] . ' documents từ file ' . basename($this->filePath),
                    'success'
                );
            } else {
                Log::error("PDF processing failed: " . $result['message']);

                $this->sendNotification(
                    'Lỗi xử lý PDF',
                    'Không thể xử lý file ' . basename($this->filePath) . ': ' . $result['message'],
                    'danger'
                );
            }

        } catch (\Exception $e) {
            Log::error("Exception during PDF processing: " . $e->getMessage());

            $this->sendNotification(
                'Lỗi nghiêm trọng',
                'Có lỗi xảy ra khi xử lý file ' . basename($this->filePath) . ': ' . $e->getMessage(),
                'danger'
            );

            throw $e;
        } finally {
            $this->cleanupTempFile();
        }
    }

    /**
     * Xử lý khi job failed
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("PDF processing job failed permanently: " . $exception->getMessage());

        $this->sendNotification(
            'Xử lý PDF thất bại',
            'Không thể xử lý file ' . basename($this->filePath) . ' sau nhiều lần thử.',
            'danger'
        );

        $this->cleanupTempFile();
    }

    /**
     * Gửi notification cho user
     */
    private function sendNotification(string $title, string $body, string $type): void
    {
        if (!$this->userId) {
            return;
        }

        try {
            $user = User::find($this->userId);
            if (!$user) {
                return;
            }

            $notification = Notification::make()
                ->title($title)
                ->body($body);

            // Thêm action để refresh trang
            if ($type === 'success') {
                $notification->actions([
                    Action::make('view')
                        ->label('Xem tài liệu')
                        ->url('/admin/mongo-documents')
                        ->button()
                ]);
            }

            switch ($type) {
                case 'success':
                    $notification->success();
                    break;
                case 'danger':
                    $notification->danger();
                    break;
                case 'info':
                default:
                    $notification->info();
                    break;
            }

            $notification->sendToDatabase($user);

        } catch (\Exception $e) {
            Log::error("Failed to send notification: " . $e->getMessage());
        }
    }

    /**
     * Xóa file tạm
     */
    private function cleanupTempFile(): void
    {
        try {
            if (file_exists($this->filePath)) {
                $relativePath = str_replace(Storage::disk('public')->path(''), '', $this->filePath);
                $relativePath = ltrim($relativePath, '/\\');

                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                    Log::info("Temporary file deleted: " . $relativePath);
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to cleanup temp file: " . $e->getMessage());
        }
    }
}
