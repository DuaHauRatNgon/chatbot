export interface ChatTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  backgroundImage?: string;
  backgroundGradient?: string;
  style: 'minimal' | 'cozy' | 'modern' | 'vibrant' | 'calm';
  category: 'default' | 'nature' | 'space' | 'ocean' | 'sunset' | 'forest';
}

export interface ChatThemeContextType {
  currentTheme: ChatTheme;
  availableThemes: ChatTheme[];
  setTheme: (themeId: string) => void;
  resetToDefault: () => void;
}
