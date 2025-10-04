// components/ChatArea.tsx (Tên gợi ý, có thể đặt ở vị trí khác)
import React, { useState, useEffect, useCallback } from 'react';
import { useConversationContext } from '@/context/ConversationContext';
import useMessages from '@/hooks/useMessages'; // Hook để fetch tin nhắn
import { ChatInput } from './chatinput'; // Component chat input
import { ApiMessage } from '@/services/type'; // Định nghĩa kiểu tin nhắn
import { toast } from 'sonner';

// Giả định có component để hiển thị từng tin nhắn
// Bạn cần tạo component này nếu chưa có
// import { MessageDisplay } from './MessageDisplay';

export const ChatArea: React.FC = () => {
  const { selectedConversationId, selectedConversation, addConversation, setSelectedConversationId } = useConversationContext();

  // State để lưu trữ tin nhắn hiện tại hiển thị trong UI
  const [displayedMessages, setDisplayedMessages] = useState<ApiMessage[]>([]);
  const [question, setQuestion] = useState(''); // State cho input của ChatInput

  // Sử dụng useMessages hook với selectedConversationId từ context
  const { messages: fetchedMessages, isLoading: isLoadingMessages, error: messagesError, fetchMessages } = useMessages(selectedConversationId || undefined);

  // Theo dõi fetchedMessages. Khi fetch xong (hoặc selectedId thay đổi), cập nhật displayedMessages
    useEffect(() => {
        if (fetchedMessages) {
            setDisplayedMessages(prev => {
                // Nếu fetch rỗng mà đang có tin nhắn tạm thì giữ nguyên
                if (fetchedMessages.length === 0 && prev.length > 0) {
                    return prev;
                }
                return fetchedMessages;
            });
        }
    }, [fetchedMessages]);

  // Kiểm tra xem đây có phải là tin nhắn đầu tiên trong một cuộc trò chuyện hay không
  // Nếu không có selectedConversationId, tức là đang bắt đầu chat mới
  // Nếu có selectedConversationId nhưng displayedMessages rỗng, có thể fetch chưa xong hoặc lỗi
  const isFirstMessageInCurrentContext = !selectedConversationId;


  // Callback khi ChatInput gửi tin nhắn thành công và nhận phản hồi từ bot
  const handleMessageReceived = useCallback((botResponse: any) => {

      try {
           const botMessageContent = JSON.parse(botResponse.message).content;
           const newBotMessage: ApiMessage = {
               _id: `temp-bot-${Date.now()}`, // ID tạm thời
               conversation_id: selectedConversationId || 'temp', // Sẽ được cập nhật sau khi tạo conversation mới
               content: botMessageContent,
               sender: 'bot',
               emotion: 'neutral', // Hoặc parse từ response nếu có
               timestamp: new Date().toISOString(),
               __v: 0
           };
           setDisplayedMessages(prev => [...prev, newBotMessage]);
      } catch (error) {
           console.error("Error processing bot response:", error);
           toast.error("Failed to process bot response.");
      }
  }, [selectedConversationId]); // Dependency on selectedConversationId

    // Callback khi ChatInput tạo title/conversation thành công (chỉ xảy ra với tin nhắn đầu tiên)
    const handleTitleCreated = useCallback((title: string, mood: number) => {
        // Log hoặc xử lý thêm nếu cần.
        // Việc thêm conversation mới vào context và chọn nó
        // đã được xử lý trong ChatInput ngay sau khi submitTitle thành công.
        // console.log("Title created:", title, "Mood:", mood);
    }, []);

  // Xử lý khi người dùng bắt đầu chat mới (ví dụ: click nút "New Chat")
  const startNewChat = useCallback(() => {
      setSelectedConversationId(null); // Đặt lại ID cuộc trò chuyện
      setDisplayedMessages([]); // Xóa tin nhắn cũ
      setQuestion(''); // Xóa nội dung input
      // isFirstMessageInCurrentContext sẽ tự động trở thành true
  }, [setSelectedConversationId]);


  // Render tin nhắn
  const renderMessages = () => {
      if (isLoadingMessages) {
          return <div className="text-center text-gray-500">Đang tải tin nhắn...</div>;
      }
      if (messagesError) {
          return <div className="text-center text-red-500">Lỗi tải tin nhắn: {messagesError.message}</div>;
      }
      if (displayedMessages.length === 0 && !isFirstMessageInCurrentContext) {
         // Nếu có selectedConversationId nhưng không có tin nhắn, có thể là cuộc trò chuyện rỗng
         return <div className="text-center text-gray-500">Bắt đầu cuộc trò chuyện này...</div>;
      }
       if (displayedMessages.length === 0 && isFirstMessageInCurrentContext) {
         // Nếu không có selectedConversationId (chế độ chat mới)
         return <div className="text-center text-gray-500">Chào mừng! Bắt đầu chat mới nhé...</div>;
      }

      return (
          <div className="flex flex-col space-y-4 overflow-y-auto flex-grow p-4">
              {displayedMessages.map((message, index) => (
                  // Bạn cần thay thế div này bằng component MessageDisplay thực tế của bạn
                  <div
                      key={message._id || index} // Sử dụng _id nếu có, nếu không dùng index tạm
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                      <div className={`p-3 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                          {message.content}
                          {/* Có thể thêm timestamp, emotion, v.v. */}
                      </div>
                  </div>
              ))}
              {/* Placeholder để cuộn xuống cuối cùng */}
              <div ref={el => {
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}></div>
          </div>
      );
  };

  // Callback cho onSubmit của ChatInput (chỉ thêm tin nhắn user vào UI tạm thời)
  const handleChatSubmit = useCallback((text?: string) => {
      const messageText = text || question;
       if (!messageText.trim()) return;

      // Thêm tin nhắn của người dùng vào danh sách hiển thị ngay lập tức
      const newUserMessage: ApiMessage = {
          _id: `temp-user-${Date.now()}`, // ID tạm thời
          conversation_id: selectedConversationId || 'temp', // Sẽ được cập nhật
          content: messageText,
          sender: 'user',
          emotion: 'neutral', // Hoặc xác định cảm xúc ở client nếu cần
          timestamp: new Date().toISOString(),
          __v: 0
      };
      setDisplayedMessages(prev => [...prev, newUserMessage]);

      // Xóa nội dung input ngay sau khi gửi
      setQuestion('');

      // Logic gọi API sẽ nằm trong ChatInput hook
      // ChatInput sẽ nhận responsibility gọi useNewMessageBot, useCreateMessage, etc.
      // và sau đó gọi lại handleMessageReceived và/hoặc handleTitleCreated
  }, [question, selectedConversationId, setQuestion]);


  return (
    <div className="flex flex-col h-full">
        {/* Header khu vực chat (tùy chọn: hiển thị title cuộc trò chuyện) */}
         {/* Bạn có thể thêm button "New Chat" ở đây */}
         <div className="p-4 bg-white border-b">
             <h3 className="text-lg font-semibold">{selectedConversation ? selectedConversation.title : 'Cuộc trò chuyện mới'}</h3>
             {/* Button "New Chat" */}
             <Button onClick={startNewChat} variant="outline" className="mt-2">
                 Bắt đầu cuộc trò chuyện mới
             </Button>
         </div>

        {/* Khu vực hiển thị tin nhắn */}
        {renderMessages()}

        {/* Khu vực ChatInput */}
        <div className="p-4 border-t">
            <ChatInput
                question={question}
                setQuestion={setQuestion}
                onSubmit={handleChatSubmit} // Gửi tin nhắn tạm thời lên UI
                isLoading={false} // Loading sẽ được quản lý tốt hơn trong ChatInput
                isFirstMessage={isFirstMessageInCurrentContext}
                onMessageReceived={handleMessageReceived}
                onTitleCreated={handleTitleCreated}
                onError={(err) => toast.error(err)} // Xử lý lỗi từ ChatInput
            />
        </div>
    </div>
  );
};

// Đảm bảo bạn wrap ứng dụng của mình bằng <ConversationProvider>
// Ví dụ:
// <ConversationProvider>
//   <div className="flex h-screen">
//     <LeftSidebar isOpen={...} onClose={...} />
//     <div className="flex-1">
//        <ChatArea />
//     </div>
//   </div>
// </ConversationProvider>