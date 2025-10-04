// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { GetMessagesApiResponse, ApiMessage } from '@/services/type'; // Đảm bảo đường dẫn đúng
import { findMessageByConversationId } from '@/services/yourApiFunctions'; // Đảm bảo đường dẫn đúng

// Định nghĩa kiểu dữ liệu trả về cho hook
interface UseMessagesResult {
    messages: ApiMessage[]; // Dữ liệu tin nhắn, sử dụng type từ API
    isLoading: boolean;
    error: Error | null;
    fetchMessages: (conversationId: string) => Promise<void>; // Hàm để gọi fetch thủ công
}

// Hàm custom hook
const useMessages = (initialConversationId?: string): UseMessagesResult => {
    const [messages, setMessages] = useState<ApiMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Hàm fetch dữ liệu, được memoized để tránh re-creation không cần thiết
    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!conversationId) {
            // Không có conversationId, có thể reset hoặc không làm gì cả
            setMessages([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await findMessageByConversationId(conversationId);
            // Nếu response có cấu trúc GetMessagesApiResponse
            if (response && response.data) {
                setMessages(response.data);
            } else {
                // Xử lý trường hợp API trả về dữ liệu không đúng mong đợi
                setMessages([]); // Reset messages
                setError(new Error('Unexpected API response structure'));
            }
        } catch (err: any) {
            console.error("Error in useMessages hook:", err);
            setError(err); // Lưu lỗi
            setMessages([]); // Xóa dữ liệu cũ khi có lỗi
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback không có dependencies vì findMessageByConversationid không đổi

    // Sử dụng useEffect để fetch dữ liệu khi hook được mount lần đầu hoặc initialConversationId thay đổi
    useEffect(() => {
        if (initialConversationId) {
            fetchMessages(initialConversationId);
        }
    }, [initialConversationId, fetchMessages]); // Depend on initialConversationId and fetchMessages

    return {
        messages,
        isLoading,
        error,
        fetchMessages, // Cho phép gọi fetch lại từ component nếu cần
    };
};

export default useMessages;