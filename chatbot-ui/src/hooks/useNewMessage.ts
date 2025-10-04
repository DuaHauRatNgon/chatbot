import { useState, useCallback } from 'react';
import { ApiResponseMessageBotObject, MessageBotRequest } from '../services/type';
import { newMessageBotAPI } from '../services/yourApiFunctions';

// Hook state interface
interface UseNewMessageBotState {
    data: ApiResponseMessageBotObject | null;
    loading: boolean;
    error: string | null;
}

// Hook return type
interface UseNewMessageBotReturn extends UseNewMessageBotState {
    sendMessage: (messageData: MessageBotRequest) => Promise<ApiResponseMessageBotObject>;
    reset: () => void;
}

export const useNewMessageBot = (): UseNewMessageBotReturn => {
    const [state, setState] = useState<UseNewMessageBotState>({
        data: null,
        loading: false,
        error: null,
    });

    const sendMessage = useCallback(async (messageData: MessageBotRequest) => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null,
        }));

        try {
            const response = await newMessageBotAPI(messageData);
            
            setState({
                data: response,
                loading: false,
                error: null,
            });
            return response; // Trả về response
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
            console.error("API error in useNewMessageBot:", errorMessage);
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            throw error; // Ném lỗi để xử lý ở nơi gọi
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        sendMessage,
        reset,
    };
};

// Phiên bản hook nâng cao với caching và retry
interface UseNewMessageBotAdvancedOptions {
    enableCache?: boolean;
    maxRetries?: number;
    retryDelay?: number;
}

export const useNewMessageBotAdvanced = (
    options: UseNewMessageBotAdvancedOptions = {}
): UseNewMessageBotReturn => {
    const { enableCache = false, maxRetries = 0, retryDelay = 1000 } = options;
    
    const [state, setState] = useState<UseNewMessageBotState>({
        data: null,
        loading: false,
        error: null,
    });

    // Simple cache implementation
    const [cache] = useState(new Map<string, ApiResponseMessageBotObject>());

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const sendMessageWithRetry = async (
        messageData: MessageBotRequest,
        retryCount = 0
    ): Promise<ApiResponseMessageBotObject> => {
        try {
            const response = await newMessageBotAPI(messageData);
            return response;
        } catch (error) {
            if (retryCount < maxRetries) {
                console.warn(`Retry ${retryCount + 1} failed, retrying after ${retryDelay}ms...`);
                await delay(retryDelay);
                return sendMessageWithRetry(messageData, retryCount + 1);
            }
            throw error;
        }
    };

    const sendMessage = useCallback(async (messageData: MessageBotRequest) => {
        const cacheKey = JSON.stringify(messageData);
        
        // Check cache first
        if (enableCache && cache.has(cacheKey)) {
            const cachedResponse = cache.get(cacheKey)!;
            setState({
                data: cachedResponse,
                loading: false,
                error: null,
            });
            return cachedResponse;
        }

        setState(prev => ({
            ...prev,
            loading: true,
            error: null,
        }));

        try {
            const response = await sendMessageWithRetry(messageData);
            
            // Cache the response
            if (enableCache) {
                cache.set(cacheKey, response);
            }
            
            setState({
                data: response,
                loading: false,
                error: null,
            });
            return response; // Trả về response
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
            console.error("API error in useNewMessageBotAdvanced:", errorMessage);
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            throw error;
        }
    }, [enableCache, cache, maxRetries, retryDelay]);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
        if (enableCache) {
            cache.clear();
        }
    }, [enableCache, cache]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        sendMessage,
        reset,
    };
};