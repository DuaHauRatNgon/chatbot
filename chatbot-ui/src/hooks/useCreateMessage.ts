import { useState, useCallback  } from "react";
import { createMessageAPI } from '../services/yourApiFunctions';
import { MessageData, CreateMessageResponse  } from '../services/type'

type CreateMessagePayload = Omit<MessageData, 'id'>;

interface UseCreateMessageHook {
    submitMessage: (payload: CreateMessagePayload) => Promise<CreateMessageResponse | null>;
    isSubmitting: boolean;
    errorMessage: string | null;
    isSubmitted: boolean;
    responseMessage: string | null;
    clearState: () => void;
  }
  
  export const useCreateMessage = (): UseCreateMessageHook => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
    const submitMessage = useCallback(async (payload: CreateMessagePayload): Promise<CreateMessageResponse | null> => {
      setIsSubmitting(true);
      setErrorMessage(null);
      setIsSubmitted(false);
      setResponseMessage(null);
  
      try {
        // Gọi API để tạo message
        const response = await createMessageAPI(payload);
        
        if (response.success) {
          setIsSubmitted(true);
          setResponseMessage(response.message);
        } else {
          setErrorMessage(response.message || 'Có lỗi xảy ra');
        }
        
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi message';
        setErrorMessage(errorMsg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    }, []);
  
    const clearState = useCallback(() => {
      setErrorMessage(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
      setResponseMessage(null);
    }, []);
  
    return {
      submitMessage,
      isSubmitting,
      errorMessage,
      isSubmitted,
      responseMessage,
      clearState
    };
  };
  
  // Hook nâng cao với callbacks
  export const useCreateMessageWithCallbacks = (
    onSubmitSuccess?: (response: CreateMessageResponse) => void,
    onSubmitError?: (error: string) => void
  ): UseCreateMessageHook => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
    const submitMessage = useCallback(async (payload: CreateMessagePayload): Promise<CreateMessageResponse | null> => {
      setIsSubmitting(true);
      setErrorMessage(null);
      setIsSubmitted(false);
      setResponseMessage(null);
  
      try {
        const response = await createMessageAPI(payload);
        
        if (response.success) {
          setIsSubmitted(true);
          setResponseMessage(response.message);
          onSubmitSuccess?.(response);
        } else {
          const errorMsg = response.message || 'Có lỗi xảy ra';
          setErrorMessage(errorMsg);
          onSubmitError?.(errorMsg);
        }
        
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi message';
        setErrorMessage(errorMsg);
        onSubmitError?.(errorMsg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    }, [onSubmitSuccess, onSubmitError]);
  
    const clearState = useCallback(() => {
      setErrorMessage(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
      setResponseMessage(null);
    }, []);
  
    return {
      submitMessage,
      isSubmitting,
      errorMessage,
      isSubmitted,
      responseMessage,
      clearState
    };
  };