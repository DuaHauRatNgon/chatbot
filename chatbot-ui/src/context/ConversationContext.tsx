
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'; // <<< Thêm useMemo ở đây
import { useConversations } from '@/hooks/useListConversations'; // Giả định hook này trả về list ban đầu
import { Conversation as ApiConversation } from '@/services/type'; // Giả định Conversation type từ API

// Use the API type for consistency if it's the primary source
export interface Conversation extends ApiConversation {}

interface ConversationContextProps {
  conversations: Conversation[];
  addConversation: (conv: Conversation) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  // Có thể thêm selectedConversation để tiện truy cập title/mood
  selectedConversation: Conversation | undefined;
}

// Sử dụng null ban đầu để biểu thị chưa có cuộc trò chuyện nào được chọn
const ConversationContext = createContext<ConversationContextProps | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Lấy userId từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUserId(null); // Đảm bảo state được cập nhật ngay cả khi lỗi parse
      }
    } else {
       setUserId(null); // Đảm bảo state được cập nhật nếu không có user data
    }
  }, []); // Chạy một lần khi mount

  // Lấy danh sách cũ từ API khi userId có giá trị
  // useConversations cần được điều chỉnh để nhận userId prop
  const { conversations: oldConversations, loading, error } = useConversations(userId);

  // Hợp nhất danh sách mới (từ addConversation) và cũ (từ API)
  useEffect(() => {
      if (oldConversations && oldConversations.length > 0) {
           setConversations(prev => {
              const ids = new Set(prev.map(c => c._id));
              const newItems = oldConversations.filter(conv => !ids.has(conv._id));
              // Thêm các cuộc trò chuyện cũ vào danh sách, giữ lại thứ tự có thể quan trọng
              // Bạn có thể muốn sắp xếp chúng theo timestamp nếu API trả về
              return [...prev, ...newItems];
           });
      }
  }, [oldConversations]); // Chạy khi oldConversations thay đổi

  const addConversation = (conv: Conversation) => {

    setConversations(prev => {
        // Tránh thêm trùng lặp nếu API fetch về cái vừa được thêm
        if (prev.some(item => item._id === conv._id)) {
            return prev;
        }
        return [conv, ...prev];
    });
  };

  // Tìm cuộc trò chuyện được chọn
  const selectedConversation = useMemo(() => {
      return conversations.find(conv => conv._id === selectedConversationId);
  }, [conversations, selectedConversationId]);


  return (
    <ConversationContext.Provider
      value={{
        conversations,
        addConversation,
        selectedConversationId,
        setSelectedConversationId,
        selectedConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationContext must be used within a ConversationProvider");
  }
  return context;
};