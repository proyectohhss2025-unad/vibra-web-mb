export interface Resource {
    type: 'video' | 'audio' | 'image';
    url: string;
}

export interface TypeQuestion {
    type: 'Question' | 'WordSearch' | 'MatchingConcepts' | 'EmotionBox' | 'DiceGame';
}

export interface Emotion {
    _id: string;
    id: string;
    name: string;
    icono: string;
    orientationNote?: string;
    description?: string;
    percentNote?: number;
}

export interface Activity {
    _id: string;
    id: string;
    title: string;
    description: string;
    type: string;
    difficulty: number;
    emotion: Emotion;
    resources: any[];
    questions: any[];
    schedule?: { date: string; weekNumber?: number; year?: number };
    isActive?: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface Question {
    id: string;
    type: 'open' | 'multiple';
    url: string;
    questionText: string;
    _id: string;
    options: [];
    correctAnswer: string;
}

export default Question;