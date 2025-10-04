import { Podcast } from './../components/custom/podcast';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
}
export interface AuthResponse { // Thêm interface cho response từ API
    success: boolean;
    message: string;
    token: string;
    user: User;
}
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ListConversations{
    id: string;
    title: string;
}
export interface ApiResponse {
    success: boolean;
    message: string;
    data: ListConversations[];
  }

export interface Message {
    id: string;
    message: string;
}

export interface MessageBotRequest {
    message: string;
    conversation_id: string;
}
export interface ApiResponseTitle{
    title: string;
    mood_before: 4;
}

// Interface cho response trả về object
export interface ApiResponseMessageBotObject {
    success: boolean;
    message: {
        content: string;
        emotion: string;
    };
}

export interface MessageData {
    id: string;
    conversation_id: string;
    message: string;
    emotion?: string;
}
// Response từ API
export interface CreateMessageResponse {
    success: boolean;
    message: string;
}
  
export interface TitleData {
    id: string;
    title: string;
    mood_before:string
}

export interface CreateTitleResponse{
    success: boolean;
    message: string;
}

export interface ApiMessage {
    _id: string;
    conversation_id: string;
    content: string;
    sender: string;
    emotion: string;
    timestamp: string;
    __v: number;
}
export interface GetMessagesApiResponse {
    success: boolean;
    message: string;
    data: ApiMessage[]; // data là một mảng các ApiMessage
}

export interface Music {
    _id: string;
    title: string;
    duration: string;
    file_url: string;
  }
  
export interface GetAllMusics {
    success: boolean;
    data: {
      data: Music[];
    };
}
  
export interface Podcast {
    _id: string;
    title: string;
    duration: string;
    file_url: string;
    description: string;
  }
  
  // Cập nhật interface để phù hợp với API response thực tế
export interface GetAllPodcasts {
    success: boolean;
    data: {
      transformedData: Podcast[]; // Thay đổi từ 'data' thành 'transformedData'
    };
}
  
export interface SurveysAndFeedback {
    _id: string;
    title: string;
    description: string;
    link: string;
    category: string;
    created_at: string;
    updated_at: string;
}  
export interface GetAllSurveyAndFeedback {
    success: boolean;
    surveysAndFeedbacks: SurveysAndFeedback[];
}

// Conversation interface
export interface Conversation {
    _id: string;
    title: string;
    mood_before: number;
    createdAt?: string;
    updatedAt?: string;
}
  