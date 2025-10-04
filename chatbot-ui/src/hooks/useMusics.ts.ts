import { useEffect, useState } from 'react';
import { findAllMusics } from '../services/yourApiFunctions'; // thay đổi đường dẫn nếu khác
import { Music } from '../services/type'; // import interface của bạn


export function useMusics() {
    const [musics, setMusics] = useState<Music[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchMusics = async () => {
        try {
          const result = await findAllMusics();
          setMusics(result.data.data); // 🟢 đúng với kiểu dữ liệu đã sửa
        } catch (err) {
          setError('Lỗi khi tải danh sách nhạc');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchMusics();
    }, []);
  
    return { musics, loading, error };
  }