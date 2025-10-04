import React, { useState } from 'react';
import { useChatTheme } from '@/context/ChatThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

// Temporary Badge component
const Badge = ({ className, children, variant = 'default', ...props }: any) => (
  <span 
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
    {...props}
  >
    {children}
  </span>
);
import { Palette, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatThemeSelector: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, resetToDefault } = useChatTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nature': return '';
      case 'ocean': return '';
      case 'space': return '';
      case 'sunset': return '';
      case 'forest': return '';
      default: return '';
    }
  };

  const getStyleBadgeColor = (style: string) => {
    switch (style) {
      case 'minimal': return 'bg-gray-100 text-gray-800';
      case 'cozy': return 'bg-orange-100 text-orange-800';
      case 'modern': return 'bg-blue-100 text-blue-800';
      case 'vibrant': return 'bg-purple-100 text-purple-800';
      case 'calm': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="border-0 shadow-none bg-transparent flex flex-col h-full">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold">Chủ đề Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </div>
          <CardDescription className="text-sm text-gray-600">
            Tùy chỉnh hình nền và phong cách giao diện chat
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
          {/* Current Theme Display */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-8 rounded-lg border-2 border-white shadow-sm overflow-hidden"
                  style={{ 
                    background: currentTheme.backgroundImage 
                      ? `url(${currentTheme.backgroundImage})` 
                      : currentTheme.backgroundGradient || currentTheme.colors.background,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderColor: currentTheme.colors.border
                  }}
                />
                <div>
                  <div className="font-medium text-sm">{currentTheme.name}</div>
                  <div className="text-xs text-gray-500">{currentTheme.description}</div>
                </div>
              </div>
              <Badge className={getStyleBadgeColor(currentTheme.style)}>
                {currentTheme.style}
              </Badge>
            </div>
          </div>

          {/* Theme Grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 flex-1 flex flex-col min-h-0"
              >
                <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto max-h-96">
                  {availableThemes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-3 h-auto border ${
                          currentTheme.id === theme.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setTheme(theme.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div 
                            className="w-10 h-6 rounded-lg border border-white shadow-sm flex-shrink-0 overflow-hidden"
                            style={{ 
                              background: theme.backgroundImage 
                                ? `url(${theme.backgroundImage})` 
                                : theme.backgroundGradient || theme.colors.background,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              borderColor: theme.colors.border
                            }}
                          />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{theme.name}</span>
                              <span className="text-xs">{getCategoryIcon(theme.category)}</span>
                              {currentTheme.id === theme.id && (
                                <Check className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {theme.description}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStyleBadgeColor(theme.style)}`}
                          >
                            {theme.style}
                          </Badge>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Reset Button */}
                <div className="pt-2 border-t flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefault}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Đặt lại mặc định
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
