import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Brain } from 'lucide-react';

export const EmotionAnalysisSimple: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          Phân tích Cảm xúc Tinh vi
        </h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và phân tích cảm xúc qua tin nhắn với độ chính xác cao
        </p>
      </div>

      {/* Test Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test Component</h2>
        <p className="text-gray-600 mb-4">
          Nếu bạn thấy được text này, component đã hoạt động!
        </p>
        <Button onClick={() => alert('Component hoạt động!')}>
          Test Button
        </Button>
      </Card>

      {/* Simple Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Biểu đồ Cảm xúc (Đang phát triển)</h2>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600">Biểu đồ 2D sẽ xuất hiện ở đây</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
