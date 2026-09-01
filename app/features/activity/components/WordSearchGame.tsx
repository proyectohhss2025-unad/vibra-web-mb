import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useUser from '@/context/UserContext';
import useParticipant from '@/context/ParticipantContext';
import { ActivityService } from '@shared/services/api/api';
import useActivityStore from '@shared/store/activity.store';
import ScoreCounter from './ScoreCounter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import { showTamaguiAlert } from '@shared/components/ui/tamagui';

// Component Types
interface WordSearchGameProps {
    words?: string[];
    gridSize?: number;
    activityId?: string;
    timeLimit?: number; // en segundos
    onComplete?: (results: GameResults) => void;
}

interface Cell {
    letter: string;
    row: number;
    col: number;
    selected: boolean;
    highlighted: boolean;
    wordIndex?: number;
}

interface GameResults {
    studentInfo: {
        id: string;
        name: string;
    };
    timeSpent: number; // en segundos
    score: number;
    wordsFound: string[];
    totalWords: number;
}

// Possible directions for placing words
const DIRECTIONS = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1],  // diagonal up-right
];

// Colors for highlighting found words (used cyclically)
const HIGHLIGHT_COLORS = [
    '#4CAF50', // green
    '#2196F3', // blue
    '#FFC107', // yellow
    '#E91E63', // pink
    '#9C27B0', // purple
    '#FF5722', // orange
];

