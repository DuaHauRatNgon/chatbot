import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Search, X, PlusCircle, MessageCircle, Calendar, ArrowLeft } from 'lucide-react';
import { cx } from 'classix';
import { useConversationContext } from '@/context/ConversationContext';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { conversations, selectedConversationId, setSelectedConversationId, selectedConversation } = useConversationContext();

  const filteredHistory = conversations.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleConversationClick = (convId: string) => {
    setSelectedConversationId(convId);
    // Đóng sidebar trên mobile sau khi chọn
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const currentSelectedTitle = selectedConversation ? selectedConversation.title : 'Chọn cuộc trò chuyện';

  // Nhóm conversations theo ngày (nếu có createdAt)
  const groupedConversations = useMemo(() => {
    const grouped: { [key: string]: typeof conversations } = {};
    
    filteredHistory.forEach(conv => {
      // Giả sử có trường createdAt, nếu không có thì dùng 'Gần đây'
      const date = conv.createdAt ? new Date(conv.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(conv);
    });

    return grouped;
  }, [filteredHistory]);

  return (
    <>
      {/* Overlay cho mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cx(
          "fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
          "border-r border-gray-200 dark:border-gray-700 shadow-xl",
          // Responsive width
          "w-80 md:w-72 lg:w-80",
          // Transform based on isOpen
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Mobile: full screen height, Desktop: account for header
          "md:top-16 md:h-[calc(100vh-4rem)]"
        )}
      >
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-4 md:mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              MindCare AI
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Cuộc trò chuyện mới
          </Button>
        </div>

        {/* Current Selection Display */}
        {selectedConversation && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Đang xem
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white mt-1 truncate">
              {currentSelectedTitle}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={cx(
            "relative transition-all duration-200",
            isSearchFocused && "transform scale-[1.02]"
          )}>
            <div className={cx(
              "flex items-center bg-white dark:bg-gray-800 rounded-xl border px-3 py-2.5 shadow-sm",
              isSearchFocused 
                ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            )}>
              <Search className={cx(
                "h-4 w-4 mr-2 transition-colors",
                isSearchFocused ? "text-blue-500" : "text-gray-400"
              )} />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 outline-none text-sm bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 px-1">
              {filteredHistory.length} kết quả cho <span className="font-semibold">"{searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-2 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {Object.keys(groupedConversations).length > 0 ? (
              Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date} className="space-y-2">
                  {/* Date Header */}
                  <div className="flex items-center space-x-2 px-3 py-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {date}
                    </h3>
                  </div>

                  {/* Conversations for this date */}
                  <div className="space-y-1">
                    {convs.map((item) => (
                      <div
                        key={item._id}
                        className={cx(
                          "group relative mx-2 p-3 rounded-xl cursor-pointer transition-all duration-200",
                          "hover:shadow-md hover:scale-[1.01] transform",
                          selectedConversationId === item._id 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                        )}
                        onClick={() => handleConversationClick(item._id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cx(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                            selectedConversationId === item._id 
                              ? 'bg-white/20' 
                              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                          )}>
                            <MessageCircle className={cx(
                              "h-4 w-4",
                              selectedConversationId === item._id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cx(
                              "font-medium text-sm mb-1 truncate",
                              selectedConversationId === item._id ? 'text-white' : 'text-gray-800 dark:text-white'
                            )}>
                              {item.title}
                            </div>
                          </div>
                        </div>

                        {/* Active indicator */}
                        {selectedConversationId === item._id && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? (
                    <>
                      <p className="font-medium">Không tìm thấy kết quả</p>
                      <p className="text-xs mt-1">Thử từ khóa khác</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Chưa có lịch sử chat</p>
                      <p className="text-xs mt-1">Bắt đầu cuộc trò chuyện đầu tiên</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};