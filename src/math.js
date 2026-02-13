/**
 * Supported math operations for the game.
 * Used for logic switching and UI labeling.
 */
export const OPERATIONS = {
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
  MULTIPLICATION: 'multiplication',
  DIVISION: 'division',
};

/**
 * Generates a random math problem based on the operation and difficulty level.
 * 
 * @param {string} operation - The type of math problem (addition, subtraction, etc.)
 * @param {number} level - The difficulty level (typically 1, 2, or 3)
 * @returns {Object|null} An object with {question, answer} or null if operation is invalid.
 */
export function generateProblem(operation, level = 1) {
  let num1, num2, answer;

  switch (operation) {
    case OPERATIONS.ADDITION:
      // Numbers increase with level (e.g., Level 1: 1-10, Level 2: 1-20)
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * (10 * level)) + 1;
      answer = num1 + num2;
      return { question: `${num1} + ${num2}`, answer };

    case OPERATIONS.SUBTRACTION:
      // Ensure the result is always positive for kids
      num2 = Math.floor(Math.random() * (10 * level)) + 1;
      num1 = num2 + Math.floor(Math.random() * (10 * level));
      answer = num1 - num2;
      return { question: `${num1} - ${num2}`, answer };

    case OPERATIONS.MULTIPLICATION:
      // Multiplication factors are smaller to keep it manageable
      num1 = Math.floor(Math.random() * (5 + level)) + 1;
      num2 = Math.floor(Math.random() * (5 + level)) + 1;
      answer = num1 * num2;
      return { question: `${num1} × ${num2}`, answer };

    case OPERATIONS.DIVISION:
      // Generate components of multiplication first to ensure clean division
      num2 = Math.floor(Math.random() * (5 + level)) + 1;
      answer = Math.floor(Math.random() * (5 + level)) + 1;
      num1 = num2 * answer;
      return { question: `${num1} ÷ ${num2}`, answer };

    default:
      console.warn(`Attempted to generate problem with unknown operation: ${operation}`);
      return null;
  }
}
