import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, 
  Smile, 
  Frown, 
  Zap, 
  Cloud, 
  Sun, 
  Moon, 
  Flame,
  Calendar,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';

// Định nghĩa interface cho emotion data
interface EmotionPoint {
  id: string;
  emotion: string;
  valence: number; // -1 (tiêu cực) đến +1 (tích cực)
  arousal: number; // 0 (yếu) đến 1 (mạnh)
  intensity: number; // 0-100
  timestamp: string;
  message: string;
  color: string;
}

interface EmotionStats {
  totalMessages: number;
  positiveRatio: number;
  negativeRatio: number;
  averageIntensity: number;
  dominantEmotion: string;
}

// Mock data cho demo
const mockEmotionData: EmotionPoint[] = [
  {
    id: '1',
    emotion: 'Vui vẻ',
    valence: 0.8,
    arousal: 0.7,
    intensity: 85,
    timestamp: '2024-10-14T09:00:00Z',
    message: 'Hôm nay tôi cảm thấy rất vui!',
    color: '#FFD700'
  },
  {
    id: '2',
    emotion: 'Hứng khởi',
    valence: 0.9,
    arousal: 0.9,
    intensity: 95,
    timestamp: '2024-10-14T09:15:00Z',
    message: 'Tôi rất phấn khích về dự án mới!',
    color: '#FF6B35'
  },
  {
    id: '3',
    emotion: 'Buồn',
    valence: -0.7,
    arousal: 0.3,
    intensity: 70,
    timestamp: '2024-10-14T10:00:00Z',
    message: 'Tôi cảm thấy hơi buồn về việc này...',
    color: '#4A90E2'
  },
  {
    id: '4',
    emotion: 'Tức giận',
    valence: -0.8,
    arousal: 0.9,
    intensity: 90,
    timestamp: '2024-10-14T10:30:00Z',
    message: 'Điều này thật sự làm tôi tức giận!',
    color: '#E74C3C'
  },
  {
    id: '5',
    emotion: 'Yêu thương',
    valence: 0.9,
    arousal: 0.6,
    intensity: 80,
    timestamp: '2024-10-14T11:00:00Z',
    message: 'Tôi yêu gia đình mình rất nhiều',
    color: '#E91E63'
  },
  {
    id: '6',
    emotion: 'Sợ hãi',
    valence: -0.6,
    arousal: 0.8,
    intensity: 75,
    timestamp: '2024-10-14T11:30:00Z',
    message: 'Tôi lo lắng về kết quả này...',
    color: '#9C27B0'
  },
  {
    id: '7',
    emotion: 'Bình thản',
    valence: 0.2,
    arousal: 0.1,
    intensity: 30,
    timestamp: '2024-10-14T12:00:00Z',
    message: 'Mọi thứ đều ổn',
    color: '#607D8B'
  },
  {
    id: '8',
    emotion: 'Ngạc nhiên',
    valence: 0.3,
    arousal: 0.8,
    intensity: 85,
    timestamp: '2024-10-14T12:15:00Z',
    message: 'Wow, tôi không ngờ điều này!',
    color: '#FF9800'
  }
];

