/**
 * Rolls a specified number of dice with a given number of sides.
 * @param {number} sides - The number of sides on the dice (default 6).
 * @param {number} count - The number of dice to roll (default 1).
 * @returns {number[]} An array containing the result of each dice roll.
 */
export function rollDice(sides = 6, count = 1) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    // Math.random() gives a float between 0 and 1; multiply by sides and floor it, then add 1.
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Rolls dice and returns the sum of the results.
 * @param {number} sides - Number of sides on the dice.
 * @param {number} count - Number of dice to roll.
 * @returns {number} The total sum of the dice rolls.
 */
export function rollDiceTotal(sides = 6, count = 1) {
  return rollDice(sides, count).reduce((total, roll) => total + roll, 0);
}
