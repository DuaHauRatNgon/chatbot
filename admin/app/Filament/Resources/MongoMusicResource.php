<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MongoMusicResource\Pages;
use App\Models\MongoMusic;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MongoMusicResource extends Resource
{
    protected static ?string $model = MongoMusic::class;

    protected static ?string $navigationIcon = 'heroicon-o-musical-note';
    protected static ?string $navigationLabel = 'Âm nhạc';
    protected static ?string $pluralLabel = 'Âm nhạc';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('title')
                    ->label('Tên bài hát')
                    ->required()
                    ->live(),

                TextInput::make('duration')
                    ->label('Thời lượng')
                    ->required()
                    ->live(),

                FileUpload::make('file_url')
                    ->label('Tệp nhạc (MP3)')
                    ->acceptedFileTypes(['audio/mpeg', 'audio/mp3'])
                    ->preserveFilenames()
                    ->disk('music_upload')
                    ->directory('')
                    ->visibility('public')
                    ->required()
                    ->afterStateUpdated(function ($state, callable $set, Forms\Get $get) {
                        Log::info('FileUpload afterStateUpdated triggered', [
                            'state' => $state,
                            'type' => gettype($state),
                            'is_uploaded_file' => $state instanceof \Illuminate\Http\UploadedFile
                        ]);

                        if ($state) {
                            $originalName = '';

                            // Lấy tên file
                            if (is_string($state)) {
                                $originalName = pathinfo($state, PATHINFO_FILENAME);
                            } elseif ($state instanceof \Illuminate\Http\UploadedFile) {
                                $originalName = pathinfo($state->getClientOriginalName(), PATHINFO_FILENAME);
                            }

                            Log::info('Original filename extracted', ['original_name' => $originalName]);

                            // Tự động set title nếu chưa có
                            if (empty($get('title')) && $originalName) {
                                $set('title', $originalName);
                                Log::info('Title set automatically', ['title' => $originalName]);
                            }

                            // Lấy thời lượng thực tế từ file
                            if (empty($get('duration'))) {
                                $duration = static::getMp3DurationFromState($state);
                                $set('duration', $duration ?: '00:00');
                                Log::info('Duration set', ['duration' => $duration]);
                            }
                        }
                    }),

                Forms\Components\ViewField::make('audio_preview')
                    ->label('Nghe thử')
                    ->view('audio-preview')
                    ->visible(fn ($record) => $record !== null)
                    ->viewData(fn ($record) => ['record' => $record]),
            ]);
    }
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Tên bài hát')
                    ->limit(30),

                TextColumn::make('duration')
                    ->label('Thời lượng'),

                TextColumn::make('file_url')
                    ->label('File URL')
                    ->limit(50),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->after(function ($record) {
                        if ($record->file_url && Storage::disk('music_upload')->exists($record->file_url)) {
                            Storage::disk('music_upload')->delete($record->file_url);
                            Log::info('File deleted after record deletion', ['file' => $record->file_url]);
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->after(function ($records) {
                            foreach ($records as $record) {
                                if ($record->file_url && Storage::disk('music_upload')->exists($record->file_url)) {
                                    Storage::disk('music_upload')->delete($record->file_url);
                                    Log::info('File deleted after bulk deletion', ['file' => $record->file_url]);
                                }
                            }
                        }),
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
            'index' => Pages\ListMongoMusic::route('/'),
            'create' => Pages\CreateMongoMusic::route('/create'),
            'edit' => Pages\EditMongoMusic::route('/{record}/edit'),
        ];
    }

    /**
     * Lấy thời lượng MP3 từ state của FileUpload
     */
    protected static function getMp3DurationFromState($state)
    {
        try {
            $filePath = null;

            if ($state instanceof \Illuminate\Http\UploadedFile) {
                // Nếu là UploadedFile, sử dụng đường dẫn tạm thời
                $filePath = $state->getPathname();
                Log::info('Using temporary path for UploadedFile', ['path' => $filePath]);
            } elseif (is_string($state)) {
                // Nếu là string, tạo đường dẫn đầy đủ
                $filePath = Storage::disk('music_upload')->path($state);
                Log::info('Using storage path for string state', ['path' => $filePath]);
            }

            if ($filePath && file_exists($filePath)) {
                $duration = static::getMp3Duration($filePath);
                Log::info('Duration extracted successfully', ['duration' => $duration]);
                return $duration;
            } else {
                Log::warning('File does not exist', ['path' => $filePath]);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error getting MP3 duration from state: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Lấy thời lượng của file MP3
     */
    protected static function getMp3Duration($filePath)
    {
        if (!file_exists($filePath)) {
            Log::warning('File does not exist for duration analysis', ['path' => $filePath]);
            return null;
        }

        try {
            // Phương pháp 1: Sử dụng getID3 (nếu có cài đặt)
            if (class_exists('\getID3')) {
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze($filePath);

                Log::info('File analysis result:', [
                    'file' => $filePath,
                    'playtime_seconds' => $fileInfo['playtime_seconds'] ?? 'not found',
                    'fileformat' => $fileInfo['fileformat'] ?? 'unknown',
                    'error' => $fileInfo['error'] ?? 'no error'
                ]);

                if (isset($fileInfo['playtime_seconds']) && is_numeric($fileInfo['playtime_seconds'])) {
                    return static::formatDuration($fileInfo['playtime_seconds']);
                }
            }

            // Phương pháp 2: Sử dụng FFmpeg (nếu có cài đặt)
            return static::getMp3DurationWithFFmpeg($filePath);

        } catch (\Exception $e) {
            Log::error('Error getting MP3 duration: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Lấy thời lượng MP3 bằng FFmpeg
     */
    protected static function getMp3DurationWithFFmpeg($filePath)
    {
        try {
            // Kiểm tra xem FFmpeg có tồn tại không
            $ffmpegPath = 'ffmpeg'; // hoặc đường dẫn đầy đủ đến ffmpeg

            $command = sprintf(
                '%s -i %s -f null - 2>&1 | grep "Duration"',
                $ffmpegPath,
                escapeshellarg($filePath)
            );

            $output = shell_exec($command);
            Log::info('FFmpeg command executed', ['command' => $command, 'output' => $output]);

            if ($output && preg_match('/Duration: (\d{2}):(\d{2}):(\d{2})/', $output, $matches)) {
                $hours = (int)$matches[1];
                $minutes = (int)$matches[2];
                $seconds = (int)$matches[3];

                $totalSeconds = $hours * 3600 + $minutes * 60 + $seconds;
                return static::formatDuration($totalSeconds);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error getting MP3 duration with FFmpeg: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Format thời lượng từ giây sang mm:ss
     */
    protected static function formatDuration($seconds)
    {
        $seconds = floatval($seconds);
        $minutes = floor($seconds / 60);
        $remainingSeconds = floor($seconds % 60);
        return sprintf('%02d:%02d', $minutes, $remainingSeconds);
    }

    /**
     * Debug info cho record
     */
    public function getDebugInfoAttribute()
    {
        return [
            'file_url' => $this->file_url,
            'disk_exists' => Storage::disk('music_upload')->exists($this->file_url),
            'disk_url' => Storage::disk('music_upload')->url($this->file_url),
            'full_path' => Storage::disk('music_upload')->path($this->file_url),
            'file_exists' => file_exists(Storage::disk('music_upload')->path($this->file_url)),
        ];
    }
}
