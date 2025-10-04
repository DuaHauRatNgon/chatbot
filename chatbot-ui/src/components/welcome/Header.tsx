// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="absolute w-full z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-brain text-white text-2xl mr-2"></i>
            <span className="text-white font-semibold text-xl">MindCare AI</span>
          </div>
          <div>
            <button
              id="loginBtn"
              className="text-white font-medium mr-4 hover:text-gray-200 transition"
            >
              Đăng nhập
            </button>
            <button
              id="registerBtn"
              className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;