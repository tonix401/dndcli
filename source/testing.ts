import { playAnimation, totalClear } from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import {
  getCombatStatusBar,
  getHealthBar,
} from "@resources/generalScreens/combatStatusBar.js";
import ICharacter from "@utilities/ICharacter.js";
import { get } from "http";
import { log } from "@utilities/LogService.js";

async function test() {
  /////////////////////////
  // const testEnemy = {
  //   name: "Dummy Enemy",
  //   hp: 80,
  //   maxhp: 80,
  //   attack: 8,
  //   defense: 3,
  //   xpReward: 50,
  //   moves: [],
  // };

  // let testCharacter: ICharacter = { ...getDataFromFile("character") };
  // for (let i = 100; i > 0; i -= 9) {
  //   testCharacter.hp = i;
  //   console.log(getCombatStatusBar(testCharacter, testEnemy));
  // }

  log('test error', 'Error');
  log('test warning', 'Warn ');
  log('test info', 'Info ');
  
  /////////////////////////
}
await test().catch((err) => {
  console.error("Error during test: Check the logs!");
  log(err);
});
console.log("End of test!");
