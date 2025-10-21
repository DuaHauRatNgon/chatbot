import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { EmotionAnalysis } from './EmotionAnalysis';

export const EmotionAnalysisDemo: React.FC = () => {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  if (showFullAnalysis) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="p-4">
          <Button 
            onClick={() => setShowFullAnalysis(false)}
            variant="outline"
            className="mb-4"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Đóng Demo
          </Button>
          <EmotionAnalysis />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-md">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <h3 className="text-xl font-semibold">Phân tích Cảm xúc</h3>
        </div>
        
        <p className="text-gray-600 text-sm">
          Xem biểu đồ 2D phân tích cảm xúc tinh vi với trục tích cực/tiêu cực và cường độ mạnh/yếu
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            😊 Tích cực
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            😢 Tiêu cực
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            ⚡ Cường độ
          </Badge>
        </div>
        
        <Button 
          onClick={() => setShowFullAnalysis(true)}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          Xem Demo Phân tích Cảm xúc
        </Button>
      </div>
    </Card>
  );
};