const WordSearchGame: React.FC<WordSearchGameProps> = ({
    words = ['REACT', 'NATIVE', 'TYPESCRIPT', 'JAVASCRIPT', 'VIBRA', 'HTML'],
    gridSize = 10,
    activityId = 'word-search-game',
    timeLimit = 300, // 5 minutes by default
    onComplete,
}) => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const { participant } = useParticipant();

    // Game states
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [gameComplete, setGameComplete] = useState<boolean>(false);

    const { actions } = useActivityStore.getState();

    // Animations
    const scoreAnim = useRef(new Animated.Value(0)).current;
    const gridAnim = useRef(new Animated.Value(0)).current;

    // Initialize the game
    useEffect(() => {
        initializeGame();
    }, []);

    // Game timer
    useEffect(() => {
        if (startTime > 0 && !gameComplete) {
            const timer = setInterval(() => {
                const currentTime = Math.floor((Date.now() - startTime) / 1000);
                setTimeSpent(currentTime);

                // Check if time is up
                if (currentTime >= timeLimit) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [startTime, gameComplete]);

    // Check if game is complete (all words found)
    useEffect(() => {
        if (foundWords.length === words.length && startTime > 0 && !gameComplete) {
            endGame();
        }
    }, [foundWords]);

    // Initialize the game
    const initializeGame = () => {
        // Create an empty grid
        const emptyGrid: Cell[][] = Array(gridSize).fill(null).map((_, row) =>
            Array(gridSize).fill(null).map((_, col) => ({
                letter: '',
                row,
                col,
                selected: false,
                highlighted: false,
            }))
        );

        // Place words in the grid
        const filledGrid = placeWords(emptyGrid, words);

        // Fill empty spaces with random letters
        const finalGrid = fillEmptySpaces(filledGrid);

        setGrid(finalGrid);
        setStartTime(Date.now());

        // Initial grid animation.
        Animated.timing(gridAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.elastic(1),
            useNativeDriver: true,
        }).start();
    };

    // Place words in the grid
    const placeWords = (grid: Cell[][], wordList: string[]) => {
        const newGrid = JSON.parse(JSON.stringify(grid));
        const placedWords: string[] = [];

        // Sort words by length (longest first)
        const sortedWords = [...wordList].sort((a, b) => b.length - a.length);

        for (let wordIndex = 0; wordIndex < sortedWords.length; wordIndex++) {
            const word = sortedWords[wordIndex].toUpperCase();
            let placed = false;

            // Try to place the word up to 100 times
            for (let attempt = 0; attempt < 100 && !placed; attempt++) {
                // Choose a random position and direction
                const row = Math.floor(Math.random() * gridSize);
                const col = Math.floor(Math.random() * gridSize);
                const dirIndex = Math.floor(Math.random() * DIRECTIONS.length);
                const [dRow, dCol] = DIRECTIONS[dirIndex];

                // Check if the word fits in the chosen direction
                if (canPlaceWord(newGrid, word, row, col, dRow, dCol)) {
                    // Place the word
                    for (let i = 0; i < word.length; i++) {
                        const newRow = row + i * dRow;
                        const newCol = col + i * dCol;
                        newGrid[newRow][newCol].letter = word[i];
                        newGrid[newRow][newCol].wordIndex = wordIndex;
                    }
                    placed = true;
                    placedWords.push(word);
                }
            }

            // If the word couldn't be placed after 100 attempts, show a warning
            if (!placed) {
                console.warn(`Could not place word: ${word}`);
            }
        }

        return newGrid;
    };

    // Check if a word can be placed at a specific position and direction
    const canPlaceWord = (grid: Cell[][], word: string, row: number, col: number, dRow: number, dCol: number) => {
        // Check if the word fits within the grid
        const endRow = row + (word.length - 1) * dRow;
        const endCol = col + (word.length - 1) * dCol;

        if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
            return false;
        }

        // Check if the word overlaps with another word
        for (let i = 0; i < word.length; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            const cell = grid[newRow][newCol];

            if (cell.letter !== '' && cell.letter !== word[i]) {
                return false;
            }
        }

        return true;
    };

    // Fill empty spaces with random letters
    const fillEmptySpaces = (grid: Cell[][]) => {
        const newGrid = JSON.parse(JSON.stringify(grid));
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (newGrid[row][col].letter === '') {
                    const randomIndex = Math.floor(Math.random() * letters.length);
                    newGrid[row][col].letter = letters[randomIndex];
                }
            }
        }

        return newGrid;
    };

    // Handle cell selection
    const handleCellPress = (row: number, col: number) => {
        if (gameComplete) return;

        const cell = grid[row][col];

        // If no cells are selected, select this cell
        if (selectedCells.length === 0) {
            setSelectedCells([cell]);
            const newGrid = [...grid];
            newGrid[row][col].selected = true;
            setGrid(newGrid);
            return;
        }

        // Check if the cell is already selected
        if (selectedCells.some(c => c.row === row && c.col === col)) {
            // If it's the last selected cell, deselect it
            if (selectedCells.length === 1) {
                setSelectedCells([]);
                const newGrid = [...grid];
                newGrid[row][col].selected = false;
                setGrid(newGrid);
            }
            return;
        }

        // Check if the cell is adjacent to the last selected cell
        const lastCell = selectedCells[selectedCells.length - 1];
        const rowDiff = Math.abs(row - lastCell.row);
        const colDiff = Math.abs(col - lastCell.col);

        // If not adjacent or not in a straight line with selected cells, ignore
        if (rowDiff > 1 || colDiff > 1) return;

        // Check if the direction is consistent with already selected cells
        if (selectedCells.length >= 2) {
            const prevCell = selectedCells[selectedCells.length - 2];
            const currentDirection = {
                dRow: lastCell.row - prevCell.row,
                dCol: lastCell.col - prevCell.col,
            };
            const newDirection = {
                dRow: row - lastCell.row,
                dCol: col - lastCell.col,
            };

            // If direction is not consistent, ignore
            if (currentDirection.dRow !== newDirection.dRow || currentDirection.dCol !== newDirection.dCol) {
                return;
            }
        }

        // Add the cell to selected cells
        const newSelectedCells = [...selectedCells, cell];
        setSelectedCells(newSelectedCells);

        // Update the grid
        const newGrid = [...grid];
        newGrid[row][col].selected = true;
        setGrid(newGrid);

        // Check if a word has been formed
        checkForWord(newSelectedCells);
    };

    // Check if selected cells form a word
    const checkForWord = (cells: Cell[]) => {
        const word = cells.map(cell => cell.letter).join('');

        // Check if the word is in the list and hasn't been found
        if (words.includes(word) && !foundWords.includes(word)) {
            // Word found
            const newFoundWords = [...foundWords, word];
            setFoundWords(newFoundWords);

            // Update score
            const wordScore = word.length * 10;
            const newScore = score + wordScore;
            setScore(newScore);

            // Animate score
            Animated.sequence([
                Animated.timing(scoreAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scoreAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Highlight cells of the found word
            const colorIndex = foundWords.length % HIGHLIGHT_COLORS.length;
            const highlightColor = HIGHLIGHT_COLORS[colorIndex];

            const newGrid = [...grid];
            cells.forEach(cell => {
                newGrid[cell.row][cell.col].highlighted = true;
                newGrid[cell.row][cell.col].selected = false;
            });

            setGrid(newGrid);
            setSelectedCells([]);
        }

        // If the word is too long, reset selection
        if (cells.length > 15) {
            const newGrid = [...grid];
            cells.forEach(cell => {
                newGrid[cell.row][cell.col].selected = false;
            });

            setGrid(newGrid);
            setSelectedCells([]);
        }
    };

    // End the game
    const endGame = () => {
        setGameComplete(true);

        // Calculate final results
        const finalTimeSpent = Math.min(timeSpent, timeLimit);
        const finalScore = score + (foundWords.length === words.length ? 100 : 0); // Bonus for finding all words

        const results: GameResults = {
            studentInfo: {
                id: user?.id || 'guest',
                name: user?.name || 'Invitado',
            },
            timeSpent: finalTimeSpent,
            score: finalScore,
            wordsFound: foundWords,
            totalWords: words.length,
        };

        // Registrar el resultado del juego vía createCompletion (requiere participant y activityId real)
        if (participant?._id && /^[0-9a-fA-F]{24}$/.test(activityId || '')) {
            const maxScore = words.length * 100;
            ActivityService.createCompletion({
                participant: participant._id,
                activity: activityId || '',
                plannedScore: maxScore,
                achievedScore: finalScore,
                timeSpent: finalTimeSpent,
                gamesCompleted: [{ type: 'WordSearch', score: finalScore, maxScore }],
            }).catch((err: any) =>
                console.warn('[WordSearch] Error registering completion:', err?.message),
            );
        }

        // get the callback function from the parent component
        if (onComplete) {
            onComplete(results);
        }

        // Show completion message and move on to the next activity
        if (Platform.OS === 'web') {
            console.log({
                type: 'success',
                text1: '¡Juego terminado!',
                text2: `Has encontrado ${foundWords.length} de ${words.length} palabras.`,
            });
            // actions.nextActivityType();
        } else {
            // Show completion message and advance to next activity
            showTamaguiAlert(
                '¡Juego terminado!',
                `Has encontrado ${foundWords.length} de ${words.length} palabras.\nPuntuación: ${finalScore}\nTiempo: ${formatTime(finalTimeSpent)}`,
                {
                    primaryLabel: 'Continuar',
                    onPrimary: () => {
                        // Avanzar a la siguiente actividad (MatchingConcepts)
                        actions.nextActivityType();
                    }
                }
            );
        }
    };

    // Format time in mm:ss format
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Scale animation for score
    const scoreScale = scoreAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
    });

    // Entry animation for grid
    const gridScale = gridAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.timerContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#333" />
                    <Text style={styles.timerText}>{formatTime(timeLimit - timeSpent)}</Text>
                </View>

                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: scoreAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [1, 1.2, 1]
                                })
                            }
                        ]
                    }}
                >
                    <ScoreCounter currentScore={score} maxScore={words.length * 10 + 100} />
                </Animated.View>
            </View>
            <View style={styles.gridContainer}>
                <View style={styles.wordsContainer}>
                    <Text style={styles.wordsTitle}>Palabras a encontrar:</Text>
                    <View style={styles.wordsList}>
                        {words.map((word, index) => (
                            <Text
                                key={index+1}
                                style={[styles.wordItem, foundWords.includes(word) && styles.wordFound]}
                            >
                                {foundWords.includes(word) ? `✓ ${word}` : word}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.gridContainerInfo}>
                <Text style={styles.instructions}>
                    Encuentra todas las palabras en el tiempo limitado
                </Text>
            </View>

            <Animated.View style={[styles.gridContainer, { transform: [{ scale: gridScale }] }]}>
                {grid.map((row, rowIndex) => (
                    <View key={rowIndex+1} style={styles.row}>
                        {row.map((cell, colIndex) => {
                            // Determine cell background color
                            let backgroundColor = '#FFFFFF';
                            if (cell.highlighted) {
                                const wordIndex = cell.wordIndex || 0;
                                backgroundColor = HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length];
                            } else if (cell.selected) {
                                backgroundColor = '#FFD700'; // Gold for selected cells
                            }

                            return (
                                <TouchableOpacity
                                    key={colIndex+1}
                                    style={[styles.cell, { backgroundColor }]}
                                    onPress={() => handleCellPress(rowIndex, colIndex)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.cellText, cell.highlighted && styles.highlightedText]}>
                                        {cell.letter}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </Animated.View>

            <View style={styles.infoContainer}>
                <Animated.View style={{ transform: [{ scale: scoreScale }] }}>
                    <Text style={styles.scoreText}>Puntuación: {score}</Text>
                </Animated.View>
            </View>

            {gameComplete && (
                <TamaguiButton
                    title='Continuar'
                    neonEffect={true}
                    style={styles.resetButton}
                    onPress={() => {
                        actions.nextActivityType()
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
    },
    timerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 8,
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        color: '#555',
        fontWeight: '500',
    },
    wordsContainer: {
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        elevation: 2,
    },
    wordsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    wordsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    wordItem: {
        margin: 4,
        padding: 4,
        backgroundColor: '#EEEEEE',
        borderRadius: 4,
        fontSize: 12,
    },
    wordFound: {
        backgroundColor: '#E8F5E9',
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    gridContainer: {
        marginTop: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        padding: 4,
        elevation: 3,
    },
    gridContainerInfo: {
        marginTop: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFCC',
        borderRadius: 8,
        padding: 4,
        elevation: 3,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 4,
        elevation: 1,
    },
    cellText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    highlightedText: {
        color: '#FFFFFF',
    },
    resetButton: {
        marginTop: 16,
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WordSearchGame;