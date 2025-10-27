import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useMusics } from '@/hooks/useMusics.ts';
import { Music as MusicType } from '@/services/type';

interface MusicProps {
  isActive: boolean;
}

export const Music: React.FC<MusicProps> = ({ isActive }) => {
  const { musics, loading, error, source } = useMusics();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong: MusicType | undefined = musics[currentSongIndex];

  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (e: Event) => {
      console.error('🔴 Audio error:', e);
      console.error('Current URL:', audio.src);
      setAudioError('Không thể phát nhạc này. Thử bài khác...');
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setAudioError(null);
    };

    const handleLoadStart = () => {
      // Audio loading started
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('🔴 Play error:', err);
        setAudioError('Lỗi phát nhạc. Thử lại...');
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSongIndex, currentSong]);

  const playPause = () => setIsPlaying((prev) => !prev);

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % musics.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + musics.length) % musics.length);
    setIsPlaying(true);
  };

  const selectSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  if (!isActive) return null;
  if (loading) return <p className="p-4 text-gray-500">Đang tải danh sách nhạc...</p>;
  if (error) return <p className="p-4 text-red-500">Lỗi: {error}</p>;
  if (!musics.length) return <p className="p-4 text-gray-500">Không có bản nhạc nào.</p>;

  return (
    <>
      {/* Audio element - Jamendo supports direct playback */}
      <audio 
        ref={audioRef} 
        src={currentSong?.file_url || currentSong?.stream_url}
        preload="metadata"
      />

      {/* Audio Error Message */}
      {audioError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">⚠️ {audioError}</p>
        </div>
      )}

      {/* Source Badge */}
      {source && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {source === 'jamendo' ? '🎵 Nhạc được lấy từ Jamendo API (Sẽ thay bằng Soundcloud, zingmp3 nếu có thể : D)' : '💾 Local Files'}
          </span>
        </div>
      )}

      {/* Current Playing - Enhanced */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 shadow-md flex-shrink-0">
        {/* Album Cover */}
        {currentSong?.image && (
          <div className="mb-3 rounded-lg overflow-hidden shadow-sm">
            <img 
              src={currentSong.image} 
              alt={currentSong.title}
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Track Info */}
        <div className="mb-3">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {currentSong?.title}
          </div>
          {currentSong?.artist && (
            <div className="text-xs text-gray-600 truncate mt-1">
              Nghệ Sĩ: {currentSong.artist}
            </div>
          )}
          {currentSong?.album && (
            <div className="text-xs text-gray-500 truncate">
              Album {currentSong.album}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Duration: {currentSong?.duration}
          </div>
          {currentSong?.tags && (
            <div className="text-xs text-indigo-600 mt-1 truncate">
              Thể loại: {currentSong.tags}
            </div>
          )}
        </div>

        {/* Controls - Enhanced */}
        <div className="flex items-center justify-center space-x-6 mt-2">
          <button 
            onClick={prevSong} 
            className="text-gray-700 hover:text-indigo-600 transition-colors"
            title="Previous"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            onClick={playPause}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full p-3 shadow-lg transform hover:scale-105 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button 
            onClick={nextSong} 
            className="text-gray-700 hover:text-indigo-600 transition-colors"
            title="Next"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Playlist - Enhanced */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-2 px-1">
          Playlist ({musics.length} bài)
        </h3>
        <div className="h-[250px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-200">
          <div className="space-y-2 pb-6">
            {musics.map((song, index) => (
              <div
                key={song._id}
                onClick={() => selectSong(index)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  index === currentSongIndex
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-indigo-500 shadow-sm'
                    : 'bg-white hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex gap-3 items-center">
                  {/* Thumbnail */}
                  {song.image && (
                    <img 
                      src={song.image} 
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {song.title}
                    </div>
                    {song.artist && (
                      <div className="text-xs text-gray-600 truncate">
                        {song.artist}
                      </div>
                    )}
                  </div>
                  
                  {/* Duration */}
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {song.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
