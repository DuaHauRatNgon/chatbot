
import { Textarea } from "../ui/textarea";
import { cx } from 'classix';
import { Button } from "../ui/button";
import { ArrowUpIcon } from "./icons"
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState, useCallback, useMemo,useEffect } from 'react'; // Thêm useMemo
import { useNewMessageBot } from '../../hooks/useNewMessage';
import { useNewTitle } from '../../hooks/useNewTitle';
import { useCreateMessage } from "@/hooks/useCreateMessage";
import { useCreateTitle } from "@/hooks/useCreateTitle";
import { useConversationContext } from '@/context/ConversationContext'; // Import context

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: (text?: string) => void; // Callback khi submit (để parent update UI tạm thời)
  isLoading: boolean; // Có thể không dùng prop này nữa, ChatInput tự quản lý loading API
  onMessageReceived?: (message: any) => void;
  onTitleCreated?: (title: string, mood: number) => void;
  onError?: (error: string) => void;
  isFirstMessage?: boolean; // Prop từ parent
}

const suggestedActions = [
  {
    title: 'Hôm nay tôi rất buồn',
    label: 'bạn có thể kể truyện vui giúp tôi được không?',
    action: 'Hôm nay tôi rất buồn,bạn có thể kể truyện vui giúp tôi được không?',
  },
  {
    title: 'Tôi muốn trị liệu cơ bản ',
    label: 'để thư giãn tinh thần',
    action: 'Tôi muốn trị liệu cơ bản để thư giãn tinh thần',
  },
];

