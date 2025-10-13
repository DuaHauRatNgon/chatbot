import { useState, useCallback } from 'react';

interface ChatSuggestionsResponse {
  success: boolean;
  suggestions: string[];
  message?: string;
}

export const useChatSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (conversationId: string, lastMessagesCount: number = 3) => {
    if (!conversationId) {
      setError('Conversation ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          last_messages_count: lastMessagesCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatSuggestionsResponse = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error(data.message || 'Failed to fetch suggestions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching chat suggestions:', err);
      
      // Fallback suggestions
      setSuggestions([
        'Bạn cảm thấy thế nào về điều đó?',
        'Có gì khiến bạn lo lắng không?',
        'Mình có thể hỗ trợ bạn gì thêm?'
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
};
