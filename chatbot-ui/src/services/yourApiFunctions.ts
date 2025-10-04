import apiClient from './apiClient';
import {
  LoginCredentials,
  User,
  AuthResponse,
  ListConversations,
  MessageData,
  ApiResponse,
  Message,
  ApiResponseTitle,
  ApiResponseMessageBotObject,
  CreateMessageResponse,
  TitleData,
  CreateTitleResponse,
  GetMessagesApiResponse,
  GetAllMusics,
  GetAllPodcasts,
  GetAllSurveyAndFeedback
} from './type'

export const login = async (userData: LoginCredentials): Promise<AuthResponse> => { // Trả về Promise<AuthResponse>
    try {
        const response = await apiClient.post<AuthResponse>('/users/login', userData); // Kiểu cho response là AuthResponse
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

// Hàm để tạo một người dùng mới
export const register = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const ListConversationsAPI = async (userId: string): Promise<ListConversations[]> => {
  try {
    const response = await apiClient.get<ApiResponse>('/conversations/user/' + userId);
    
    // Kiểm tra response có thành công không
    if (response.data.success) {
      return response.data.data || []; // Trả về mảng conversations hoặc empty array
    } else {
      // Nếu message là "không có data" thì trả về empty array thay vì throw error
      if (response.data.message && response.data.message.includes('Không có dữ liệu conversation')) {
        return []; // Trả về empty array
      } else {
        throw new Error(response.data.message);
      }
    }
  } catch (error: any) {
    // Kiểm tra nếu là 404 và message về không có data
    if (error.response?.status === 404 && 
        error.response?.data?.message?.includes('Không có dữ liệu conversation')) {
      return []; // Trả về empty array thay vì throw error
    }
    
    console.error('Error fetching conversations:', error);
    throw error;
  }
}


export const newTitleAPI = async (messageData: Omit<Message, 'id'>): Promise<ApiResponseTitle> => {
  try {
    const response = await apiClient.post<ApiResponseTitle>('/chat/title', messageData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export const newMessageBotAPI = async (messageData: { message: string; conversation_id: string }): Promise<ApiResponseMessageBotObject> => {
  try {
    const response = await apiClient.post<ApiResponseMessageBotObject>('/chat/message', messageData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export const createMessageAPI = async (messageData: Omit<MessageData, 'id'>): Promise<CreateMessageResponse> => {
  try {
    const response = await apiClient.post<CreateMessageResponse>('/messages', messageData);
      
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
} 
// API function để tạo title
export const createTitleAPI = async (titleData: Omit<TitleData, 'id'>): Promise<CreateTitleResponse> => {
  try {
    const response = await apiClient.post('/conversations', titleData);
    return response.data;
  } catch (error) {
    console.error('Error creating title:', error);
    throw error;
  }
}

export const findMessageByConversationId = async (conversationId: string): Promise<GetMessagesApiResponse> => {
  try {
    const response = await apiClient.get('/messages/conversation/' + conversationId);
    return response.data;
  } catch (error) {
    console.error('Error creating title:', error);
    throw error;  }
}

export const findAllMusics = async (): Promise<GetAllMusics> => {
  try {
    const response = await apiClient.get<GetAllMusics>('/musics');
    return response.data;
  } catch (error) {
    console.error('Error fetching musics:', error);
    throw error;
  }
};
  
export const findAllPodcasts = async (): Promise<GetAllPodcasts> => {
  try {
    const response = await apiClient.get<GetAllPodcasts>('/podcasts');
    return response.data;
  } catch (error) {
    console.error('Error fetching musics:', error);
    throw error;
  }
};
export const findAllSurveysAndFeedback = async (): Promise<GetAllSurveyAndFeedback> => {
  try {
    const response = await apiClient.get<GetAllSurveyAndFeedback>('/surveysAndFeedback');
    return response.data;
  } catch (error) {
    console.error('Error fetching musics:', error);
    throw error;
  }
}

// Assessment API functions
export const startAssessmentAPI = async (data: {
  scaleType: string;
  userId: string;
  conversationId: string;
}): Promise<{ success: boolean; data: any; message: string }> => {
  try {
    const response = await apiClient.post('/assessments/start', data);
    return response.data;
  } catch (error) {
    console.error('Error starting assessment:', error);
    throw error;
  }
};

export const submitAssessmentAnswerAPI = async (assessmentId: string, answer: number): Promise<{ success: boolean; data: any; message: string }> => {
  try {
    const response = await apiClient.post(`/assessments/${assessmentId}/answer`, { answer });
    return response.data;
  } catch (error) {
    console.error('Error submitting assessment answer:', error);
    throw error;
  }
};

export const getAssessmentAPI = async (assessmentId: string): Promise<{ success: boolean; data: any; message: string }> => {
  try {
    const response = await apiClient.get(`/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw error;
  }
};

export const getUserAssessmentsAPI = async (userId: string): Promise<{ success: boolean; data: any; message: string }> => {
  try {
    const response = await apiClient.get(`/assessments/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user assessments:', error);
    throw error;
  }
};