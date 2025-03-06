import {
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

export function getCombatStatusBar(character: ICharacter, enemy: IEnemy) {
  const background =
    secondaryColor(`*******************************************************************************
          |                   |                  |                  |          
 _________|___________________|__________________|__________________|__________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
          |                   |                  |                   |         
 _________|___________________|__________________|___________________|_________`);

  const backgroundLines = background.split("\n");
  const heroArr: [string, string] = [
    character.name,
    getHealthBar(character.hp, character.abilities.maxhp),
  ];
  const enemyArr: [string, string] = [
    enemy.name,
    getHealthBar(enemy.hp, enemy.maxhp),
  ];

  const maxLength = Math.max(
    removeFormatting(heroArr.join("")).string.length,
    removeFormatting(enemyArr.join("")).string.length
  );

  const table = alignTextAsTable([heroArr, enemyArr], "", "   ", maxLength);

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
