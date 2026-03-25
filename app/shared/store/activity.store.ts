import { create } from 'zustand';

type ActivityType = 'Question' | 'WordSearch' | 'MatchingConcepts' | 'EmotionBox' | 'DiceGame';

interface ActivityState {
    currentStep: number;
    responses: Record<string, any>[];
    mediaStatus: 'loading' | 'ready' | 'error';
    startTime: number;
    activityType: ActivityType;
    actions: {
        initialize: (steps: number) => void;
        nextStep: () => void;
        prevStep: () => void;
        addResponse: (response: any) => void;
        reset: () => void;
        setActivityType: (type: ActivityType) => void;
        nextActivityType: () => void;
    };
}

const useActivityStore = create<ActivityState>()((set) => ({
    currentStep: 0,
    responses: [],
    mediaStatus: 'loading',
    startTime: Date.now(),
    activityType: 'Question',
    actions: {
        initialize: (steps: number) => set({ currentStep: 0, responses: new Array(steps) }),
        nextStep: () => set((state) => ({
            // currentStep: Math.min(state.currentStep + 1, state.responses.length - 1)
            currentStep: state.currentStep + 1
        })),
        prevStep: () => set((state) => ({
            currentStep: Math.max(state.currentStep - 1, 0)
        })),
        addResponse: (response: any) => set((state) => {
            // Verificamos si la respuesta ya existe para evitar duplicados
            const existingResponseIndex = state.responses.findIndex(r => r.questionId === response.questionId);

            if (existingResponseIndex >= 0) {
                // Si ya existe, actualizamos la respuesta existente
                const updatedResponses = [...state.responses];
                updatedResponses[existingResponseIndex] = response;
                return { responses: updatedResponses };
            } else {
                // Si no existe, agregamos la nueva respuesta
                return { responses: [...state.responses, response] };
            }
        }),
        reset: () => set({
            currentStep: 0,
            responses: [],
            mediaStatus: 'loading',
            startTime: Date.now(),
            activityType: 'Question'
        }),
        setActivityType: (type: ActivityType) => set({
            activityType: type
        }),
        nextActivityType: () => set((state) => {
            const currentType = state.activityType;
            let nextType: ActivityType = currentType;
            console.log('currentType:', currentType);

            if (currentType === 'Question') {
                nextType = 'WordSearch';
            } else if (currentType === 'WordSearch') {
                nextType = 'MatchingConcepts';
            } else if (currentType === 'MatchingConcepts') {
                nextType = 'EmotionBox';
            } else if (currentType === 'EmotionBox') {
                nextType = 'DiceGame';
            }

            console.log('nextType:', nextType);

            return { activityType: nextType };
        })
    },
}));

export default useActivityStore;