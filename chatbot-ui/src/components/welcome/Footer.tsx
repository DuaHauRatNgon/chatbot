// src/components/Footer.tsx
import React from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaBrain, 
  FaPhone 
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Intro */}
          <div>
            <div className="flex items-center mb-4">
              <FaBrain className="text-white text-2xl mr-2" />
              <span className="font-semibold text-xl">MindCare AI</span>
            </div>
            <p className="text-gray-400">
              Trợ lý AI chăm sóc sức khỏe tâm lý hàng đầu Việt Nam.
            </p>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center text-gray-400">
              <FaPhone className="mr-2" />
              <span>Liên hệ: 0869 595 203</span>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kết nối với chúng tôi</h4>
            <div className="flex space-x-4">
              <FaFacebook className="text-gray-400 hover:text-white transition text-xl cursor-pointer" />
              <FaTwitter className="text-gray-400 hover:text-white transition text-xl cursor-pointer" />
              <FaInstagram className="text-gray-400 hover:text-white transition text-xl cursor-pointer" />
              <FaLinkedin className="text-gray-400 hover:text-white transition text-xl cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2025 MindCare AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
