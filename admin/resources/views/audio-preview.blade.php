@if ($record?->file_url)
    <audio controls style="width: 100%; margin-top: 10px;">
        <source src="{{ Storage::disk('music_upload')->url($record->file_url) }}" type="audio/mpeg">
        Trình duyệt không hỗ trợ phát nhạc.
    </audio>
@else
    <p>Không có file nhạc để phát.</p>
@endif
