type MediaResource = {
    type: 'video' | 'audio' | 'interactive';
    url: string;
    duration: number;
    metadata: Record<string, any>;
}

type Question = {
    type: 'multiple_choice' | 'open_response';
    question: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
}

interface Tip {
    emoji: string;
    message: string;
    category?: string;
}

interface GameEntry {
    type: 'WordSearch' | 'MatchingConcepts' | 'DiceGame' | 'EmotionBox';
    config: Record<string, any>;
    order: number;
}

interface Activity {
    _id: any;
    emotion: any;
    title: string;
    description: string;
    resources: MediaResource[];
    questions: Question[];
    difficulty: number;
    estimatedDuration: number;
    version: string;
    createdAt: Date;
    tips?: Tip[];
    games?: GameEntry[];
}

// Modelo de Planificación Semanal
interface WeeklySchedule {
    weekNumber: number;
    year: number;
    days: {
        date: Date;
        emotion: string;
        activity: any;
        status: 'pending' | 'active' | 'completed';
    }[];
    participants: any[];
}

// Modelo de Respuesta de Usuario
interface UserResponse {
    user: any;
    activity: any;
    responses: {
        questionId: any;
        answer: string;
        isCorrect?: boolean;
        responseTime: number;
    }[];
    score: number;
    startTime: Date;
    endTime: Date;
}