import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  startAssessmentAPI, 
  submitAssessmentAnswerAPI,
  getAssessmentAPI 
} from '@/services/yourApiFunctions';
import { QuizState, AssessmentStartResponse, AssessmentAnswerResponse } from '@/interfaces/interfaces';

export const useAssessment = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    active: false,
    currentQuestion: 0,
    totalQuestions: 0,
    progress: 0,
    answers: []
  });
  const [assessmentResult, setAssessmentResult] = useState<AssessmentAnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startAssessment = useCallback(async (scaleType: string, userId: string, conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await startAssessmentAPI({
        scaleType,
        userId,
        conversationId
      });

      if (response.success) {
        const data: AssessmentStartResponse = response.data;
        setQuizState({
          active: true,
          scaleType: data.scaleType,
          assessmentId: data.assessmentId,
          currentQuestion: data.currentQuestion,
          totalQuestions: data.totalQuestions,
          question: data.question,
          options: data.options,
          progress: Math.round((data.currentQuestion / data.totalQuestions) * 100),
          answers: []
        });
        return true;
      } else {
        toast.error(response.message || 'Không thể bắt đầu đánh giá');
        return false;
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Lỗi khi bắt đầu đánh giá');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: number) => {
    if (!quizState.assessmentId) {
      toast.error('Không tìm thấy ID đánh giá');
      return;
    }

    try {
      setIsLoading(true);
      const response = await submitAssessmentAnswerAPI(quizState.assessmentId, answer);

      if (response.success) {
        const data: AssessmentAnswerResponse = response.data;
        
        if (data.completed) {
          // Assessment hoàn thành
          setQuizState(prev => ({ ...prev, active: false }));
          setAssessmentResult(data);
          toast.success('Đánh giá hoàn thành!');
          return data;
        } else {
          // Tiếp tục câu hỏi tiếp theo
          setQuizState(prev => ({
            ...prev,
            currentQuestion: data.currentQuestion || prev.currentQuestion + 1,
            question: data.question,
            options: data.options,
            progress: data.progress || prev.progress,
            answers: [...prev.answers, answer]
          }));
          return null;
        }
      } else {
        toast.error(response.message || 'Lỗi khi gửi câu trả lời');
        return null;
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Lỗi khi gửi câu trả lời');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [quizState.assessmentId]);

  const closeQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, active: false }));
  }, []);

  const closeResults = useCallback(() => {
    setAssessmentResult(null);
  }, []);

  const getAssessment = useCallback(async (assessmentId: string) => {
    try {
      const response = await getAssessmentAPI(assessmentId);
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.message || 'Không thể lấy thông tin đánh giá');
        return null;
      }
    } catch (error) {
      console.error('Error getting assessment:', error);
      toast.error('Lỗi khi lấy thông tin đánh giá');
      return null;
    }
  }, []);

  return {
    quizState,
    assessmentResult,
    isLoading,
    startAssessment,
    submitAnswer,
    closeQuiz,
    closeResults,
    getAssessment
  };
};
