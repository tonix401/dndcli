/**
 * Rolls a specified number of dice with a given number of sides.
 * @param sides - The number of sides on the dice (default 6).
 * @param count - The number of dice to roll (default 1).
 * @returns An array containing the result of each dice roll.
 */
export function rollDice(sides: number = 6, count: number = 1): number[] {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    // Math.random() gives a float between 0 and 1; multiply by sides and floor it, then add 1.
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Rolls dice and returns the sum of the results.
 * @param sides - Number of sides on the dice.
 * @param count - Number of dice to roll.
 * @returns The total sum of the dice rolls.
 */
export function rollDiceTotal(sides = 6, count = 1) {
  return rollDice(sides, count).reduce((total, roll) => total + roll, 0);
}
