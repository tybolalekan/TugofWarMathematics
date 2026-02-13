/**
 * Global game state object.
 * Centralizes all data that changes during gameplay.
 */
export const state = {
    score: 0,               // Player's current score (answers correct)
    opponentScore: 0,       // Opponent's current score (in single player)
    ropePosition: 50,       // Current position of the rope marker (0-100)
    // 0 = Player 1/You win, 100 = Player 2/Computer wins
    player1Problem: null,   // Current problem being solved by Player 1
    player2Problem: null,   // Current problem being solved by Player 2 (in PvP)
    gameActive: false,      // Flag to prevent inputs/actions after game ends
    timer: 0,               // Match duration in seconds
    level: 1,               // Difficulty level (1, 2, or 3)
    operation: 'addition',  // Current math operation being practiced
    gameMode: 'single',     // Match type: 'single' (vs computer) or 'two-player' (local PvP)
    winningThreshold: 0,    // Target position for Player 1 to win
    losingThreshold: 100,   // Target position for Opponent to win
    pullStrength: 5,        // How many percentage points the rope moves per correct answer
    opponentPullSpeed: 1000, // Interval between computer pulls in milliseconds
};

/**
 * Resets the game state to default values for a new match.
 * Note: Some settings like 'operation' and 'gameMode' are preserved 
 * as they are usually selected before the game starts.
 */
export function resetState() {
    state.score = 0;
    state.opponentScore = 0;
    state.ropePosition = 50;
    state.player1Problem = null;
    state.player2Problem = null;
    state.gameActive = false;
    state.timer = 0;
    // Level is also preserved as it's a pre-game selection
}
