import React from 'react';
import { Music } from '@/components/custom/music';
import { Podcast } from '@/components/custom/podcast';
import { Music as MusicIcon, Mic, Brain, Sparkles } from 'lucide-react';

interface MediaContentWrapperProps {
  activeTab: string;
}

export const MediaContentWrapper: React.FC<MediaContentWrapperProps> = ({ activeTab }) => {
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'music':
        return {
          icon: MusicIcon,
          title: 'Âm nhạc thư giãn',
          subtitle: 'Khám phá những giai điệu êm dịu',
          gradient: 'from-pink-500 to-rose-500'
        };
      case 'podcast':
        return {
          icon: Mic,
          title: 'Podcast hay',
          subtitle: 'Lắng nghe những câu chuyện thú vị',
          gradient: 'from-blue-500 to-cyan-500'
        };
      default:
        return {
          icon: Sparkles,
          title: 'Giải trí',
          subtitle: 'Chọn loại nội dung yêu thích',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const tabInfo = getTabInfo(activeTab);
  const Icon = tabInfo.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header Card */}
      <div className={`bg-gradient-to-r ${tabInfo.gradient} rounded-xl p-4 mb-4 text-white shadow-lg`}>
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-2 mr-3">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{tabInfo.title}</h3>
            <p className="text-sm text-white/80">{tabInfo.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <Music isActive={activeTab === 'music'} />
          <Podcast isActive={activeTab === 'podcast'} />
        </div>
      </div>
    </div>
  );
};