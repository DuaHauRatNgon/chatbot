import { useState, useCallback } from 'react';
import { createTitleAPI } from '../services/yourApiFunctions';
import { TitleData, CreateTitleResponse } from '../services/type';

type CreateTitlePayload = Omit<TitleData, 'id'>;

interface UseCreateTitleHook {
  submitTitle: (payload: CreateTitlePayload) => Promise<CreateTitleResponse | null>;
  isSubmitting: boolean;
  errorTitle: string | null;
  isSubmitted: boolean;
  responseTitle: string | null;
  clearState: () => void;
  
}

/**
 * Custom hook to handle title creation with optional success/error callbacks.
 * @param onSubmitSuccess - Optional callback for successful title creation
 * @param onSubmitError - Optional callback for handling errors
 * @returns Object containing submitTitle function and state variables
 */
export const useCreateTitle = (
  onSubmitSuccess?: (response: CreateTitleResponse) => void,
  onSubmitError?: (error: string) => void
): UseCreateTitleHook => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseTitle, setResponseTitle] = useState<string | null>(null);

  const submitTitle = useCallback(
    async (payload: CreateTitlePayload): Promise<CreateTitleResponse | null> => {
      setIsSubmitting(true);
      setErrorTitle(null);
      setIsSubmitted(false);
      setResponseTitle(null);

      try {
        const response = await createTitleAPI(payload);

        if (response.success) {
          setIsSubmitted(true);
          setResponseTitle(response.title);
          onSubmitSuccess?.(response);
          return response;
        } else {
          const errorMsg = response.message || 'Có lỗi xảy ra khi tạo title';
          setErrorTitle(errorMsg);
          onSubmitError?.(errorMsg);
          return null;
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi Title';
        setErrorTitle(errorMsg);
        onSubmitError?.(errorMsg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmitSuccess, onSubmitError]
  );

  const clearState = useCallback(() => {
    setErrorTitle(null);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setResponseTitle(null);
  }, []);

  return {
    submitTitle,
    isSubmitting,
    errorTitle,
    isSubmitted,
    responseTitle,
    clearState,
  };
};