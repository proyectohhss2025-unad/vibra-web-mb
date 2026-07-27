/**
 * Banco de tips motivacionales para el asistente emocional
 * Organizados por tipo de actividad. Solo mensajes positivos y de apoyo.
 */

export interface EmotionalTip {
  emoji: string;
  message: string;
}

export const TIPS: Record<string, EmotionalTip[]> = {
  start: [
    { emoji: '🌟', message: '¡Hola! Hoy vamos a explorar tus emociones' },
    { emoji: '😊', message: 'No hay respuestas incorrectas, solo tu experiencia' },
    { emoji: '🌈', message: 'Cada emoción es única, como tú' },
    { emoji: '✨', message: 'Este es tu espacio para sentir y aprender' },
  ],
  question: [
    { emoji: '💭', message: 'Respira profundo y responde con calma' },
    { emoji: '✨', message: 'Cada emoción es válida, siéntete libre' },
    { emoji: '🌸', message: 'Tómate tu tiempo, no hay prisa' },
    { emoji: '🌿', message: 'Observa cómo te sientes en este momento' },
    { emoji: '💛', message: 'Tus emociones son importantes, siéntelas' },
  ],
  wordsearch: [
    { emoji: '🔍', message: 'Busca las palabras con calma, tú puedes' },
    { emoji: '💪', message: 'Concéntrate, las palabras están ahí para ti' },
    { emoji: '👀', message: 'Observa bien cada letra, son pistas' },
  ],
  matching: [
    { emoji: '🧩', message: 'Conecta cada concepto con calma' },
    { emoji: '🎯', message: 'Observa bien antes de emparejar' },
    { emoji: '🤔', message: 'Piensa en cada relación, confía en ti' },
  ],
  emotionbox: [
    { emoji: '🎨', message: 'Coloca cada emoción donde creas que va' },
    { emoji: '🌈', message: 'Las emociones tienen muchos matices' },
    { emoji: '🌟', message: 'No hay una forma incorrecta de sentir' },
  ],
  dicegame: [
    { emoji: '🎲', message: '¡Suerte! Cada tiro es una nueva oportunidad' },
    { emoji: '🎉', message: 'Disfruta el juego, es parte del aprendizaje' },
    { emoji: '✨', message: 'Cada número trae una nueva pregunta' },
  ],
  complete: [
    { emoji: '🎉', message: '¡Lo hiciste increíble! Nos vemos mañana' },
    { emoji: '🌟', message: 'Gracias por compartir tus emociones hoy' },
    { emoji: '💛', message: 'Cada día es una nueva oportunidad para sentir' },
    { emoji: '🌈', message: 'Eres valioso por ser quien eres' },
  ],
};

export const TRANSITION_MESSAGES: Record<string, string> = {
  Question: '🌟 ¡Siguiente actividad! Vas muy bien',
  WordSearch: '🔍 Busca las palabras ocultas, tú puedes',
  MatchingConcepts: '🧩 Hora de conectar conceptos',
  EmotionBox: '🎨 Explora las emociones en cajas',
  DiceGame: '🎲 ¡Lanza los dados! Una sorpresa te espera',
};

export function getRandomTip(key: string): EmotionalTip {
  const tips = TIPS[key] || TIPS.start;
  return tips[Math.floor(Math.random() * tips.length)];
}

export interface Tip {
  emoji: string;
  message: string;
  category?: string;
}

/**
 * Obtiene un tip desde la actividad (si tiene) o del banco hardcodeado como fallback.
 * Filtra por categoría si los tips de la actividad la tienen definida.
 */
export function getTipFromActivity(
  activityTips: Tip[] | undefined,
  category: string,
): EmotionalTip {
  if (activityTips && activityTips.length > 0) {
    const filtered = activityTips.filter(t => !t.category || t.category === category);
    const pool = filtered.length > 0 ? filtered : activityTips;
    const tip = pool[Math.floor(Math.random() * pool.length)];
    return { emoji: tip.emoji, message: tip.message };
  }
  return getRandomTip(category);
}
