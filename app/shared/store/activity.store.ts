import { create } from 'zustand';

type ActivityType = 'Question' | 'WordSearch' | 'MatchingConcepts' | 'EmotionBox' | 'DiceGame';

interface GameEntry {
    type: ActivityType;
    config: Record<string, any>;
    order: number;
}

interface ActivityState {
    currentStep: number;
    responses: Record<string, any>[];
    mediaStatus: 'loading' | 'ready' | 'error';
    startTime: number;
    activityType: ActivityType;
    games: GameEntry[];           // Juegos dinámicos desde la actividad
    gameIndex: number;            // Índice actual en el array de juegos
    totalQuestions: number;       // Total de preguntas a responder
    allQuestionsAnswered: boolean; // Indica si todas las preguntas fueron respondidas
    actions: {
        initialize: (steps: number) => void;
        setGames: (games: GameEntry[]) => void;
        nextStep: () => void;
        prevStep: () => void;
        addResponse: (response: any) => void;
        reset: () => void;
        setActivityType: (type: ActivityType) => void;
        nextActivityType: () => void;
        isLastGame: () => boolean;
        setTotalQuestions: (count: number) => void;
        checkAllQuestionsAnswered: () => void;
    };
}

const useActivityStore = create<ActivityState>()((set) => ({
    currentStep: 0,
    responses: [],
    mediaStatus: 'loading',
    startTime: Date.now(),
    activityType: 'Question',
    games: [],
    gameIndex: 0,
    totalQuestions: 0,
    allQuestionsAnswered: false,
    actions: {
        initialize: (steps: number) => set({ currentStep: 0, responses: new Array(steps), totalQuestions: steps, allQuestionsAnswered: false }),
        setGames: (games: GameEntry[]) => set({
            games,
            gameIndex: 0,
            // Mantener activityType como 'Question' (las preguntas van primero)
        }),
        nextStep: () => set((state) => ({
            currentStep: state.currentStep + 1
        })),
        prevStep: () => set((state) => ({
            currentStep: Math.max(state.currentStep - 1, 0)
        })),
        addResponse: (response: any) => set((state) => {
            const existingResponseIndex = state.responses.findIndex(r => r.questionId === response.questionId);
            let updatedResponses: Record<string, any>[];
            if (existingResponseIndex >= 0) {
                updatedResponses = [...state.responses];
                updatedResponses[existingResponseIndex] = response;
            } else {
                updatedResponses = [...state.responses, response];
            }
            // Verificar si todas las preguntas están respondidas
            const answeredCount = updatedResponses.filter(r => r && r.questionId).length;
            const allDone = state.totalQuestions > 0 && answeredCount >= state.totalQuestions;
            return { responses: updatedResponses, allQuestionsAnswered: allDone };
        }),
        reset: () => set((state) => ({
            currentStep: 0,
            responses: [],
            mediaStatus: 'loading',
            startTime: Date.now(),
            activityType: 'Question',     // Siempre empezar por preguntas
            games: state.games,           // Preservar juegos cargados desde BD
            gameIndex: 0,                 // Reiniciar al primer juego
            totalQuestions: state.totalQuestions,
            allQuestionsAnswered: false,
        })),
        setActivityType: (type: ActivityType) => set({ activityType: type }),
        nextActivityType: () => set((state) => {
            // Secuencia dinámica desde BD (actividades con games configurados)
            if (state.games.length > 0) {
                // Si activityType es 'Question', ir al primer juego (gameIndex 0)
                if (state.activityType === 'Question') {
                    const firstGame = state.games[0];
                    return { activityType: firstGame.type, gameIndex: 0, currentStep: 0 };
                }
                // Si ya estamos en un juego, avanzar al siguiente
                const nextIndex = state.gameIndex + 1;
                if (nextIndex < state.games.length) {
                    const nextGame = state.games[nextIndex];
                    return { activityType: nextGame.type, gameIndex: nextIndex, currentStep: 0 };
                }
                // Ya está en el último juego → no avanzar (el botón mostrará "Finalizar")
                return state;
            }
            // Fallback a secuencia fija (actividades sin campo games)
            const sequence: ActivityType[] = ['Question', 'WordSearch', 'MatchingConcepts', 'EmotionBox', 'DiceGame'];
            const currentIdx = sequence.indexOf(state.activityType);
            if (currentIdx >= 0 && currentIdx < sequence.length - 1) {
                return { activityType: sequence[currentIdx + 1], currentStep: 0 };
            }
            return state;
        }),
        isLastGame: () => {
            const state = useActivityStore.getState();
            if (state.games.length > 0) {
                return state.gameIndex >= state.games.length - 1;
            }
            return state.activityType === 'DiceGame';
        },
        setTotalQuestions: (count: number) => set({ totalQuestions: count, allQuestionsAnswered: false }),
        checkAllQuestionsAnswered: () => set((state) => {
            // Si no hay preguntas, no se considera completado (esperar a que carguen)
            if (state.totalQuestions === 0) return { allQuestionsAnswered: false };
            // Contar respuestas no vacías
            const answeredCount = state.responses.filter(r => r && r.questionId).length;
            return { allQuestionsAnswered: answeredCount >= state.totalQuestions };
        }),
    },
}));

export default useActivityStore;
