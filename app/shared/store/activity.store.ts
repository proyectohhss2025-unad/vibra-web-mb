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
    actions: {
        initialize: (steps: number) => set({ currentStep: 0, responses: new Array(steps) }),
        setGames: (games: GameEntry[]) => set({
            games,
            gameIndex: 0,
            activityType: games.length > 0 ? games[0].type : 'Question',
        }),
        nextStep: () => set((state) => ({
            currentStep: state.currentStep + 1
        })),
        prevStep: () => set((state) => ({
            currentStep: Math.max(state.currentStep - 1, 0)
        })),
        addResponse: (response: any) => set((state) => {
            const existingResponseIndex = state.responses.findIndex(r => r.questionId === response.questionId);
            if (existingResponseIndex >= 0) {
                const updatedResponses = [...state.responses];
                updatedResponses[existingResponseIndex] = response;
                return { responses: updatedResponses };
            } else {
                return { responses: [...state.responses, response] };
            }
        }),
        reset: () => set((state) => ({
            currentStep: 0,
            responses: [],
            mediaStatus: 'loading',
            startTime: Date.now(),
            activityType: state.games.length > 0 ? state.games[0]?.type || 'Question' : 'Question',
            games: state.games,          // Preservar juegos cargados desde BD
            gameIndex: 0,                // Reiniciar al primer juego
        })),
        setActivityType: (type: ActivityType) => set({ activityType: type }),
        nextActivityType: () => set((state) => {
            // Secuencia dinámica desde BD (actividades con games configurados)
            if (state.games.length > 0) {
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
    },
}));

export default useActivityStore;
