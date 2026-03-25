export interface Resource {
    type: 'video' | 'audio';
    url: string;
}

export interface TypeQuestion {
    type: 'Question' | 'WordSearch' | 'MatchingConcepts' | 'EmotionBox' | 'DiceGame';
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