import { useState, useCallback } from 'react';
import { newTitleAPI } from '../services/yourApiFunctions'
import {Message} from '../services/type'


interface ApiResponseTitle {
    title: string;
    mood_before: number; // Sửa từ 4 thành number
  }
  
  interface UseNewTitleReturn {
    createTitle: (messageData: Omit<Message, 'id'>) => Promise<ApiResponseTitle>;
    loading: boolean;
    error: string | null;
    data: ApiResponseTitle | null;
    reset: () => void;
  }
  
  export const useNewTitle = (): UseNewTitleReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ApiResponseTitle | null>(null);
  
    const createTitle = useCallback(async (messageData: Omit<Message, 'id'>): Promise<ApiResponseTitle> => {
      setLoading(true);
      setError(null);
      
      try {
        // Import API function (điều chỉnh đường dẫn theo cấu trúc project của bạn)
        
        const result = await newTitleAPI(messageData);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    const reset = useCallback(() => {
      setLoading(false);
      setError(null);
      setData(null);
    }, []);
  
    return {
      createTitle,
      loading,
      error,
      data,
      reset
    };
  };
  