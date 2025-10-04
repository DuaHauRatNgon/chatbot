import { useEffect, useState } from 'react';
import { findAllPodcasts } from '../services/yourApiFunctions';
import { Podcast } from '../services/type';

export function usePodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const result = await findAllPodcasts();
        // Truy cập vào transformedData thay vì data
        setPodcasts(result.data.transformedData);
      } catch (err) {
        setError('Lỗi khi tải danh sách podcast');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  return { podcasts, loading, error };
}