import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { QuizState, AssessmentAnswerResponse } from '@/interfaces/interfaces';

interface AssessmentQuizProps {
  quizState: QuizState;
  onAnswerSubmit: (answer: number) => void;
  onQuizClose: () => void;
  onQuizComplete: (result: AssessmentAnswerResponse) => void;
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({
  quizState,
  onAnswerSubmit,
  onQuizClose,
  onQuizComplete: _onQuizComplete
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    
    setIsSubmitting(true);
    try {
      await onAnswerSubmit(selectedAnswer);
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScaleInfo = (scaleType: string) => {
    switch (scaleType) {
      case 'GAD-7':
        return {
          title: 'Thang đo Lo âu (GAD-7)',
          description: 'Đánh giá mức độ lo âu trong 2 tuần qua',
          color: 'bg-blue-500'
        };
      case 'PHQ-9':
        return {
          title: 'Thang đo Trầm cảm (PHQ-9)',
          description: 'Đánh giá mức độ trầm cảm trong 2 tuần qua',
          color: 'bg-purple-500'
        };
      case 'PSS':
        return {
          title: 'Thang đo Stress (PSS)',
          description: 'Đánh giá mức độ stress trong tháng qua',
          color: 'bg-orange-500'
        };
      default:
        return {
          title: 'Thang đo Tâm lý',
          description: 'Đánh giá tình trạng tâm lý',
          color: 'bg-gray-500'
        };
    }
  };

  const scaleInfo = getScaleInfo(quizState.scaleType || '');

  if (!quizState.active) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${scaleInfo.color}`}></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {scaleInfo.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {scaleInfo.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onQuizClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Câu hỏi {quizState.currentQuestion + 1} / {quizState.totalQuestions}</span>
              <span>{quizState.progress}%</span>
            </div>
            <Progress value={quizState.progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
              {quizState.question}
            </h4>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {quizState.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-4 ${
                  selectedAnswer === index 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={isSubmitting}
              >
                <span className="flex-1">{option}</span>
                {selectedAnswer === index && (
                  <CheckCircle className="w-5 h-5 ml-2" />
                )}
              </Button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </div>
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Thông tin quan trọng:</p>
                <p>
                  Thang đo này chỉ mang tính chất sàng lọc và không thay thế cho chẩn đoán chuyên nghiệp. 
                  Nếu bạn có những lo lắng nghiêm trọng về sức khỏe tâm lý, hãy tham khảo ý kiến chuyên gia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
