import React, { useState, useEffect } from 'react';
import Header from '@/components/welcome/Header';
import HeroSection from '@/components/welcome/HeroSection';
import FeaturesSection from '@/components/welcome/FeaturesSection';
import CTASSection from '@/components/welcome/CTASSection';
import Footer from '@/components/welcome/Footer';
import LoginModal from '@/components/welcome/LoginModal';
import RegisterModal from '@/components/welcome/RegisterModal';

export function Welcome(){
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const styles = {
        body: {
            fontFamily: "Inter, sans-serif",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            minHeight: "100vh",
        }
    };
    useEffect(() => {
      // Khai báo các hàm handler tách riêng
      const handleLogin = () => setIsLoginModalOpen(true);
      const handleRegister = () => setIsRegisterModalOpen(true);
    
      // Lấy phần tử nút
      const loginBtn = document.getElementById("loginBtn");
      const mainLoginBtn = document.getElementById("mainLoginBtn");
      const registerBtn = document.getElementById("registerBtn");
      const mainRegisterBtn = document.getElementById("mainRegisterBtn");
      const bottomRegisterBtn = document.getElementById("bottomRegisterBtn");
    
      // Gắn event
      if (loginBtn) loginBtn.addEventListener("click", handleLogin);
      if (mainLoginBtn) mainLoginBtn.addEventListener("click", handleLogin);
      if (registerBtn) registerBtn.addEventListener("click", handleRegister);
      if (mainRegisterBtn) mainRegisterBtn.addEventListener("click", handleRegister);
      if (bottomRegisterBtn) bottomRegisterBtn.addEventListener("click", handleRegister);
    
      return () => {
        // Gỡ event đúng cách
        if (loginBtn) loginBtn.removeEventListener("click", handleLogin);
        if (mainLoginBtn) mainLoginBtn.removeEventListener("click", handleLogin);
        if (registerBtn) registerBtn.removeEventListener("click", handleRegister);
        if (mainRegisterBtn) mainRegisterBtn.removeEventListener("click", handleRegister);
        if (bottomRegisterBtn) bottomRegisterBtn.removeEventListener("click", handleRegister);
      };
    }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false); // Close register if open
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false); // Close login if open
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
  <div style={{...styles.body, minHeight: '100vh', height: '100%'}}>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CTASSection />
      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  );
};