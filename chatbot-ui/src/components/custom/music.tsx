import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useMusics } from '@/hooks/useMusics.ts';
import { Music as MusicType } from '@/services/type';

interface MusicProps {
  isActive: boolean;
}

export const Music: React.FC<MusicProps> = ({ isActive }) => {
  const { musics, loading, error } = useMusics();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong: MusicType | undefined = musics[currentSongIndex];

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSongIndex]);

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
      {/* Audio element */}
      <audio ref={audioRef} src={currentSong?.file_url} />

      {/* Current Playing */}
      <div className="bg-white rounded-lg p-3 mb-4 shadow-sm flex-shrink-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {currentSong?.title}
        </div>
        <div className="text-xs text-gray-600 truncate">
          Thời lượng: {currentSong?.duration}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <button onClick={prevSong} className="text-gray-600 hover:text-gray-800">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={playPause}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={nextSong} className="text-gray-600 hover:text-gray-800">
            <SkipForward className="h-5 w-5" />
          </button>
          <Volume2 className="h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Playlist */}
      <div className="h-[200px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="space-y-2 pb-6">
          {musics.map((song, index) => (
            <div
              key={song._id}
              onClick={() => selectSong(index)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                index === currentSongIndex
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {song.title}
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-2">{song.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
