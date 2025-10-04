// src/components/HeroSection.tsx
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-gradient relative pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1
              className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
            >
              Trợ lý AI chăm sóc sức khỏe tâm lý của bạn
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-lg">
              MindCare AI luôn lắng nghe và đồng hành cùng bạn vượt qua những
              khó khăn tâm lý với công nghệ AI tiên tiến.
            </p>
            <div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button
                id="mainRegisterBtn"
                className="btn-primary bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold text-lg"
              >
                Bắt đầu ngay <i className="fas fa-arrow-right ml-2"></i>
              </button>
              <button
                id="mainLoginBtn"
                className="btn-primary border-2 border-white text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-white hover:bg-opacity-10"
              >
                Đăng nhập
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
              alt="AI Assistant"
              className="ai-avatar w-64 h-64 md:w-80 md:h-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;