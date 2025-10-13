import React, { useState } from 'react';
import { ChatSuggestions } from './ChatSuggestions';
import { Button } from '../ui/button';

/**
 * Demo component to test ChatSuggestions functionality
 * This can be used for testing the suggestion feature independently
 */
export const ChatSuggestionsDemo: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    console.log('Suggestion clicked:', suggestion);
  };

  const simulateConversation = () => {
    // Simulate a conversation ID (in real app, this comes from the conversation context)
    setConversationId('demo-conversation-id');
    setShowSuggestions(true);
  };

  const resetDemo = () => {
    setConversationId(null);
    setShowSuggestions(false);
    setSelectedSuggestion('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🤖 Chat Suggestions Demo
      </h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Controls:</h3>
          <div className="flex gap-2">
            <Button 
              onClick={simulateConversation}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Show Suggestions
            </Button>
            <Button 
              onClick={resetDemo}
              variant="outline"
            >
              Reset Demo
            </Button>
          </div>
        </div>

        {selectedSuggestion && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">Selected Suggestion:</h4>
            <p className="text-green-700">"{selectedSuggestion}"</p>
          </div>
        )}

        <div className="border rounded-lg min-h-[200px] bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h4 className="font-semibold">Chat Interface Simulation</h4>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <div className="bg-blue-100 p-3 rounded-lg inline-block max-w-xs">
                Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊
              </div>
            </div>
            
            <div className="mb-4 text-right">
              <div className="bg-gray-200 p-3 rounded-lg inline-block max-w-xs">
                Tôi đang cảm thấy hơi lo lắng về công việc...
              </div>
            </div>
            
            <div className="mb-4">
              <div className="bg-blue-100 p-3 rounded-lg inline-block max-w-xs">
                Mình hiểu cảm giác đó. Bạn có thể chia sẻ thêm về những gì khiến bạn lo lắng không?
              </div>
            </div>
          </div>

          {/* Chat Suggestions will appear here */}
          <ChatSuggestions
            conversationId={conversationId}
            onSuggestionClick={handleSuggestionClick}
            isVisible={showSuggestions}
            className="border-t bg-white"
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 How it works:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>1. Click "Show Suggestions" to simulate bot response</li>
            <li>2. AI-generated suggestions will appear as clickable bubbles</li>
            <li>3. Click any suggestion to "send" it as a message</li>
            <li>4. In the real app, this happens automatically after bot responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
