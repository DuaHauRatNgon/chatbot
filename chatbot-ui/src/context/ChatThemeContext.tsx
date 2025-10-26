import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatTheme, ChatThemeContextType } from '@/interfaces/chatTheme';

// Định nghĩa các theme có sẵn - Emotion-themed backgrounds
const defaultThemes: ChatTheme[] = [
  {
    id: 'joy',
    name: 'Vui Vẻ',
    description: 'Cảm xúc vui vẻ, hạnh phúc, tích cực',
    colors: {
      primary: 'hsl(45 100% 50%)',
      secondary: 'hsl(45 100% 95%)',
      background: 'hsl(45 100% 98%)',
      surface: 'hsl(45 100% 100%)',
      text: 'hsl(45 20% 15%)',
      textSecondary: 'hsl(45 10% 50%)',
      border: 'hsl(45 30% 85%)',
      accent: 'hsl(45 80% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Joy_standard2.png',
    style: 'vibrant',
    category: 'positive'
  },
  {
    id: 'sadness',
    name: 'Buồn Bã',
    description: 'Cảm xúc buồn, trầm lắng, u ám',
    colors: {
      primary: 'hsl(210 30% 35%)',
      secondary: 'hsl(210 20% 90%)',
      background: 'hsl(210 15% 95%)',
      surface: 'hsl(210 10% 98%)',
      text: 'hsl(210 25% 20%)',
      textSecondary: 'hsl(210 15% 45%)',
      border: 'hsl(210 15% 80%)',
      accent: 'hsl(210 25% 85%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Sadness_standard2.png',
    style: 'calm',
    category: 'negative'
  },
  {
    id: 'anger',
    name: 'Tức Giận',
    description: 'Cảm xúc giận dữ, bực bội, căng thẳng',
    colors: {
      primary: 'hsl(0 70% 45%)',
      secondary: 'hsl(0 50% 95%)',
      background: 'hsl(0 40% 98%)',
      surface: 'hsl(0 30% 100%)',
      text: 'hsl(0 30% 20%)',
      textSecondary: 'hsl(0 20% 50%)',
      border: 'hsl(0 30% 85%)',
      accent: 'hsl(0 60% 90%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Anger_standard2.png',
    style: 'vibrant',
    category: 'negative'
  },
  {
    id: 'fear',
    name: 'Sợ Hãi',
    description: 'Cảm xúc sợ hãi, lo lắng, bất an',
    colors: {
      primary: 'hsl(270 50% 40%)',
      secondary: 'hsl(270 30% 92%)',
      background: 'hsl(270 20% 96%)',
      surface: 'hsl(270 15% 99%)',
      text: 'hsl(270 25% 22%)',
      textSecondary: 'hsl(270 15% 48%)',
      border: 'hsl(270 20% 83%)',
      accent: 'hsl(270 40% 88%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Fear_standard2.png',
    style: 'modern',
    category: 'negative'
  },
  {
    id: 'anxiety',
    name: 'Lo Âu',
    description: 'Cảm xúc lo âu, căng thẳng, bồn chồn',
    colors: {
      primary: 'hsl(25 65% 45%)',
      secondary: 'hsl(25 45% 93%)',
      background: 'hsl(25 35% 97%)',
      surface: 'hsl(25 25% 99%)',
      text: 'hsl(25 28% 18%)',
      textSecondary: 'hsl(25 18% 48%)',
      border: 'hsl(25 28% 84%)',
      accent: 'hsl(25 55% 89%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Anxiety_standard2.png',
    style: 'cozy',
    category: 'negative'
  },
  {
    id: 'disgust',
    name: 'Ghê Tởm',
    description: 'Cảm xúc ghê tởm, khó chịu, phản cảm',
    colors: {
      primary: 'hsl(120 40% 35%)',
      secondary: 'hsl(120 30% 92%)',
      background: 'hsl(120 20% 96%)',
      surface: 'hsl(120 15% 99%)',
      text: 'hsl(120 25% 20%)',
      textSecondary: 'hsl(120 15% 47%)',
      border: 'hsl(120 20% 83%)',
      accent: 'hsl(120 35% 88%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Disgust_standard2.png',
    style: 'calm',
    category: 'negative'
  },
  {
    id: 'embarrassment',
    name: 'Xấu Hổ',
    description: 'Cảm xúc xấu hổ, ngượng ngùng, bối rối',
    colors: {
      primary: 'hsl(340 45% 42%)',
      secondary: 'hsl(340 35% 93%)',
      background: 'hsl(340 25% 97%)',
      surface: 'hsl(340 20% 99%)',
      text: 'hsl(340 23% 19%)',
      textSecondary: 'hsl(340 18% 49%)',
      border: 'hsl(340 23% 84%)',
      accent: 'hsl(340 40% 89%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Embarrassment_standard2.png',
    style: 'cozy',
    category: 'neutral'
  },
  {
    id: 'ennui',
    name: 'Chán Nản',
    description: 'Cảm xúc chán nản, buồn tẻ, mệt mỏi',
    colors: {
      primary: 'hsl(200 15% 40%)',
      secondary: 'hsl(200 10% 92%)',
      background: 'hsl(200 8% 96%)',
      surface: 'hsl(200 5% 99%)',
      text: 'hsl(200 12% 22%)',
      textSecondary: 'hsl(200 8% 50%)',
      border: 'hsl(200 10% 84%)',
      accent: 'hsl(200 12% 88%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Ennui_standard2.png',
    style: 'minimal',
    category: 'neutral'
  },
  {
    id: 'envy',
    name: 'Ghen Tị',
    description: 'Cảm xúc ghen tị, đố kỵ, không hài lòng',
    colors: {
      primary: 'hsl(150 40% 38%)',
      secondary: 'hsl(150 30% 92%)',
      background: 'hsl(150 20% 96%)',
      surface: 'hsl(150 15% 99%)',
      text: 'hsl(150 23% 21%)',
      textSecondary: 'hsl(150 15% 48%)',
      border: 'hsl(150 20% 83%)',
      accent: 'hsl(150 35% 88%)',
    },
    backgroundImage: '/src/assets/backgrounds/Io_Envy_standard2.png',
    style: 'modern',
    category: 'negative'
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
    setTheme('ennui'); // Chán Nản - neutral theme
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
