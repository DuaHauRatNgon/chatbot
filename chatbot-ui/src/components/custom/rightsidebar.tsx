import { Button } from '@/components/ui/button';
import { SurveyAndFeedback } from '@/components/custom/survey-and-feedback';
import HorizontalMenu from '@/components/custom/horizontalmenu'
import { Music } from '@/components/custom/music';
import { ChatThemeSelector } from '@/components/custom/ChatThemeSelector';
import MoodHistoryChart from '@/components/custom/MoodHistoryChart';
import { useState } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { LogOut, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar = ({ isOpen, onClose }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState('theme');
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/welcome");
  };
  return (

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

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
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
          {/* <Podcast isActive={activeTab === 'podcast'} /> */}
        </div>
      </div>

      {/* Survey Forms Section - Bottom Half */}
      <div className="flex-shrink-0 border-t border-gray-300 pt-4 flex flex-col max-h-80">
        <h2 className="text-lg font-semibold mb-4 flex items-center flex-shrink-0">
          📋 Hỗ trợ
        </h2>
        <div className="flex-1 overflow-y-auto">
          <SurveyAndFeedback/>
        </div>
      </div>
    </div>
  );
};