export const EmotionAnalysis: React.FC = () => {
  const [emotionData, setEmotionData] = useState<EmotionPoint[]>(mockEmotionData);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionPoint | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Tính toán thống kê
  const stats: EmotionStats = React.useMemo(() => {
    const total = emotionData.length;
    const positive = emotionData.filter(e => e.valence > 0).length;
    const negative = emotionData.filter(e => e.valence < 0).length;
    const avgIntensity = emotionData.reduce((sum, e) => sum + e.intensity, 0) / total;
    
    // Tìm cảm xúc chiếm ưu thế
    const emotionCounts = emotionData.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Không xác định';

    return {
      totalMessages: total,
      positiveRatio: (positive / total) * 100,
      negativeRatio: (negative / total) * 100,
      averageIntensity: avgIntensity,
      dominantEmotion
    };
  }, [emotionData]);

  // Chuyển đổi tọa độ cảm xúc thành pixel coordinates
  const getChartCoordinates = (emotion: EmotionPoint, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Valence: -1 to +1 -> 0 to width
    const x = centerX + (emotion.valence * centerX * 0.8);
    
    // Arousal: 0 to 1 -> height to 0 (đảo ngược vì canvas y tăng xuống dưới)
    const y = centerY - (emotion.arousal * centerY * 0.8);
    
    return { x, y };
  };

  const EmotionChart: React.FC = () => {
    const chartWidth = 600;
    const chartHeight = 400;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;

    return (
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
        <svg width={chartWidth} height={chartHeight} className="border rounded-lg bg-white">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Axes */}
          <line x1={centerX} y1="20" x2={centerX} y2={chartHeight - 20} stroke="#666" strokeWidth="2" />
          <line x1="20" y1={centerY} x2={chartWidth - 20} y2={centerY} stroke="#666" strokeWidth="2" />
          
          {/* Quadrant labels */}
          <text x={centerX + 20} y="35" className="text-sm font-medium fill-green-600">
            Tích cực + Mạnh
          </text>
          <text x={centerX + 20} y={chartHeight - 10} className="text-sm font-medium fill-green-400">
            Tích cực + Yếu
          </text>
          <text x="20" y="35" className="text-sm font-medium fill-red-600">
            Tiêu cực + Mạnh
          </text>
          <text x="20" y={chartHeight - 10} className="text-sm font-medium fill-red-400">
            Tiêu cực + Yếu
          </text>
          
          {/* Axis labels */}
          <text x={chartWidth - 50} y={centerY - 10} className="text-xs fill-gray-600">
            Tích cực
          </text>
          <text x="30" y={centerY - 10} className="text-xs fill-gray-600">
            Tiêu cực
          </text>
          <text x={centerX + 10} y="15" className="text-xs fill-gray-600">
            Mạnh
          </text>
          <text x={centerX + 10} y={chartHeight - 5} className="text-xs fill-gray-600">
            Yếu
          </text>
          
          {/* Emotion points */}
          {emotionData.map((emotion) => {
            const { x, y } = getChartCoordinates(emotion, chartWidth, chartHeight);
            const radius = Math.max(6, emotion.intensity / 10);
            
            return (
              <g key={emotion.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={emotion.color}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedEmotion(emotion)}
                />
                <text
                  x={x}
                  y={y - radius - 5}
                  className="text-xs fill-gray-700 text-center"
                  textAnchor="middle"
                >
                  {emotion.emotion}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Cách đọc biểu đồ:</strong></p>
          <p>• Trục ngang: Tiêu cực (trái) ↔ Tích cực (phải)</p>
          <p>• Trục dọc: Yếu (dưới) ↔ Mạnh (trên)</p>
          <p>• Kích thước chấm: Cường độ cảm xúc</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            Phân tích Cảm xúc Tinh vi
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và phân tích cảm xúc qua tin nhắn với độ chính xác cao
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Lọc
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tin nhắn</p>
              <p className="text-2xl font-bold">{stats.totalMessages}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sun className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cảm xúc tích cực</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.positiveRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Cloud className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cảm xúc tiêu cực</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.negativeRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cường độ TB</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.averageIntensity.toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Biểu đồ Cảm xúc 2D</h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(filter)}
              >
                {filter === 'today' && 'Hôm nay'}
                {filter === 'week' && 'Tuần này'}
                {filter === 'month' && 'Tháng này'}
                {filter === 'all' && 'Tất cả'}
              </Button>
            ))}
          </div>
        </div>
        
        <EmotionChart />
      </Card>

      {/* Emotion Details */}
      {selectedEmotion && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chi tiết Cảm xúc</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedEmotion(null)}
            >
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: selectedEmotion.color }}
                />
                <h4 className="text-xl font-medium">{selectedEmotion.emotion}</h4>
                <Badge variant="secondary">
                  {selectedEmotion.intensity}% cường độ
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tin nhắn gốc:</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    "{selectedEmotion.message}"
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Thời gian:</p>
                  <p className="text-gray-900">
                    {new Date(selectedEmotion.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Phân tích chi tiết:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tính tích cực:</span>
                    <span className={selectedEmotion.valence > 0 ? 'text-green-600' : 'text-red-600'}>
                      {selectedEmotion.valence > 0 ? '+' : ''}{(selectedEmotion.valence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mức độ kích thích:</span>
                    <span className="text-purple-600">
                      {(selectedEmotion.arousal * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cường độ tổng thể:</span>
                    <span className="text-blue-600">
                      {selectedEmotion.intensity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Emotion Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dòng thời gian Cảm xúc</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {emotionData
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((emotion) => (
              <div 
                key={emotion.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setSelectedEmotion(emotion)}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: emotion.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{emotion.emotion}</span>
                    <Badge variant="outline" className="text-xs">
                      {emotion.intensity}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {emotion.message}
                  </p>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(emotion.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
