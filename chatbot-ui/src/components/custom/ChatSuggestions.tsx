import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface ChatSuggestionsProps {
  conversationId: string | null;
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
  className?: string;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  conversationId,
  onSuggestionClick,
  isVisible,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string[]>([]);

  const fetchSuggestions = async (convId: string) => {
    if (!convId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: convId,
          last_messages_count: 3,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error(data.message || 'Failed to fetch suggestions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching chat suggestions:', err);
      
      // Không sử dụng fallback suggestions - chỉ hiển thị lỗi
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId && isVisible) {
      fetchSuggestions(conversationId);
    }
  }, [conversationId, isVisible]);

  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setDisplayedSuggestions(suggestions);
    }
  }, [suggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
    // Ẩn suggestions sau khi click
    setDisplayedSuggestions([]);
  };

  if (!isVisible || !conversationId || displayedSuggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-wrap gap-2 p-4 ${className}`}
      >
        <div className="text-xs text-gray-500 mb-2 w-full">
          💡 Gợi ý cho bạn:
        </div>
        
        {displayedSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="
                bg-gradient-to-r from-blue-50 to-purple-50 
                hover:from-blue-100 hover:to-purple-100
                border-blue-200 hover:border-blue-300
                text-blue-700 hover:text-blue-800
                rounded-full px-4 py-2 text-sm
                transition-all duration-200
                shadow-sm hover:shadow-md
                max-w-xs truncate
              "
            >
              {suggestion}
            </Button>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
            Đang tạo gợi ý...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-500 w-full">
            Không thể tải gợi ý: {error}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
