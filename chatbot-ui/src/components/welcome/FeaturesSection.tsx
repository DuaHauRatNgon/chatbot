// src/components/FeaturesSection.tsx
import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            MindCare AI có gì đặc biệt?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Công nghệ AI thông minh giúp bạn hiểu rõ và cải thiện sức khỏe tinh
            thần
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition">
            <div className="feature-icon mx-auto">
              <i className="fas fa-head-side-virus text-indigo-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Phân tích cảm xúc
            </h3>
            <p className="text-gray-600 text-center">
              AI phân tích ngôn ngữ và cảm xúc của bạn để đưa ra những lời
              khuyên phù hợp nhất.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition">
            <div className="feature-icon mx-auto">
              <i className="fas fa-calendar-check text-indigo-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Lưu trữ 
            </h3>
            <p className="text-gray-600 text-center">
              Hệ thống lưu trữ lịch sử tâm lý và cảm xúc
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition">
            <div className="feature-icon mx-auto">
              <i className="fas fa-lock text-indigo-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Bảo mật tuyệt đối
            </h3>
            <p className="text-gray-600 text-center">
              Mọi cuộc trò chuyện đều được mã hóa, đảm bảo sự riêng tư tuyệt đối
              cho bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;