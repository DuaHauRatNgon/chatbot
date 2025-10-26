
import { ChatInput, ChatInputRef } from "@/components/custom/chatinput";
import { ChatSuggestions } from "@/components/custom/ChatSuggestions";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useEffect, useCallback, useRef } from "react";
import { ApiMessage } from '@/services/type';
import { Overview } from "@/components/custom/overview";
import { LeftSidebar } from "@/components/custom/leftsidebar"
import { RightSidebar } from "@/components/custom/rightsidebar"
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useConversationContext } from '@/context/ConversationContext';
import useMessages from '@/hooks/useMessage';
import { useAssessment } from '@/hooks/useAssessment';
import { AssessmentQuiz } from '@/components/custom/AssessmentQuiz';
import { AssessmentResults } from '@/components/custom/AssessmentResults';
import { useEmotionBackground } from '@/hooks/useEmotionBackground';
import { EmotionIndicator } from '@/components/custom/EmotionIndicator';
import { useChatTheme } from '@/context/ChatThemeContext';

export function Chat() {
  const {
    selectedConversationId,
    setSelectedConversationId
  } = useConversationContext();

  const {
    messages: fetchedMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useMessages(selectedConversationId || undefined);

  const [displayedMessages, setDisplayedMessages] = useState<ApiMessage[]>([]);
  const [question, setQuestion] = useState<string>("");
  // 👉 Ban đầu set false nếu là màn hình nhỏ
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const chatInputRef = useRef<ChatInputRef>(null);
  // Track Assessment status per conversation
  const [assessmentTriggered, setAssessmentTriggered] = useState<Set<string>>(new Set());

  // Assessment hook
  const {
    quizState,
    assessmentResult,
    startAssessment,
    submitAnswer,
    closeQuiz,
    closeResults
  } = useAssessment();

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  // Background mode: 'auto' (emotion-based) or 'manual' (user-selected theme)
  const [backgroundMode, setBackgroundMode] = useState<'auto' | 'manual'>('auto');

  // Emotion-based background (auto mode)
  const { dominantEmotion, backgroundImage: emotionBackground } = useEmotionBackground(displayedMessages, 5);
  
  // Manual theme selection
  const { currentTheme } = useChatTheme();
  
  // Determine which background to use
  const backgroundImage = backgroundMode === 'auto' 
    ? emotionBackground 
    : (currentTheme.backgroundImage || emotionBackground);

  // Debug logging
  useEffect(() => {
    console.log(`[Chat] Background Mode: ${backgroundMode}`);
    console.log(`[Chat] Dominant Emotion: ${dominantEmotion}`);
    console.log(`[Chat] Emotion Background: ${emotionBackground}`);
    console.log(`[Chat] Final Background: ${backgroundImage}`);
    console.log(`[Chat] Displayed Messages Count: ${displayedMessages.length}`);
  }, [backgroundMode, dominantEmotion, emotionBackground, backgroundImage, displayedMessages.length]);

  // Fixed useEffect to properly handle conversation switching
  useEffect(() => {
    
    if (selectedConversationId === null) {
      // When creating new chat, immediately clear messages
      setDisplayedMessages([]);
    } else if (fetchedMessages && fetchedMessages.length > 0) {
      // When switching to existing conversation, show fetched messages
      setDisplayedMessages(fetchedMessages);
    } else if (selectedConversationId && fetchedMessages && fetchedMessages.length === 0) {
      // When switching to conversation with no messages (empty conversation)
      setDisplayedMessages([]);
    }
  }, [fetchedMessages, selectedConversationId]);
  useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setLeftSidebarOpen(false);
          setRightSidebarOpen(false);
        } else {
          setLeftSidebarOpen(true);
          setRightSidebarOpen(true);
        }
      };
      handleResize(); // chạy lần đầu
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const closeLeftSidebar = () => {
    setLeftSidebarOpen(false);
  };

  const closeRightSidebar = () => {
    setRightSidebarOpen(false);
  };

  const handleChatSubmit = useCallback((text?: string) => {
    const messageText = text || question;
    if (!messageText.trim()) return;

    // Ẩn suggestions khi user gửi tin nhắn
    setShowSuggestions(false);

    const userMessage: ApiMessage = {
      content: messageText,
      sender: "user",
      _id: `temp-user-${uuidv4()}`,
      conversation_id: selectedConversationId || 'temp',
      emotion: 'neutral', // Tạm thời, sẽ được AI phân tích sau
      timestamp: new Date().toISOString(),
      __v: 0
    };

    setDisplayedMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsBotThinking(true);
  }, [question, selectedConversationId]);

  const handleMessageReceived = useCallback(async (botResponse: any) => {
    setIsBotThinking(false);

    let content = '';
    let shouldTriggerQuiz = false;
    let quizType = '';
    let quizReason = '';
    let detectedEmotion = 'neutral'; // Default emotion

    if (botResponse && botResponse.message) {
      try {
        const parsedMessage = JSON.parse(botResponse.message);
        content = parsedMessage.content || '';
        shouldTriggerQuiz = parsedMessage.trigger_quiz || false;
        quizType = parsedMessage.quiz_type || '';
        quizReason = parsedMessage.quiz_reason || '';
        detectedEmotion = parsedMessage.emotion || 'neutral'; // Lấy emotion từ AI
        
        console.log(`[DEBUG Frontend] Detected emotion from AI: ${detectedEmotion}`);
        
        if (!content) {
          console.warn("Chat.tsx: Parsed message has no content:", parsedMessage);
          content = JSON.stringify(parsedMessage);
        }
      } catch (error) {
        console.error("Chat.tsx: Lỗi khi phân tích message:", error);
        content = JSON.stringify(botResponse);
      }
    } else {
      console.warn("Chat.tsx: No 'message' field in botResponse:", botResponse);
      content = botResponse.response || JSON.stringify(botResponse);
    }

    const botMessage: ApiMessage = {
      content,
      sender: "bot",
      _id: `temp-bot-${uuidv4()}`,
      conversation_id: selectedConversationId || 'temp',
      emotion: detectedEmotion, // Sử dụng emotion từ AI
      timestamp: new Date().toISOString(),
      __v: 0
    };

    setDisplayedMessages(prev => [...prev, botMessage]);

    // Hiển thị suggestions sau khi bot trả lời
    setTimeout(() => {
      setShowSuggestions(true);
    }, 1000); // Delay 1 giây để user đọc tin nhắn bot

    // Kiểm tra có nên trigger assessment không
    if (shouldTriggerQuiz && quizType && selectedConversationId) {
      // Kiểm tra xem Assessment đã được trigger trong conversation này chưa
      if (assessmentTriggered.has(selectedConversationId)) {
        console.log(`Assessment already triggered for conversation: ${selectedConversationId}`);
        return; // Không trigger Assessment nữa
      }
      
      // Lấy userId từ localStorage hoặc context (giả sử có sẵn)
      const userId = localStorage.getItem('userId') || 'temp-user-id';
      
      // Tạo tin nhắn gợi ý assessment với thông tin AI
      let assessmentContent = `Để hiểu rõ hơn về tình trạng của bạn, mình muốn mời bạn làm một bảng đánh giá ngắn về ${quizType}. ${quizReason}`;
      
      // Thêm thông tin AI nếu có
      if (botResponse.aiContext) {
        const { confidence, primaryConcern, severity, keyIndicators } = botResponse.aiContext;
        assessmentContent += `\n\n🤖 **Phân tích AI:**`;
        assessmentContent += `\n• Độ tin cậy: ${Math.round((confidence || 0) * 100)}%`;
        assessmentContent += `\n• Mối quan tâm chính: ${primaryConcern || 'Không xác định'}`;
        assessmentContent += `\n• Mức độ: ${severity || 'Không xác định'}`;
        
        if (keyIndicators && keyIndicators.length > 0) {
          assessmentContent += `\n• Dấu hiệu phát hiện: ${keyIndicators.join(', ')}`;
        }
      }
      
      assessmentContent += `\n\nBạn có muốn thử không?`;
      
      const assessmentPromptMessage: ApiMessage = {
        content: assessmentContent,
        sender: "bot",
        _id: `temp-bot-assessment-${uuidv4()}`,
        conversation_id: selectedConversationId,
        emotion: 'neutral',
        timestamp: new Date().toISOString(),
        __v: 0
      };
      
      setDisplayedMessages(prev => [...prev, assessmentPromptMessage]);
      
      // Đánh dấu Assessment đã được trigger cho conversation này
      setAssessmentTriggered(prev => new Set(prev).add(selectedConversationId));
      
      // Tự động bắt đầu assessment (có thể thay đổi thành hỏi user trước)
      setTimeout(() => {
        startAssessment(quizType, userId, selectedConversationId);
      }, 2000); // Delay 2 giây để user đọc tin nhắn
    }
  }, [selectedConversationId, startAssessment, assessmentTriggered, setAssessmentTriggered]);

  const handleTitleCreated = useCallback((_title: string, _mood: number) => {
  }, []);

  const handleError = useCallback((error: string) => {
    setIsBotThinking(false);
    console.error("Chat.tsx: Chat error:", error);

    const errorMessage: ApiMessage = {
      content: `Error: ${error}`,
      sender: "bot",
      _id: `temp-error-${uuidv4()}`,
      conversation_id: selectedConversationId || 'temp',
      emotion: 'fear',
      timestamp: new Date().toISOString(),
      __v: 0
    };

    setDisplayedMessages(prev => [...prev, errorMessage]);
  }, [selectedConversationId]);

  const isFirstMessage = !selectedConversationId;

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null);
    setDisplayedMessages([]); 
    setQuestion('');
    setIsBotThinking(false);
    setShowSuggestions(false);
    // Reset Assessment tracking khi bắt đầu chat mới
    setAssessmentTriggered(new Set());
  }, [setSelectedConversationId]);

  // Callback khi user click vào suggestion
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuestion(suggestion);
    setShowSuggestions(false);
    // Gọi trực tiếp handleSubmit của ChatInput để kích hoạt bot response
    if (chatInputRef.current) {
      chatInputRef.current.handleSubmit(suggestion);
    }
  }, []);

  return (
    <div className="flex flex-col h-dvh">
      {/* Main Content Area with Dynamic Emotion Background */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Fixed Background Layer - không scroll theo content */}
        <div 
          className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none'
          }}
        />
        
        {/* Content wrapper với relative positioning để nằm trên background */}
        <LeftSidebar 
          isOpen={leftSidebarOpen} 
          onClose={closeLeftSidebar} 
          onNewChat={handleNewChat} 
        />

        <div className="flex flex-col flex-1 min-w-0 relative">
          <div className="relative flex-1 min-w-0">
            {!leftSidebarOpen && (
              <button
                onClick={toggleLeftSidebar}
                className="fixed left-4 top-4 z-30 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Mở sidebar trái"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {!rightSidebarOpen && (
              <button
                onClick={toggleRightSidebar}
                className="fixed right-4 top-4 z-30 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Mở sidebar phải"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Background Mode Toggle */}
            <div className="fixed right-4 top-20 z-30">
              <button
                onClick={() => setBackgroundMode(mode => mode === 'auto' ? 'manual' : 'auto')}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
                title={backgroundMode === 'auto' ? 'Chế độ tự động (theo cảm xúc)' : 'Chế độ thủ công (chọn theme)'}
              >
                {backgroundMode === 'auto' ? '🤖 Auto' : '🎨 Manual'}
              </button>
            </div>

            {/* Emotion Indicator - chỉ hiển thị khi ở auto mode */}
            {backgroundMode === 'auto' && displayedMessages.length > 0 && dominantEmotion !== 'neutral' && (
              <div className="fixed right-20 top-20 z-30 animate-fade-in">
                <EmotionIndicator 
                  emotion={dominantEmotion} 
                  showLabel={true}
                  size="md"
                />
              </div>
            )}

            {/* Messages Container with Transparent Background */}
            <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative bg-transparent" ref={messagesContainerRef}>
              {/* Show Overview only when no conversation selected and no messages */}
              {!selectedConversationId && displayedMessages.length === 0 && <Overview />}

              {/* Show loading when fetching messages for existing conversation */}
              {selectedConversationId && isLoadingMessages && displayedMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">Đang tải tin nhắn...</div>
              )}

              {/* Show error when fetching messages */}
              {messagesError && (
                <div className="text-center text-red-500 mt-8">
                  Lỗi tải tin nhắn: {messagesError.message}
                </div>
              )}

              {/* Render messages */}
              {displayedMessages.map((message, index) => (
                <PreviewMessage key={message._id || `temp-${index}`} message={message} />
              ))}

              {/* Show thinking message when bot is processing */}
              {isBotThinking && <ThinkingMessage />}

              <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
            </div>
          </div>

          {/* Chat Suggestions */}
          <ChatSuggestions
            conversationId={selectedConversationId}
            onSuggestionClick={handleSuggestionClick}
            isVisible={showSuggestions && !isFirstMessage && !isBotThinking}
            className="mx-auto w-full md:max-w-3xl px-4 pb-2"
          />

          <div className="flex mx-auto px-4 chat-theme-surface pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
            <ChatInput
              ref={chatInputRef}
              question={question}
              setQuestion={setQuestion}
              onSubmit={handleChatSubmit}
              isLoading={false}
              isFirstMessage={isFirstMessage}
              onMessageReceived={handleMessageReceived}
              onTitleCreated={handleTitleCreated}
              onError={handleError}
            />
          </div>
        </div>

        <RightSidebar 
          isOpen={rightSidebarOpen} 
          onClose={closeRightSidebar}
          onThemeChange={() => setBackgroundMode('manual')}
        />
      </div>

      {/* Assessment Quiz Modal */}
      <AssessmentQuiz
        quizState={quizState}
        onAnswerSubmit={submitAnswer}
        onQuizClose={closeQuiz}
        onQuizComplete={closeResults}
      />

      {/* Assessment Results Modal */}
      {assessmentResult && (
        <AssessmentResults
          result={assessmentResult}
          onClose={closeResults}
        />
      )}


      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-20 md:hidden"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        ></div>
      )}
    </div>
  );
}