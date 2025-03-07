import {
  alignText,
  alignTextAsTable,
  boxItUp,
  overlayTextOnLineAndFormat,
  primaryColor,
  removeFormatting,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import chalk from "chalk";

/**
 * The status bar during combat, showing the health of the hero and the enemy.
 * @param character The character object
 * @param enemy The enemy object
 * @returns a formatted string with the hero and enemy health bars
 * @example
 * ```txt
 * *******************************************************************************
 *           |                   |                  |                  |
 *  _________|_________/‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\_________|__________
 * |                   ⎸ Gilbert      [■■■■■■■■■■■■■■■■■···] ⎹ |
 * |___________________⎸ Test Dummy   [■■■■■■■■■■■■■■■■■■■■] ⎹_|__________________
 *           |         \_____________________________________/          |
 *  _________|___________________|__________________|___________________|_________
 * ```
 */
export function getCombatStatusBar(character: ICharacter, enemy: IEnemy, _round: number = 0) {
  const background =
    secondaryColor(`*******************************************************************************
          |                   |                  |                  |          
 _________|___________________|__________________|__________________|__________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
          |                   |                  |                   |         
 _________|___________________|__________________|___________________|_________`);

  const backgroundLines = background.split("\n");
  const heroBar: [string, string] = [
    getHealthBar(character.hp, character.abilities.maxhp),
    character.hp + "/" + character.abilities.maxhp,
  ];
  const enemyBar: [string, string] = [
    getHealthBar(enemy.hp, enemy.maxhp),
    enemy.hp + "/" + enemy.maxhp,
  ];

  const healthBarMinLength = Math.max(
    removeFormatting(heroBar.join()).string.length,
    removeFormatting(enemyBar.join()).string.length
  );

  const heroArr: [string, string] = [
    character.name,
    alignTextAsTable([heroBar], "", " ", healthBarMinLength).text,
  ];
  const enemyArr: [string, string] = [
    enemy.name,
    alignTextAsTable([enemyBar], "", " ", healthBarMinLength).text,
  ];
  const titleArr: [string, string] = ["Combat", ""];

  const table = alignTextAsTable([heroArr, enemyArr], "", "   ");

  const boxLines = boxItUp(table.text).split("\n");

  backgroundLines.map((line, index) => {
    if (index > 1) {
      backgroundLines[index] = overlayTextOnLineAndFormat(
        line,
        primaryColor(boxLines[index - 2] || "")
      );
    }
  });

  return backgroundLines.join("\n");
}

/**
 * Generates a health bar string representation.
 * @param current - The current health value.
 * @param max - The maximum health value.
 * @param fullColor - The color for full health (default: green).
 * @param emptyColor - The color for empty health (default: red).
 * @param barLength - The length of the health bar (default: 20).
 * @returns The formatted health bar string.
 */
export function getHealthBar(
  current: number,
  max: number,
  fullColor: { r: number; g: number; b: number } = { r: 0, g: 255, b: 0 },
  emptyColor: { r: number; g: number; b: number } = { r: 255, g: 0, b: 0 },
  barLength: number = 20
): string {
  if (current > max) {
    max = current;
  }

  /**
   * The function to calculate the color gradient, returns a value between 0 and 1 for every x between 0 and 1
   * Just a parabola atm, but can be changed later.
   * I also tried some e functions.
   * They look really good with red and green but not with other colors, so this is a compromise
   */
  const func = (x: number) => Math.pow(x, 2);

  const vector = {
    r: fullColor.r - emptyColor.r,
    g: fullColor.g - emptyColor.g,
    b: fullColor.b - emptyColor.b,
  };
  const value = func(current / max);
  const color = {
    r: Math.round(emptyColor.r + vector.r * value),
    g: Math.round(emptyColor.g + vector.g * value),
    b: Math.round(emptyColor.b + vector.b * value),
  };
  const { r, g, b } = color;

  const rawFilled = Math.round((current / max) * barLength);
  const filledLength = Math.min(rawFilled, barLength);
  const emptyLength = Math.max(barLength - filledLength, 0);

  let result = `[${chalk.bold.rgb(
    r,
    g,
    b
  )("■".repeat(filledLength))}${"·".repeat(emptyLength)}]`;
  return result;
}
