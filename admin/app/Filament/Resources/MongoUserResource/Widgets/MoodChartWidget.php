<?php

namespace App\Filament\Resources\MongoUserResource\Widgets;

use App\Models\MongoDailyMood;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;
use Filament\Support\RawJs;

class MoodChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Biểu đồ cảm xúc theo thời gian';
    public ?string $userId = null;
    public ?string $filter = '7days';
    protected static ?string $pollingInterval = null;
    protected int $height = 400;

    public function mount(?string $userId = null): void
    {
        if ($userId) {
            $this->userId = $userId;
            Log::info("MoodChartWidget mounted with provided userId: {$this->userId}");
            return;
        }

        $routeRecord = request()->route('record');
        if ($routeRecord && property_exists($routeRecord, '_id')) {
            $this->userId = (string) $routeRecord->_id;
            Log::info("MoodChartWidget fallback route userId: {$this->userId}");
        } else {
            Log::warning("MoodChartWidget could not determine userId from mount or route.");
        }
    }

    protected function getFilters(): ?array
    {
        return [
            '7days' => '7 ngày gần nhất',
            '14days' => '14 ngày gần nhất',
            '30days' => '30 ngày gần nhất',
            '90days' => '3 tháng gần nhất',
            'all' => 'Tất cả',
        ];
    }

    // protected function getData(): array
    // {
    //     Log::info("getData called for userId: {$this->userId}, filter: {$this->filter}");

    //     if (!$this->userId) {
    //         Log::warning("No userId found for MoodChartWidget.");
    //         return ['labels' => [], 'datasets' => []];
    //     }

    //     $now = Carbon::now();
    //     $from = match ($this->filter) {
    //         '7days' => $now->copy()->subDays(7),
    //         '14days' => $now->copy()->subDays(14),
    //         '30days' => $now->copy()->subDays(30),
    //         '90days' => $now->copy()->subDays(90),
    //         'all' => Carbon::create(2000, 1, 1),
    //         default => $now->copy()->subDays(7),
    //     };
    //     Log::info("Date range: {$from->format('Y-m-d')} → {$now->format('Y-m-d')}");

    //     try {
    //         $userId = $this->userId instanceof ObjectId ? $this->userId : new ObjectId($this->userId);

    //         $records = MongoDailyMood::where('user_id', $userId)
    //             ->where('date', '>=', $from->format('Y-m-d'))
    //             ->orderBy('date')
    //             ->get();

    //         Log::info("Found {$records->count()} mood records for user {$this->userId}");
    //     } catch (\Exception $e) {
    //         Log::error("Error fetching mood records: " . $e->getMessage());
    //         return ['labels' => [], 'datasets' => []];
    //     }

    //     if ($records->isEmpty()) {
    //         return ['labels' => [], 'datasets' => []];
    //     }

    //     // Map cảm xúc → y-value + màu
    //     $emotionMap = [
    //         'sad' => ['value' => 1, 'label' => 'Buồn 😢', 'color' => '#3b82f6'],   // xanh dương
    //         'fear' => ['value' => 2, 'label' => 'Lo 😨', 'color' => '#a855f7'],  // tím
    //         'angry' => ['value' => 3, 'label' => 'Tức 😡', 'color' => '#ef4444'], // đỏ
    //         'happy' => ['value' => 4, 'label' => 'Vui 😄', 'color' => '#22c55e'], // xanh lá
    //     ];

    //     // Gom dữ liệu theo từng cảm xúc để vẽ nhiều dataset
    //     $datasets = [];

    //     foreach ($emotionMap as $emotion => $info) {
    //         $data = [];
    //         foreach ($records as $record) {
    //             if ($record->emotion === $emotion) {
    //                 $data[] = [
    //                     'x' => Carbon::parse($record->date)->format('Y-m-d'),
    //                     'y' => $info['value'],
    //                 ];
    //             }
    //         }

    //         if (!empty($data)) {
    //             $datasets[] = [
    //                 'label' => $info['label'],
    //                 'data' => $data,
    //                 'borderColor' => $info['color'],
    //                 'backgroundColor' => $info['color'],
    //                 'pointRadius' => 7,
    //                 'pointBorderColor' => '#fff',
    //                 'pointBorderWidth' => 2,
    //                 'showLine' => false,
    //             ];
    //         }
    //     }

    //     return [
    //         'labels' => [],
    //         'datasets' => $datasets,
    //     ];
    // }
    // protected function getOptions(): array
    // {
    //     return [
    //         'responsive' => true,
    //         'maintainAspectRatio' => false,
    //         'interaction' => [
    //             'intersect' => false,
    //             'mode' => 'nearest',
    //         ],
    //         'scales' => [
    //             'x' => [
    //                 'type' => 'category',
    //                 'title' => [
    //                     'display' => true,
    //                     'text' => 'Ngày',
    //                 ],
    //             ],
    //             'y' => [
    //                 'beginAtZero' => true,
    //                 'min' => 0,
    //                 'max' => 5,
    //                 'ticks' => [
    //                     'stepSize' => 1,
    //                     'callback' => 'function(value) {
    //                         const labels = {0: "", 1: "Buồn 😢", 2: "Lo 😨", 3: "Tức 😡", 4: "Vui 😄"};
    //                         return labels[value] || "";
    //                     }',
    //                 ],
    //                 'title' => [
    //                     'display' => true,
    //                     'text' => 'Cảm xúc',
    //                 ],
    //             ],
    //         ],
    //         'plugins' => [
    //             'legend' => [
    //                 'display' => true,
    //                 'position' => 'top',
    //                 'labels' => [
    //                     'usePointStyle' => true,
    //                     'pointStyle' => 'circle',
    //                     'padding' => 20,
    //                 ],
    //             ],
    //             'tooltip' => [
    //                 'callbacks' => [
    //                     'label' => RawJs::make('function(context) {
    //                         return context.dataset.label + ": " + context.parsed.x;
    //                     }'),
    //                 ],
    //             ],
    //         ],
    //     ];
    // }

    protected function getType(): string
    {
        return 'scatter';
    }

    protected function getData(): array
    {
        Log::info("getData called for userId: {$this->userId}, filter: {$this->filter}");

        if (!$this->userId) {
            Log::warning("No userId found for MoodChartWidget.");
            return ['labels' => [], 'datasets' => []];
        }

        $now = Carbon::now();
        $from = match ($this->filter) {
            '7days' => $now->copy()->subDays(7),
            '14days' => $now->copy()->subDays(14),
            '30days' => $now->copy()->subDays(30),
            '90days' => $now->copy()->subDays(90),
            'all' => Carbon::create(2000, 1, 1),
            default => $now->copy()->subDays(7),
        };

        try {
            $userId = $this->userId instanceof ObjectId ? $this->userId : new ObjectId($this->userId);

            $records = MongoDailyMood::where('user_id', $userId)
                ->where('date', '>=', $from->format('Y-m-d'))
                ->orderBy('date')
                ->get();

            Log::info("Found {$records->count()} mood records for user {$this->userId}");
        } catch (\Exception $e) {
            Log::error("Error fetching mood records: " . $e->getMessage());
            return ['labels' => [], 'datasets' => []];
        }

        if ($records->isEmpty()) {
            return ['labels' => [], 'datasets' => []];
        }

        // ✅ Mỗi cảm xúc có màu riêng
        $emotionMap = [
            'sad' => ['y' => 1, 'color' => '#3b82f6', 'emoji' => '😢', 'label' => 'Buồn'],
            'fear' => ['y' => 2, 'color' => '#8b5cf6', 'emoji' => '😨', 'label' => 'Lo'],
            'angry' => ['y' => 3, 'color' => '#ef4444', 'emoji' => '😡', 'label' => 'Tức'],
            'happy' => ['y' => 4, 'color' => '#facc15', 'emoji' => '😄', 'label' => 'Vui'],
        ];

        $datasets = [];

        foreach ($emotionMap as $key => $info) {
            $points = $records
                ->filter(fn($r) => $r->emotion === $key)
                ->map(fn($r) => [
                    'x' => Carbon::parse($r->date)->format('Y-m-d'),
                    'y' => $info['y'],
                ])
                ->values()
                ->toArray();

            if (!empty($points)) {
                $datasets[] = [
                    'label' => "{$info['label']} {$info['emoji']}",
                    'data' => $points,
                    'backgroundColor' => $info['color'],
                    'borderColor' => $info['color'],
                    'pointBackgroundColor' => $info['color'], // ✅ màu tâm
                    'pointBorderColor' => '#fff',
                    'pointBorderWidth' => 2,
                    'pointRadius' => 8,
                    'showLine' => false,
                ];
            }
        }

        return [
            'labels' => [],
            'datasets' => $datasets,
        ];
    }


    protected function getOptions(): array
    {
        return [
            'responsive' => true,
            'maintainAspectRatio' => false,
            'scales' => [
                'x' => [
                    'type' => 'category',
                    'title' => [
                        'display' => true,
                        'text' => 'Ngày',
                    ],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'min' => 0,
                    'max' => 5,
                    'ticks' => [
                        'stepSize' => 1,
                        'callback' => 'function(value) {
                            const labels = {0: "", 1: "Buồn 😢", 2: "Lo 😨", 3: "Tức 😡", 4: "Vui 😄"};
                            return labels[value] || "";
                        }',
                    ],
                    'title' => [
                        'display' => true,
                        'text' => 'Cảm xúc',
                    ],
                ],
            ],
            'plugins' => [
                'legend' => [
                    'display' => true,
                    'position' => 'top',
                    'labels' => [
                        'usePointStyle' => true,
                        'pointStyle' => 'circle',
                        'padding' => 20,
                    ],
                ],
            ],
        ];
    }

}
