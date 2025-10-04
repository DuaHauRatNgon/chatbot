import { useState, useEffect } from 'react';
import { ListConversationsAPI } from '../services/yourApiFunctions';
import { ListConversations } from '../services/type';

export const useConversations = (userId: string) => {
    const [conversations, setConversations] = useState<ListConversations[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (!userId) return;
  
      const fetchConversations = async () => {
        setLoading(true);
        setError(null);
        try {
          const conversationsData = await ListConversationsAPI(userId);
          setConversations(conversationsData);
        } catch (err: any) {
          // Kiểm tra nếu là lỗi "không có data" thì không hiển thị error
          if (err.message && err.message.includes('Không có dữ liệu conversation')) {
            setConversations([]); // Set empty array
            setError(null); // Không set error
          } else {
            setError(err.message || 'Có lỗi xảy ra');
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchConversations();
    }, [userId]);
  
    return { conversations, loading, error };
};