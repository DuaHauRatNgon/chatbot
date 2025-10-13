import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AssessmentResults } from './AssessmentResults';
import { AssessmentAnswerResponse } from '@/interfaces/interfaces';

export const QuickAssessmentTest: React.FC = () => {
  const [showResults, setShowResults] = useState(false);

  const handleTest = () => {
    setShowResults(true);
  };

  // Tạo mock data giống như từ backend
  const mockResult: AssessmentAnswerResponse = {
    completed: true,
    totalScore: 15,
    interpretation: 'Lo âu mức độ nặng',
    assessment: {
      _id: 'test-assessment-id',
      userId: 'test-user-id',
      conversationId: 'test-conversation-id',
      scaleType: 'GAD-7',
      answers: [3, 3, 2, 2, 3, 2, 0], // Tổng = 15
      totalScore: 15,
      interpretation: 'Lo âu mức độ nặng',
      status: 'completed',
      currentQuestion: 7,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      suggestedBy: 'AI'
    },
    aiContext: {
      confidence: 0.8,
      primaryConcern: 'anxiety',
      severity: 'mild',
      urgency: 'medium',
      keyIndicators: ['cảm thấy xấu hổ', 'muốn trốn tránh']
    },
    // Không có recommendations - sẽ trigger AI generation
    recommendations: undefined
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="p-4 bg-white shadow-lg">
        <h3 className="font-semibold mb-2">Quick Test</h3>
        <Button 
          onClick={handleTest}
          size="sm"
        >
          Test Assessment Results
        </Button>
      </Card>

      {showResults && (
        <AssessmentResults
          result={mockResult}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
