import {
  boxItUp,
  overlayTextOnLineAndFormat,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";

export function getStatusBar(character: ICharacter) {
  const background =
    secondaryColor(`*******************************************************************************
          |                   |                  |                  |          
 _________|___________________|__________________|__________________|__________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
          |                   |                  |                   |         
 _________|___________________|__________________|___________________|_________`);

  const backgroundLines = background.split("\n");
  const title = ` ${character.name} - ${getTerm("level")} ${
    character.level
  } ${getTerm(character.class)}`;
  const stats = `HP: ${character.hp}/${character.abilities.maxhp} STR: ${character.abilities.strength} DEX: ${character.abilities.dexterity} CHA: ${character.abilities.charisma} LCK: ${character.abilities.luck} MANA: ${character.abilities.mana}`;

  const boxLines = boxItUp(title + "\n" + stats).split("\n");

  backgroundLines.map((line, index) => {
    if (index > 1) {
      backgroundLines[index] = overlayTextOnLineAndFormat(
        line,
        boxLines[index - 2] || ""
      );
    }
  });

  return backgroundLines.join("\n");
}
