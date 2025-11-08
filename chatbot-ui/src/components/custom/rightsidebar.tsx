// import { Button } from '@/components/ui/button';
// import { SurveyAndFeedback } from '@/components/custom/survey-and-feedback';
// import HorizontalMenu from '@/components/custom/horizontalmenu'
// import { Music } from '@/components/custom/music';
// import { ChatThemeSelector } from '@/components/custom/ChatThemeSelector';
// import MoodHistoryChart from '@/components/custom/MoodHistoryChart';
// import { useState } from 'react';
// import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
// import { LogOut, HeartPulse, Book } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from '@/context/AuthContext'; // ✅ Thêm dòng này
// import { changePassword } from '@/services/yourApiFunctions';


// interface RightSidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const RightSidebar = ({ isOpen, onClose }: RightSidebarProps) => {
//   const [activeTab, setActiveTab] = useState('theme');
//   const [showChangePass, setShowChangePass] = useState(false);
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();
//   const { logout } = useAuth(); // ✅ Lấy hàm logout từ context

//   const handleLogout = () => {
//     logout(); // ✅ Gọi logout() từ AuthContext
//     navigate("/welcome"); // ✅ Điều hướng về trang welcome
//   };
//     const handleChangePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       setMessage('⚠️ Vui lòng nhập đầy đủ thông tin.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setMessage('❌ Mật khẩu mới không khớp.');
//       return;
//     }

//     const res = await changePassword(oldPassword, newPassword);
//     if (res.success) {
//       setMessage('✅ Đổi mật khẩu thành công!');
//       setTimeout(() => setShowChangePass(false), 1500);
//     } else {
//       setMessage(`❌ ${res.message}`);
//     }
//   };

//   return (

//     <div
//       className={`
//         bg-gray-200 w-80 p-4 transition-transform duration-300 transform
//         ${isOpen ? 'translate-x-0' : 'translate-x-full'}
//         ${isOpen ? 'shadow-lg' : ''}
//         fixed top-0 right-0 h-full z-40 flex flex-col
//       `}
//     >
//       {/* Close Button */}
//       <div className="flex justify-between items-center mb-4">
//         <Button
//           onClick={onClose}
//           className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//         >
//           <KeyboardArrowRightIcon/>
//         </Button>

//         <Button variant="ghost"   type="button"  size="icon" onClick={handleLogout}>
//           <LogOut className="h-5 w-5" />
//         </Button>
//       </div>

//       {/*Top Half */}
//       <div className="flex-1 mt-12 mb-2 flex flex-col min-h-0">
//         <HorizontalMenu activeTab={activeTab} onTabChange={setActiveTab} />
//         <div className="flex-1 overflow-y-auto">
//           {activeTab === 'theme' && <ChatThemeSelector />}
//           {activeTab === 'music' && <Music isActive={true} />}
//           {activeTab === 'mood' && (
//             <div className="p-1">
//               <h3 className="text-sm font-semibold mb-2">Lịch sử cảm xúc</h3>
//               <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/mood')}>
//                 <HeartPulse className="h-4 w-4 mr-2" /> Mở trang phân tích cảm xúc
//               </Button>
//             </div>
//           )}
//           {activeTab === 'books' && (
//             <div className="p-1">
//               <h3 className="text-sm font-semibold mb-2">Đọc sách</h3>
//               <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/books')}>
//                 <Book className="h-4 w-4 mr-2" /> Mở trang đọc sách
//               </Button>
//             </div>
//           )}
//           {/* <Podcast isActive={activeTab === 'podcast'} /> */}
//         </div>
//       </div>

//     </div>
//   );
// };
import { Button } from '@/components/ui/button';
import { SurveyAndFeedback } from '@/components/custom/survey-and-feedback';
import HorizontalMenu from '@/components/custom/horizontalmenu';
import { Music } from '@/components/custom/music';
import { ChatThemeSelector } from '@/components/custom/ChatThemeSelector';
import MoodHistoryChart from '@/components/custom/MoodHistoryChart';
import { useState } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { LogOut, HeartPulse, Book, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext'; 
import { changePassword } from '@/services/yourApiFunctions';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar = ({ isOpen, onClose }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState('theme');
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/welcome");
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('⚠️ Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Mật khẩu mới không khớp.');
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setMessage('✅ Đổi mật khẩu thành công!');
      setTimeout(() => {
        setShowChangePass(false);
        setMessage('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } else {
      setMessage(`❌ ${res.message}`);
    }
  };

  return (
    <>
      <div
        className={`
          bg-gray-200 w-80 p-4 transition-transform duration-300 transform
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${isOpen ? 'shadow-lg' : ''}
          fixed top-0 right-0 h-full z-40 flex flex-col
        `}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={onClose} 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            <KeyboardArrowRightIcon/>
          </Button>

          <div className="flex items-center gap-2">
            {/* 🔐 Nút đổi mật khẩu */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowChangePass(true)}
            >
              <KeyRound className="h-5 w-5" />
            </Button>

            {/* 🚪 Nút đăng xuất */}
            <Button variant="ghost" type="button" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/*Top Half */}
        <div className="flex-1 mt-12 mb-2 flex flex-col min-h-0">
          <HorizontalMenu activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'theme' && <ChatThemeSelector />}
            {activeTab === 'music' && <Music isActive={true} />}
            {activeTab === 'mood' && (
              <div className="p-1">
                <h3 className="text-sm font-semibold mb-2">Lịch sử cảm xúc</h3>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/mood')}>
                  <HeartPulse className="h-4 w-4 mr-2" /> Mở trang phân tích cảm xúc
                </Button>
              </div>
            )}
            {activeTab === 'books' && (
              <div className="p-1">
                <h3 className="text-sm font-semibold mb-2">Đọc sách</h3>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => navigate('/books')}>
                  <Book className="h-4 w-4 mr-2" /> Mở trang đọc sách
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔒 Modal đổi mật khẩu */}
      {showChangePass && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Đổi mật khẩu</h2>
            
            <div className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {message && (
                <p className="text-sm mt-1 text-center text-gray-700">{message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button variant="ghost" onClick={() => setShowChangePass(false)}>
                Hủy
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleChangePassword}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
