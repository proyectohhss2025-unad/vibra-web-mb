/**
 * @fileoverview Definiciones de tipos para la actividad de Caja de Emociones
 * @author Trae AI
 */

/**
 * Interfaz para la configuración de emociones
 * @interface EmotionConfig
 * @property {string} id - Identificador único de la emoción
 * @property {string} name - Nombre de la emoción
 * @property {string} type - Tipo de emoción (sana o por gestionar)
 * @property {string} [imageUrl] - URL opcional de la imagen para la emoción
 */
export interface EmotionConfig {
    id: string;
    name: string;
    type: 'sana' | 'gestionar';
    imageUrl?: string;
}

/**
 * Interfaz para el registro de colocación de emociones
 * @interface EmotionPlacement
 * @property {string} emotionId - ID de la emoción
 * @property {string} boxType - Tipo de caja donde se colocó
 * @property {boolean} isCorrect - Indica si la colocación fue correcta
 */
export interface EmotionPlacement {
    emotionId: string;
    boxType: 'sana' | 'gestionar' | string;
    isCorrect: boolean;
}

/**
 * Interfaz para el resultado de la actividad
 * @interface EmotionActivityResult
 * @property {string} studentId - ID del estudiante
 * @property {number} score - Puntuación obtenida
 * @property {number} timeSpent - Tiempo empleado en segundos
 * @property {EmotionPlacement[]} placements - Colocaciones de emociones realizadas
 */
export interface EmotionActivityResult {
    studentId: string;
    score: number;
    timeSpent: number;
    placements: EmotionPlacement[];
}

/**
 * Interfaz para las propiedades del componente EmotionBoxActivity
 * @interface EmotionBoxActivityProps
 * @property {string} activityId - ID de la actividad
 * @property {EmotionConfig[]} emotions - Lista de emociones configurables
 * @property {Function} [onComplete] - Función a ejecutar cuando se completa la actividad
 * @property {number} [timeLimit] - Tiempo límite en segundos para completar la actividad
 */
export interface EmotionBoxActivityProps {
    activityId: string;
    emotions: EmotionConfig[];
    onComplete?: (result: EmotionActivityResult) => void;
    timeLimit?: number;
}