interface Response {
    isCorrect?: boolean;
    points: number;
    responseTime: number;
}

/**
 * Calculates the score based on the given responses.
 * @param responses - An array of Response objects.
 * @returns The calculated score.
 */
const calculateScore = (responses: Response[]): number => {
    const BASE_MULTIPLIER = 100;
    const TIME_PENALTY_PER_SECOND = 0.1;
    const COMPLETENESS_BONUS = 50;

    const baseScore = responses.reduce((acc, curr) =>
        acc + (curr.isCorrect ? curr.points * BASE_MULTIPLIER : 0), 0);

    const timePenalty = responses.reduce((acc, curr) =>
        acc + (curr.responseTime * TIME_PENALTY_PER_SECOND), 0);

    const completenessBonus = responses.length === 5 ? COMPLETENESS_BONUS : 0;

    return Math.max(0, baseScore - timePenalty + completenessBonus);
};
export default calculateScore;

/**
 * Calculates the maximum score based on the given questions count.
 * @param questionsCount - The number of questions.
 * @returns The maximum score.
 */
export const calculateMaxScore = (questionsCount: number): number => {
    const MAX_POINTS_PER_QUESTION = 100;
    const COMPLETENESS_BONUS = 50;
    return (questionsCount * MAX_POINTS_PER_QUESTION) + COMPLETENESS_BONUS;
};