import { useEffect, useState } from 'react';
import { findAllMusics } from '../services/yourApiFunctions'; // thay đổi đường dẫn nếu khác
import { Music } from '../services/type'; // import interface của bạn


export function useMusics() {
    const [musics, setMusics] = useState<Music[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'jamendo' | 'local' | null>(null);

    useEffect(() => {
      const fetchMusics = async () => {
        try {
          const result = await findAllMusics();
          
          // Handle cả 2 formats: array trực tiếp hoặc nested object
          let musicData: Music[];
          if (Array.isArray(result.data)) {
            musicData = result.data;
          } else if (result.data && 'data' in result.data) {
            musicData = result.data.data;
          } else {
            musicData = [];
          }
          
          setMusics(musicData);
          setSource(result.source || null);
          
          console.log(`🎵 Loaded ${musicData.length} tracks from ${result.source || 'unknown'}`);
        } catch (err) {
          setError('Lỗi khi tải danh sách nhạc');
          console.error('useMusics error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchMusics();
    }, []);

    return { musics, loading, error, source };
}