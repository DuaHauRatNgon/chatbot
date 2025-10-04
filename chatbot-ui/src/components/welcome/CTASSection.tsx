// src/components/CTASSection.tsx
import React from 'react';

const CTASSection: React.FC = () => {
  return (
    <section className="py-16 bg-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng cải thiện sức khỏe tinh thần?
            </h2>
            <p className="text-xl text-indigo-100">
              Đăng ký ngay để trải nghiệm trợ lý AI tâm lý thông minh hoàn toàn
              miễn phí.
            </p>
          </div>
          <div>
            <button
              id="bottomRegisterBtn"
              className="btn-primary bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100"
            >
              Đăng ký miễn phí <i className="fas fa-user-plus ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASSection;