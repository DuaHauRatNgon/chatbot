import { useEffect, useState } from 'react';
import { findAllSurveysAndFeedback } from '@/services/yourApiFunctions'; // đường dẫn tùy chỉnh
import { SurveysAndFeedback } from '@/services/type'; // tùy vào cấu trúc bạn đặt

interface UseSurveysAndFeedbackResult {
  data: SurveysAndFeedback[] | null;
  loading: boolean;
  error: string | null;
}

export const useSurveysAndFeedback = (): UseSurveysAndFeedbackResult => {
  const [data, setData] = useState<SurveysAndFeedback[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await findAllSurveysAndFeedback();
        setData(response.surveysAndFeedbacks);
      } catch (err: any) {
        setError(err?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  return { data, loading, error };
};
