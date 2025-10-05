import React from 'react';
import { Music, Palette, HeartPulse } from 'lucide-react';

const HorizontalMenu = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: 'theme',
      label: 'Chủ đề',
      icon: Palette,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'music',
      label: 'Âm nhạc',
      icon: Music,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'mood',
      label: 'Cảm xúc',
      icon: HeartPulse,
      color: 'from-green-500 to-emerald-500'
    },
    // {
    //   id: 'podcast',
    //   label: 'Podcast',
    //   icon: Mic,
    //   color: 'from-blue-500 to-cyan-500'
    // },
  ];

  return (
    <div className="mb-6">
      <div className="flex bg-gray-200 rounded-xl p-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex-1 flex items-center justify-center px-4 py-3 rounded-lg
                transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? `bg-white shadow-md text-gray-800 transform scale-105` 
                  : `text-gray-600 hover:text-gray-800 hover:bg-gray-100`
                }
              `}
            >
              <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalMenu;