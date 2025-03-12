import { primaryColor, secondaryColor } from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import packageJson from "@root/package.json" with {type: "json"};

export default function getTemplateRoomAscii() {
  const p = (text: string) => primaryColor(text);
  const s = (text: string) => secondaryColor(text);
  return s(`*******************************************************************************
          |                   |                  |                  |          
 _________|___________________|__________________|__________________|__________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
          |                   |                  |                   |         
 _________|___________________|__________________|___________________|_________
|                   |                   |                   |                  
|___________________|___________________|___________________|__________________
          |                   |                  |                     |       
 _________|___________________|__________________|_____________________|_______
|                   |                   |                  |                   
|___________________|___________________|__________________|___________________
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
*******************************************************************************`);
}


export const getErrorAscii = () => `/========================================================\\
||                                                      ||
||    ______    ______    ______    ______    ______    ||
||   /      \\  /      \\  /      \\  /      \\  /      \\   ||
||  /$$$$$$  |/$$$$$$  |/$$$$$$  |/$$$$$$  |/$$$$$$  |  ||
||  $$    $$ |$$ |  $$/ $$ |  $$/ $$ |  $$ |$$ |  $$/   ||
||  $$$$$$$$/ $$ |      $$ |      $$ \\__$$ |$$ |        ||
||  $$       |$$ |      $$ |      $$    $$/ $$ |        ||
||   $$$$$$$/ $$/       $$/        $$$$$$/  $$/         ||
||                                                      ||
\\========================================================/`;

export const getWarningAscii = () => `/==================================================\\
||                                                ||
||   __   __   __   ______    ______   _______    ||
||  /  | /  | /  | /      \\  /      \\ /       \\   ||
||  $$ | $$ | $$ | $$$$$$  |/$$$$$$  |$$$$$$$  |  ||
||  $$ | $$ | $$ | /    $$ |$$ |  $$/ $$ |  $$ |  ||
||  $$ \\_$$ \\_$$ |/$$$$$$$ |$$ |      $$ |  $$ |  ||
||  $$   $$   $$/ $$    $$ |$$ |      $$ |  $$ |  ||
||   $$$$$/$$$$/   $$$$$$$/ $$/       $$/   $$/   ||
||                                                ||
\\==================================================/`;

export const getTitle = () => 
` /$$$$$$$            /$$$$$$$           /$$$$$$  /$$       /$$$$$$
| $$__  $$          | $$__  $$         /$$__  $$| $$      |_  $$_/
| $$  \\ $$ /$$$$$$$ | $$  \\ $$        | $$  \\__/| $$        | $$  
| $$  | $$| $$__  $$| $$  | $$ /$$$$$$| $$      | $$        | $$  
| $$  | $$| $$  \\ $$| $$  | $$|______/| $$      | $$        | $$  
| $$  | $$| $$  | $$| $$  | $$        | $$    $$| $$        | $$  
| $$$$$$$/| $$  | $$| $$$$$$$/        |  $$$$$$/| $$$$$$$$ /$$$$$$
|_______/ |__/  |__/|_______/          \\______/ |________/|______/

${packageJson.version} - ${getTerm("welcome")}`;

export const testCombatBackground = [
  "********************************************************************************",
  "                      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾&                      ",
  "                      | Goblin [|||||||||||||||||] 10/10 |                      ",
  "                      &__________________________________/                      ",
  '                                  |& .====. /|                                  ',
  "                                  & '      ' /                                  ",
  "                                   |  °  °  |                                   ",
  "                                    &_    _/                                    ",
  "                                 ____/    &____                                 ",
  "                                /              &                                ",
  "     .==. /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾& .==.     ",
  "    /   |/| Wandalf - Level 3 Mage      | Choose Action              |&|   &    ",
  "   /    / | HP: 10/20 [||||||||:::::::] | - Attack                   | &    &   ",
  "  /    /  | MN:   2/7 [|||||::::::::::] | - Defend                   |  &    &  ",
  " |        | STR:          | CHA:        | - Use Item                 |        | ",
  " |        | DEX:          | LCK:        | - Use Ability              |        | ",
  " &        |                             | - Try to flee              |        / ",
  " /.       &__________________________________________________________/       .& ",
  "/  ' .        _.=*                                            *=._        . '  &",
  "********************************************************************************"
].join("\n")