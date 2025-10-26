import { Heart, Smile, Frown, AlertCircle, Angry, Ghost, Sparkles, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmotionIndicatorProps {
  emotion: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Mapping emotion sang icon và label
const EMOTION_CONFIG: Record<string, { 
  icon: React.ComponentType<any>; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  'happy': { 
    icon: Smile, 
    label: 'Vui vẻ', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  'excited': { 
    icon: Sparkles, 
    label: 'Phấn khích', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'love': { 
    icon: Heart, 
    label: 'Yêu thương', 
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  'sad': { 
    icon: Frown, 
    label: 'Buồn', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'depression': { 
    icon: Frown, 
    label: 'Trầm cảm', 
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  'anxiety': { 
    icon: AlertCircle, 
    label: 'Lo âu', 
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  'fear': { 
    icon: Ghost, 
    label: 'Sợ hãi', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'angry': { 
    icon: Angry, 
    label: 'Tức giận', 
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'disgust': { 
    icon: AlertCircle, 
    label: 'Ghê tởm', 
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  'surprise': { 
    icon: Sparkles, 
    label: 'Ngạc nhiên', 
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  'neutral': { 
    icon: Meh, 
    label: 'Bình thường', 
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
};

const SIZE_CONFIG = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

/**
 * Component hiển thị emotion indicator với icon và label
 */
export function EmotionIndicator({ 
  emotion, 
  className, 
  showLabel = false,
  size = 'md' 
}: EmotionIndicatorProps) {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG['neutral'];
  const Icon = config.icon;
  const iconSize = SIZE_CONFIG[size];

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm',
      config.bgColor,
      'border border-gray-200/50 shadow-sm',
      className
    )}>
      <Icon className={cn(iconSize, config.color)} />
      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          config.color
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}

interface EmotionBadgeProps {
  emotion: string;
  count?: number;
  onClick?: () => void;
  isActive?: boolean;
}

/**
 * Component badge nhỏ để hiển thị emotion với count
 */
export function EmotionBadge({ 
  emotion, 
  count, 
  onClick,
  isActive = false 
}: EmotionBadgeProps) {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG['neutral'];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-medium transition-all duration-200',
        config.bgColor,
        config.color,
        'border',
        isActive ? 'border-current shadow-md scale-105' : 'border-transparent hover:border-current hover:shadow-sm',
        onClick && 'cursor-pointer hover:scale-105'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-0.5 px-1.5 py-0.5 bg-white/60 rounded-full text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

interface EmotionStatsProps {
  emotionScores: Record<string, number>;
  className?: string;
}

/**
 * Component hiển thị thống kê emotions
 */
export function EmotionStats({ emotionScores, className }: EmotionStatsProps) {
  // Sắp xếp theo số lượng giảm dần
  const sortedEmotions = Object.entries(emotionScores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  if (sortedEmotions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {sortedEmotions.map(([emotion, count]) => (
        <EmotionBadge 
          key={emotion} 
          emotion={emotion} 
          count={count}
        />
      ))}
    </div>
  );
}
