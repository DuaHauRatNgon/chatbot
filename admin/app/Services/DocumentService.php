<?php

namespace App\Services;

use App\Models\MongoDocument;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;

class DocumentService
{
    protected $openaiApiKey;
    protected $batchSize = 5; // Xử lý 5 chunks mỗi lần
    protected $requestTimeout = 60; // Timeout cho mỗi request

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
    }

    /**
     * Xử lý PDF với batch processing để tránh timeout
     */
    public function createDocumentsFromPdf(string $filePath, int $chunkSize = 4000): array
    {
        try {
            if (!file_exists($filePath)) {
                return [
                    'success' => false,
                    'message' => 'File PDF không tồn tại tại đường dẫn: ' . $filePath
                ];
            }

            // Tăng memory limit và execution time cho process này
            ini_set('memory_limit', '512M');
            set_time_limit(0); // 5 phút

            $chunks = $this->readPdfChunks($filePath, $chunkSize);

            if (empty($chunks)) {
                return [
                    'success' => false,
                    'message' => 'File PDF không chứa nội dung hoặc không thể trích xuất nội dung.'
                ];
            }

            Log::info("Processing PDF with " . count($chunks) . " chunks");

            $documents = [];
            $errors = [];

            // Xử lý theo batch để tránh timeout
            $batches = array_chunk($chunks, $this->batchSize);

            foreach ($batches as $batchIndex => $batch) {
                Log::info("Processing batch " . ($batchIndex + 1) . "/" . count($batches));

                foreach ($batch as $index => $chunk) {
                    if (trim($chunk) === '') {
                        continue;
                    }

                    $actualIndex = $batchIndex * $this->batchSize + $index;

                    try {
                        $embedding = $this->createEmbedding($chunk);

                        if ($embedding) {
                            $document = MongoDocument::create([
                                'text' => $chunk,
                                'embedding' => $embedding,
                                'metadata' => [
                                    'sourceType' => 'pdf_file',
                                    'sourceFile' => basename($filePath),
                                    'chunkIndex' => $actualIndex,
                                    'chunkSize' => strlen($chunk),
                                    'createdAt' => now(),
                                ]
                            ]);

                            $documents[] = $document;
                            Log::info("Created document for chunk " . $actualIndex);
                        } else {
                            $errors[] = "Không tạo được embedding cho chunk {$actualIndex}";
                            Log::warning("Could not create embedding for chunk {$actualIndex}");
                        }
                    } catch (\Exception $e) {
                        $errors[] = "Lỗi xử lý chunk {$actualIndex}: " . $e->getMessage();
                        Log::error("Error processing chunk {$actualIndex}: " . $e->getMessage());
                    }
                }

                // Nghỉ một chút giữa các batch để tránh rate limit
                if ($batchIndex < count($batches) - 1) {
                    sleep(1);
                }
            }

            return [
                'success' => true,
                'message' => 'Xử lý file PDF thành công.',
                'data' => $documents,
                'total_chunks_processed' => count($documents),
                'errors' => $errors
            ];

        } catch (\Exception $e) {
            Log::error('Error processing PDF: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Lỗi không xác định khi xử lý file PDF.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Tạo embedding với timeout và retry logic
     */
    private function createEmbedding(string $text): ?array
    {
        if (trim($text) === '') {
            return null;
        }

        $maxRetries = 3;
        $retryCount = 0;

        while ($retryCount < $maxRetries) {
            try {
                $cleanedText = str_replace(["\r\n", "\r", "\n"], " ", $text);

                $response = Http::timeout($this->requestTimeout)
                    ->retry(2, 1000) // Retry 2 lần, delay 1 giây
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $this->openaiApiKey,
                        'Content-Type' => 'application/json',
                    ])
                    ->post('https://api.openai.com/v1/embeddings', [
                        'model' => 'text-embedding-3-small',
                        'input' => $cleanedText,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['data'][0]['embedding'])) {
                        return $data['data'][0]['embedding'];
                    }
                }

                Log::error('OpenAI API Error: Status ' . $response->status() . ' - ' . $response->body());

                // Nếu là rate limit, đợi lâu hơn
                if ($response->status() === 429) {
                    sleep(5);
                }

                $retryCount++;

            } catch (\Exception $e) {
                Log::error('Exception calling OpenAI API (attempt ' . ($retryCount + 1) . '): ' . $e->getMessage());
                $retryCount++;

                if ($retryCount < $maxRetries) {
                    sleep(2);
                }
            }
        }

        return null;
    }

    /**
     * Cải thiện việc đọc PDF
     */
    private function readPdfChunks(string $filePath, int $chunkSize = 1000): array
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            $text = $pdf->getText();

            if (empty($text)) {
                Log::warning("Extracted empty text from PDF file: " . basename($filePath));
                return [];
            }

            // Làm sạch text trước khi chia chunk
            $text = preg_replace('/\s+/', ' ', $text); // Thay thế multiple spaces bằng single space
            $text = trim($text);

            $chunks = [];
            $words = explode(' ', $text);
            $currentChunk = '';

            foreach ($words as $word) {
                if (strlen($currentChunk . ' ' . $word) > $chunkSize) {
                    if (!empty($currentChunk)) {
                        $chunks[] = trim($currentChunk);
                        $currentChunk = $word;
                    } else {
                        $chunks[] = trim($word);
                        $currentChunk = '';
                    }
                } else {
                    $currentChunk = empty($currentChunk) ? $word : $currentChunk . ' ' . $word;
                }
            }

            if (!empty($currentChunk)) {
                $chunks[] = trim($currentChunk);
            }

            return array_filter($chunks, function($chunk) {
                return trim($chunk) !== '';
            });

        } catch (\Exception $e) {
            Log::error('Error reading PDF: ' . $e->getMessage());
            return [];
        }
    }

    // Giữ nguyên phương thức createDocumentFromText
    public function createDocumentFromText(string $text): array
    {
        try {
            if (empty($text)) {
                return [
                    'success' => false,
                    'message' => 'Văn bản đầu vào không được rỗng.'
                ];
            }

            $embedding = $this->createEmbedding($text);

            if (!$embedding) {
                return [
                    'success' => false,
                    'message' => 'Không thể tạo embedding từ OpenAI.'
                ];
            }

            $document = MongoDocument::create([
                'text' => $text,
                'embedding' => $embedding,
                'metadata' => [
                    'sourceType' => 'text_input',
                    'chunkSize' => strlen($text),
                    'createdAt' => now(),
                ]
            ]);

            return [
                'success' => true,
                'message' => 'Tạo document từ văn bản thành công.',
                'data' => $document
            ];

        } catch (\Exception $e) {
            Log::error('Error creating document from text: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Lỗi server khi tạo document từ văn bản.',
                'error' => $e->getMessage()
            ];
        }
    }
}
