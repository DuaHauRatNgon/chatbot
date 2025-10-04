import React, { useState, useEffect } from 'react';
import { MessageCircle, Home, ArrowLeft, Bot, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatBot404: React.FC = () => {
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    const timer2 = setTimeout(() => {
      setIsTyping(false);
      setShowMessage(true);
    }, 3000);

    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Robot Avatar */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/25 relative">
            <Bot size={64} className={`text-white transition-all duration-300 ${glitchEffect ? 'animate-pulse scale-110' : ''}`} />
            {/* Status Indicator */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <WifiOff size={16} className="text-white" />
            </div>
          </div>
        </div>

        {/* 404 Title with Glitch Effect */}
        <h1 className={`text-8xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent transition-all duration-200 ${glitchEffect ? 'animate-pulse' : ''}`}>
          4<span className="inline-block animate-bounce">0</span>4
        </h1>

        {/* Chat Bubble */}
        <div className="mb-8 relative">
          <div className="inline-block max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  {isTyping ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  ) : showMessage ? (
                    <div className="text-white/90 text-left">
                      <p className="font-medium mb-1">Xin lỗi! Tôi không thể tìm thấy trang này 😔</p>
                      <p className="text-sm text-white/70">Có vẻ như trang bạn đang tìm kiếm đã biến mất vào không gian mạng...</p>
                    </div>
                  ) : (
                    <div className="h-8"></div>
                  )}
                </div>
              </div>
            </div>
            {/* Chat bubble tail */}
            <div className="w-4 h-4 bg-white/10 backdrop-blur-sm rotate-45 -mt-2 ml-12 border-r border-b border-white/20"></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xl text-white/80 mb-8 leading-relaxed">
          Chatbot của chúng tôi đang tạm thời <span className="text-purple-400 font-semibold">offline</span>.
          <br />
          Hãy thử quay lại trang chủ hoặc kiểm tra URL của bạn.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 hover:from-purple-700 hover:to-blue-700"
          >
            <Home size={20} />
            <span>Về trang chủ</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="group flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Nếu vấn đề vẫn tiếp tục, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default ChatBot404;