export const ChatInput = ({
  question,
  setQuestion,
  onSubmit, // Callback để parent thêm tin nhắn user tạm thời vào UI
  // isLoading, // Loại bỏ prop này
  isFirstMessage = false, // Default là false, parent sẽ quyết định
  onMessageReceived,
  onTitleCreated,
  onError
}: ChatInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Lấy selectedConversationId và addConversation, setSelectedConversationId từ context
  const { selectedConversationId, addConversation, setSelectedConversationId } = useConversationContext();

  // Khởi tạo các hook cần thiết
  const newMessageBot = useNewMessageBot(); // Giả định hook này gửi tin nhắn đến bot AI
  const newTitle = useNewTitle(); // Giả định hook này tạo title AI
  const createMessage = useCreateMessage(); // Giả định hook này lưu tin nhắn vào DB
  const createTitle = useCreateTitle(); // Giả định hook này lưu title/conversation vào DB

  // combinedLoading sẽ dựa vào loading state của các hook API bên trong ChatInput
  const combinedLoading = useMemo(() => {
       return newMessageBot.loading || newTitle.loading || createTitle.isSubmitting || createMessage.isSubmitting;
  }, [newMessageBot.loading, newTitle.loading, createTitle.isSubmitting, createMessage.isSubmitting]);


  const handleSubmit = useCallback(async (text?: string) => {
    const messageText = text || question;
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (combinedLoading) {
         toast.error('Please wait for the model to finish its response!');
         return;
    }

    setShowSuggestions(false);
    onSubmit(messageText); // <--- Gửi tin nhắn user lên UI ngay lập tức qua callback

    // setQuestion(''); // <--- Xóa nội dung trong textarea sau khi onSubmit được gọi

    try {
        let currentConversationId = selectedConversationId; // Bắt đầu với ID hiện tại (từ context)

      // Xử lý tin nhắn đầu tiên (tạo title và conversation mới)
      if (isFirstMessage) {

        // 1. Tạo title bằng useNewTitle
        const newTitleResponse = await newTitle.createTitle({ message: messageText });

        if (newTitleResponse && newTitleResponse.title && newTitleResponse.mood_before !== undefined) {

          // 2. Lưu title vào database bằng useCreateTitle
          const createTitlePayload = {
            title: newTitleResponse.title,
            mood_before: newTitleResponse.mood_before
            // Có thể thêm userId ở đây nếu API cần, lấy từ localStorage hoặc context
            // userId: ...
          };

          const createTitleResponse = await createTitle.submitTitle(createTitlePayload);

          if (createTitleResponse && createTitleResponse.data && createTitleResponse.data._id) {
            const newConversationId = createTitleResponse.data._id;
            currentConversationId = newConversationId; // Cập nhật ID cuộc trò chuyện hiện tại

            // !!! Thêm cuộc trò chuyện mới vào context VÀ chọn nó ngay lập tức
            addConversation(createTitleResponse.data);
            setSelectedConversationId(newConversationId);

            onTitleCreated?.(createTitleResponse.data.title, createTitleResponse.data.mood_before); // Gọi callback để parent xử lý thêm (tùy chọn)

          } else {
            toast.error("Failed to create title/conversation in database.");
            onError?.("Failed to create title/conversation in database.");
            return; // Dừng xử lý nếu tạo conversation thất bại
          }
        } else {
          toast.error("Failed to create title with AI.");
          onError?.("Failed to create title with AI.");
          return; // Dừng xử lý nếu tạo title AI thất bại
        }
      }

      // --- Logic chung cho cả tin nhắn đầu tiên và các tin nhắn tiếp theo ---
      // Tại điểm này, currentConversationId CHẮC CHẮN là ID hợp lệ
      // (hoặc là ID cũ từ context nếu isFirstMessage=false, hoặc là ID mới vừa tạo)

      // 3. Lưu tin nhắn của người dùng vào database bằng useCreateMessage
      if (!currentConversationId) {
           // Trường hợp hiếm xảy ra nếu logic trên đúng, nhưng thêm để an toàn
           toast.error("Internal error: No conversation ID available.");
           onError?.("Internal error: No conversation ID available.");
           return;
      }
       const createUserMessagePayload = {
          conversation_id: currentConversationId,
          content: messageText,
          sender: "user"
          // Có thể thêm emotion nếu đã phân tích ở client
      };
      // Không cần await ở đây nếu bạn muốn tin nhắn bot hiển thị sớm hơn
      // Nhưng để đảm bảo thứ tự, tốt nhất là await
      await createMessage.submitMessage(createUserMessagePayload);


      // 4. Gửi tin nhắn của người dùng đến bot AI bằng useNewMessageBot
      // (Có thể gửi song song với việc lưu tin nhắn user vào DB nếu API cho phép)
      const newMessageBotResponse = await newMessageBot.sendMessage({ message: messageText, conversation_id: currentConversationId }); // Gửi cả ID cho bot nếu cần context

      if (newMessageBotResponse && newMessageBotResponse.message) {

        // 5. Parse và lưu tin nhắn của bot vào database bằng useCreateMessage
        try {
            const botMessageContent = JSON.parse(newMessageBotResponse.message).content; // Đảm bảo parsing đúng cấu trúc
             const createBotMessagePayload = {
                conversation_id: currentConversationId,
                content: botMessageContent,
                sender: "bot"
                // Có thể thêm emotion từ bot response nếu có
            };
            await createMessage.submitMessage(createBotMessagePayload);

            onMessageReceived?.(newMessageBotResponse); // Gọi callback để parent hiển thị tin nhắn bot
        } catch (parseError) {
             console.error("Failed to parse bot message:", parseError);
             toast.error("Failed to parse bot response.");
             onError?.("Failed to parse bot response.");
        }

      } else {
        toast.error("Failed to get response from bot.");
        onError?.("Failed to get response from bot.");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error("Error in handleSubmit:", error);
      toast.error(errorMessage);
      onError?.(errorMessage);
      // Cân nhắc xử lý UI khi lỗi: xóa tin nhắn tạm thời, v.v.
    } finally {
        // setQuestion(''); // Có thể xóa ở đây thay vì sau onSubmit
    }
  }, [
    question,
    combinedLoading, // Thêm dependency combinedLoading
    newMessageBot,
    newTitle,
    createTitle,
    createMessage,
    isFirstMessage,
    onSubmit,
    onMessageReceived,
    onTitleCreated,
    onError,
    // setQuestion, // SetQuestion không cần trong dependency nếu gọi trực tiếp
    selectedConversationId, // Dependency mới từ context
    addConversation, // Dependency mới từ context
    setSelectedConversationId // Dependency mới từ context
]);

  // Xóa nội dung input sau khi handleSubmit thành công (hoặc thất bại?)
  // Tốt nhất nên xóa ngay sau onSubmit để UI phản hồi nhanh
  // hoặc trong khối finally của handleSubmit nếu muốn giữ lại text khi lỗi?
  // Hiện tại đang xóa sau onSubmit trong ChatArea, giữ nguyên ở đây

  // Reset suggestions khi question thay đổi và rỗng
  useEffect(() => {
      if (question === '' && !combinedLoading) {
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  }, [question, combinedLoading]);


  return (
    <div className="relative w-full flex flex-col gap-4">

      {/* File input (giữ nguyên nếu cần) */}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        multiple
        tabIndex={-1}
      />

      <Textarea
        placeholder="Send a message..."
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl text-base chat-theme-accent chat-theme-text chat-theme-border',
        )}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            // Kiểm tra loading ngay tại đây để feedback nhanh hơn
            if (combinedLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              handleSubmit();
            }
          }
        }}
        rows={3}
        autoFocus
        disabled={combinedLoading}
      />

      <Button
        className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 border dark:border-zinc-600"
        onClick={() => handleSubmit()} // Gửi nội dung từ state question
        disabled={question.length === 0 || combinedLoading}
      >
        {combinedLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowUpIcon size={14} />
        )}
      </Button>

      {combinedLoading && (
        <div className="absolute -top-8 left-0 text-xs text-muted-foreground">
          {isFirstMessage ? 'Creating title and sending message...' : 'Sending message...'}
        </div>
      )}
    </div>
  );
};