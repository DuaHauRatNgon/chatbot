export interface message{
    content:string;
    role:string;
    id:string;
}

// Assessment interfaces
export interface AssessmentScale {
  name: string;
  description: string;
  questions: string[];
  options: string[];
  scoring: number[];
  interpretation: { [key: string]: string };
}

export interface Assessment {
  _id: string;
  userId: string;
  conversationId: string;
  scaleType: 'GAD-7' | 'PHQ-9' | 'PSS';
  answers: number[];
  totalScore?: number;
  interpretation?: string;
  status: 'in_progress' | 'completed';
  currentQuestion: number;
  startedAt: string;
  completedAt?: string;
  suggestedBy: string;
}

export interface AssessmentStartResponse {
  assessmentId: string;
  scaleType: string;
  name: string;
  description: string;
  totalQuestions: number;
  currentQuestion: number;
  question: string;
  options: string[];
}

export interface AssessmentAnswerResponse {
  completed: boolean;
  assessmentId?: string;
  currentQuestion?: number;
  question?: string;
  options?: string[];
  progress?: number;
  totalScore?: number;
  interpretation?: string;
  recommendations?: {
    immediateActions?: string[];
    dailyPractices?: string[];
    professionalHelp?: {
      needed: boolean;
      urgency?: string;
      recommendations?: string[];
    };
    resources?: string[];
    followUp?: {
      timeline: string;
      actions?: string[];
    };
    aiGenerated?: boolean;
  };
  assessment?: Assessment;
  aiContext?: {
    confidence?: number;
    primaryConcern?: string;
    severity?: string;
    urgency?: string;
    keyIndicators?: string[];
  };
}

export interface QuizState {
  active: boolean;
  scaleType?: string;
  assessmentId?: string;
  currentQuestion: number;
  totalQuestions: number;
  question?: string;
  options?: string[];
  progress: number;
  answers: number[];
}