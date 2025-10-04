import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatTheme, ChatThemeContextType } from '@/interfaces/chatTheme';

// Định nghĩa các theme có sẵn
const defaultThemes: ChatTheme[] = [
  {
    id: 'default',
    name: 'Mặc định',
    description: 'Giao diện đơn giản và sạch sẽ',
    colors: {
      primary: 'hsl(0 0% 9%)',
      secondary: 'hsl(0 0% 96.1%)',
      background: 'hsl(0 0% 100%)',
      surface: 'hsl(0 0% 100%)',
      text: 'hsl(0 0% 3.9%)',
      textSecondary: 'hsl(0 0% 45.1%)',
      border: 'hsl(0 0% 89.8%)',
      accent: 'hsl(0 0% 96.1%)',
    },
    style: 'minimal',
    category: 'default'
  },
  {
    id: 'calm-blue',
    name: 'Xanh Dịu Dàng',
    description: 'Màu xanh nhẹ nhàng giúp thư giãn',
    colors: {
      primary: 'hsl(210 40% 25%)',
      secondary: 'hsl(210 30% 95%)',
      background: 'hsl(210 20% 98%)',
      surface: 'hsl(210 15% 100%)',
      text: 'hsl(210 20% 15%)',
      textSecondary: 'hsl(210 10% 50%)',
      border: 'hsl(210 20% 85%)',
      accent: 'hsl(210 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/calm-blue.svg',
    style: 'calm',
    category: 'ocean'
  },
  {
    id: 'warm-sunset',
    name: 'Hoàng Hôn Ấm Áp',
    description: 'Sắc cam vàng ấm áp như hoàng hôn',
    colors: {
      primary: 'hsl(25 70% 45%)',
      secondary: 'hsl(25 30% 95%)',
      background: 'hsl(25 20% 98%)',
      surface: 'hsl(25 15% 100%)',
      text: 'hsl(25 20% 15%)',
      textSecondary: 'hsl(25 10% 50%)',
      border: 'hsl(25 20% 85%)',
      accent: 'hsl(25 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/warm-sunset.svg',
    style: 'cozy',
    category: 'sunset'
  },
  {
    id: 'forest-green',
    name: 'Rừng Xanh',
    description: 'Màu xanh lá cây tự nhiên, gần gũi với thiên nhiên',
    colors: {
      primary: 'hsl(120 40% 25%)',
      secondary: 'hsl(120 30% 95%)',
      background: 'hsl(120 20% 98%)',
      surface: 'hsl(120 15% 100%)',
      text: 'hsl(120 20% 15%)',
      textSecondary: 'hsl(120 10% 50%)',
      border: 'hsl(120 20% 85%)',
      accent: 'hsl(120 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/forest-green.svg',
    style: 'calm',
    category: 'forest'
  },
  {
    id: 'lavender-dream',
    name: 'Hoa Bằng Lăng',
    description: 'Màu tím nhẹ nhàng, thư giãn tinh thần',
    colors: {
      primary: 'hsl(270 40% 35%)',
      secondary: 'hsl(270 30% 95%)',
      background: 'hsl(270 20% 98%)',
      surface: 'hsl(270 15% 100%)',
      text: 'hsl(270 20% 15%)',
      textSecondary: 'hsl(270 10% 50%)',
      border: 'hsl(270 20% 85%)',
      accent: 'hsl(270 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/lavender-dream.svg',
    style: 'calm',
    category: 'nature'
  },
  {
    id: 'space-dark',
    name: 'Không Gian Vũ Trụ',
    description: 'Tông màu tối với điểm nhấn xanh dương',
    colors: {
      primary: 'hsl(220 60% 60%)',
      secondary: 'hsl(220 20% 15%)',
      background: 'hsl(220 15% 8%)',
      surface: 'hsl(220 20% 12%)',
      text: 'hsl(220 10% 90%)',
      textSecondary: 'hsl(220 10% 70%)',
      border: 'hsl(220 20% 20%)',
      accent: 'hsl(220 40% 25%)',
    },
    backgroundImage: '/src/assets/backgrounds/space-dark.svg',
    style: 'modern',
    category: 'space'
  },
  {
    id: 'rose-gold',
    name: 'Hồng Vàng',
    description: 'Sắc hồng vàng sang trọng và ấm áp',
    colors: {
      primary: 'hsl(340 50% 45%)',
      secondary: 'hsl(340 30% 95%)',
      background: 'hsl(340 20% 98%)',
      surface: 'hsl(340 15% 100%)',
      text: 'hsl(340 20% 15%)',
      textSecondary: 'hsl(340 10% 50%)',
      border: 'hsl(340 20% 85%)',
      accent: 'hsl(340 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/rose-gold.svg',
    style: 'cozy',
    category: 'sunset'
  },
  {
    id: 'mint-fresh',
    name: 'Bạc Hà Tươi Mát',
    description: 'Màu xanh bạc hà tươi mát, sảng khoái',
    colors: {
      primary: 'hsl(160 50% 35%)',
      secondary: 'hsl(160 30% 95%)',
      background: 'hsl(160 20% 98%)',
      surface: 'hsl(160 15% 100%)',
      text: 'hsl(160 20% 15%)',
      textSecondary: 'hsl(160 10% 50%)',
      border: 'hsl(160 20% 85%)',
      accent: 'hsl(160 40% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/mint-fresh.svg',
    style: 'modern',
    category: 'nature'
  }
];

const ChatThemeContext = createContext<ChatThemeContextType | undefined>(undefined);

export function ChatThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ChatTheme>(() => {
    const savedThemeId = localStorage.getItem('chatTheme');
    const savedTheme = defaultThemes.find(theme => theme.id === savedThemeId);
    return savedTheme || defaultThemes[0];
  });

  const setTheme = (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('chatTheme', themeId);
      applyThemeToDocument(theme);
    }
  };

  const resetToDefault = () => {
    setTheme('default');
  };

  const applyThemeToDocument = (theme: ChatTheme) => {
    const root = document.documentElement;
    
    // Áp dụng CSS custom properties
    root.style.setProperty('--chat-primary', theme.colors.primary);
    root.style.setProperty('--chat-secondary', theme.colors.secondary);
    root.style.setProperty('--chat-background', theme.colors.background);
    root.style.setProperty('--chat-surface', theme.colors.surface);
    root.style.setProperty('--chat-text', theme.colors.text);
    root.style.setProperty('--chat-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--chat-border', theme.colors.border);
    root.style.setProperty('--chat-accent', theme.colors.accent);
    
    if (theme.backgroundImage) {
      root.style.setProperty('--chat-background-image', `url(${theme.backgroundImage})`);
    } else if (theme.backgroundGradient) {
      root.style.setProperty('--chat-background-gradient', theme.backgroundGradient);
    }
    
    // Thêm class cho style
    root.className = root.className.replace(/chat-style-\w+/g, '');
    root.classList.add(`chat-style-${theme.style}`);
  };

  // Áp dụng theme khi component mount
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  return (
    <ChatThemeContext.Provider 
      value={{ 
        currentTheme, 
        availableThemes: defaultThemes, 
        setTheme, 
        resetToDefault 
      }}
    >
      {children}
    </ChatThemeContext.Provider>
  );
}

export function useChatTheme() {
  const context = useContext(ChatThemeContext);
  if (context === undefined) {
    throw new Error('useChatTheme must be used within a ChatThemeProvider');
  }
  return context;
}
